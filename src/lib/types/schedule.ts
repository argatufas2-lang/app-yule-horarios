export interface TimeSlot {
	id: number;
	orden: number;
	franja: string;
	minutos_maximos: number;
	hora_inicio: string;
	hora_fin: string;
}

export interface Teacher {
	id: string;
	nombre: string;
	perfil: string | null;
	clase_base: string | null;
	jornada: string;
	orden: number | null;
	curso_escolar: string | null;
}

export interface Session {
	id: string;
	profesor_nombre: string;
	dia: number;
	franja: number;
<<<<<<< HEAD
	actividad: string | null;
	clase: string | null;
	aula: string | null;
	rol_aula: string | null;
	fuente: string | null;
	curso_escolar: string | null;
	minutos: number | null;
=======
	dia_semana?: number;
	tramo_id?: number;
	actividad: string | null;
	clase: string | null;
	aula: string | null;
	grupo_desdoble?: string | null;
	rol_aula: string | null;
	fuente?: string | null;
	curso_escolar?: string | null;
	minutos?: number | null;
	es_lectiva?: boolean;
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
}

export interface Classroom {
	id: number;
	nombre: string;
	curso_escolar: string;
}
