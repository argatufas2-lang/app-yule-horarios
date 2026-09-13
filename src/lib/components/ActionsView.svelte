<script lang="ts">
    import ActionToolbar from './ActionToolbar.svelte';

    // Estados de navegación y selección
    export let selectedCurso: string = '2026-2027';
    export let cursosDisponibles: string[] = ['2026-2027', '2025-2026', '2024-2025'];
    
    export let selectedProfesor: string = '1';
    export let profesoresDisponibles: { id: string; nombre: string }[] = [
        { id: '1', nombre: 'ALBA (2/3 - Especialista)' },
        { id: '2', nombre: 'MIKEL (Completa - Tutor HH/LH)' },
        { id: '3', nombre: 'ANE (1/2 - Pedagogía Terapéutica)' }
    ];

    let activeTab: 'profesorado' | 'aulas' = 'profesorado';

    // Información simulada del profesor activo
    $: currentTeacher = profesoresDisponibles.find(p => p.id === selectedProfesor) || profesoresDisponibles[0];

    // Días de la semana
    const daysOfWeek = [
        { id: 1, name: 'Astelehena', short: 'Lunes' },
        { id: 2, name: 'Asteartea', short: 'Martes' },
        { id: 3, name: 'Asteazkena', short: 'Miércoles' },
        { id: 4, name: 'Osteguna', short: 'Jueves' },
        { id: 5, name: 'Ostirala', short: 'Viernes' }
    ];

    // Franjas horarias simuladas de Primaria
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

    // Matriz de ejemplo para el horario del profesor
    const scheduleGrid: Record<string, Record<number, { actividad: string; clase?: string; aula?: string; color?: string }>> = {
        '1': {
            1: { actividad: 'Euskera', clase: 'LH 2A', aula: 'Aula 201' },
            2: { actividad: 'Gaztelania', clase: 'LH 2A', aula: 'Aula 201' },
            4: { actividad: 'Ingelesa', clase: 'LH 3B', aula: 'Ingelesa Gelan' },
            6: { actividad: 'Tutoretza', clase: 'LH 2A', aula: 'Aula 201' },
            7: { actividad: 'Koordinazioa', clase: 'Irakasleak', aula: 'Mintegia' }
        },
        '2': {
            1: { actividad: 'Matematika', clase: 'LH 4A', aula: 'Aula 401' },
            2: { actividad: 'Ingurunea', clase: 'LH 4A', aula: 'Aula 401' },
            4: { actividad: 'Gaztelania', clase: 'LH 4A', aula: 'Aula 401' },
            6: { actividad: 'Gorputz Hezkuntza', clase: 'LH 4A', aula: 'Pistatan' }
        }
    };

    // Manejadores de eventos de ActionToolbar
    function handleSelectCurso(event: CustomEvent<string>) {
        selectedCurso = event.detail;
        console.log('Curso seleccionado:', selectedCurso);
    }

    function handleSelectProfesor(event: CustomEvent<string>) {
        selectedProfesor = event.detail;
        console.log('Profesor seleccionado ID:', selectedProfesor);
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
    <!-- Barra de Herramientas Superior -->
    <ActionToolbar
        {selectedCurso}
        {cursosDisponibles}
        {selectedProfesor}
        {profesoresDisponibles}
        on:selectCurso={handleSelectCurso}
        on:selectProfesor={handleSelectProfesor}
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
                    on:click={() => activeTab = 'profesorado'}
                    class="py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 {activeTab === 'profesorado' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
                >
                    👨‍🏫 Profesorado (Irakasleak)
                </button>

                <button
                    type="button"
                    on:click={() => activeTab = 'aulas'}
                    class="py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 {activeTab === 'aulas' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
                >
                    🏫 Aulas y Grupos (Gela / Taldeak)
                </button>
            </nav>
        </div>

        {#if activeTab === 'profesorado'}
            <!-- Tarjeta Informativa del Profesor -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg border border-indigo-200 dark:border-indigo-700">
                        {currentTeacher.nombre.charAt(0)}
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{currentTeacher.nombre}</h2>
                        <div class="flex flex-wrap items-center gap-2 mt-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                Especialista
                            </span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Jornada: 2/3 (Parcial)
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
            </div>

            <!-- Cuadrícula de Horario Semanal Completa -->
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
                                                Presencia / Zaintza
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
                                            {@const session = scheduleGrid[selectedProfesor]?.[slot.orden]}
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
                                        {/each}
                                    </tr>
                                {/if}
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        {:else}
            <!-- Vista de Aulas y Grupos -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400 space-y-3">
                <div class="text-4xl">🏫</div>
                <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">Vista de Aulas y Grupos</h3>
                <p class="max-w-md mx-auto text-sm">
                    Selecciona un grupo o aula para consultar la ocupación de espacios y la distribución de grupos.
                </p>
            </div>
        {/if}
    </main>
</div>
