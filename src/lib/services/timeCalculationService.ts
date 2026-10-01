import type { Session } from '../types/schedule';

export interface JornadaConfig {
	minutosLectivosObjetivo: number;
	minutosNoLectivosObjetivo: number;
}

export interface ScheduleSummary {
	minutosLectivos: number;
	minutosNoLectivos: number;
	minutosTotales: number;
	horasLectivasFormatted: string;
	horasNoLectivasFormatted: string;
	horasTotalesFormatted: string;
	balanceLectivasMinutos: number;
	balanceLectivasFormatted: string;
	balanceNoLectivasMinutos: number;
	balanceNoLectivasFormatted: string;
	balanceTotalMinutos: number;
	balanceTotalFormatted: string;
}

/**
 * Convierte un número de minutos a formato "Xh Ym" o "-Xh Ym" si es negativo.
 */
export function formatMinutes(minutes: number): string {
	const isNegative = minutes < 0;
<<<<<<< HEAD
	const absMinutes = Math.abs(minutes);
	const hours = Math.floor(absMinutes / 60);
	const mins = absMinutes % 60;
=======
	const totalRounded = Math.round(Math.abs(minutes));
	const hours = Math.floor(totalRounded / 60);
	const mins = totalRounded % 60;
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
	
	const formatted = `${hours}h ${mins}m`;
	return isNegative ? `-${formatted}` : formatted;
}

/**
<<<<<<< HEAD
 * Determina si una sesión se considera lectiva o no lectiva.
 */
export function isLectivaSession(session: Session): boolean {
	if (!session.actividad) return false;
	const actLower = session.actividad.toLowerCase();
	// Si la actividad indica explícitamente no lectiva o guardia/recreo/coordinación
	if (actLower.includes('no lectiva') || actLower.includes('recreo') || actLower.includes('coordinacion')) {
		return false;
	}
=======
 * Normaliza cadenas de texto quitando tildes, diacríticos, mayúsculas y espacios sobrantes.
 */
function normalizeText(text: string | null | undefined): string {
	if (!text) return '';
	return text
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
}

/**
 * Determina si una sesión se considera lectiva o no lectiva priorizando el catálogo y patrones de texto.
 */
export function isLectivaSession(
	session: Session,
	actividadesCatalogo?: Array<{ nombre: string; es_lectiva: boolean }>
): boolean {
	if (!session.actividad) {
		return session.es_lectiva ?? false;
	}

	const actLimpia = session.actividad.trim().toUpperCase();

	// 1. Prioridad máxima: Búsqueda directa en el catálogo de actividades oficial
	if (actividadesCatalogo && actividadesCatalogo.length > 0) {
		const encontrada = actividadesCatalogo.find(
			(a) => a.nombre.trim().toUpperCase() === actLimpia
		);
		if (encontrada && encontrada.es_lectiva !== undefined && encontrada.es_lectiva !== null) {
			return encontrada.es_lectiva;
		}
	}

	// 2. Segunda prioridad: Patrones de texto no lectivos conocidos (evita que valores por defecto en BD fallen)
	const normActividad = normalizeText(session.actividad);
	const patronesNoLectivos = [
		'no lectiva',
		'ez irakaskuntza',
		'recreo',
		'atsedenaldia',
		'coordinacion',
		'koordinazioa',
		'formakuntza',
		'formacion',
		'guardia',
		'zaintza',
		'tutoretza',
		'tutoria',
		'mintegia',
		'seminario',
		'bilera',
		'reunion',
		'bazkaria',
		'comedor',
		'presencia',
		'bat',
		'pedagogika',
		'maila',
		'zikloa',
		'gurasoak',
		'lan pertsonala',
		'obk',
		'ikt',
		'irratsaioa',
		'exklusiba',
		'beste batzuk',
		'besteak',
		'atentzioa',
		'atencion'
	];

	const esPatronNoLectivo = patronesNoLectivos.some((patron) => normActividad.includes(patron));
	if (esPatronNoLectivo) {
		return false;
	}

	// 3. Tercera prioridad: Propiedad explícita de la sesión si existe
	if (session.es_lectiva !== undefined && session.es_lectiva !== null) {
		return session.es_lectiva;
	}

	// 4. Por defecto se considera lectiva
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
	return true;
}

/**
 * Calcula el resumen de horas lectivas, no lectivas y el balance respecto a los objetivos de jornada.
 */
export function calculateScheduleSummary(
	sessions: Session[],
<<<<<<< HEAD
	jornadaConfig: JornadaConfig
=======
	jornadaConfig: JornadaConfig,
	actividadesCatalogo?: Array<{ nombre: string; es_lectiva: boolean }>
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
): ScheduleSummary {
	let minutosLectivos = 0;
	let minutosNoLectivos = 0;

<<<<<<< HEAD
	for (const session of sessions) {
		const mins = session.minutos ?? 0;
		if (mins <= 0) continue;

		if (isLectivaSession(session)) {
=======
	const franjasProcesadas = new Map<string, Session>();

	for (const session of sessions) {
		const diaKey = session.dia ?? session.dia_semana;
		const franjaKey = session.franja ?? session.tramo_id ?? (session as { time_slot_id?: number }).time_slot_id;

		if (diaKey === undefined || franjaKey === undefined) {
			const actNorm = session.actividad ? session.actividad.trim().toUpperCase() : '';
			if (!actNorm || actNorm === 'BAZKARIA' || actNorm === 'ATSEDENALDIA' || actNorm === 'RECREO') {
				continue;
			}

			const mins = Number(session.minutos) > 0 ? Number(session.minutos) : 45;
			if (mins > 0) {
				if (isLectivaSession(session, actividadesCatalogo)) {
					minutosLectivos += mins;
				} else {
					minutosNoLectivos += mins;
				}
			}
			continue;
		}

		// Identificar de forma única por ID de sesión si existe, o por día/franja/actividad
		const slotKey = session.id 
			? `id_${session.id}`
			: `${diaKey}_${franjaKey}_${session.actividad?.trim().toUpperCase() || 'empty'}`;

		if (!franjasProcesadas.has(slotKey)) {
			franjasProcesadas.set(slotKey, session);
		}
	}

	for (const session of franjasProcesadas.values()) {
		// Normalizar nombre de la actividad
		const actNorm = session.actividad ? session.actividad.trim().toUpperCase() : '';

		// BAZKARIA y ATSEDENALDIA o celdas vacías/pasivas por defecto aportan 0 minutos al cómputo
		if (!actNorm || actNorm === 'BAZKARIA' || actNorm === 'ATSEDENALDIA' || actNorm === 'RECREO') {
			continue;
		}

		const mins = Number(session.minutos) > 0 ? Number(session.minutos) : 45;
		if (mins <= 0) continue;

		if (isLectivaSession(session, actividadesCatalogo)) {
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
			minutosLectivos += mins;
		} else {
			minutosNoLectivos += mins;
		}
	}

	const minutosTotales = minutosLectivos + minutosNoLectivos;
	const minutosTotalesObjetivo = jornadaConfig.minutosLectivosObjetivo + jornadaConfig.minutosNoLectivosObjetivo;

	const balanceLectivasMinutos = minutosLectivos - jornadaConfig.minutosLectivosObjetivo;
	const balanceNoLectivasMinutos = minutosNoLectivos - jornadaConfig.minutosNoLectivosObjetivo;
	const balanceTotalMinutos = minutosTotales - minutosTotalesObjetivo;

	return {
		minutosLectivos,
		minutosNoLectivos,
		minutosTotales,
		horasLectivasFormatted: formatMinutes(minutosLectivos),
		horasNoLectivasFormatted: formatMinutes(minutosNoLectivos),
		horasTotalesFormatted: formatMinutes(minutosTotales),
		balanceLectivasMinutos,
		balanceLectivasFormatted: formatMinutes(balanceLectivasMinutos),
		balanceNoLectivasMinutos,
		balanceNoLectivasFormatted: formatMinutes(balanceNoLectivasMinutos),
		balanceTotalMinutos,
		balanceTotalFormatted: formatMinutes(balanceTotalMinutos)
	};
}
