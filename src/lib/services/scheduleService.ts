import { supabase } from '$lib/services/supabaseClient';
import { formatJornada, formatRol } from '$lib/utils/formatters';

export interface TimeSlotItem {
    orden: number;
    time: string;
    label: string;
    type: 'lectiva' | 'recreo' | 'comedor' | 'presencia';
}

export interface EntityOption {
    id: string;
    nombre: string;
    rol?: string;
    jornada?: string;
    edificio?: string;
    capacidad?: string;
    labelText?: string;
}

export interface GridSessionCell {
    id?: string;
    actividad: string;
    clase?: string;
    aula?: string;
    rawData?: any;
}

export function fallbackTimeSlots(): TimeSlotItem[] {
    return [
        { orden: 0, time: '09:00 - 09:30', label: '1ª Franja', type: 'lectiva' },
        { orden: 1, time: '09:30 - 10:30', label: '2ª Franja', type: 'lectiva' },
        { orden: 2, time: '10:30 - 11:00', label: '3ª Franja', type: 'lectiva' },
        { orden: 3, time: '11:00 - 11:30', label: 'ATSEDENALDIA', type: 'recreo' },
        { orden: 4, time: '11:30 - 12:30', label: '4ª Franja', type: 'lectiva' },
        { orden: 5, time: '12:30 - 13:00', label: '5ª Franja', type: 'lectiva' },
        { orden: 6, time: '13:00 - 14:00', label: '6ª Franja', type: 'lectiva' },
        { orden: 7, time: '14:00 - 15:00', label: 'BAZKARIA', type: 'comedor' },
        { orden: 8, time: '15:00 - 16:00', label: '7ª Franja', type: 'lectiva' },
        { orden: 9, time: '16:00 - 17:00', label: '8ª Franja', type: 'lectiva' }
    ];
}

// Consultar el total global de profesores en Supabase
export async function fetchTotalProfesorado(selectedCurso: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('profesores')
            .select('*', { count: 'exact', head: true })
            .eq('curso_escolar', selectedCurso);

        if (!error && count !== null) {
            return count;
        }
    } catch (e) {
        console.error('Error al consultar el recuento total de profesorado:', e);
    }
    return 0;
}

// Consultar tramos horarios de Supabase
export async function fetchTimeSlots(): Promise<TimeSlotItem[]> {
    try {
        const { data, error } = await supabase
            .from('tramos_horarios_primaria')
            .select('*')
            .order('orden', { ascending: true });

        if (error) {
            console.error('Error al cargar tramos horarios de Supabase:', error.message);
            return fallbackTimeSlots();
        }

        if (data && data.length > 0) {
            return data.map((t: { hora_inicio?: string; hora_fin?: string; tipo?: string; descripcion?: string; orden?: number; id: number }) => {
                const horaInicio = t.hora_inicio ? t.hora_inicio.slice(0, 5) : '';
                const horaFin = t.hora_fin ? t.hora_fin.slice(0, 5) : '';
                const timeRange = `${horaInicio} - ${horaFin}`;
                
                let type: 'lectiva' | 'recreo' | 'comedor' | 'presencia' = 'lectiva';
                const tipoLower = (t.tipo || '').toLowerCase();
                const descLower = (t.descripcion || '').toLowerCase();

                if ((timeRange.includes('11:00') && timeRange.includes('11:30')) || tipoLower.includes('recreo') || descLower.includes('recreo') || descLower.includes('atseden')) {
                    type = 'recreo';
                } else if ((timeRange.includes('14:00') && timeRange.includes('15:00')) || tipoLower.includes('comedor') || descLower.includes('comedor') || descLower.includes('bazkaria')) {
                    type = 'comedor';
                } else if (tipoLower.includes('guardia') || descLower.includes('zaintza') || tipoLower.includes('presencia')) {
                    type = 'presencia';
                }

                return {
                    orden: t.orden ?? 0,
                    time: timeRange,
                    label: t.descripcion || `Franja ${t.orden ?? 0}`,
                    type
                };
            });
        }
    } catch (e) {
        console.error('Error al obtener tramos horarios:', e);
    }
    return fallbackTimeSlots();
}

// Consultar profesores desde Supabase ordenados strictly de la A a la Z
export async function fetchProfesores(curso: string): Promise<EntityOption[]> {
    try {
        const { data, error } = await supabase
            .from('profesores')
            .select('*')
            .eq('curso_escolar', curso)
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error al cargar profesores desde Supabase:', error.message);
            return [];
        }

        if (data && data.length > 0) {
            const mapped: EntityOption[] = data.map((p: { id: string | number; nombre: string; jornada?: string; perfil?: string }) => {
                const nombreFormatted = p.nombre ? p.nombre.toUpperCase() : '';
                const jornadaFormatted = formatJornada(p.jornada);
                const rolFormatted = formatRol(p.perfil);

                return {
                    id: String(p.id),
                    nombre: p.nombre,
                    rol: p.perfil || 'Especialista',
                    jornada: p.jornada || 'Jornada completa',
                    labelText: `${nombreFormatted} - ${jornadaFormatted} - ${rolFormatted}`
                };
            });

            mapped.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
            return mapped;
        }
    } catch (err) {
        console.error('Error de red/servidor al obtener profesores:', err);
    }
    return [];
}

// Consultar aulas/grupos desde Supabase ordenados alfabéticamente
export async function fetchAulas(curso: string): Promise<EntityOption[]> {
    try {
        const { data, error } = await supabase
            .from('aulas')
            .select('*')
            .eq('curso_escolar', curso)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error al cargar aulas desde Supabase:', error.message);
            return [];
        }

        if (data && data.length > 0) {
            const mapped: EntityOption[] = data.map((a: { id: string | number; name?: string; nombre?: string; code?: string; edificio?: string; capacidad?: string }) => {
                const aulaNombre = a.name || a.nombre || a.code || `Aula ${a.id}`;
                return {
                    id: String(a.id),
                    nombre: aulaNombre,
                    edificio: a.edificio || 'Edificio Principal',
                    capacidad: a.capacidad || 'Estándar',
                    labelText: aulaNombre.toUpperCase()
                };
            });

            mapped.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
            return mapped;
        }
    } catch (err) {
        console.error('Error de red/servidor al obtener aulas:', err);
    }
    return [];
}

// Consultar las sesiones reales del profesor o aula seleccionada
export async function fetchSessionsForEntity(
    entityId: string,
    activeTab: 'profesorado' | 'aulas',
    selectedCurso: string,
    profesoresDisponibles: EntityOption[]
): Promise<Record<string, Record<string, GridSessionCell>>> {
    if (!entityId) return {};

    try {
        const selectedProfesorObj = profesoresDisponibles.find(p => p.id === entityId);
        const profesorNombre = selectedProfesorObj?.nombre;

        let query = supabase
            .from('sesiones')
            .select('*')
            .eq('curso_escolar', selectedCurso);

        if (activeTab === 'profesorado') {
            if (profesorNombre) {
                query = query.eq('profesor_nombre', profesorNombre);
            } else {
                query = query.eq('professor_id', entityId);
            }
        } else {
            query = query.eq('classroom_id', entityId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error al consultar sesiones:', error.message);
            return {};
        }

        const grid: Record<string, Record<string, GridSessionCell>> = {
            [entityId]: {}
        };

        if (data && data.length > 0) {
            data.forEach((s: { id?: string | number; dia?: number; day_of_week?: number; franja?: number; tramo_id?: number; orden?: number; actividad?: string; group_name?: string; clase?: string; grupo?: string; aula?: string }) => {
                const rawDia = s.dia ?? s.day_of_week ?? 0;
                const dia = Number(rawDia);
                const franja = Number(s.franja ?? s.tramo_id ?? s.orden ?? 0);
                const key = `${dia}_${franja}`;

                grid[entityId][key] = {
                    id: s.id ? String(s.id) : undefined,
                    actividad: s.actividad || s.group_name || 'Asignatura',
                    clase: s.clase || s.grupo || '',
                    aula: s.aula || '',
                    rawData: s
                };
            });
        }

        return grid;
    } catch (e) {
        console.error('Error procesando sesiones:', e);
        return {};
    }
}
