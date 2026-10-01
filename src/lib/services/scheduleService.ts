<<<<<<< HEAD
import { supabase } from '$lib/services/supabaseClient';
import { formatJornada, formatRol } from '$lib/utils/formatters';
=======
import { supabase } from './supabaseClient';
import { formatJornada, formatRol } from '../utils/formatters';
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)

export interface TimeSlotItem {
    orden: number;
    time: string;
    label: string;
    type: 'lectiva' | 'recreo' | 'comedor' | 'presencia';
<<<<<<< HEAD
=======
    minutos_maximos?: number;
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
}

export interface EntityOption {
    id: string;
    nombre: string;
    rol?: string;
    jornada?: string;
<<<<<<< HEAD
=======
    clase_base?: string;
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
    edificio?: string;
    capacidad?: string;
    labelText?: string;
}

export interface GridSessionCell {
    id?: string;
    actividad: string;
    clase?: string;
    aula?: string;
<<<<<<< HEAD
    rawData?: any;
}

export function fallbackTimeSlots(): TimeSlotItem[] {
=======
    profesor?: string;
    apoyoProfesor?: string;
    esTutor?: boolean;
    isEusle?: boolean;
    rawData?: any;
}

function cleanGroupCode(val: any): string {
    if (!val) return '';
    return String(val)
        .trim()
        .toLowerCase()
        .replace(/[º°ª\s\-_]/g, '');
}

function esTutorOficialDelGrupo(
    profClaseBase?: string | null,
    targetGroup?: string | null
): boolean {
    if (!profClaseBase || !targetGroup) return false;
    const p = cleanGroupCode(profClaseBase);
    const t = cleanGroupCode(targetGroup);
    if (!p || !t) return false;
    return p === t || p === `lh${t}` || `lh${p}` === t;
}

function isSessionForClassroom(s: any, entityId: string, aulaNombre?: string): boolean {
    const target1 = cleanGroupCode(entityId);
    const target2 = aulaNombre ? cleanGroupCode(aulaNombre) : '';

    if (!target1 && !target2) return false;

    const sessionCodes = [
        cleanGroupCode(s.clase),
        cleanGroupCode(s.group_name),
        cleanGroupCode(s.aula),
        cleanGroupCode(s.classroom_id),
        cleanGroupCode(s.aula_id)
    ].filter(Boolean);

    if (sessionCodes.length === 0) return false;

    return sessionCodes.some((code) => {
        if (target1) {
            if (code === target1) return true;
            if (code === `lh${target1}`) return true;
            if (`lh${code}` === target1) return true;
        }
        if (target2) {
            if (code === target2) return true;
            if (code === `lh${target2}`) return true;
            if (`lh${code}` === target2) return true;
        }
        return false;
    });
}

// Estructura horaria estándar exacta de Profesorado (0 a 9)
export function fallbackTimeSlotsProfesorado(): TimeSlotItem[] {
    return [
        { orden: 0, time: '09:00 - 09:30', label: '1ª Franja', type: 'lectiva' },
        { orden: 1, time: '09:30 - 10:15', label: '2ª Franja', type: 'lectiva' },
        { orden: 2, time: '10:15 - 11:00', label: '3ª Franja', type: 'lectiva' },
        { orden: 3, time: '11:00 - 11:30', label: 'ATSEDENALDIA', type: 'recreo' },
        { orden: 4, time: '11:30 - 12:15', label: '4ª Franja', type: 'lectiva' },
        { orden: 5, time: '12:15 - 13:00', label: '5ª Franja', type: 'lectiva' },
        { orden: 6, time: '13:00 - 14:00', label: '6ª Franja', type: 'lectiva' },
        { orden: 7, time: '14:00 - 15:00', label: 'BAZKARIA', type: 'comedor' },
        { orden: 8, time: '15:00 - 15:45', label: '7ª Franja', type: 'lectiva' },
        { orden: 9, time: '15:45 - 16:30', label: '8ª Franja', type: 'lectiva' }
    ];
}

// Estructura horaria especial de Aulas
export function fallbackTimeSlotsAulas(): TimeSlotItem[] {
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
    return [
        { orden: 0, time: '09:00 - 09:30', label: '1ª Franja', type: 'lectiva' },
        { orden: 1, time: '09:30 - 10:30', label: '2ª Franja', type: 'lectiva' },
        { orden: 2, time: '10:30 - 11:00', label: '3ª Franja', type: 'lectiva' },
        { orden: 3, time: '11:00 - 11:30', label: 'ATSEDENALDIA', type: 'recreo' },
        { orden: 4, time: '11:30 - 12:30', label: '4ª Franja', type: 'lectiva' },
        { orden: 5, time: '12:30 - 13:00', label: '5ª Franja', type: 'lectiva' },
<<<<<<< HEAD
        { orden: 6, time: '13:00 - 14:00', label: '6ª Franja', type: 'lectiva' },
        { orden: 7, time: '14:00 - 15:00', label: 'BAZKARIA', type: 'comedor' },
        { orden: 8, time: '15:00 - 16:00', label: '7ª Franja', type: 'lectiva' },
        { orden: 9, time: '16:00 - 17:00', label: '8ª Franja', type: 'lectiva' }
    ];
}

=======
        { orden: 6, time: '13:00 - 15:00', label: 'BAZKARIA', type: 'comedor' },
        { orden: 7, time: '15:00 - 16:00', label: '7ª Franja (Tarde)', type: 'lectiva' },
        { orden: 8, time: '16:00 - 17:00', label: '8ª Franja (Tarde)', type: 'lectiva' }
    ];
}

export function fallbackTimeSlots(): TimeSlotItem[] {
    return fallbackTimeSlotsProfesorado();
}

>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
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

<<<<<<< HEAD
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
=======
// Consultar tramos horarios diferenciados según la pestaña activa
export async function fetchTimeSlots(activeTab: 'profesorado' | 'aulas' = 'profesorado'): Promise<TimeSlotItem[]> {
    if (activeTab === 'profesorado') {
        try {
            const { data, error } = await supabase
                .from('tramos_horarios_primaria')
                .select('*')
                .order('orden', { ascending: true });

            if (!error && data && data.length >= 8) {
                return data.map((t: { hora_inicio?: string; hora_fin?: string; tipo?: string; descripcion?: string; orden?: number; id: number; minutos_maximos?: number }) => {
                    const horaInicio = t.hora_inicio ? t.hora_inicio.slice(0, 5) : '';
                    const horaFin = t.hora_fin ? t.hora_fin.slice(0, 5) : '';
                    const timeRange = (horaInicio && horaFin) ? `${horaInicio} - ${horaFin}` : '';
                    const ordenNum = Number(t.orden ?? 0);
                    
                    let type: 'lectiva' | 'recreo' | 'comedor' | 'presencia' = 'lectiva';
                    let label = `Franja ${ordenNum}`;

                    if (ordenNum === 3 || timeRange.includes('11:00 - 11:30')) {
                        type = 'recreo';
                        label = 'ATSEDENALDIA';
                    } else if (ordenNum === 7 || timeRange.includes('14:00 - 15:00')) {
                        type = 'comedor';
                        label = 'BAZKARIA';
                    } else if (ordenNum === 0) {
                        label = '1ª Franja';
                    } else if (ordenNum === 1) {
                        label = '2ª Franja';
                    } else if (ordenNum === 2) {
                        label = '3ª Franja';
                    } else if (ordenNum === 4) {
                        label = '4ª Franja';
                    } else if (ordenNum === 5) {
                        label = '5ª Franja';
                    } else if (ordenNum === 6) {
                        label = '6ª Franja';
                    } else if (ordenNum === 8) {
                        label = '7ª Franja';
                    } else if (ordenNum === 9) {
                        label = '8ª Franja';
                    }

                    const defaultSlot = fallbackTimeSlotsProfesorado()[ordenNum];
                    const finalTime = timeRange || (defaultSlot ? defaultSlot.time : '');

                    return {
                        orden: ordenNum,
                        time: finalTime,
                        label,
                        type,
                        minutos_maximos: Number(t.minutos_maximos || 45)
                    };
                });
            }
        } catch (e) {
            console.error('Error al obtener tramos horarios de profesorado:', e);
        }
        return fallbackTimeSlotsProfesorado();
    } else {
        return fallbackTimeSlotsAulas();
    }
}

// Consultar profesores desde Supabase ordenados alfabéticamente
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
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
<<<<<<< HEAD
            const mapped: EntityOption[] = data.map((p: { id: string | number; nombre: string; jornada?: string; perfil?: string }) => {
=======
            const mapped: EntityOption[] = data.map((p: { id: string | number; nombre: string; jornada?: string; perfil?: string; clase_base?: string }) => {
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
                const nombreFormatted = p.nombre ? p.nombre.toUpperCase() : '';
                const jornadaFormatted = formatJornada(p.jornada);
                const rolFormatted = formatRol(p.perfil);

                return {
                    id: String(p.id),
                    nombre: p.nombre,
                    rol: p.perfil || 'Especialista',
                    jornada: p.jornada || 'Jornada completa',
<<<<<<< HEAD
=======
                    clase_base: p.clase_base || undefined,
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
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
<<<<<<< HEAD
        const { data, error } = await supabase
            .from('aulas')
            .select('*')
            .eq('curso_escolar', curso)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error al cargar aulas desde Supabase:', error.message);
            return [];
=======
        let { data, error } = await supabase
            .from('aulas')
            .select('*')
            .eq('curso_escolar', curso)
            .order('nombre', { ascending: true });

        if (error || !data || data.length === 0) {
            const fallback = await supabase
                .from('aulas')
                .select('*');
            if (!fallback.error && fallback.data) {
                data = fallback.data;
            }
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
        }

        if (data && data.length > 0) {
            const mapped: EntityOption[] = data.map((a: { id: string | number; name?: string; nombre?: string; code?: string; edificio?: string; capacidad?: string }) => {
<<<<<<< HEAD
                const aulaNombre = a.name || a.nombre || a.code || `Aula ${a.id}`;
=======
                const aulaNombre = a.nombre || a.name || a.code || `Aula ${a.id}`;
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
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

<<<<<<< HEAD
// Consultar las sesiones reales del profesor o aula seleccionada
=======
// Consultar sesiones para un profesor o aula respetando la vista activa
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
export async function fetchSessionsForEntity(
    entityId: string,
    activeTab: 'profesorado' | 'aulas',
    selectedCurso: string,
<<<<<<< HEAD
    profesoresDisponibles: EntityOption[]
=======
    profesoresDisponibles: EntityOption[],
    aulasDisponibles: EntityOption[] = []
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
): Promise<Record<string, Record<string, GridSessionCell>>> {
    if (!entityId) return {};

    try {
<<<<<<< HEAD
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
=======
        const selectedProfesorObj = profesoresDisponibles.find(p => p.id === entityId || p.nombre === entityId);
        const profesorNombre = selectedProfesorObj?.nombre || (activeTab === 'profesorado' ? entityId : undefined);

        const selectedAulaObj = aulasDisponibles.find(a => a.id === entityId || a.nombre === entityId);
        const aulaNombre = selectedAulaObj?.nombre || (activeTab === 'aulas' ? entityId : undefined);

        console.log(`[SCHEDULE_SERVICE] Cargando sesiones para entityId: ${entityId} (${activeTab}), curso: ${selectedCurso}`);

        let allSessions: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let fetchMore = true;

        // Descarga completa y paginada de sesiones para garantizar que no queden datos cortados
        while (fetchMore) {
            let query = supabase.from('sesiones').select('*');
            if (selectedCurso) {
                query = query.eq('curso_escolar', selectedCurso);
            }

            const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
            if (error) {
                console.error('Error al consultar sesiones de Supabase:', error.message);
                break;
            }
            if (data && data.length > 0) {
                allSessions = allSessions.concat(data);
                if (data.length < pageSize) fetchMore = false;
                else page++;
            } else {
                fetchMore = false;
            }
        }

        // Fallback si por curso no trajo resultados
        if (allSessions.length === 0) {
            const fallbackRes = await supabase.from('sesiones').select('*').limit(2000);
            if (!fallbackRes.error && fallbackRes.data) {
                allSessions = fallbackRes.data;
            }
        }

        console.log(`[SCHEDULE_SERVICE] Descargadas ${allSessions.length} sesiones totales del backend.`);

        const cellMap: Record<string, GridSessionCell> = {};

        const normalize = (val: any) => String(val || '')
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");

        const entityIdNorm = normalize(entityId);
        const targetProfNorm = profesorNombre ? normalize(profesorNombre) : entityIdNorm;
        const targetProfTokens = targetProfNorm.split(' ').filter(t => t.length > 2);
        const targetAulaNorm = aulaNombre ? normalize(aulaNombre) : entityIdNorm;

        const filteredData = (allSessions || []).filter((s: any) => {
            if (activeTab === 'profesorado') {
                const profNameNorm = normalize(s.profesor_nombre || s.profesor);

                if (!profNameNorm) return true;

                if (profNameNorm === targetProfNorm ||
                    profNameNorm.includes(targetProfNorm) ||
                    targetProfNorm.includes(profNameNorm)) {
                    return true;
                }

                // Coincidencia por tokens si el nombre contiene varios términos
                if (targetProfTokens.length > 0) {
                    const matchTokens = targetProfTokens.some(token => profNameNorm.includes(token));
                    if (matchTokens) return true;
                }

                return false;
            } else {
                return isSessionForClassroom(s, entityId, aulaNombre);
            }
        });

        console.log(`[SCHEDULE_SERVICE] Sesiones filtradas para ${entityId}: ${filteredData.length}`);

        const profNames = Array.from(new Set(filteredData.map((s: any) => s.profesor_nombre || s.profesor).filter(Boolean)));
        let profMap: Record<string, { rol: string; claseBase?: string }> = {};

        if (profNames.length > 0) {
            const { data: profsData } = await supabase
                .from('profesores')
                .select('nombre, perfil, clase_base')
                .in('nombre', profNames);

            if (profsData) {
                profsData.forEach((p: any) => {
                    profMap[p.nombre] = {
                        rol: typeof formatRol === 'function' ? formatRol(p.perfil) : (p.perfil || ''),
                        claseBase: p.clase_base
                    };
                });
            }
        }

        // Inspeccionar días para detectar si está en base 0 (0..4) o base 1 (1..5)
        const rawDays = filteredData
            .map((s: any) => Number(s.dia ?? s.day_of_week ?? s.dia_semana))
            .filter((d: number) => !isNaN(d));
        const hasZeroInDays = rawDays.includes(0);

        // Inspeccionar franjas para detectar si está en base 0 (0..9) o base 1 (1..10)
        const rawFranjas = filteredData
            .map((s: any) => Number(s.franja ?? s.slot ?? s.time_slot_id ?? s.tramo_horario_id ?? s.tramo_id ?? s.orden))
            .filter((f: number) => !isNaN(f));
        const hasZeroInFranjas = rawFranjas.includes(0);
        const hasTenInFranjas = rawFranjas.includes(10);
        const maxFranjaDataset = rawFranjas.length > 0 ? Math.max(...rawFranjas) : 0;
        const isBase1Franjas = !hasZeroInFranjas && (hasTenInFranjas || maxFranjaDataset > 9);

        filteredData.forEach((s: any) => {
            const rawDia = s.dia ?? s.day_of_week ?? s.dia_semana;
            const rawFranja = s.franja ?? s.slot ?? s.time_slot_id ?? s.tramo_horario_id ?? s.tramo_id ?? s.orden;

            const diaNum = Number(rawDia);
            const franjaNum = Number(rawFranja);
            
            if (isNaN(diaNum) || isNaN(franjaNum)) return;

            // Ajuste de día
            let dia = diaNum;
            if (!hasZeroInDays && diaNum >= 1 && diaNum <= 5) {
                dia = diaNum - 1;
            }

            // Resolver franja (hora de inicio o base)
            let slotOrden = franjaNum;
            const timeStr = String(s.hora_inicio || s.time || s.tramo || s.hora || '').trim();

            if (timeStr) {
                if (timeStr.includes('09:00')) slotOrden = 0;
                else if (timeStr.includes('09:30')) slotOrden = 1;
                else if (timeStr.includes('10:15') || timeStr.includes('10:30')) slotOrden = 2;
                else if (timeStr.includes('11:00')) slotOrden = 3;
                else if (timeStr.includes('11:30')) slotOrden = 4;
                else if (timeStr.includes('12:15') || timeStr.includes('12:30')) slotOrden = 5;
                else if (timeStr.includes('13:00')) slotOrden = 6;
                else if (timeStr.includes('14:00')) slotOrden = 7;
                else if (timeStr.includes('15:00') || timeStr.includes('15:15') || timeStr.includes('15:30')) slotOrden = 8;
                else if (timeStr.includes('15:45') || timeStr.includes('16:00') || timeStr.includes('16:15') || timeStr.includes('16:30')) slotOrden = 9;
            } else {
                if (isBase1Franjas && franjaNum >= 1) {
                    slotOrden = franjaNum - 1;
                } else if (franjaNum === 6 && maxFranjaDataset <= 7) {
                    slotOrden = 8;
                } else if (franjaNum === 7 && maxFranjaDataset <= 8) {
                    slotOrden = 9;
                }
            }

            if (activeTab === 'aulas') {
                if (slotOrden === 8) slotOrden = 7;
                else if (slotOrden === 9) slotOrden = 8;
            }

            const profName = s.profesor_nombre || s.profesor || '';
            const profInfo = profMap[profName];

            // Un docente es el tutor OFICIAL únicamente si su grupo tutorizado (clase_base) coincide con el grupo/aula consultado
            const isTutorOficial = esTutorOficialDelGrupo(profInfo?.claseBase, targetAulaNorm) ||
                                   esTutorOficialDelGrupo(profInfo?.claseBase, entityId) ||
                                   esTutorOficialDelGrupo(profInfo?.claseBase, s.clase) ||
                                   esTutorOficialDelGrupo(profInfo?.claseBase, s.aula);

            const isEusle = String(s.rol_aula || '').toLowerCase().includes('eusle') ||
                            String(s.actividad || '').toLowerCase().includes('eusle');

            const isSupport = String(s.rol_aula || '').toLowerCase().includes('pt') ||
                              String(s.rol_aula || '').toLowerCase().includes('apoyo') ||
                              String(s.rol_aula || '').toLowerCase().includes('laguntza') ||
                              String(s.rol_aula || '').toLowerCase().includes('hezitzaile') ||
                              String(s.actividad || '').toLowerCase().includes('pt') ||
                              String(s.actividad || '').toLowerCase().includes('laguntza') ||
                              String(s.actividad || '').toLowerCase().includes('apoyo');

            const cellKey = `${dia}_${slotOrden}`;

            if (!cellMap[cellKey]) {
                let mainProf = '';
                let supportProf = '';

                if (isSupport) {
                    supportProf = profName;
                } else {
                    mainProf = (activeTab === 'aulas' && isTutorOficial) ? '' : profName;
                }

                cellMap[cellKey] = {
                    id: s.id ? String(s.id) : undefined,
                    actividad: s.actividad || s.materia || s.nombre || 'Asignatura',
                    clase: s.clase || s.group_name || '',
                    aula: s.aula || '',
                    profesor: mainProf,
                    apoyoProfesor: supportProf,
                    esTutor: isTutorOficial,
                    isEusle: isEusle,
                    rawData: s
                };
            } else {
                const existing = cellMap[cellKey];

                if (isEusle) {
                    existing.isEusle = true;
                }

                if (isSupport) {
                    if (profName) {
                        if (!existing.apoyoProfesor) {
                            existing.apoyoProfesor = profName;
                        } else if (!existing.apoyoProfesor.includes(profName)) {
                            existing.apoyoProfesor += `, ${profName}`;
                        }
                    }
                } else {
                    if (activeTab === 'aulas') {
                        if (!isTutorOficial && profName) {
                            if (!existing.profesor) {
                                existing.profesor = profName;
                            } else if (!existing.profesor.includes(profName)) {
                                existing.profesor += `, ${profName}`;
                            }
                        }
                    } else if (profName) {
                        if (!existing.profesor) {
                            existing.profesor = profName;
                        } else if (!existing.profesor.includes(profName)) {
                            existing.profesor += `, ${profName}`;
                        }
                    }

                    if (!existing.actividad || existing.actividad === 'Asignatura') {
                        existing.actividad = s.actividad || s.materia || s.nombre || 'Asignatura';
                    }
                }
            }
        });

        const grid: Record<string, Record<string, GridSessionCell>> = {
            [entityId]: cellMap
        };

        if (profesorNombre && profesorNombre !== entityId) {
            grid[profesorNombre] = cellMap;
        }

        if (aulaNombre && aulaNombre !== entityId) {
            grid[aulaNombre] = cellMap;
        }

        return grid;

    } catch (err) {
        console.error('Excepción en fetchSessionsForEntity:', err);
>>>>>>> 4938176 (Reiniciar repositorio limpio - App Horarios)
        return {};
    }
}
