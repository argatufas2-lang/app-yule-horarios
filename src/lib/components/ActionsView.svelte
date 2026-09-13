<script lang="ts">
    import ActionToolbar from './ActionToolbar.svelte';

    // Estados de navegación y selección
    export let selectedCurso: string = '2026-2027';
    export let cursosDisponibles: string[] = ['2026-2027', '2025-2026', '2024-2025'];
    
    let activeTab: 'profesorado' | 'aulas' = 'profesorado';

    // Listado de Profesores
    export let profesoresDisponibles: { id: string; nombre: string; rol?: string; jornada?: string }[] = [
        { id: '1', nombre: 'ALBA (2/3 - Especialista)', rol: 'Especialista', jornada: '2/3 (Parcial)' },
        { id: '2', nombre: 'MIKEL (Completa - Tutor HH/LH)', rol: 'Tutor', jornada: 'Completa' },
        { id: '3', nombre: 'ANE (1/2 - Pedagogía Terapéutica)', rol: 'PT', jornada: '1/2 (Parcial)' }
    ];

    // Listado de Aulas y Grupos
    export let aulasDisponibles: { id: string; nombre: string; edificio?: string; capacidad?: string }[] = [
        { id: 'a1', nombre: 'LH 1A - Aula 101', edificio: 'Edificio Principal', capacidad: '25 alumnos' },
        { id: 'a2', nombre: 'LH 2A - Aula 201', edificio: 'Edificio Principal', capacidad: '24 alumnos' },
        { id: 'a3', nombre: 'Gela Handia - Gimnasio', edificio: 'Pabellón Deportivo', capacidad: 'Especial' },
        { id: 'a4', nombre: 'Ingelesa Gelan - Aula Idiomas', edificio: 'Planta 2', capacidad: '20 alumnos' }
    ];

    export let selectedEntityId: string = '1';

    // Lista dinámica para el selector según la pestaña
    $: selectorOptions = activeTab === 'profesorado' 
        ? profesoresDisponibles 
        : aulasDisponibles;

    // Información del elemento seleccionado (Profesor o Aula)
    $: currentTeacher = profesoresDisponibles.find(p => p.id === selectedEntityId) || profesoresDisponibles[0];
    $: currentClassroom = aulasDisponibles.find(a => a.id === selectedEntityId) || aulasDisponibles[0];

    // Al cambiar de pestaña, resetear la selección al primer elemento de esa categoría
    function handleTabChange(tab: 'profesorado' | 'aulas') {
        activeTab = tab;
        selectedEntityId = tab === 'profesorado' ? profesoresDisponibles[0].id : aulasDisponibles[0].id;
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
    function handleSelectCurso(event: CustomEvent<string>) {
        selectedCurso = event.detail;
        console.log('Curso seleccionado:', selectedCurso);
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

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
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
        <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    type="button"
                    on:click={() => handleTabChange('profesorado')}
                    class="py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 {activeTab === 'profesorado' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
                >
                    👨‍🏫 Profesorado (Irakasleak)
                </button>

                <button
                    type="button"
                    on:click={() => handleTabChange('aulas')}
                    class="py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 {activeTab === 'aulas' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
                >
                    🏫 Aulas y Grupos (Gela / Taldeak)
                </button>
            </nav>
        </div>

        <!-- Tarjeta Informativa Unificada -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {#if activeTab === 'profesorado'}
                <!-- Información del Profesor -->
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg border border-indigo-200 dark:border-indigo-700">
                        {currentTeacher?.nombre ? currentTeacher.nombre.charAt(0) : 'P'}
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{currentTeacher?.nombre}</h2>
                        <div class="flex flex-wrap items-center gap-2 mt-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                {currentTeacher?.rol || 'Especialista'}
                            </span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Jornada: {currentTeacher?.jornada || 'Completa'}
                            </span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                Curso: {selectedCurso}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div>
                        <span class="block text-xs text-gray-400 font-medium">Lectivas asignadas:</span>
                        <strong class="text-gray-800 dark:text-gray-100">14h 00m / 15h 00m</strong>
                    </div>
                    <div class="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
                    <div>
                        <span class="block text-xs text-gray-400 font-medium">Balance total:</span>
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
                        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{currentClassroom?.nombre}</h2>
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

                <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div>
                        <span class="block text-xs text-gray-400 font-medium">Ocupación lectiva:</span>
                        <strong class="text-indigo-600 dark:text-indigo-400">85% Ocupada</strong>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Cuadrícula de Horario Semanal Reutilizada -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full border-collapse text-center text-xs md:text-sm">
                    <thead>
                        <tr class="bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 font-semibold">
                            <th class="p-3 border-r border-gray-200 dark:border-gray-700 w-32">Ordua / Hora</th>
                            {#each daysOfWeek as day}
                                <th class="p-3 border-r border-gray-200 dark:border-gray-700 min-w-[130px]">
                                    <span class="block text-sm font-bold">{day.name}</span>
                                    <span class="block text-[11px] text-gray-500 dark:text-gray-400 font-normal">{day.short}</span>
                                </th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        {#each timeSlots as slot}
                            {#if slot.type === 'recreo'}
                                <!-- Fila Recreo -->
                                <tr class="bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-medium">
                                    <td class="p-2 border-r border-amber-200 dark:border-amber-900/50 bg-amber-100/50 dark:bg-amber-900/40 font-semibold text-xs whitespace-nowrap">
                                        {slot.time}
                                    </td>
                                    <td colspan="5" class="p-2 text-center text-xs tracking-wider uppercase font-semibold">
                                        ☕ {slot.label}
                                    </td>
                                </tr>
                            {:else if slot.type === 'comedor'}
                                <!-- Fila Bazcaria / Comedor -->
                                <tr class="bg-orange-50 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200 font-medium">
                                    <td class="p-2 border-r border-orange-200 dark:border-orange-900/50 bg-orange-100/50 dark:bg-orange-900/40 font-semibold text-xs whitespace-nowrap">
                                        {slot.time}
                                    </td>
                                    <td colspan="5" class="p-2 text-center text-xs tracking-wider uppercase font-semibold">
                                        🍽️ Bazkaria / Comedor
                                    </td>
                                </tr>
                            {:else if slot.type === 'presencia'}
                                <!-- Fila Presencia / Guardia -->
                                <tr class="bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200">
                                    <td class="p-2 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50 font-semibold text-xs whitespace-nowrap">
                                        {slot.time}
                                    </td>
                                    {#each daysOfWeek as day}
                                        <td class="p-2 border-r border-gray-200 dark:border-gray-700 bg-slate-100/60 dark:bg-slate-700/40 text-xs italic text-gray-500 dark:text-gray-400">
                                            {activeTab === 'profesorado' ? 'Presencia / Zaintza' : 'Libre / Libre'}
                                        </td>
                                    {/each}
                                </tr>
                            {:else}
                                <!-- Franjas Lectivas -->
                                <tr>
                                    <td class="p-2 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 font-semibold text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                        {slot.time}
                                    </td>
                                    {#each daysOfWeek as day}
                                        {#if activeTab === 'profesorado'}
                                            {@const session = teacherScheduleGrid[selectedEntityId]?.[slot.orden]}
                                            <td class="p-2 border-r border-gray-200 dark:border-gray-700 h-16 align-middle hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer">
                                                {#if session}
                                                    <div class="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg p-1.5 shadow-xs">
                                                        <span class="block font-bold text-indigo-900 dark:text-indigo-200 text-xs">{session.actividad}</span>
                                                        {#if session.clase}
                                                            <span class="block text-[11px] font-medium text-indigo-700 dark:text-indigo-300">{session.clase}</span>
                                                        {/if}
                                                        {#if session.aula}
                                                            <span class="block text-[10px] text-indigo-500 dark:text-indigo-400">{session.aula}</span>
                                                        {/if}
                                                    </div>
                                                {:else}
                                                    <span class="text-xs text-gray-300 dark:text-gray-600 font-light">+ Añadir</span>
                                                {/if}
                                            </td>
                                        {:else}
                                            {@const classroomSession = classroomScheduleGrid[selectedEntityId]?.[slot.orden]}
                                            <td class="p-2 border-r border-gray-200 dark:border-gray-700 h-16 align-middle hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer">
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
                                                    <span class="text-xs text-gray-300 dark:text-gray-600 font-light">+ Añadir</span>
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
    </main>
</div>
