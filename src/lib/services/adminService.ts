import { supabase } from '$lib/services/supabaseClient';

export interface ProfesorRecord {
    id: string;
    nombre: string;
    perfil: string | null;
    jornada: string | null;
    curso_escolar: string | null;
    orden?: number | null;
}

export interface ActividadRecord {
    id: number;
    nombre: string;
    categoria: string | null;
    es_lectiva: boolean;
    curso_escolar: string | null;
}

export interface AulaRecord {
    id: string;
    code: string | null;
    nombre: string;
    edificio?: string | null;
    capacidad?: string | null;
    curso_escolar: string | null;
}

// --- PROFESORES ---
export async function getAdminProfesores(curso: string): Promise<ProfesorRecord[]> {
    const { data, error } = await supabase
        .from('profesores')
        .select('*')
        .eq('curso_escolar', curso)
        .order('nombre', { ascending: true });

    if (error) throw new Error(`Error al cargar profesores: ${error.message}`);
    return data || [];
}

export async function createAdminProfesor(profesor: Omit<ProfesorRecord, 'id'>): Promise<ProfesorRecord> {
    const { data, error } = await supabase
        .from('profesores')
        .insert([profesor])
        .select()
        .single();

    if (error) throw new Error(`Error al crear profesor: ${error.message}`);
    return data;
}

export async function updateAdminProfesor(id: string, updates: Partial<ProfesorRecord>): Promise<ProfesorRecord> {
    const { data, error } = await supabase
        .from('profesores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Error al actualizar profesor: ${error.message}`);
    return data;
}

export async function deleteAdminProfesor(id: string): Promise<void> {
    const { error } = await supabase
        .from('profesores')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Error al eliminar profesor: ${error.message}`);
}

// --- ASIGNATURAS / ACTIVIDADES ---
export async function getAdminActividades(curso: string): Promise<ActividadRecord[]> {
    const { data, error } = await supabase
        .from('actividades')
        .select('*')
        .eq('curso_escolar', curso)
        .order('nombre', { ascending: true });

    if (error) throw new Error(`Error al cargar asignaturas: ${error.message}`);
    return data || [];
}

export async function createAdminActividad(actividad: Omit<ActividadRecord, 'id'>): Promise<ActividadRecord> {
    const { data, error } = await supabase
        .from('actividades')
        .insert([actividad])
        .select()
        .single();

    if (error) throw new Error(`Error al crear asignatura: ${error.message}`);
    return data;
}

export async function updateAdminActividad(id: number, updates: Partial<ActividadRecord>): Promise<ActividadRecord> {
    const { data, error } = await supabase
        .from('actividades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Error al actualizar asignatura: ${error.message}`);
    return data;
}

export async function deleteAdminActividad(id: number): Promise<void> {
    const { error } = await supabase
        .from('actividades')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Error al eliminar asignatura: ${error.message}`);
}

// --- AULAS ---
export async function getAdminAulas(curso: string): Promise<AulaRecord[]> {
    const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .eq('curso_escolar', curso)
        .order('nombre', { ascending: true });

    if (error) throw new Error(`Error al cargar aulas: ${error.message}`);
    return data || [];
}

export async function createAdminAula(aula: Omit<AulaRecord, 'id'>): Promise<AulaRecord> {
    const { data, error } = await supabase
        .from('aulas')
        .insert([aula])
        .select()
        .single();

    if (error) throw new Error(`Error al crear aula: ${error.message}`);
    return data;
}

export async function updateAdminAula(id: string, updates: Partial<AulaRecord>): Promise<AulaRecord> {
    const { data, error } = await supabase
        .from('aulas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Error al actualizar aula: ${error.message}`);
    return data;
}

export async function deleteAdminAula(id: string): Promise<void> {
    const { error } = await supabase
        .from('aulas')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Error al eliminar aula: ${error.message}`);
}
