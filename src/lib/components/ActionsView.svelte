<script lang="ts">
    import { onMount } from 'svelte';
    import ActionToolbar from './ActionToolbar.svelte';
    import AdminModal from './AdminModal.svelte';
    import { daysOfWeek } from '$lib/constants/calendar';
    import { formatJornada } from '$lib/utils/formatters';
    import {
        fetchTotalProfesorado,
        fetchTimeSlots,
        fetchProfesores,
        fetchAulas,
        fetchSessionsForEntity,
        type TimeSlotItem,
        type EntityOption,
        type GridSessionCell
    } from '$lib/services/scheduleService';

    // Estados de navegación y selección
    export let selectedCurso: string = '2026-2027';
    export let selectedCiclo: 'LH' | 'HH' = 'LH';
    
    let activeTab: 'profesorado' | 'aulas' = 'profesorado';
    let showDebug: boolean = false; // Estado para conmutar el panel de depuración
    let showAdminModal: boolean = false; // Estado para el modal de administración

    // Listados dinámicos obtenidos de Supabase
    export let profesoresDisponibles: EntityOption[] = [];
    export let aulasDisponibles: EntityOption[] = [];
    export let totalProfesoradoCount: number = 0;

    export let selectedEntityId: string = '';

    let loading: boolean = false;
    let loadingSessions: boolean = false;

    // Tramos horarios y Sesiones dinámicas
    let timeSlots: TimeSlotItem[] = [];
    let teacherScheduleGrid: Record<string, Record<string, GridSessionCell>> = {};

    // Cargar los datos correspondientes según la pestaña y el curso activo
    async function loadDataForCurrentTab() {
        totalProfesoradoCount = await fetchTotalProfesorado(selectedCurso);
        timeSlots = await fetchTimeSlots();

        if (activeTab === 'profesorado') {
            loading = true;
            profesoresDisponibles = await fetchProfesores(selectedCurso);
            loading = false;

            if (profesoresDisponibles.length > 0) {
                const exists = profesoresDisponibles.some(p => p.id === selectedEntityId);
                if (!exists) selectedEntityId = profesoresDisponibles[0].id;
            } else {
                selectedEntityId = '';
            }
        } else {
            loading = true;
            aulasDisponibles = await fetchAulas(selectedCurso);
            loading = false;

            if (aulasDisponibles.length > 0) {
                const exists = aulasDisponibles.some(a => a.id === selectedEntityId);
                if (!exists) selectedEntityId = aulasDisponibles[0].id;
            } else {
                selectedEntityId = '';
            }
        }

        if (selectedEntityId) {
            await loadSessionsForEntity(selectedEntityId);
        }
    }

    async function loadSessionsForEntity(entityId: string) {
        if (!entityId) return;
        loadingSessions = true;
        teacherScheduleGrid = await fetchSessionsForEntity(
            entityId,
            activeTab,
            selectedCurso,
            profesoresDisponibles
        );
        loadingSessions = false;
    }

    onMount(() => {
        loadDataForCurrentTab();
    });

    // Reaccionar ante el cambio de profesor/aula seleccionada
    $: if (selectedEntityId) {
        loadSessionsForEntity(selectedEntityId);
    }

    // Lista dinámica para el selector según la pestaña
    $: selectorOptions = activeTab === 'profesorado' 
        ? profesoresDisponibles 
        : aulasDisponibles;

    // Información del elemento seleccionado (Profesor o Aula)
    $: currentTeacher = profesoresDisponibles.find(p => p.id === selectedEntityId) || profesoresDisponibles[0];
    $: currentClassroom = aulasDisponibles.find(a => a.id === selectedEntityId) || aulasDisponibles[0];

    // Evaluación de si el profesor actual tiene jornada completa
    $: isJornadaCompleta = activeTab === 'profesorado' && currentTeacher?.jornada 
        ? formatJornada(currentTeacher.jornada) === 'JC'
        : false;

    // Al cambiar de pestaña
    async function handleTabChange(tab: 'profesorado' | 'aulas') {
        activeTab = tab;
        await loadDataForCurrentTab();
    }

    // Manejadores de eventos de ActionToolbar
    async function handleSelectCurso(event: CustomEvent<string>) {
        selectedCurso = event.detail;
        await loadDataForCurrentTab();
    }

    function handleSelectEntity(event: CustomEvent<string>) {
        selectedEntityId = event.detail;
    }

    function handleSelectCiclo(event: CustomEvent<'LH' | 'HH'>) {
        selectedCiclo = event.detail;
    }

    function handleFinDeCurso() {
        console.log('Acción: Fin de Curso (LH)');
    }

    function handleControlJornada() {
        console.log('Acción: Control de Jornada');
    }

    function handleExecuteBulkPrint(event: CustomEvent<{ selectedIds: string[] }>) {
        console.log('Ejecutando impresión masiva de IDs:', event.detail.selectedIds);
    }

    function handleAdministracion() {
        showAdminModal = true;
    }

    function handleImportarAsc() {
        console.log('Acción: Importar PDF aSc');
    }

    function handleImageError(event: Event) {
        const target = event.target as HTMLElement;
        if (target) {
            target.style.display = 'none';
        }
    }
</script>

<div class="flex flex-col min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors">
    <!-- Barra de Herramientas Superior Corporativa Ganivet (Oculta en Impresión) -->
    <div class="print:hidden">
        <ActionToolbar
            {selectedCurso}
            {selectedCiclo}
            totalProfesorado={totalProfesoradoCount}
            selectedProfesor={selectedEntityId}
            profesoresDisponibles={selectorOptions}
            {activeTab}
            on:selectCurso={handleSelectCurso}
            on:selectProfesor={handleSelectEntity}
            on:selectCiclo={handleSelectCiclo}
            on:finDeCurso={handleFinDeCurso}
            on:controlJornada={handleControlJornada}
            on:executeBulkPrint={handleExecuteBulkPrint}
            on:administracion={handleAdministracion}
            on:importarAsc={handleImportarAsc}
        />
    </div>

    <!-- Área de Contenido Principal Ampliada -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-4 print-area print:p-0 print:m-0 print:space-y-1">
        
        <!-- Pestañas y Selector Unificados con Botón de Debug (Ocultos en Impresión) -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            
            <div class="flex flex-col md:flex-row md:items-center justify-start gap-4 flex-1">
                <!-- Pestañas Principales -->
                <div class="flex items-center space-x-1 shrink-0">
                    <button
                        type="button"
                        on:click={() => handleTabChange('profesorado')}
                        class="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border {activeTab === 'profesorado' ? 'border-sky-600 bg-sky-600 text-white shadow-xs' : 'border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700'}"
                    >
                        👨‍🏫 Profesorado
                    </button>

                    <button
                        type="button"
                        on:click={() => handleTabChange('aulas')}
                        class="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border {activeTab === 'aulas' ? 'border-sky-600 bg-sky-600 text-white shadow-xs' : 'border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700'}"
                    >
                        🏫 Aulas y Grupos
                    </button>
                </div>

                <!-- Desplegable Alineado Inmediatamente a Continuación -->
                <div class="flex items-center space-x-2 w-full md:w-auto flex-1 max-w-2xl">
                    <label for="entitySelector" class="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        {activeTab === 'profesorado' ? 'SELECCIONAR PROFESORADO:' : 'SELECCIONAR AULA / GRUPO:'}
                    </label>
                    <select
                        id="entitySelector"
                        value={selectedEntityId}
                        on:change={(e) => selectedEntityId = e.currentTarget.value}
                        class="w-full bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-xs font-semibold rounded-lg border border-slate-300 dark:border-gray-500 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-xs"
                    >
                        {#if loading}
                            <option value="">Cargando datos de Supabase...</option>
                        {:else if selectorOptions.length === 0}
                            <option value="">Sin registros disponibles</option>
                        {:else}
                            {#each selectorOptions as option}
                                <option value={option.id}>{option.labelText || option.nombre}</option>
                            {/each}
                        {/if}
                    </select>
                </div>
            </div>

            <!-- Botón Conmutador de Depuración Visual -->
            <button
                type="button"
                on:click={() => showDebug = !showDebug}
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1 border {showDebug ? 'bg-amber-500 text-white border-amber-600 shadow-xs' : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:bg-slate-200'}"
                title="Activar/desactivar visor técnico de auditoría de datos en cada celda"
            >
                🐛 Debug Datos
            </button>
        </div>

        <!-- Tarjeta de Perfil Alineada Horizontalmente (Sin Sombra/Bordes en Impresión) -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-4 flex items-center justify-center print:border-none print:shadow-none print:bg-transparent print:p-1 print:mb-1">
            {#if activeTab === 'profesorado'}
                <div class="flex flex-wrap items-center justify-center gap-4 text-center sm:text-left print:gap-2">
                    <!-- 1. Logo -->
                    <div class="h-10 sm:h-12 flex items-center justify-center overflow-hidden shrink-0 print:h-7">
                        <img src="/Logo.png" alt="Ganivet Logo" class="h-10 sm:h-12 w-auto object-contain print:h-7" on:error={handleImageError} />
                    </div>
                    <!-- 2. Nombre Mucho Más Grande y Destacado -->
                    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight print:text-lg">
                        {currentTeacher?.nombre ? currentTeacher.nombre.toUpperCase() : (loading ? 'CARGANDO PROFESORADO...' : 'SIN PROFESORADO DISPONIBLE')}
                    </h2>
                    <!-- 3. Etiquetas -->
                    <div class="flex flex-wrap items-center gap-1.5">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800 print:text-[9px] print:py-0.5 print:px-2">
                            Primaria (LH)
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 print:text-[9px] print:py-0.5 print:px-2">
                            {currentTeacher?.rol || 'Especialista'}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 print:text-[9px] print:py-0.5 print:px-2">
                            {currentTeacher?.jornada || 'Jornada completa'}
                        </span>
                    </div>
                </div>
            {:else}
                <div class="flex flex-wrap items-center justify-center gap-4 text-center sm:text-left print:gap-2">
                    <!-- 1. Logo -->
                    <div class="h-10 sm:h-12 flex items-center justify-center overflow-hidden shrink-0 print:h-7">
                        <img src="/Logo.png" alt="Ganivet Logo" class="h-10 sm:h-12 w-auto object-contain print:h-7" on:error={handleImageError} />
                    </div>
                    <!-- 2. Nombre Mucho Más Grande y Destacado -->
                    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight print:text-lg">
                        {currentClassroom?.nombre ? currentClassroom.nombre.toUpperCase() : (loading ? 'CARGANDO AULAS...' : 'SIN AULAS DISPONIBLES')}
                    </h2>
                    <!-- 3. Etiquetas -->
                    <div class="flex flex-wrap items-center gap-1.5">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200/60 print:text-[9px] print:py-0.5 print:px-2">
                            {currentClassroom?.edificio || 'Edificio Principal'}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:text-slate-700 dark:text-slate-300 border border-slate-200 print:text-[9px] print:py-0.5 print:px-2">
                            Capacidad: {currentClassroom?.capacidad || 'Estándar'}
                        </span>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Cuadrícula de Horarios Principal Limpia para Impresión -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-slate-300 dark:border-gray-600 overflow-hidden print:border print:border-black print:shadow-none print:rounded-none">
            <div class="overflow-x-auto">
                <table class="w-full border-collapse border-2 border-slate-300 dark:border-gray-600 text-center text-xs md:text-sm print:border print:border-black print:text-[10px]">
                    <thead>
                        <tr class="bg-sky-100 dark:bg-sky-950/70 text-sky-950 dark:text-sky-100 border-b-2 border-slate-300 dark:border-gray-600 font-bold print:border-b print:border-black print:bg-sky-50">
                            <th class="p-3 border-r-2 border-slate-300 dark:border-gray-600 w-40 font-extrabold text-sky-900 dark:text-sky-200 text-base print:p-1 print:text-[10px] print:w-24 print:border-r print:border-black">Ordua</th>
                            {#each daysOfWeek as day}
                                <th class="p-3 border-r-2 border-slate-300 dark:border-gray-600 min-w-[140px] print:p-1 print:min-w-0 print:border-r print:border-black">
                                    <span class="block text-lg font-black text-sky-900 dark:text-sky-100 tracking-wide print:text-[11px] print:font-bold">{day.name}</span>
                                </th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody class="divide-y-2 divide-slate-300 dark:divide-gray-600 print:divide-y print:divide-black">
                        <!-- Fila Superior de Presencia Delimitada -->
                        <tr class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black">
                            <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-200/70 dark:bg-gray-700 font-bold text-base text-slate-800 dark:text-slate-100 whitespace-nowrap print:p-0.5 print:text-[9px] print:border-r print:border-black">
                                📌 Presencia / Zaintza
                            </td>
                            {#each daysOfWeek as day}
                                <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-xs font-semibold text-sky-800 dark:text-sky-300 bg-slate-50 dark:bg-slate-800/60 print:p-0.5 print:text-[9px] print:border-r print:border-black">
                                    09:00 - 16:30 (4h 30m)
                                </td>
                            {/each}
                        </tr>

                        <!-- Tramos Horarios Consultados de Supabase -->
                        {#each timeSlots as slot}
                            {#if slot.type === 'recreo' || slot.time.includes('11:00 - 11:30')}
                                <!-- Fila Recreo -->
                                <tr class="bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black">
                                    <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-emerald-200/60 dark:bg-emerald-900/60 font-bold text-base whitespace-nowrap text-emerald-950 dark:text-emerald-200 print:p-0.5 print:text-[9px] print:border-r print:border-black">
                                        11:00 - 11:30
                                    </td>
                                    {#each daysOfWeek as day}
                                        <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-center text-xs tracking-wider uppercase font-extrabold text-emerald-900 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-950/40 print:p-0.5 print:text-[8px] print:border-r print:border-black">
                                            ATSEDENALDIA
                                        </td>
                                    {/each}
                                </tr>
                            {:else if slot.type === 'comedor' || slot.time.includes('14:00 - 15:00')}
                                <!-- Fila Comedor / Formación únicamente en 14:00 - 15:00 los Miércoles de Jornada Completa -->
                                <tr class="bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black">
                                    <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-emerald-200/60 dark:bg-emerald-900/60 font-bold text-base whitespace-nowrap text-emerald-950 dark:text-emerald-200 print:p-0.5 print:text-[9px] print:border-r print:border-black">
                                        14:00 - 15:00
                                    </td>
                                    {#each daysOfWeek as day}
                                        {#if day.id === 2 && isJornadaCompleta}
                                            <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-center text-xs tracking-wider uppercase font-black text-slate-900 dark:text-gray-100 print:p-0.5 print:text-[8px] print:border-r print:border-black">
                                                FORMAKUNTZA
                                            </td>
                                        {:else}
                                            <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-center text-xs tracking-wider uppercase font-extrabold text-emerald-900 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-950/40 print:p-0.5 print:text-[8px] print:border-r print:border-black">
                                                BAZKARIA
                                            </td>
                                        {/if}
                                    {/each}
                                </tr>
                            {:else if slot.type === 'presencia'}
                                <!-- Fila Guardias / Presencia Complementaria -->
                                <tr class="bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black">
                                    <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-100/80 dark:bg-gray-700/50 font-bold text-base text-slate-700 dark:text-slate-200 whitespace-nowrap print:p-0.5 print:text-[9px] print:border-r print:border-black">
                                        {slot.time}
                                    </td>
                                    {#each daysOfWeek as day}
                                        <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-100/50 dark:bg-slate-700/30 text-xs italic text-slate-400 dark:text-gray-400 print:p-0.5 print:text-[8px] print:border-r print:border-black">
                                            {activeTab === 'profesorado' ? 'Guardia / Zaintza' : 'Libre / Libre'}
                                        </td>
                                    {/each}
                                </tr>
                            {:else}
                                <!-- Franjas Lectivas -->
                                <tr class="border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black">
                                    <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/30 font-bold text-base text-slate-700 dark:text-gray-200 whitespace-nowrap print:p-0.5 print:text-[9px] print:border-r print:border-black">
                                        {slot.time}
                                    </td>
                                    {#each daysOfWeek as day}
                                        {@const sessionKey = `${day.id}_${slot.orden}`}
                                        {@const session = teacherScheduleGrid[selectedEntityId]?.[sessionKey]}
                                        {@const isViernesLibre = day.id === 4 && slot.time.includes('13:00 - 14:00')}
                                        <td 
                                            class="p-1.5 border-r-2 border-slate-300 dark:border-gray-600 h-16 align-middle transition-colors relative print:p-0.5 print:h-9 print:border-r print:border-black {isViernesLibre ? 'cell-disabled-striped' : 'hover:bg-slate-100/60 dark:hover:bg-gray-700/40 cursor-pointer'}"
                                            title={showDebug ? `[DEBUG] Día: ${day.id} | Tramo: ${slot.orden} | Asignatura: ${session?.actividad || 'Ninguna'} | Grupo: ${session?.clase || 'Ninguno'} | SesionID: ${session?.id || 'N/A'}` : ''}
                                        >
                                            {#if isViernesLibre}
                                                <!-- Hora libre universal del Viernes (13:00 - 14:00) vacía con sombreado rayado -->
                                            {:else if day.id === 2 && isJornadaCompleta && slot.time.includes('13:00 - 14:00')}
                                                <!-- Formación en Miércoles Tarde (13:00 - 14:00) en Jornada Completa sin fondo especial -->
                                                <div class="flex flex-col items-center justify-center space-y-0.5 p-1">
                                                    <span class="block font-black text-slate-900 dark:text-gray-100 text-xs sm:text-sm uppercase tracking-wide print:text-[9px]">
                                                        FORMAKUNTZA
                                                    </span>
                                                </div>
                                            {:else if session}
                                                <div class="flex flex-col items-center justify-center space-y-0.5">
                                                    <span class="block font-black text-slate-900 dark:text-gray-100 text-sm uppercase tracking-wide print:text-[9px]">
                                                        {session.actividad.toUpperCase()}
                                                    </span>
                                                    {#if session.clase}
                                                        <span class="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase print:text-[8px]">
                                                            {session.clase.toUpperCase()}
                                                        </span>
                                                    {/if}
                                                    {#if session.aula}
                                                        <span class="block text-[11px] font-semibold text-slate-500 dark:text-gray-400 uppercase print:text-[7px]">
                                                            {session.aula.toUpperCase()}
                                                        </span>
                                                    {/if}
                                                </div>
                                            {/if}

                                            <!-- Bloque Visual de Depuración Técnica Enriquecido (Oculto en Impresión) -->
                                            {#if showDebug}
                                                <div class="mt-1 text-[9px] font-mono leading-tight bg-amber-100/90 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100 p-1 rounded-sm border border-amber-400/80 text-left space-y-0.5 shadow-xs print:hidden">
                                                    <div><strong class="font-bold">Día:</strong> {day.id} | <strong class="font-bold">Tramo:</strong> {slot.orden}</div>
                                                    <div><strong class="font-bold">Act:</strong> {session?.actividad || '---'}</div>
                                                    <div><strong class="font-bold">Grupo:</strong> {session?.clase || '---'}</div>
                                                    <div class="truncate text-[8px] text-amber-800 dark:text-amber-300"><strong class="font-bold">ID:</strong> {session?.id || 'sin_sesion'}</div>
                                                </div>
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

        <!-- Bloque de Resumen Inferior (Sin Fondo Ni Sombra en Impresión) -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-4 space-y-3 print:border-none print:p-0 print:shadow-none print:bg-transparent print:mt-1">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-700 gap-2 print:pb-0.5 print:mb-0.5 print:border-b">
                <div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-gray-100 print:text-[10px]">
                        Resumen Horario y Balance de Jornada
                    </h3>
                    <p class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[8px]">
                        Tipo de Jornada: <strong class="text-slate-800 dark:text-gray-200">{currentTeacher?.jornada || 'Jornada completa'}</strong>
                    </p>
                </div>
                <div class="bg-slate-50 dark:bg-gray-700 px-3 py-1 rounded-lg border border-slate-200 dark:border-gray-600 text-xs font-semibold text-slate-700 dark:text-gray-300 print:text-[8px] print:py-0 print:px-1.5 print:border">
                    Objetivo Oficial: <span class="text-sky-700 dark:text-sky-300 font-bold">23h 00m</span>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-1.5">
                <!-- Horas Lectivas -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]">Horas Lectivas</span>
                        <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block print:text-[10px]">14h 00m</strong>
                        <span class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[7px]">Objetivo: 15h 00m</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]">
                        📚
                    </div>
                </div>

                <!-- Horas No Lectivas -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]">Horas No Lectivas</span>
                        <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block print:text-[10px]">8h 30m</strong>
                        <span class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[7px]">Objetivo: 8h 00m</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]">
                        📝
                    </div>
                </div>

                <!-- Total Asignado -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]">Total Asignado</span>
                        <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block print:text-[10px]">22h 30m</strong>
                        <span class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[7px]">Total Jornada: 23h 00m</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]">
                        ⏱️
                    </div>
                </div>

                <!-- Balance Horario -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]">Balance Horario</span>
                        <strong class="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block print:text-[10px]">+0h 30m</strong>
                        <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium print:text-[7px]">Jornada equilibrada</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]">
                        秤️
                    </div>
                </div>
            </div>
        </div>

    </main>

    <!-- Componente Modal de Administración -->
    <AdminModal
        isOpen={showAdminModal}
        {selectedCurso}
        on:close={() => {
            showAdminModal = false;
            loadDataForCurrentTab();
        }}
    />
</div>
