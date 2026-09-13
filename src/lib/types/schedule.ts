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
	actividad: string | null;
	clase: string | null;
	aula: string | null;
	rol_aula: string | null;
	fuente: string | null;
	curso_escolar: string | null;
	minutos: number | null;
}

export interface Classroom {
	id: number;
	nombre: string;
	curso_escolar: string;
}
