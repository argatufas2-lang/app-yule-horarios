import { supabase } from '$lib/services/supabaseClient';
import type { StagingSessionRow } from './excelImportService';
import { normalizarNombreProfesor } from './excelImportService';

const DICCIONARIO_ACTIVIDADES: Record<string, string> = {
	MATE: 'MATEMATIKA',
	MATES: 'MATEMATIKA',
	MUS: 'MUSIKA',
	ENG: 'ENGLISH',
	ING: 'INGLES',
	EUSK: 'EUSKARA',
	CAST: 'LENGUA CASTELLANA',
	EF: 'EDUCACION FISICA',
	FIZ: 'GORPUTZ HEZKUNTZA',
	REL: 'RELIGION'
};

function normalizarNombreActividad(nombreRaw?: string | null): string {
	if (!nombreRaw) return '';
	const limpio = nombreRaw.trim().toUpperCase();
	return DICCIONARIO_ACTIVIDADES[limpio] || limpio;
}

export async function getStagingRowsByBatch(batchId: string): Promise<StagingSessionRow[]> {
	const allRows: StagingSessionRow[] = [];
	const pageSize = 1000;
	let from = 0;
	let hasMore = true;

	while (hasMore) {
		const { data, error } = await supabase
			.from('sesiones_staging')
			.select('*')
			.eq('batch_id', batchId)
			.order('profesor_nombre', { ascending: true })
			.order('dia', { ascending: true })
			.order('franja', { ascending: true })
			.range(from, from + pageSize - 1);

		if (error) {
			console.error('Error al obtener filas de staging:', error);
			throw new Error(`Error al recuperar borradores: ${error.message}`);
		}

		if (data && data.length > 0) {
			allRows.push(...(data as StagingSessionRow[]));
			from += pageSize;
			if (data.length < pageSize) {
				hasMore = false;
			}
		} else {
			hasMore = false;
		}
	}

	return allRows;
}

export async function updateStagingRow(
	id: string,
	updates: Partial<StagingSessionRow>
): Promise<StagingSessionRow> {
	// Revalidar borrador
	const errores: string[] = [];
	if (updates.actividad !== undefined && !updates.actividad?.trim()) {
		errores.push('Actividad requerida');
	}
	if (updates.profesor_nombre !== undefined && !updates.profesor_nombre?.trim()) {
		errores.push('Profesor requerido');
	}

	const finalUpdates = {
		...updates,
		errores,
		estado_validacion: errores.length === 0 ? 'valido' : 'error'
	};

	const { data, error } = await supabase
		.from('sesiones_staging')
		.update(finalUpdates)
		.eq('id', id)
		.select()
		.single();

	if (error) {
		console.error('Error al actualizar fila staging:', error);
		throw new Error(`Error al actualizar registro staging: ${error.message}`);
	}

	return data as StagingSessionRow;
}

async function sincronizarProfesores(profesoresUnicos: string[], cursoEscolar: string): Promise<void> {
	if (profesoresUnicos.length === 0) return;

	const profesoresNormalizados = Array.from(
		new Set(profesoresUnicos.map((p) => normalizarNombreProfesor(p)).filter(Boolean))
	);

	// 1. Consultar todos los nombres de profesores existentes en la base de datos
	const { data: existentes, error: fetchErr } = await supabase
		.from('profesores')
		.select('nombre');

	if (fetchErr) {
		console.error('Error al consultar profesores existentes:', fetchErr.message);
		throw new Error(`Error al verificar profesores existentes: ${fetchErr.message}`);
	}

	const nombresExistentesSet = new Set(
		(existentes || []).map((p: { nombre: string }) => normalizarNombreProfesor(p.nombre))
	);

	// 2. Filtrar únicamente los profesores que NO existen en la base de datos
	const nuevosProfesores = profesoresNormalizados.filter(
		(nombreNorm) => !nombresExistentesSet.has(nombreNorm)
	);

	if (nuevosProfesores.length === 0) return;

	// 3. Insertar con onConflict en 'nombre'
	const payload = nuevosProfesores.map((nombre, index) => ({
		nombre,
		curso_escolar: cursoEscolar,
		orden: (existentes?.length || 0) + index + 1
	}));

	const { error } = await supabase
		.from('profesores')
		.upsert(payload, { onConflict: 'nombre', ignoreDuplicates: true });

	if (error) {
		console.error('Error al registrar nuevos profesores:', error.message);
		throw new Error(`Error al registrar profesores importados: ${error.message}`);
	}
}

async function sincronizarActividades(actividadesUnicas: string[], cursoEscolar: string): Promise<void> {
	if (actividadesUnicas.length === 0) return;

	// 1. Consultar exclusivamente (SELECT) los registros existentes en el catálogo
	const { data: existentes, error: fetchErr } = await supabase
		.from('actividades')
		.select('nombre')
		.eq('curso_escolar', cursoEscolar);

	if (fetchErr) {
		console.error('Error al consultar tabla maestra de actividades:', fetchErr.message);
		throw new Error(`Error al verificar catálogo de actividades: ${fetchErr.message}`);
	}

	// 2. Normalizar los nombres existentes para evitar comparaciones erróneas
	const nombresExistentes = new Set(
		(existentes || []).map((a: { nombre: string }) => normalizarNombreActividad(a.nombre))
	);

	// 3. Identificar solo nombres verdaderamente ausentes en la tabla maestra
	const totalmenteNuevas = Array.from(
		new Set(
			actividadesUnicas
				.map((a) => normalizarNombreActividad(a))
				.filter((nombreNorm) => Boolean(nombreNorm) && !nombresExistentes.has(nombreNorm))
		)
	);

	if (totalmenteNuevas.length === 0) return;

	// 4. Insertar de forma segura únicamente los nuevos fichajes detectados
	const payload = totalmenteNuevas.map((nombre) => ({
		nombre,
		curso_escolar: cursoEscolar,
		es_lectiva: true
	}));

	const { error: insertErr } = await supabase
		.from('actividades')
		.insert(payload);

	if (insertErr) {
		console.error('Error al añadir nueva actividad al catálogo:', insertErr.message);
		throw new Error(`Error al registrar actividad no existente: ${insertErr.message}`);
	}
}

async function sincronizarAulas(aulasUnicas: string[], cursoEscolar: string): Promise<void> {
	if (aulasUnicas.length === 0) return;

	const payload = aulasUnicas.map((nombre) => ({
		nombre,
		curso_escolar: cursoEscolar
	}));

	const { error } = await supabase
		.from('aulas')
		.upsert(payload, { onConflict: 'nombre,curso_escolar', ignoreDuplicates: true });

	if (error) {
		console.error('Error al sincronizar aulas:', error.message);
		throw new Error(`Error al registrar aulas importadas: ${error.message}`);
	}
}

export async function implantarStaging(batchId: string, cursoEscolar: string, reemplazarExistentes: boolean = true): Promise<number> {
	const cursoNormalizado = cursoEscolar.trim();

	// 1. Obtener TODAS las filas válidas paginando de 1000 en 1000
	const validRows: StagingSessionRow[] = [];
	const pageSize = 1000;
	let from = 0;
	let hasMore = true;

	while (hasMore) {
		const { data, error: fetchErr } = await supabase
			.from('sesiones_staging')
			.select('*')
			.eq('batch_id', batchId)
			.eq('estado_validacion', 'valido')
			.range(from, from + pageSize - 1);

		if (fetchErr) {
			throw new Error(`Error al leer sesiones válidas: ${fetchErr.message}`);
		}

		if (data && data.length > 0) {
			validRows.push(...(data as StagingSessionRow[]));
			from += pageSize;
			if (data.length < pageSize) {
				hasMore = false;
			}
		} else {
			hasMore = false;
		}
	}

	if (validRows.length === 0) {
		throw new Error('No hay filas válidas para implantar en la base de datos.');
	}

	// 2. Archivar en 'sesiones_historico' y vaciar 'sesiones' obligatoriamente antes de la implantación
	// Consultar TODAS las sesiones actuales sin importar el curso escolar ni filtros restrictivos, paginando
	const sesionesExistentes: any[] = [];
	const fetchPageSize = 1000;
	let fetchFrom = 0;
	let fetchHasMore = true;

	while (fetchHasMore) {
		const { data: pageData, error: fetchCurrentErr } = await supabase
			.from('sesiones')
			.select('*')
			.range(fetchFrom, fetchFrom + fetchPageSize - 1);

		if (fetchCurrentErr) {
			console.error('Error al consultar sesiones actuales para archivo:', fetchCurrentErr.message);
			throw new Error(`Error crítico al verificar sesiones existentes: ${fetchCurrentErr.message}`);
		}

		if (pageData && pageData.length > 0) {
			sesionesExistentes.push(...pageData);
			fetchFrom += fetchPageSize;
			if (pageData.length < fetchPageSize) {
				fetchHasMore = false;
			}
		} else {
			fetchHasMore = false;
		}
	}

	// Archivar en 'sesiones_historico' por lotes si existen registros previos
	if (sesionesExistentes.length > 0) {
		const fechaArchivo = new Date().toISOString();
		const historicoPayload = sesionesExistentes.map(({ id, ...resto }) => ({
			...resto,
			sesion_original_id: id,
			fecha_archivo: fechaArchivo,
			motivo_archivo: `Respaldo automático previo a implantación (lote ${batchId})`
		}));

		const archiveChunkSize = 1000;
		for (let i = 0; i < historicoPayload.length; i += archiveChunkSize) {
			const chunk = historicoPayload.slice(i, i + archiveChunkSize);
			const { error: archiveErr } = await supabase
				.from('sesiones_historico')
				.insert(chunk);

			if (archiveErr) {
				console.error('Error al archivar sesiones en sesiones_historico:', archiveErr.message);
				throw new Error(`Error crítico al respaldar sesiones existentes en el histórico: ${archiveErr.message}`);
			}
		}
	}

	// Vaciar por completo e incondicionalmente la tabla sesiones
	const { error: delErr } = await supabase
		.from('sesiones')
		.delete()
		.neq('id', '00000000-0000-0000-0000-000000000000');

	if (delErr) {
		console.error('Error al vaciar la tabla de sesiones:', delErr.message);
		throw new Error(`Error crítico al vaciar la tabla de sesiones: ${delErr.message}`);
	}

	// 3. Extraer y sincronizar valores únicos con las tablas maestras auxiliares
	const profesoresUnicos = Array.from(
		new Set(
			validRows
				.map((r) => normalizarNombreProfesor(r.profesor_nombre))
				.filter((p): p is string => Boolean(p))
		)
	);

	const actividadesUnicas = Array.from(
		new Set(
			validRows
				.map((r) => normalizarNombreActividad(r.actividad))
				.filter((a): a is string => Boolean(a))
		)
	);

	// Extraer aulas limpiando cadenas compuestas (e.g. "2B, 2A, 2D" -> toma únicamente el aula individual o primera)
	const aulasUnicasSet = new Set<string>();
	validRows.forEach((r) => {
		if (r.aula) {
			const aulaLimpia = r.aula.split(',')[0].trim();
			if (aulaLimpia) aulasUnicasSet.add(aulaLimpia);
		}
	});
	const aulasUnicas = Array.from(aulasUnicasSet);

	await sincronizarProfesores(profesoresUnicos, cursoNormalizado);
	await sincronizarActividades(actividadesUnicas, cursoNormalizado);
	await sincronizarAulas(aulasUnicas, cursoNormalizado);

	// 4. Formatear payload para 'sesiones' asignando el cursoEscolar objetivo y el nombre normalizado
	// Se descartan registros vacíos (sin actividad ni clase) para dejar las celdas disponibles
	const payload = validRows
		.filter((r) => Boolean(r.actividad?.trim() || r.clase?.trim() || r.aula?.trim()))
		.map((r) => ({
			profesor_nombre: normalizarNombreProfesor(r.profesor_nombre),
			dia: r.dia,
			franja: r.franja,
			actividad: normalizarNombreActividad(r.actividad) || null,
			clase: r.clase,
			aula: r.aula ? r.aula.split(',')[0].trim() : null,
			grupo_desdoble: r.grupo_desdoble ? r.grupo_desdoble.trim() : null,
			rol_aula: r.rol_aula || 'principal',
			fuente: r.fuente || 'excel_import',
			minutos: r.minutos || 45,
			curso_escolar: cursoNormalizado
		}));

	// 5. Insertar en 'sesiones' por lotes (chunks) de 1.000 registros
	const chunkSize = 1000;
	for (let i = 0; i < payload.length; i += chunkSize) {
		const chunk = payload.slice(i, i + chunkSize);
		const { error: insertErr } = await supabase.from('sesiones').insert(chunk);

		if (insertErr) {
			throw new Error(`Error al trasladar bloque (${i}-${i + chunk.length}) a producción: ${insertErr.message}`);
		}
	}

	return payload.length;
}

export async function desecharStaging(batchId: string): Promise<void> {
	const { error } = await supabase
		.from('sesiones_staging')
		.delete()
		.eq('batch_id', batchId);

	if (error) {
		console.error('Error al desechar borrador staging:', error);
		throw new Error(`Error al borrar borrador staging: ${error.message}`);
	}
}

export async function vaciarTablaStaging(): Promise<void> {
	const { error } = await supabase
		.from('sesiones_staging')
		.delete()
		.neq('id', '00000000-0000-0000-0000-000000000000');

	if (error) {
		console.error('Error al vaciar tabla sesiones_staging:', error);
		throw new Error(`Error al vaciar la tabla temporal: ${error.message}`);
	}
}
