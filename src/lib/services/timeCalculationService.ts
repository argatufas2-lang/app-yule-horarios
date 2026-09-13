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
	const absMinutes = Math.abs(minutes);
	const hours = Math.floor(absMinutes / 60);
	const mins = absMinutes % 60;
	
	const formatted = `${hours}h ${mins}m`;
	return isNegative ? `-${formatted}` : formatted;
}

/**
 * Determina si una sesión se considera lectiva o no lectiva.
 */
export function isLectivaSession(session: Session): boolean {
	if (!session.actividad) return false;
	const actLower = session.actividad.toLowerCase();
	// Si la actividad indica explícitamente no lectiva o guardia/recreo/coordinación
	if (actLower.includes('no lectiva') || actLower.includes('recreo') || actLower.includes('coordinacion')) {
		return false;
	}
	return true;
}

/**
 * Calcula el resumen de horas lectivas, no lectivas y el balance respecto a los objetivos de jornada.
 */
export function calculateScheduleSummary(
	sessions: Session[],
	jornadaConfig: JornadaConfig
): ScheduleSummary {
	let minutosLectivos = 0;
	let minutosNoLectivos = 0;

	for (const session of sessions) {
		const mins = session.minutos ?? 0;
		if (mins <= 0) continue;

		if (isLectivaSession(session)) {
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
