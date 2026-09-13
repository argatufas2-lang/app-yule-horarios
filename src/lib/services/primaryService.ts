import { supabase } from './supabaseClient';
import type { Teacher, TimeSlot, Session } from '../types/schedule';

export async function getTeachers(curso: string): Promise<Teacher[]> {
	const { data, error } = await supabase
		.from('profesores')
		.select('*')
		.eq('curso_escolar', curso)
		.order('orden', { ascending: true, nullsFirst: false });

	if (error) {
		console.error('Error fetching teachers:', error);
		throw new Error(`Error al obtener los profesores: ${error.message}`);
	}

	return (data as Teacher[]) || [];
}

export async function getTimeSlots(): Promise<TimeSlot[]> {
	const { data, error } = await supabase
		.from('tramos_horarios_primaria')
		.select('*')
		.order('orden', { ascending: true });

	if (error) {
		console.error('Error fetching time slots:', error);
		throw new Error(`Error al obtener los tramos horarios: ${error.message}`);
	}

	return (data as TimeSlot[]) || [];
}

export async function getSessionsForTeacher(curso: string, profesorNombre: string): Promise<Session[]> {
	const { data, error } = await supabase
		.from('sesiones')
		.select('*')
		.eq('curso_escolar', curso)
		.eq('profesor_nombre', profesorNombre);

	if (error) {
		console.error('Error fetching sessions for teacher:', error);
		throw new Error(`Error al obtener las sesiones del profesor: ${error.message}`);
	}

	return (data as Session[]) || [];
}

export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
	const { data, error } = await supabase
		.from('sesiones')
		.update(updates)
		.eq('id', sessionId)
		.select()
		.single();

	if (error) {
		console.error('Error updating session:', error);
		throw new Error(`Error al actualizar la sesión: ${error.message}`);
	}

	return data as Session;
}

export async function createSession(session: Omit<Session, 'id'>): Promise<Session> {
	const { data, error } = await supabase
		.from('sesiones')
		.insert([session])
		.select()
		.single();

	if (error) {
		console.error('Error creating session:', error);
		throw new Error(`Error al crear la sesión: ${error.message}`);
	}

	return data as Session;
}

export async function deleteSession(sessionId: string): Promise<void> {
	const { error } = await supabase
		.from('sesiones')
		.delete()
		.eq('id', sessionId);

	if (error) {
		console.error('Error deleting session:', error);
		throw new Error(`Error al eliminar la sesión: ${error.message}`);
	}
}
