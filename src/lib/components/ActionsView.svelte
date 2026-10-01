<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import ActionToolbar from './ActionToolbar.svelte';
    import AdminModal from './AdminModal.svelte';
    import SesionModal from './SesionModal.svelte';
    import TeacherScheduleGrid from './TeacherScheduleGrid.svelte';
    import ClassroomScheduleGrid from './ClassroomScheduleGrid.svelte';
    import { formatJornada } from '$lib/utils/formatters';
    import { getAdminActividades } from '$lib/services/adminService';
    import {
        calculateScheduleSummary,
        formatMinutes,
        type ScheduleSummary
    } from '$lib/services/timeCalculationService';
    import type { Session } from '$lib/types/schedule';
    import {
        createSession,
        updateSession,
        getSessionsForTeacher
    } from '$lib/services/primaryService';
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

    const dispatch = createEventDispatcher<{
        controlJornada: void;
        finDeCurso: void;
        importarAsc: void;
        selectCurso: string;
    }>();

    // Estados de navegación y selección
    export let selectedCurso: string = '2026-2027';
    export let selectedCiclo: 'LH' | 'HH' = 'LH';
    
    let activeTab: 'profesorado' | 'aulas' = 'profesorado';
    let showDebug: boolean = false;
    let showAdminModal: boolean = false;

    // Control de secuencia determinista de peticiones asíncronas
    let activeRequestId = 0;

    // Estado para el modal de Sesión
    let isSesionModalOpen: boolean = false;
    let selectedCellDia: number | null = null;
    let selectedCellFranja: number | null = null;
    let selectedCellDiaNombre: string = '';
    let selectedCellFranjaNombre: string = '';
    let maxMinutosFranja: number = 60;
    let ajusteMinutosValor: number = 60;
    let ajusteParteValor: 'inicio' | 'final' = 'inicio';
    let selectedCellData: {
        id?: string;
        actividad?: string | null;
        clase?: string | null;
        aula?: string | null;
        rol_aula?: string | null;
        es_lectiva?: boolean;
    } = {};

    // Listados dinámicos obtenidos de Supabase
    export let profesoresDisponibles: EntityOption[] = [];
    export let aulasDisponibles: EntityOption[] = [];
    export let actividadesDisponibles: Array<{ id: number | string; nombre: string; es_lectiva?: boolean }> = [];
    export let totalProfesoradoCount: number = 0;

    export let selectedEntityId: string = '';

    let loading: boolean = false;
    let loadingSessions: boolean = false;
    let lastLoadedEntityId: string = '';

    // Tramos horarios y Sesiones dinámicas
    let timeSlots: TimeSlotItem[] = [];
    let teacherScheduleGrid: Record<string, Record<string, GridSessionCell>> = {};
    let teacherSessionsList: Session[] = [];

    // Carga explícita de entidad con control estricto de petición asíncrona
    async function switchEntity(entityId: string) {
        if (!entityId) {
            teacherScheduleGrid = {};
            teacherSessionsList = [];
            selectedEntityId = '';
            lastLoadedEntityId = '';
            return;
        }

        selectedEntityId = entityId;
        const reqId = ++activeRequestId;
        loadingSessions = true;

        const profObj = profesoresDisponibles.find((p) => p.id === entityId);
        if (activeTab === 'profesorado' && profObj && profObj.nombre) {
            try {
                teacherSessionsList = await getSessionsForTeacher(selectedCurso, profObj.nombre);
            } catch (e) {
                console.error('Error cargando sesiones para cálculo de jornada:', e);
                teacherSessionsList = [];
            }
        } else {
            teacherSessionsList = [];
        }

        const newGrid = await fetchSessionsForEntity(
            entityId,
            activeTab,
            selectedCurso,
            profesoresDisponibles,
            aulasDisponibles
        );

        // Si la petición es obsoleta por haber cambiado de entidad/pestaña en el ínterin, se descarta
        if (reqId !== activeRequestId) return;

        // Forzar reactividad de Svelte mediante una nueva referencia
        teacherScheduleGrid = { ...newGrid };
        lastLoadedEntityId = entityId;
        loadingSessions = false;
    }

    // Cargar los datos correspondientes según la pestaña y el curso activo
    async function loadDataForCurrentTab() {
        teacherScheduleGrid = {};
        lastLoadedEntityId = '';

        totalProfesoradoCount = await fetchTotalProfesorado(selectedCurso);
        timeSlots = await fetchTimeSlots(activeTab);

        try {
            const rawActividades = await getAdminActividades(selectedCurso);
            actividadesDisponibles = rawActividades.map(a => ({
                id: a.id,
                nombre: a.nombre,
                es_lectiva: a.es_lectiva
            }));
        } catch (e) {
            console.error('Error cargando actividades:', e);
        }

        let targetId = '';

        if (activeTab === 'profesorado') {
            loading = true;
            profesoresDisponibles = await fetchProfesores(selectedCurso);
            loading = false;

            if (profesoresDisponibles.length > 0) {
                const exists = profesoresDisponibles.some(p => p.id === selectedEntityId);
                targetId = exists ? selectedEntityId : profesoresDisponibles[0].id;
            }
        } else {
            loading = true;
            const [aulas, profs] = await Promise.all([
                fetchAulas(selectedCurso),
                fetchProfesores(selectedCurso)
            ]);
            aulasDisponibles = aulas;
            profesoresDisponibles = profs;
            loading = false;

            if (aulasDisponibles.length > 0) {
                const exists = aulasDisponibles.some(a => a.id === selectedEntityId);
                targetId = exists ? selectedEntityId : aulasDisponibles[0].id;
            }
        }

        selectedEntityId = targetId;
        await switchEntity(targetId);
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

    $: currentTutor = profesoresDisponibles.find((p) => {
        if (!currentClassroom) return false;
        const pClase = String(p.clase_base || (p as any).claseBase || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
        const cName = String(currentClassroom.nombre || currentClassroom.id || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
        const cCode = String((currentClassroom as any).code || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
        if (!pClase) return false;
        return pClase === cName || pClase === cCode || cName.includes(pClase) || pClase.includes(cName);
    });

    // Evaluación de si el profesor actual tiene jornada completa
    $: isJornadaCompleta = activeTab === 'profesorado' && currentTeacher?.jornada 
        ? formatJornada(currentTeacher.jornada) === 'JC'
        : false;

    // Cálculo dinámico del resumen de jornada para el profesor actual
    $: scheduleSummary = (() => {
        const isJC = isJornadaCompleta;
        const config = {
            minutosLectivosObjetivo: isJC ? 900 : 450, // 15h JC / 7h 30m parcial
            minutosNoLectivosObjetivo: isJC ? 480 : 240 // 8h JC / 4h parcial
        };
        const catMap = actividadesDisponibles.map(a => ({ nombre: a.nombre, es_lectiva: Boolean(a.es_lectiva) }));
        return calculateScheduleSummary(teacherSessionsList, config, catMap);
    })();

    // Al cambiar de pestaña
    async function handleTabChange(tab: 'profesorado' | 'aulas') {
        if (activeTab === tab) return;
        activeRequestId++;
        activeTab = tab;
        teacherScheduleGrid = {};
        lastLoadedEntityId = '';
        selectedEntityId = '';
        await loadDataForCurrentTab();
    }

    function handleEntitySelectChange(event: Event) {
        const target = event.currentTarget as HTMLSelectElement;
        if (target && target.value) {
            switchEntity(target.value);
        }
    }

    // Manejadores de eventos de ActionToolbar
    async function handleSelectCurso(event: CustomEvent<string>) {
        selectedCurso = event.detail;
        dispatch('selectCurso', selectedCurso);
        await loadDataForCurrentTab();
    }

    function handleSelectCiclo(event: CustomEvent<'LH' | 'HH'>) {
        selectedCiclo = event.detail;
    }

    function handleFinDeCurso() {
        dispatch('finDeCurso');
    }

    function handleControlJornada() {
        dispatch('controlJornada');
    }

    function handleExecuteBulkPrint(event: CustomEvent<{ selectedIds: string[] }>) {
        console.log('Ejecutando impresión masiva de IDs:', event.detail.selectedIds);
    }

    function handleAdministracion() {
        showAdminModal = true;
    }

    function handleImportarAsc() {
        dispatch('importarAsc');
    }

    function handleImageError(event: Event) {
        const target = event.target as HTMLElement;
        if (target) {
            target.style.display = 'none';
        }
    }

    // Abrir modal de Sesión al hacer clic en una casilla de la cuadrícula
    async function handleCellClick(dayId: number, dayName: string, slot: TimeSlotItem, session?: GridSessionCell) {
        selectedCellDia = dayId;
        let dbFranja = slot.orden;
        if (activeTab === 'aulas') {
            if (slot.orden === 7) dbFranja = 8;
            else if (slot.orden === 8) dbFranja = 9;
        }
        selectedCellFranja = dbFranja;
        selectedCellDiaNombre = dayName;
        selectedCellFranjaNombre = slot.time;

        // Obtener el tramo correspondiente de Supabase y calcular tiempo máximo real
        const foundSlot = timeSlots.find((ts) => ts.orden === slot.orden);
        maxMinutosFranja = foundSlot?.minutos_maximos || slot.minutos_maximos || 60;

        if (session && session.rawData && typeof session.rawData.minutos === 'number') {
            ajusteMinutosValor = Math.min(session.rawData.minutos, maxMinutosFranja);
        } else {
            ajusteMinutosValor = maxMinutosFranja;
        }
        ajusteParteValor = 'inicio';

        selectedCellData = session ? {
            id: session.id,
            actividad: session.actividad,
            clase: session.clase,
            aula: session.aula,
            rol_aula: session.rawData?.rol_aula,
            es_lectiva: session.rawData?.es_lectiva
        } : {};
        isSesionModalOpen = true;
    }

    async function handleSaveSession(event: CustomEvent<any>) {
        console.log('Guardando datos de la sesión:', event.detail);

        const detail = event.detail || {};
        const profNombre = currentTeacher?.nombre || '';

        if (profNombre && selectedCellDia !== null && selectedCellFranja !== null) {
            try {
                const minVal = detail.minutos !== undefined ? detail.minutos : ajusteMinutosValor;
                const minutosValidados = Math.max(1, Math.min(minVal, maxMinutosFranja));

                const sessionPayload = {
                    profesor_nombre: profNombre,
                    dia: selectedCellDia,
                    franja: selectedCellFranja,
                    actividad: detail.actividad || null,
                    clase: detail.clase || null,
                    aula: detail.aula || null,
                    rol_aula: detail.rol_aula || null,
                    minutos: minutosValidados,
                    curso_escolar: selectedCurso
                };

                if (detail.id) {
                    await updateSession(detail.id, sessionPayload);
                } else if (detail.actividad) {
                    await createSession(sessionPayload);
                }
            } catch (err) {
                console.error('Error al guardar la sesión:', err);
            }
        }

        lastLoadedEntityId = '';
        await switchEntity(selectedEntityId);
    }

    function handleDeleteSession(event: CustomEvent<{ id: string }>) {
        console.log('Eliminando sesión ID:', event.detail.id);
        lastLoadedEntityId = '';
        switchEntity(selectedEntityId);
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
            on:selectProfesor={(e) => switchEntity(e.detail)}
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
                        on:change={handleEntitySelectChange}
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

        <!-- Tarjeta de Perfil Alineada Horizontalmente -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-4 flex items-center justify-center print:border-none print:shadow-none print:bg-transparent print:p-1 print:mb-1">
            {#if activeTab === 'profesorado'}
                <div class="flex flex-wrap items-center justify-center gap-4 text-center sm:text-left print:gap-2">
                    <div class="h-10 sm:h-12 flex items-center justify-center overflow-hidden shrink-0 print:h-7">
                        <img src="/Logo.png" alt="Ganivet Logo" class="h-10 sm:h-12 w-auto object-contain print:h-7" on:error={handleImageError} />
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight print:text-lg">
                        {currentTeacher?.nombre ? currentTeacher.nombre.toUpperCase() : (loading ? 'CARGANDO PROFESORADO...' : 'SIN PROFESORADO DISPONIBLE')}
                    </h2>
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
                    <div class="h-10 sm:h-12 flex items-center justify-center overflow-hidden shrink-0 print:h-7">
                        <img src="/Logo.png" alt="Ganivet Logo" class="h-10 sm:h-12 w-auto object-contain print:h-7" on:error={handleImageError} />
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight print:text-lg">
                        {currentClassroom?.nombre ? currentClassroom.nombre.toUpperCase() : (loading ? 'CARGANDO AULAS...' : 'SIN AULAS DISPONIBLES')}
                    </h2>
                    <div class="flex flex-wrap items-center gap-1.5">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-100 border border-sky-300 dark:border-sky-800 print:text-[9px] print:py-0.5 print:px-2">
                            🧑‍🏫 Tutor/a: {currentTutor ? currentTutor.nombre : 'Sin asignar'}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200/60 print:text-[9px] print:py-0.5 print:px-2">
                            {currentClassroom?.edificio || 'Edificio Principal'}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:text-slate-300 border border-slate-200 print:text-[9px] print:py-0.5 print:px-2">
                            Capacidad: {currentClassroom?.capacidad || 'Estándar'}
                        </span>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Renderizado Condicional Desacoplado por Pestaña Activa -->
        {#if activeTab === 'profesorado'}
            <TeacherScheduleGrid
                teacherId={selectedEntityId}
                selectedEntityId={selectedEntityId}
                gridData={teacherScheduleGrid}
                {timeSlots}
                {isJornadaCompleta}
                {showDebug}
                onCellClick={handleCellClick}
            />
        {:else}
            <ClassroomScheduleGrid
                classroomId={selectedEntityId}
                selectedEntityId={selectedEntityId}
                gridData={teacherScheduleGrid}
                {showDebug}
                onCellClick={handleCellClick}
            />
        {/if}

        <!-- Bloque de Resumen Inferior -->
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
                    Objetivo Oficial: <span class="text-sky-700 dark:text-sky-300 font-bold">{isJornadaCompleta ? '23h 00m' : '11h 30m'}</span>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-1.5">
                <!-- Horas Lectivas -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]">Horas Lectivas</span>
                        <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block print:text-[10px]">{scheduleSummary.horasLectivasFormatted}</strong>
                        <span class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[7px]">Objetivo: {isJornadaCompleta ? '15h 00m' : '7h 30m'}</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]">
                        📚
                    </div>
                </div>

                <!-- Horas No Lectivas -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]">Horas No Lectivas</span>
                        <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block print:text-[10px]">{scheduleSummary.horasNoLectivasFormatted}</strong>
                        <span class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[7px]">Objetivo: {isJornadaCompleta ? '8h 00m' : '4h 00m'}</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]">
                        📝
                    </div>
                </div>

                <!-- Total Asignado -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]">Total Asignado</span>
                        <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block print:text-[10px]">{scheduleSummary.horasTotalesFormatted}</strong>
                        <span class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[7px]">Total Jornada: {isJornadaCompleta ? '23h 00m' : '11h 30m'}</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]">
                        ⏱️
                    </div>
                </div>

                <!-- Balance Horario -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]">Balance Horario</span>
                        <strong class="text-lg font-bold {scheduleSummary.balanceTotalMinutos >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} mt-0.5 block print:text-[10px]">
                            {scheduleSummary.balanceTotalFormatted}
                        </strong>
                        <span class="text-[11px] {scheduleSummary.balanceTotalMinutos === 0 ? 'text-emerald-600 dark:text-emerald-400' : scheduleSummary.balanceTotalMinutos > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400'} font-medium print:text-[7px]">
                            {scheduleSummary.balanceTotalMinutos === 0 ? 'Jornada equilibrada' : scheduleSummary.balanceTotalMinutos > 0 ? 'Exceso asignado' : 'Horas pendientes'}
                        </span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]">
                        ⚖️
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
            lastLoadedEntityId = '';
            loadDataForCurrentTab();
        }}
    />

    <!-- Componente Modal de Edición de Sesión -->
    <SesionModal
        bind:isOpen={isSesionModalOpen}
        profesorNombre={currentTeacher?.nombre || ''}
        dia={selectedCellDia}
        franja={selectedCellFranja}
        diaNombre={selectedCellDiaNombre}
        franjaNombre={selectedCellFranjaNombre}
        sesionData={selectedCellData}
        actividadesDisponibles={actividadesDisponibles}
        aulasDisponibles={aulasDisponibles}
        maxMinutosFranja={maxMinutosFranja}
        bind:ajusteMinutos={ajusteMinutosValor}
        bind:ajusteParte={ajusteParteValor}
        on:save={handleSaveSession}
        on:delete={handleDeleteSession}
    />
</div>
