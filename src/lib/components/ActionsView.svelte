<script lang="ts">
    import { onMount } from 'svelte';
    import ActionToolbar from './ActionToolbar.svelte';
    import { supabase } from '$lib/services/supabaseClient';

    // Estados de navegación y selección
    export let selectedCurso: string = '2026-2027';
    export let cursosDisponibles: string[] = ['2026-2027', '2025-2026', '2024-2025'];
    
    let activeTab: 'profesorado' | 'aulas' = 'profesorado';

    // Listados dinámicos obtenidos de Supabase
    export let profesoresDisponibles: { id: string; nombre: string; rol?: string; jornada?: string }[] = [];
    export let aulasDisponibles: { id: string; nombre: string; edificio?: string; capacidad?: string }[] = [];

    export let selectedEntityId: string = '';

    let loading: boolean = false;

    // Consultar profesores desde Supabase
    async function fetchProfesores(curso: string) {
        loading = true;
        try {
            const { data, error } = await supabase
                .from('profesores')
                .select('*')
                .eq('curso_escolar', curso)
                .order('orden', { ascending: true, nullsFirst: false });

            if (error) {
                console.error('Error al cargar profesores desde Supabase:', error.message);
                return;
            }

            if (data && data.length > 0) {
                profesoresDisponibles = data.map((p) => ({
                    id: String(p.id),
                    nombre: p.nombre,
                    rol: p.perfil || 'Especialista',
                    jornada: p.jornada || 'Completa'
                }));
            } else {
                profesoresDisponibles = [];
            }
        } catch (err) {
            console.error('Error de red/servidor al obtener profesores:', err);
        } finally {
            loading = false;
        }
    }

    // Consultar aulas/grupos desde Supabase
    async function fetchAulas(curso: string) {
        loading = true;
        try {
            const { data, error } = await supabase
                .from('aulas')
                .select('*')
                .eq('curso_escolar', curso);

            if (error) {
                console.error('Error al cargar aulas desde Supabase:', error.message);
                return;
            }

            if (data && data.length > 0) {
                aulasDisponibles = data.map((a) => ({
                    id: String(a.id),
                    nombre: a.name || a.nombre || a.code || `Aula ${a.id}`,
                    edificio: a.edificio || 'Edificio Principal',
                    capacidad: a.capacidad || 'Estándar'
                }));
            } else {
                aulasDisponibles = [];
            }
        } catch (err) {
            console.error('Error de red/servidor al obtener aulas:', err);
        } finally {
            loading = false;
        }
    }

    // Cargar los datos correspondientes según la pestaña y el curso activo
    async function loadDataForCurrentTab() {
        if (activeTab === 'profesorado') {
            await fetchProfesores(selectedCurso);
            if (profesoresDisponibles.length > 0) {
                const exists = profesoresDisponibles.some(p => p.id === selectedEntityId);
                if (!exists) selectedEntityId = profesoresDisponibles[0].id;
            } else {
                selectedEntityId = '';
            }
        } else {
            await fetchAulas(selectedCurso);
            if (aulasDisponibles.length > 0) {
                const exists = aulasDisponibles.some(a => a.id === selectedEntityId);
                if (!exists) selectedEntityId = aulasDisponibles[0].id;
            } else {
                selectedEntityId = '';
            }
        }
    }

    onMount(() => {
        loadDataForCurrentTab();
    });

    // Lista dinámica para el selector según la pestaña
    $: selectorOptions = activeTab === 'profesorado' 
        ? profesoresDisponibles 
        : aulasDisponibles;

    // Información del elemento seleccionado (Profesor o Aula)
    $: currentTeacher = profesoresDisponibles.find(p => p.id === selectedEntityId) || profesoresDisponibles[0];
    $: currentClassroom = aulasDisponibles.find(a => a.id === selectedEntityId) || aulasDisponibles[0];

    // Al cambiar de pestaña
    async function handleTabChange(tab: 'profesorado' | 'aulas') {
        activeTab = tab;
        await loadDataForCurrentTab();
    }

    // Días de la semana
    const daysOfWeek = [
        { id: 1, name: 'Astelehena', short: 'Lunes' },
        { id: 2, name: 'Asteartea', short: 'Martes' },
        { id: 3, name: 'Asteazkena', short: 'Miércoles' },
        { id: 4, name: 'Osteguna', short: 'Jueves' },
        { id: 5, name: 'Ostirala', short: 'Viernes' }
    ];

    // Franjas horarias
    const timeSlots = [
        { orden: 1, time: '09:00 - 10:00', label: '1ª Franja', type: 'lectiva' },
        { orden: 2, time: '10:00 - 11:00', label: '2ª Franja', type: 'lectiva' },
        { orden: 3, time: '11:00 - 11:30', label: 'Jolas-ordua / Recreo', type: 'recreo' },
        { orden: 4, time: '11:30 - 12:30', label: '3ª Franja', type: 'lectiva' },
        { orden: 5, time: '12:30 - 14:30', label: 'Bazcaria / Comedor', type: 'comedor' },
        { orden: 6, time: '14:30 - 15:30', label: '4ª Franja', type: 'lectiva' },
        { orden: 7, time: '15:30 - 16:30', label: '5ª Franja', type: 'lectiva' },
        { orden: 8, time: '16:30 - 17:30', label: 'Zaintza / Presencia', type: 'presencia' }
    ];

    // Matriz de horario para Profesores (ID -> Franja)
    const teacherScheduleGrid: Record<string, Record<number, { actividad: string; clase?: string; aula?: string }>> = {
        '1': {
            1: { actividad: 'Euskera', clase: 'LH 2A', aula: 'Aula 201' },
            2: { actividad: 'Gaztelania', clase: 'LH 2A', aula: 'Aula 201' },
            4: { actividad: 'Ingelesa', clase: 'LH 3B', aula: 'Aula Idiomas' },
            6: { actividad: 'Tutoretza', clase: 'LH 2A', aula: 'Aula 201' },
            7: { actividad: 'Koordinazioa', clase: 'Irakasleak', aula: 'Mintegia' }
        },
        '2': {
            1: { actividad: 'Matematika', clase: 'LH 4A', aula: 'Aula 401' },
            2: { actividad: 'Ingurunea', clase: 'LH 4A', aula: 'Aula 401' },
            4: { actividad: 'Gaztelania', clase: 'LH 4A', aula: 'Aula 401' },
            6: { actividad: 'Gorputz Hezkuntza', clase: 'LH 4A', aula: 'Gimnasio' }
        }
    };

    // Matriz de horario para Aulas y Grupos (ID -> Franja)
    const classroomScheduleGrid: Record<string, Record<number, { actividad: string; profesor?: string; grupo?: string }>> = {
        'a2': { // LH 2A - Aula 201
            1: { actividad: 'Euskera', profesor: 'ALBA', grupo: 'LH 2A' },
            2: { actividad: 'Gaztelania', profesor: 'ALBA', grupo: 'LH 2A' },
            4: { actividad: 'Matematika', profesor: 'MIKEL', grupo: 'LH 2A' },
            6: { actividad: 'Tutoretza', profesor: 'ALBA', grupo: 'LH 2A' }
        },
        'a3': { // Gimnasio
            6: { actividad: 'Gorputz Hezkuntza', profesor: 'MIKEL', grupo: 'LH 4A' }
        },
        'a4': { // Aula Idiomas
            4: { actividad: 'Ingelesa', profesor: 'ALBA', grupo: 'LH 3B' }
        }
    };

    // Manejadores de eventos de ActionToolbar
    async function handleSelectCurso(event: CustomEvent<string>) {
        selectedCurso = event.detail;
        console.log('Curso seleccionado:', selectedCurso);
        await loadDataForCurrentTab();
    }

    function handleSelectEntity(event: CustomEvent<string>) {
        selectedEntityId = event.detail;
        console.log('Elemento seleccionado ID:', selectedEntityId);
    }

    function handleFinDeCurso() {
        console.log('Acción: Fin de Curso (LH)');
    }

    function handleControlJornada() {
        console.log('Acción: Control de Jornada');
    }

    function handleImprimirHorario() {
        window.print();
    }

    function handleImprimirTodos() {
        console.log('Acción: Imprimir Todos');
    }

    function handleAdministracion() {
        console.log('Acción: Administración');
    }

    function handleImportarAsc() {
        console.log('Acción: Importar PDF aSc');
    }
</script>

<div class="flex flex-col min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors">
    <!-- Barra de Herramientas Superior Reutilizada -->
    <ActionToolbar
        {selectedCurso}
        {cursosDisponibles}
        selectedProfesor={selectedEntityId}
        profesoresDisponibles={selectorOptions}
        on:selectCurso={handleSelectCurso}
        on:selectProfesor={handleSelectEntity}
        on:finDeCurso={handleFinDeCurso}
        on:controlJornada={handleControlJornada}
        on:imprimirHorario={handleImprimirHorario}
        on:imprimirTodos={handleImprimirTodos}
        on:administracion={handleAdministracion}
        on:importarAsc={handleImportarAsc}
    />

    <!-- Área de Contenido Principal -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        <!-- Pestañas de Navegación Interna -->
        <div class="border-b border-slate-200 dark:border-gray-700">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    type="button"
                    on:click={() => handleTabChange('profesorado')}
                    class="py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 {activeTab === 'profesorado' ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-400 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-gray-400 dark:hover:text-gray-300'}"
                >
                    👨‍🏫 Profesorado (Irakasleak)
                </button>

                <button
                    type="button"
                    on:click={() => handleTabChange('aulas')}
                    class="py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 {activeTab === 'aulas' ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-400 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-gray-400 dark:hover:text-gray-300'}"
                >
                    🏫 Aulas y Grupos (Gela / Taldeak)
                </button>
            </nav>
        </div>

        <!-- Tarjeta Informativa Unificada -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {#if activeTab === 'profesorado'}
                <!-- Información del Profesor -->
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-lg border border-sky-200 dark:border-sky-700">
                        {currentTeacher?.nombre ? currentTeacher.nombre.charAt(0) : 'P'}
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-gray-100">
                            {currentTeacher?.nombre || (loading ? 'Cargando profesores...' : 'Sin profesores disponibles')}
                        </h2>
                        <div class="flex flex-wrap items-center gap-2 mt-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                                {currentTeacher?.rol || 'Especialista'}
                            </span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Jornada: {currentTeacher?.jornada || 'Completa'}
                            </span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                Curso: {selectedCurso}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg border border-slate-100 dark:border-gray-700">
                    <div>
                        <span class="block text-xs text-slate-400 font-medium">Lectivas asignadas:</span>
                        <strong class="text-slate-800 dark:text-gray-100">14h 00m / 15h 00m</strong>
                    </div>
                    <div class="h-8 w-px bg-slate-200 dark:bg-gray-600"></div>
                    <div>
                        <span class="block text-xs text-slate-400 font-medium">Balance total:</span>
                        <strong class="text-emerald-600 dark:text-emerald-400">+0h 30m</strong>
                    </div>
                </div>
            {:else}
                <!-- Información del Aula/Grupo -->
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-lg border border-amber-200 dark:border-amber-700">
                        🏫
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-gray-100">
                            {currentClassroom?.nombre || (loading ? 'Cargando aulas...' : 'Sin aulas disponibles')}
                        </h2>
                        <div class="flex flex-wrap items-center gap-2 mt-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                {currentClassroom?.edificio || 'Edificio Principal'}
                            </span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                                Capacidad: {currentClassroom?.capacidad || 'Estándar'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg border border-slate-100 dark:border-gray-700">
                    <div>
                        <span class="block text-xs text-slate-400 font-medium">Ocupación lectiva:</span>
                        <strong class="text-sky-600 dark:text-sky-400">85% Ocupada</strong>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Cuadrícula de Horario Semanal Corporativa -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full border-collapse text-center text-xs md:text-sm">
                    <thead>
                        <tr class="bg-sky-50/80 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border-b border-slate-200 dark:border-gray-700 font-semibold">
                            <th class="p-3 border-r border-slate-200 dark:border-gray-700 w-32 font-bold text-slate-700 dark:text-slate-300">Ordua / Hora</th>
                            {#each daysOfWeek as day}
                                <th class="p-3 border-r border-slate-200 dark:border-gray-700 min-w-[130px]">
                                    <span class="block text-sm font-bold text-sky-900 dark:text-sky-200">{day.name}</span>
                                    <span class="block text-[11px] text-sky-600 dark:text-sky-400 font-normal">{day.short}</span>
                                </th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-gray-700">
                        {#each timeSlots as slot}
                            {#if slot.type === 'recreo'}
                                <!-- Fila Recreo -->
                                <tr class="bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-medium">
                                    <td class="p-2 border-r border-amber-200 dark:border-amber-900/50 bg-amber-100/50 dark:bg-amber-900/40 font-semibold text-xs whitespace-nowrap text-amber-800 dark:text-amber-300">
                                        {slot.time}
                                    </td>
                                    <td colspan="5" class="p-2 text-center text-xs tracking-wider uppercase font-semibold text-amber-800 dark:text-amber-300">
                                        ☕ {slot.label}
                                    </td>
                                </tr>
                            {:else if slot.type === 'comedor'}
                                <!-- Fila Bazcaria / Comedor -->
                                <tr class="bg-orange-50/70 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200 font-medium">
                                    <td class="p-2 border-r border-orange-200 dark:border-orange-900/50 bg-orange-100/50 dark:bg-orange-900/40 font-semibold text-xs whitespace-nowrap text-orange-800 dark:text-orange-300">
                                        {slot.time}
                                    </td>
                                    <td colspan="5" class="p-2 text-center text-xs tracking-wider uppercase font-semibold text-orange-800 dark:text-orange-300">
                                        🍽️ Bazkaria / Comedor
                                    </td>
                                </tr>
                            {:else if slot.type === 'presencia'}
                                <!-- Fila Presencia / Guardia -->
                                <tr class="bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200">
                                    <td class="p-2 border-r border-slate-200 dark:border-gray-700 bg-slate-100/80 dark:bg-gray-700/50 font-semibold text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                        {slot.time}
                                    </td>
                                    {#each daysOfWeek as day}
                                        <td class="p-2 border-r border-slate-200 dark:border-gray-700 bg-slate-100/50 dark:bg-slate-700/30 text-xs italic text-slate-400 dark:text-gray-400">
                                            {activeTab === 'profesorado' ? 'Presencia / Zaintza' : 'Libre / Libre'}
                                        </td>
                                    {/each}
                                </tr>
                            {:else}
                                <!-- Franjas Lectivas -->
                                <tr>
                                    <td class="p-2 border-r border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/30 font-semibold text-xs text-slate-600 dark:text-gray-300 whitespace-nowrap">
                                        {slot.time}
                                    </td>
                                    {#each daysOfWeek as day}
                                        {#if activeTab === 'profesorado'}
                                            {@const session = teacherScheduleGrid[selectedEntityId]?.[slot.orden]}
                                            <td class="p-2 border-r border-slate-200 dark:border-gray-700 h-16 align-middle hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-colors cursor-pointer">
                                                {#if session}
                                                    <div class="bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-lg p-1.5 shadow-xs">
                                                        <span class="block font-bold text-sky-900 dark:text-sky-200 text-xs">{session.actividad}</span>
                                                        {#if session.clase}
                                                            <span class="block text-[11px] font-medium text-sky-700 dark:text-sky-300">{session.clase}</span>
                                                        {/if}
                                                        {#if session.aula}
                                                            <span class="block text-[10px] text-sky-500 dark:text-sky-400">{session.aula}</span>
                                                        {/if}
                                                    </div>
                                                {:else}
                                                    <span class="text-xs text-slate-300 dark:text-gray-600 font-light">+ Añadir</span>
                                                {/if}
                                            </td>
                                        {:else}
                                            {@const classroomSession = classroomScheduleGrid[selectedEntityId]?.[slot.orden]}
                                            <td class="p-2 border-r border-slate-200 dark:border-gray-700 h-16 align-middle hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer">
                                                {#if classroomSession}
                                                    <div class="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg p-1.5 shadow-xs">
                                                        <span class="block font-bold text-amber-900 dark:text-amber-200 text-xs">{classroomSession.actividad}</span>
                                                        {#if classroomSession.profesor}
                                                            <span class="block text-[11px] font-medium text-amber-800 dark:text-amber-300">Prof: {classroomSession.profesor}</span>
                                                        {/if}
                                                        {#if classroomSession.grupo}
                                                            <span class="block text-[10px] text-amber-600 dark:text-amber-400">Grupo: {classroomSession.grupo}</span>
                                                        {/if}
                                                    </div>
                                                {:else}
                                                    <span class="text-xs text-slate-300 dark:text-gray-600 font-light">+ Añadir</span>
                                                {/if}
                                            </td>
                                        {/if}
                                    {/each}
                                </tr>
                            {/if}
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Tarjetas de Resumen Estadístico de Horas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Horas Lectivas -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
                <div>
                    <span class="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Horas Lectivas</span>
                    <strong class="text-xl font-bold text-slate-800 dark:text-gray-100 mt-1 block">14h 00m</strong>
                    <span class="text-xs text-slate-500 dark:text-gray-400">Objetivo: 15h 00m</span>
                </div>
                <div class="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg">
                    📚
                </div>
            </div>

            <!-- Horas No Lectivas -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
                <div>
                    <span class="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Horas No Lectivas</span>
                    <strong class="text-xl font-bold text-slate-800 dark:text-gray-100 mt-1 block">8h 30m</strong>
                    <span class="text-xs text-slate-500 dark:text-gray-400">Objetivo: 8h 00m</span>
                </div>
                <div class="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                    📝
                </div>
            </div>

            <!-- Total Asignado -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
                <div>
                    <span class="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Total Asignado</span>
                    <strong class="text-xl font-bold text-slate-800 dark:text-gray-100 mt-1 block">22h 30m</strong>
                    <span class="text-xs text-slate-500 dark:text-gray-400">Total Jornada: 23h 00m</span>
                </div>
                <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                    ⏱️
                </div>
            </div>

            <!-- Balance Horario -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
                <div>
                    <span class="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Balance Horario</span>
                    <strong class="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">+0h 30m</strong>
                    <span class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Jornada equilibrada</span>
                </div>
                <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                    ⚖️
                </div>
            </div>
        </div>

    </main>
</div>
