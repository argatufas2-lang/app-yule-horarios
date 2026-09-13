import { supabase } from '$lib/services/supabaseClient';
import type { SesionWithRelations, Sesion } from '$types/database';

export async function getProfessorSessions(professorId: string): Promise<SesionWithRelations[]> {
    const { data, error } = await supabase
        .from('sesiones')
        .select(`
            *,
            actividad:actividades(*),
            aula:aulas(*)
        `)
        .eq('professor_id', professorId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching professor sessions:', error.message);
        throw new Error(`No se pudieron cargar las sesiones del profesor: ${error.message}`);
    }

    return (data as SesionWithRelations[]) || [];
}

export async function saveSession(sessionData: Omit<Sesion, 'id'>): Promise<string> {
    const { data, error } = await supabase
        .from('sesiones')
        .insert([sessionData])
        .select('id')
        .single();

    if (error) {
        console.error('Error saving session:', error.message);
        throw new Error(`Error al guardar la sesión: ${error.message}`);
    }

    return data.id;
}

export async function deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
        .from('sesiones')
        .delete()
        .eq('id', sessionId);

    if (error) {
        console.error('Error deleting session:', error.message);
        throw new Error(`Error al eliminar la sesión: ${error.message}`);
    }
}
