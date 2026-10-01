export interface Profesor {
    id: string;
    name: string; // O el nombre del campo exacto que tenga tu tabla 'profesores'
    email: string;
    department?: string | null;
    max_lectiva_hours?: number;
    max_total_hours?: number;
}

export interface Actividad {
    id: number; // Es un int4 según tu captura
    nombre: string;
    categoria: string;
    es_lectiva: boolean;
    curso_escolar: string;
    created_at: string;
}

export interface Aula {
    id: string;
    code: string;
    name: string;
}

export interface Sesion {
    id: string;
    professor_id: string;
    activity_id: number; // Vinculada a 'actividades.id' (int4)
    classroom_id: string | null;
    day_of_week: number;
    start_time: string;
    end_time: string;
    group_name: string;
<<<<<<< HEAD
=======
    grupo_desdoble?: string | null;
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
}

export interface SesionWithRelations extends Sesion {
    actividad: Actividad;
    aula: Aula | null;
}
