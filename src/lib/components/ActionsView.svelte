<script lang="ts">
    import { onMount } from 'svelte';
    import ActionToolbar from './ActionToolbar.svelte';
    import { supabase } from '$lib/services/supabaseClient';

    // Estados de navegación y selección
    export let selectedCurso: string = '2026-2027';
    export let selectedCiclo: 'LH' | 'HH' = 'LH';
    
    let activeTab: 'profesorado' | 'aulas' = 'profesorado';
    let showDebug: boolean = false; // Estado para conmutar el panel de depuración

    // Listados dinámicos obtenidos de Supabase
    export let profesoresDisponibles: { id: string; nombre: string; rol?: string; jornada?: string; labelText?: string }[] = [];
    export let aulasDisponibles: { id: string; nombre: string; edificio?: string; capacidad?: string; labelText?: string }[] = [];
    export let totalProfesoradoCount: number = 0;

    export let selectedEntityId: string = '';

    let loading: boolean = false;
    let loadingSessions: boolean = false;

    // Tramos horarios y Sesiones dinámicas de Supabase
    let timeSlots: { orden: number; time: string; label: string; type: 'lectiva' | 'recreo' | 'comedor' | 'presencia' }[] = [];
    let teacherScheduleGrid: Record<string, Record<string, { id?: string; actividad: string; clase?: string; aula?: string; rawData?: any }>> = {};

    // Helper para formatear la jornada visualmente (JC o fracción)
    function formatJornada(jornadaRaw?: string | null): string {
        if (!jornadaRaw) return 'JC';
        const jLower = jornadaRaw.toLowerCase().trim();
        if (jLower.includes('completa') || jLower.includes('100') || jLower.includes('1/1') || jLower === 'jc' || jLower === 'completo') {
            return 'JC';
        }
        return jornadaRaw;
    }

    // Helper para formatear el rol visualmente (Tutor / Especialista)
    function formatRol(perfilRaw?: string | null): string {
        if (!perfilRaw) return 'Especialista';
        const pLower = perfilRaw.toLowerCase().trim();
        if (pLower.includes('tutor') || pLower.includes('tutoretza')) {
            return 'Tutor';
        }
        return 'Especialista';
    }

    // Consultar el total global de profesores en Supabase
    async function fetchTotalProfesorado() {
        try {
            const { count, error } = await supabase
                .from('profesores')
                .select('*', { count: 'exact', head: true })
                .eq('curso_escolar', selectedCurso);

            if (!error && count !== null) {
                totalProfesoradoCount = count;
            }
        } catch (e) {
            console.error('Error al consultar el recuento total de profesorado:', e);
        }
    }

    // Consultar tramos horarios de Supabase
    async function fetchTimeSlots() {
        try {
            const { data, error } = await supabase
                .from('tramos_horarios_primaria')
                .select('*')
                .order('orden', { ascending: true });

            if (error) {
                console.error('Error al cargar tramos horarios de Supabase:', error.message);
                fallbackTimeSlots();
                return;
            }

            if (data && data.length > 0) {
                timeSlots = data.map((t: { hora_inicio?: string; hora_fin?: string; tipo?: string; descripcion?: string; orden?: number; id: number }) => {
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
                        orden: t.orden ?? t.id,
                        time: timeRange,
                        label: t.descripcion || `${t.orden}ª Franja`,
                        type
                    };
                });
            } else {
                fallbackTimeSlots();
            }
        } catch (e) {
            console.error('Error al obtener tramos horarios:', e);
            fallbackTimeSlots();
        }
    }

    function fallbackTimeSlots() {
        timeSlots = [
            { orden: 0, time: '09:00 - 10:00', label: '1ª Franja', type: 'lectiva' },
            { orden: 1, time: '10:00 - 11:00', label: '2ª Franja', type: 'lectiva' },
            { orden: 2, time: '11:00 - 11:30', label: 'ATSEDENALDIA', type: 'recreo' },
            { orden: 3, time: '11:30 - 12:30', label: '3ª Franja', type: 'lectiva' },
            { orden: 4, time: '12:30 - 14:00', label: '4ª Franja', type: 'lectiva' },
            { orden: 5, time: '14:00 - 15:00', label: 'BAZKARIA', type: 'comedor' },
            { orden: 6, time: '15:00 - 16:00', label: '5ª Franja', type: 'lectiva' },
            { orden: 7, time: '16:00 - 17:00', label: '6ª Franja', type: 'lectiva' }
        ];
    }

    // Consultar profesores desde Supabase ordenados estrictamente de la A a la Z
    async function fetchProfesores(curso: string) {
        loading = true;
        try {
            const { data, error } = await supabase
                .from('profesores')
                .select('*')
                .eq('curso_escolar', curso)
                .order('nombre', { ascending: true });

            if (error) {
                console.error('Error al cargar profesores desde Supabase:', error.message);
                return;
            }

            if (data && data.length > 0) {
                const mapped = data.map((p: { id: string | number; nombre: string; jornada?: string; perfil?: string }) => {
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

                mapped.sort((a: { nombre: string }, b: { nombre: string }) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
                profesoresDisponibles = mapped;
            } else {
                profesoresDisponibles = [];
            }
        } catch (err) {
            console.error('Error de red/servidor al obtener profesores:', err);
        } finally {
            loading = false;
        }
    }

    // Consultar aulas/grupos desde Supabase ordenados alfabéticamente
    async function fetchAulas(curso: string) {
        loading = true;
        try {
            const { data, error } = await supabase
                .from('aulas')
                .select('*')
                .eq('curso_escolar', curso)
                .order('name', { ascending: true });

            if (error) {
                console.error('Error al cargar aulas desde Supabase:', error.message);
                return;
            }

            if (data && data.length > 0) {
                const mapped = data.map((a: { id: string | number; name?: string; nombre?: string; code?: string; edificio?: string; capacidad?: string }) => {
                    const aulaNombre = a.name || a.nombre || a.code || `Aula ${a.id}`;
                    return {
                        id: String(a.id),
                        nombre: aulaNombre,
                        edificio: a.edificio || 'Edificio Principal',
                        capacidad: a.capacidad || 'Estándar',
                        labelText: aulaNombre.toUpperCase()
                    };
                });

                mapped.sort((a: { nombre: string }, b: { nombre: string }) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
                aulasDisponibles = mapped;
            } else {
                aulasDisponibles = [];
            }
        } catch (err) {
            console.error('Error de red/servidor al obtener aulas:', err);
        } finally {
            loading = false;
        }
    }

    // Consultar las sesiones reales del profesor o aula seleccionada
    async function fetchSessionsForEntity(entityId: string) {
        if (!entityId) return;
        loadingSessions = true;

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
                return;
            }

            const grid: Record<string, Record<string, { id?: string; actividad: string; clase?: string; aula?: string; rawData?: any }>> = {
                [entityId]: {}
            };

            if (data && data.length > 0) {
                data.forEach((s: { id?: string | number; dia?: number; day_of_week?: number; franja?: number; tramo_id?: number; orden?: number; actividad?: string; group_name?: string; clase?: string; grupo?: string; aula?: string }) => {
                    const dia = s.dia ?? s.day_of_week ?? 1;
                    const franja = s.franja ?? s.tramo_id ?? s.orden ?? 0;
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

            teacherScheduleGrid = grid;
        } catch (e) {
            console.error('Error procesando sesiones:', e);
        } finally {
            loadingSessions = false;
        }
    }

    // Cargar los datos correspondientes según la pestaña y el curso activo
    async function loadDataForCurrentTab() {
        await fetchTotalProfesorado();
        await fetchTimeSlots();

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

        if (selectedEntityId) {
            await fetchSessionsForEntity(selectedEntityId);
        }
    }

    onMount(() => {
        loadDataForCurrentTab();
    });

    // Reaccionar ante el cambio de profesor/aula seleccionada
    $: if (selectedEntityId) {
        fetchSessionsForEntity(selectedEntityId);
    }

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

    // Días de la semana únicamente en Euskera
    const daysOfWeek = [
        { id: 1, name: 'Astelehena' },
        { id: 2, name: 'Asteartea' },
        { id: 3, name: 'Asteazkena' },
        { id: 4, name: 'Osteguna' },
        { id: 5, name: 'Ostirala' }
    ];

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

    function handleImageError(event: Event) {
        const target = event.target as HTMLElement;
        if (target) {
            target.style.display = 'none';
        }
    }
</script>

<div class="flex flex-col min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors">
    <!-- Barra de Herramientas Superior Corporativa Ganivet -->
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
        on:imprimirHorario={handleImprimirHorario}
        on:imprimirTodos={handleImprimirTodos}
        on:administracion={handleAdministracion}
        on:importarAsc={handleImportarAsc}
    />

    <!-- Área de Contenido Principal Ampliada -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-4">
        
        <!-- Pestañas y Selector Unificados con Botón de Debug -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
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

        <!-- Tarjeta de Perfil Alineada Horizontalmente (Logo -> Nombre Grande -> Etiquetas) -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-4 flex items-center justify-center">
            {#if activeTab === 'profesorado'}
                <div class="flex flex-wrap items-center justify-center gap-4 text-center sm:text-left">
                    <!-- 1. Logo -->
                    <div class="h-10 sm:h-12 flex items-center justify-center overflow-hidden shrink-0">
                        <img src="/Logo.png" alt="Ganivet Logo" class="h-10 sm:h-12 w-auto object-contain" on:error={handleImageError} />
                    </div>
                    <!-- 2. Nombre Mucho Más Grande y Destacado -->
                    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight">
                        {currentTeacher?.nombre ? currentTeacher.nombre.toUpperCase() : (loading ? 'CARGANDO PROFESORADO...' : 'SIN PROFESORADO DISPONIBLE')}
                    </h2>
                    <!-- 3. Etiquetas -->
                    <div class="flex flex-wrap items-center gap-1.5">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800">
                            Primaria (LH)
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                            {currentTeacher?.rol || 'Especialista'}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                            {currentTeacher?.jornada || 'Jornada completa'}
                        </span>
                    </div>
                </div>
            {:else}
                <div class="flex flex-wrap items-center justify-center gap-4 text-center sm:text-left">
                    <!-- 1. Logo -->
                    <div class="h-10 sm:h-12 flex items-center justify-center overflow-hidden shrink-0">
                        <img src="/Logo.png" alt="Ganivet Logo" class="h-10 sm:h-12 w-auto object-contain" on:error={handleImageError} />
                    </div>
                    <!-- 2. Nombre Mucho Más Grande y Destacado -->
                    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight">
                        {currentClassroom?.nombre ? currentClassroom.nombre.toUpperCase() : (loading ? 'CARGANDO AULAS...' : 'SIN AULAS DISPONIBLES')}
                    </h2>
                    <!-- 3. Etiquetas -->
                    <div class="flex flex-wrap items-center gap-1.5">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200/60">
                            {currentClassroom?.edificio || 'Edificio Principal'}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border border-slate-200">
                            Capacidad: {currentClassroom?.capacidad || 'Estándar'}
                        </span>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Cuadrícula de Horarios Principal con Bordes Marcados y Modo Debug -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-slate-300 dark:border-gray-600 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full border-collapse border-2 border-slate-300 dark:border-gray-600 text-center text-xs md:text-sm">
                    <thead>
                        <tr class="bg-sky-100 dark:bg-sky-950/70 text-sky-950 dark:text-sky-100 border-b-2 border-slate-300 dark:border-gray-600 font-bold">
                            <th class="p-3 border-r-2 border-slate-300 dark:border-gray-600 w-40 font-extrabold text-sky-900 dark:text-sky-200 text-base">Ordua</th>
                            {#each daysOfWeek as day}
                                <th class="p-3 border-r-2 border-slate-300 dark:border-gray-600 min-w-[140px]">
                                    <span class="block text-lg font-black text-sky-900 dark:text-sky-100 tracking-wide">{day.name}</span>
                                </th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody class="divide-y-2 divide-slate-300 dark:divide-gray-600">
                        <!-- Fila Superior de Presencia Delimitada -->
                        <tr class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-b-2 border-slate-300 dark:border-gray-600">
                            <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-200/70 dark:bg-gray-700 font-bold text-base text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                📌 Presencia / Zaintza
                            </td>
                            {#each daysOfWeek as day}
                                <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-xs font-semibold text-sky-800 dark:text-sky-300 bg-slate-50 dark:bg-slate-800/60">
                                    09:00 - 16:30 (4h 30m)
                                </td>
                            {/each}
                        </tr>

                        <!-- Tramos Horarios Consultados de Supabase -->
                        {#each timeSlots as slot}
                            {#if slot.type === 'recreo' || slot.time.includes('11:00 - 11:30')}
                                <!-- Fila Recreo (Celdas Independientes por Día) -->
                                <tr class="bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium border-b-2 border-slate-300 dark:border-gray-600">
                                    <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-emerald-200/60 dark:bg-emerald-900/60 font-bold text-base whitespace-nowrap text-emerald-950 dark:text-emerald-200">
                                        11:00 - 11:30
                                    </td>
                                    {#each daysOfWeek as day}
                                        <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-center text-xs tracking-wider uppercase font-extrabold text-emerald-900 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-950/40">
                                            ATSEDENALDIA
                                        </td>
                                    {/each}
                                </tr>
                            {:else if slot.type === 'comedor' || slot.time.includes('14:00 - 15:00')}
                                <!-- Fila Comedor (Celdas Independientes por Día) -->
                                <tr class="bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium border-b-2 border-slate-300 dark:border-gray-600">
                                    <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-emerald-200/60 dark:bg-emerald-900/60 font-bold text-base whitespace-nowrap text-emerald-950 dark:text-emerald-200">
                                        14:00 - 15:00
                                    </td>
                                    {#each daysOfWeek as day}
                                        <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-center text-xs tracking-wider uppercase font-extrabold text-emerald-900 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-950/40">
                                            BAZKARIA
                                        </td>
                                    {/each}
                                </tr>
                            {:else if slot.type === 'presencia'}
                                <!-- Fila Guardias / Presencia Complementaria -->
                                <tr class="bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-b-2 border-slate-300 dark:border-gray-600">
                                    <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-100/80 dark:bg-gray-700/50 font-bold text-base text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                        {slot.time}
                                    </td>
                                    {#each daysOfWeek as day}
                                        <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-100/50 dark:bg-slate-700/30 text-xs italic text-slate-400 dark:text-gray-400">
                                            {activeTab === 'profesorado' ? 'Guardia / Zaintza' : 'Libre / Libre'}
                                        </td>
                                    {/each}
                                </tr>
                            {:else}
                                <!-- Franjas Lectivas -->
                                <tr class="border-b-2 border-slate-300 dark:border-gray-600">
                                    <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/30 font-bold text-base text-slate-700 dark:text-gray-200 whitespace-nowrap">
                                        {slot.time}
                                    </td>
                                    {#each daysOfWeek as day}
                                        {@const sessionKey = `${day.id}_${slot.orden}`}
                                        {@const session = teacherScheduleGrid[selectedEntityId]?.[sessionKey]}
                                        <td 
                                            class="p-1.5 border-r-2 border-slate-300 dark:border-gray-600 h-16 align-middle hover:bg-slate-100/60 dark:hover:bg-gray-700/40 transition-colors cursor-pointer relative"
                                            title={showDebug ? `[DEBUG] Día: ${day.id} | Franja: ${slot.orden} | EntityID: ${selectedEntityId} | SessionID: ${session?.id || 'N/A'}` : ''}
                                        >
                                            {#if session}
                                                <div class="flex flex-col items-center justify-center space-y-0.5">
                                                    <span class="block font-black text-slate-900 dark:text-gray-100 text-sm uppercase tracking-wide">
                                                        {session.actividad.toUpperCase()}
                                                    </span>
                                                    {#if session.clase}
                                                        <span class="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase">
                                                            {session.clase.toUpperCase()}
                                                        </span>
                                                    {/if}
                                                    {#if session.aula}
                                                        <span class="block text-[11px] font-semibold text-slate-500 dark:text-gray-400 uppercase">
                                                            {session.aula.toUpperCase()}
                                                        </span>
                                                    {/if}
                                                </div>
                                            {/if}

                                            <!-- Bloque Visual de Depuración Técnica Auditora -->
                                            {#if showDebug}
                                                <div class="mt-1 text-[9px] font-mono leading-none bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 p-1 rounded-sm border border-amber-300/80 text-left space-y-0.5">
                                                    <div><strong class="font-bold">Key:</strong> {sessionKey}</div>
                                                    <div><strong class="font-bold">SesionID:</strong> {session?.id || 'ninguna'}</div>
                                                    <div><strong class="font-bold">Entidad:</strong> {selectedEntityId}</div>
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

        <!-- Bloque de Resumen Inferior -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-4 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-700 gap-2">
                <div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-gray-100">
                        Resumen Horario y Balance de Jornada
                    </h3>
                    <p class="text-[11px] text-slate-500 dark:text-gray-400">
                        Tipo de Jornada: <strong class="text-slate-800 dark:text-gray-200">{currentTeacher?.jornada || 'Jornada completa'}</strong>
                    </p>
                </div>
                <div class="bg-slate-50 dark:bg-gray-700 px-3 py-1 rounded-lg border border-slate-200 dark:border-gray-600 text-xs font-semibold text-slate-700 dark:text-gray-300">
                    Objetivo Oficial: <span class="text-sky-700 dark:text-sky-300 font-bold">23h 00m</span>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <!-- Horas Lectivas -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Horas Lectivas</span>
                        <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block">14h 00m</strong>
                        <span class="text-[11px] text-slate-500 dark:text-gray-400">Objetivo: 15h 00m</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-base">
                        📚
                    </div>
                </div>

                <!-- Horas No Lectivas -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Horas No Lectivas</span>
                        <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block">8h 30m</strong>
                        <span class="text-[11px] text-slate-500 dark:text-gray-400">Objetivo: 8h 00m</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
                        📝
                    </div>
                </div>

                <!-- Total Asignado -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Total Asignado</span>
                        <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block">22h 30m</strong>
                        <span class="text-[11px] text-slate-500 dark:text-gray-400">Total Jornada: 23h 00m</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                        ⏱️
                    </div>
                </div>

                <!-- Balance Horario -->
                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Balance Horario</span>
                        <strong class="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">+0h 30m</strong>
                        <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Jornada equilibrada</span>
                    </div>
                    <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                        ⚖️
                    </div>
                </div>
            </div>
        </div>

    </main>
</div>
