import { supabase } from './supabaseClient';
import { getAdminProfesores, getAdminActividades, getAdminTramosHorarios, type ProfesorRecord } from './adminService';
import { formatMinutes, isLectivaSession } from './timeCalculationService';

async function getAllAjustesMinutos(): Promise<Array<{ profesor_nombre?: string; dia?: number; franja?: number; minutos?: number }>> {
	try {
		const { data, error } = await supabase.from('ajustes_minutos').select('*');
		if (error) return [];
		return data || [];
	} catch {
		return [];
	}
}

export interface ProfesorJornadaData {
	id: string;
	nombre: string;
	jornada: string;
	minutosLectivosRealizados: number;
	minutosNoLectivosRealizados: number;
	minutosTotalesRealizados: number;
	sesionesLectivasCount: number;
	sesionesNoLectivasCount: number;
	sesionesTotalesCount: number;
	topeMinutosLectivos: number;
	topeMinutosNoLectivos: number;
	topeMinutosTotales: number;
	balanceMinutos: number;
	horasLectivasFormatted: string;
	horasNoLectivasFormatted: string;
	horasTotalesFormatted: string;
	topeLectivasFormatted: string;
	topeNoLectivasFormatted: string;
	topeTotalesFormatted: string;
	balanceFormatted: string;
}

export interface TipoJornadaRecord {
	id?: string | number;
	codigo?: string | null;
	nombre?: string | null;
	minutos_lectivos?: number | null;
	minutos_no_lectivos?: number | null;
	horas_lectivas?: number | null;
	horas_no_lectivas?: number | null;
	horas_totales?: number | null;
}

export function normalizeStr(str: string | null | undefined): string {
	if (!str) return '';
	return str
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, ' ');
}

function getDefaultTopesByJornada(jornadaStr: string) {
	const norm = normalizeStr(jornadaStr);
	if (norm.includes('1/2') || norm.includes('media') || norm.includes('50%') || norm === '0.5') {
		return { lectivos: 518, noLectivos: 172, totales: 690 };
	}
	if (norm.includes('2/3') || norm.includes('66%') || norm.includes('67%')) {
		return { lectivos: 690, noLectivos: 230, totales: 920 };
	}
	if (norm.includes('3/4') || norm.includes('75%')) {
		return { lectivos: 776, noLectivos: 259, totales: 1035 };
	}
	if (norm.includes('4/5') || norm.includes('80%')) {
		return { lectivos: 828, noLectivos: 276, totales: 1104 };
	}
	return { lectivos: 1035, noLectivos: 345, totales: 1380 };
}

function findMatchingProfesor(profesorNombreInSession: string, profesores: ProfesorRecord[]): ProfesorRecord | undefined {
	if (!profesorNombreInSession) return undefined;
	const sessionNorm = normalizeStr(profesorNombreInSession);

	let match = profesores.find((p) => normalizeStr(p.nombre) === sessionNorm);
	if (match) return match;

	match = profesores.find((p) => {
		const pNorm = normalizeStr(p.nombre);
		return pNorm.startsWith(sessionNorm) || sessionNorm.startsWith(pNorm);
	});
	if (match) return match;

	const sessionTokens = sessionNorm.split(' ');
	match = profesores.find((p) => {
		const pTokens = normalizeStr(p.nombre).split(' ');
		if (sessionTokens[0] && pTokens[0] && sessionTokens[0] === pTokens[0]) {
			if (sessionTokens[1] && pTokens[1]) {
				if (sessionTokens[1][0] === pTokens[1][0]) return true;
			}
			return true;
		}
		return false;
	});

	return match;
}

export async function fetchControlJornadaData(cursoEscolar: string = '2026-2027'): Promise<ProfesorJornadaData[]> {
	const [profesoresResult, sesionesResult, actividadesResult, ajustesResult, tramosResult, tiposJornadaResult] =
		await Promise.allSettled([
			getAdminProfesores(cursoEscolar),
			supabase.from('sesiones').select('*').eq('curso_escolar', cursoEscolar),
			getAdminActividades(cursoEscolar),
			getAllAjustesMinutos(),
			getAdminTramosHorarios(),
			supabase.from('tipos_jornada').select('*')
		]);

	const profesores = profesoresResult.status === 'fulfilled' ? profesoresResult.value : [];
	const sesiones = sesionesResult.status === 'fulfilled' && sesionesResult.value.data ? sesionesResult.value.data : [];
	const actividades = actividadesResult.status === 'fulfilled' ? actividadesResult.value : [];
	const ajustes = ajustesResult.status === 'fulfilled' ? ajustesResult.value : [];
	const tramos = tramosResult.status === 'fulfilled' ? tramosResult.value : [];
	const tiposJornada: TipoJornadaRecord[] =
		tiposJornadaResult.status === 'fulfilled' && tiposJornadaResult.value.data ? tiposJornadaResult.value.data : [];

	console.log('[ControlJornada Debug] Datos cargados de Supabase:', {
		profesores: profesores.length,
		sesiones: sesiones.length,
		actividades: actividades.length,
		ajustes: ajustes.length,
		tramos: tramos.length,
		tiposJornada: tiposJornada.length
	});

	const actividadLectivaMap = new Map<string, boolean>();
	for (const act of actividades) {
		if (act.nombre) actividadLectivaMap.set(normalizeStr(act.nombre), !!act.es_lectiva);
	}

	const tramoMinutosMap = new Map<number, number>();
	for (const tramo of tramos) {
		const key = tramo.orden ?? tramo.id;
		tramoMinutosMap.set(key, tramo.minutos_maximos || 45);
	}

	const ajusteMinutosMap = new Map<string, number>();
	for (const aj of ajustes) {
		if (aj.profesor_nombre && aj.minutos !== undefined && aj.minutos !== null) {
			const key = `${normalizeStr(aj.profesor_nombre)}-${aj.dia}-${aj.franja}`;
			ajusteMinutosMap.set(key, aj.minutos);
		}
	}

	const tiposJornadaMap = new Map<string, { lectivos: number; noLectivos: number; totales: number }>();
	for (const tj of tiposJornada) {
		const code = normalizeStr(tj.codigo || tj.nombre);
		if (!code) continue;
		let lect = tj.minutos_lectivos ?? (tj.horas_lectivas ? Math.round(Number(tj.horas_lectivas) * 60) : 0);
		let noLect = tj.minutos_no_lectivos ?? (tj.horas_no_lectivas ? Math.round(Number(tj.horas_no_lectivas) * 60) : 0);
		let tot = lect + noLect;
		if (tot === 0 && tj.horas_totales) tot = Math.round(Number(tj.horas_totales) * 60);
		if (tot > 0) tiposJornadaMap.set(code, { lectivos: lect, noLectivos: noLect, totales: tot });
	}

	const sesionesPorProfesorId = new Map<string, typeof sesiones>();
	for (const p of profesores) {
		sesionesPorProfesorId.set(String(p.id), []);
	}

	for (const s of sesiones) {
		if (!s.profesor_nombre) continue;
		const matchProf = findMatchingProfesor(s.profesor_nombre, profesores);
		if (matchProf) {
			sesionesPorProfesorId.get(String(matchProf.id))!.push(s);
		} else {
			console.warn('[ControlJornada Debug] Sesión con profesor no reconocido en claustro:', s.profesor_nombre, s);
		}
	}

	return profesores.map((prof) => {
		const profSesiones = sesionesPorProfesorId.get(String(prof.id)) || [];

		let minsLectivasReal = 0;
		let minsNoLectivasReal = 0;
		let sesLectivasCount = 0;
		let sesNoLectivasCount = 0;

		for (const s of profSesiones) {
			let esLectiva: boolean;
			const actNorm = normalizeStr(s.actividad);

			if (actNorm && actividadLectivaMap.has(actNorm)) {
				esLectiva = actividadLectivaMap.get(actNorm)!;
			} else if (s.es_lectiva !== undefined && s.es_lectiva !== null) {
				esLectiva = !!s.es_lectiva;
			} else {
				esLectiva = isLectivaSession(s as any);
				if (s.actividad) {
					console.log('[ControlJornada Debug] Actividad no hallada en catálogo (fallback):', s.actividad, '-> esLectiva:', esLectiva, 'para', prof.nombre);
				}
			}

			const ajKey = `${normalizeStr(prof.nombre)}-${s.dia}-${s.franja}`;
			let duracion = 45;

			if (ajusteMinutosMap.has(ajKey)) {
				duracion = ajusteMinutosMap.get(ajKey)!;
			} else if (s.minutos && s.minutos > 0) {
				duracion = s.minutos;
			} else if (s.franja && tramoMinutosMap.has(s.franja)) {
				duracion = tramoMinutosMap.get(s.franja)!;
			}

			if (duracion > 0) {
				if (esLectiva) {
					minsLectivasReal += duracion;
					sesLectivasCount++;
				} else {
					minsNoLectivasReal += duracion;
					sesNoLectivasCount++;
				}
			}
		}

		const minsTotalesReal = minsLectivasReal + minsNoLectivasReal;
		const sesTotalesCount = sesLectivasCount + sesNoLectivasCount;
		const jornadaCode = (prof.jornada || 'Completa').trim();
		const topes = tiposJornadaMap.get(normalizeStr(jornadaCode)) || getDefaultTopesByJornada(jornadaCode);
		const balanceMinutos = minsTotalesReal - topes.totales;

		return {
			id: String(prof.id),
			nombre: prof.nombre,
			jornada: jornadaCode,
			minutosLectivosRealizados: minsLectivasReal,
			minutosNoLectivosRealizados: minsNoLectivasReal,
			minutosTotalesRealizados: minsTotalesReal,
			sesionesLectivasCount: sesLectivasCount,
			sesionesNoLectivasCount: sesNoLectivasCount,
			sesionesTotalesCount: sesTotalesCount,
			topeMinutosLectivos: topes.lectivos,
			topeMinutosNoLectivos: topes.noLectivos,
			topeMinutosTotales: topes.totales,
			balanceMinutos,
			horasLectivasFormatted: formatMinutes(minsLectivasReal),
			horasNoLectivasFormatted: formatMinutes(minsNoLectivasReal),
			horasTotalesFormatted: formatMinutes(minsTotalesReal),
			topeLectivasFormatted: formatMinutes(topes.lectivos),
			topeNoLectivasFormatted: formatMinutes(topes.noLectivos),
			topeTotalesFormatted: formatMinutes(topes.totales),
			balanceFormatted: formatMinutes(balanceMinutos)
		};
	});
}
