<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import {
        getAdminProfesores,
        createAdminProfesor,
        updateAdminProfesor,
        deleteAdminProfesor,
        getAdminActividades,
        createAdminActividad,
        updateAdminActividad,
        deleteAdminActividad,
        getAdminAulas,
        createAdminAula,
        updateAdminAula,
        deleteAdminAula,
        getAdminTramosHorarios,
        createAdminTramoHorario,
        updateAdminTramoHorario,
        deleteAdminTramoHorario,
        type ProfesorRecord,
        type ActividadRecord,
        type AulaRecord,
        type TramoHorarioRecord
    } from '$lib/services/adminService';

    export let isOpen: boolean = false;
    export let selectedCurso: string = '2026-2027';

    const dispatch = createEventDispatcher();

    type TabType = 'profesores' | 'actividades' | 'aulas' | 'tramos';
    let activeTab: TabType = 'profesores';

    let loading: boolean = false;
    let errorMessage: string = '';
    let successMessage: string = '';

    // Datos
    let profesores: ProfesorRecord[] = [];
    let actividades: ActividadRecord[] = [];
    let aulas: AulaRecord[] = [];
    let tramosHorarios: TramoHorarioRecord[] = [];

    const diasNombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    // Opciones estándar para selectores desplegables
    const opcionesPerfil = ['Tutor', 'Especialista', 'Consultor', 'Orientador', 'PT', 'AL'];
    const opcionesJornada = ['Jornada completa', '2/3 de jornada', '1/2 jornada', '1/3 de jornada'];
    const opcionesCategoria = ['General', 'Lectiva', 'No Lectiva', 'Complementaria', 'Guardia'];
    const opcionesEdificio = ['Principal', 'Secundario', 'Gimnasio', 'Exterior'];

    // Control de celda activa en edición en línea: { id, field }
    let activeCell: { id: string | number; field: string } | null = null;

    // Campos temporales para Nuevo Registro
    let newProfesor = { nombre: '', perfil: 'Especialista', jornada: 'Jornada completa', clase_base: '' };
    let newActividad = { nombre: '', categoria: 'General', es_lectiva: true };
    let newAula = { nombre: '', code: '', edificio: 'Principal', capacidad: '30' };
    let newTramo = { franja: '', minutos_maximos: 45 };

    $: opcionesClaseBase = Array.from(
        new Set([
            '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B',
            'HH2', 'HH3', 'HH4', 'HH5',
            ...aulas.map((a) => a.nombre).filter(Boolean),
            ...aulas.map((a) => a.code).filter(Boolean)
        ])
    ).sort();

    $: if (isOpen && selectedCurso) {
        loadData();
    }

    async function loadData() {
        loading = true;
        errorMessage = '';
        try {
            if (activeTab === 'profesores') {
                profesores = await getAdminProfesores(selectedCurso);
                aulas = await getAdminAulas(selectedCurso);
            } else if (activeTab === 'actividades') {
                actividades = await getAdminActividades(selectedCurso);
            } else if (activeTab === 'aulas') {
                aulas = await getAdminAulas(selectedCurso);
            } else if (activeTab === 'tramos') {
                const rawTramos = await getAdminTramosHorarios();
                tramosHorarios = rawTramos.map((t) => ({
                    ...t,
                    franja: String(t.franja ?? '')
                }));
                profesores = await getAdminProfesores(selectedCurso);
            }
        } catch (e: any) {
            errorMessage = e.message || 'Error al cargar datos';
        } finally {
            loading = false;
        }
    }

    function switchTab(tab: TabType) {
        activeTab = tab;
        activeCell = null;
        errorMessage = '';
        successMessage = '';
        loadData();
    }

    function closeModal() {
        isOpen = false;
        dispatch('close');
    }

    function setEditingCell(id: string | number, field: string) {
        activeCell = { id, field };
    }

    function isEditingCell(id: string | number, field: string): boolean {
        return activeCell !== null && activeCell.id === id && activeCell.field === field;
    }

    function clearEditingCell() {
        activeCell = null;
    }

    function handleKeyDownCell(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            (e.target as HTMLElement)?.blur();
        } else if (e.key === 'Escape') {
            clearEditingCell();
        }
    }

    // --- ACCIONES PROFESORES ---
    async function handleCreateProfesor() {
        if (!newProfesor.nombre.trim()) return;
        try {
            await createAdminProfesor({
                nombre: newProfesor.nombre,
                perfil: newProfesor.perfil,
                jornada: newProfesor.jornada,
                clase_base: newProfesor.perfil === 'Tutor' ? (newProfesor.clase_base || null) : (newProfesor.clase_base || null),
                curso_escolar: selectedCurso
            });
            newProfesor = { nombre: '', perfil: 'Especialista', jornada: 'Jornada completa', clase_base: '' };
            showSuccess('Profesor creado con éxito');
            await loadData();
        } catch (e: any) {
            errorMessage = e.message;
        }
    }

    async function handleSaveProfesorField(p: ProfesorRecord, field: keyof ProfesorRecord) {
        clearEditingCell();
        try {
            await updateAdminProfesor(p.id, { [field]: p[field] });
            showSuccess('Profesor actualizado');
        } catch (e: any) {
            errorMessage = e.message;
            await loadData();
        }
    }

    async function handleDeleteProfesor(id: string, nombre: string) {
        if (!confirm(`¿Eliminar al profesor "${nombre}"?`)) return;
        try {
            await deleteAdminProfesor(id);
            showSuccess('Profesor eliminado');
            await loadData();
        } catch (e: any) {
            errorMessage = e.message;
        }
    }

    // --- ACCIONES ACTIVIDADES ---
    async function handleCreateActividad() {
        if (!newActividad.nombre.trim()) return;
        try {
            await createAdminActividad({
                nombre: newActividad.nombre,
                categoria: newActividad.categoria,
                es_lectiva: Boolean(newActividad.es_lectiva),
                curso_escolar: selectedCurso
            });
            newActividad = { nombre: '', categoria: 'General', es_lectiva: true };
            showSuccess('Asignatura creada con éxito');
            await loadData();
        } catch (e: any) {
            errorMessage = e.message;
        }
    }

    async function handleSaveActividadField(a: ActividadRecord, field: keyof ActividadRecord) {
        clearEditingCell();
        try {
            await updateAdminActividad(a.id, { [field]: a[field] });
            showSuccess('Asignatura actualizada');
        } catch (e: any) {
            errorMessage = e.message;
            await loadData();
        }
    }

    async function handleDeleteActividad(id: number, nombre: string) {
        if (!confirm(`¿Eliminar la asignatura "${nombre}"?`)) return;
        try {
            await deleteAdminActividad(id);
            showSuccess('Asignatura eliminada');
            await loadData();
        } catch (e: any) {
            errorMessage = e.message;
        }
    }

    // --- ACCIONES AULAS ---
    async function handleCreateAula() {
        if (!newAula.nombre.trim()) return;
        try {
            await createAdminAula({
                nombre: newAula.nombre,
                code: newAula.code || newAula.nombre,
                edificio: newAula.edificio,
                capacidad: newAula.capacidad,
                curso_escolar: selectedCurso
            });
            newAula = { nombre: '', code: '', edificio: 'Principal', capacidad: '30' };
            showSuccess('Aula creada con éxito');
            await loadData();
        } catch (e: any) {
            errorMessage = e.message;
        }
    }

    async function handleSaveAulaField(au: AulaRecord, field: keyof AulaRecord) {
        clearEditingCell();
        try {
            await updateAdminAula(au.id, { [field]: au[field] });
            showSuccess('Aula actualizada');
        } catch (e: any) {
            errorMessage = e.message;
            await loadData();
        }
    }

    async function handleDeleteAula(id: string, nombre: string) {
        if (!confirm(`¿Eliminar el aula "${nombre}"?`)) return;
        try {
            await deleteAdminAula(id);
            showSuccess('Aula eliminada');
            await loadData();
        } catch (e: any) {
            errorMessage = e.message;
        }
    }

    // --- ACCIONES TRAMOS HORARIOS ---
    async function handleCreateTramo() {
        try {
            await createAdminTramoHorario({
                franja: String(newTramo.franja),
                orden: tramosHorarios.length,
                minutos_maximos: Number(newTramo.minutos_maximos)
            });
            newTramo = { franja: '', minutos_maximos: 45 };
            showSuccess('Tramo horario creado');
            await loadData();
        } catch (e: any) {
            errorMessage = e.message;
        }
    }

    async function handleSaveTramoField(t: TramoHorarioRecord, field: keyof TramoHorarioRecord) {
        clearEditingCell();
        try {
            const val = field === 'minutos_maximos' ? Number(t[field]) : String(t[field] ?? '');
            const updates: Partial<TramoHorarioRecord> = { [field]: val };
            await updateAdminTramoHorario(t.id, updates);
            showSuccess('Tramo horario actualizado');
        } catch (e: any) {
            errorMessage = e.message;
            await loadData();
        }
    }

    async function handleDeleteTramo(id: number, franja: string | number) {
        if (!confirm(`¿Eliminar la franja ${franja}?`)) return;
        try {
            await deleteAdminTramoHorario(id);
            showSuccess('Tramo horario eliminado');
            await loadData();
        } catch (e: any) {
            errorMessage = e.message;
        }
    }

    function showSuccess(msg: string) {
        successMessage = msg;
        setTimeout(() => successMessage = '', 3000);
    }

    function autofocusInput(node: HTMLElement) {
        setTimeout(() => {
            node.focus();
            if (node instanceof HTMLInputElement) {
                node.select();
            }
        }, 0);
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-6xl h-[90vh] max-h-[920px] flex flex-col overflow-hidden transition-all">
            
            <!-- Cabecera -->
            <div class="px-8 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                <div class="flex items-center space-x-3">
                    <span class="text-2xl">⚙️</span>
                    <div>
                        <h2 class="text-xl font-black tracking-wide">Módulo de Administración</h2>
                        <p class="text-xs text-slate-400 font-medium">Gestión de datos de configuración general — Curso {selectedCurso}</p>
                    </div>
                </div>
                <button
                    type="button"
                    on:click={closeModal}
                    class="text-slate-400 hover:text-white text-2xl font-bold p-2 rounded-xl hover:bg-slate-800 transition-colors"
                    title="Cerrar ventana"
                >
                    ✕
                </button>
            </div>

            <!-- Navegación de Pestañas -->
            <div class="flex border-b border-slate-200 dark:border-gray-700 bg-slate-100/80 dark:bg-gray-900 px-8 pt-4 space-x-3 overflow-x-auto shrink-0">
                <button
                    type="button"
                    on:click={() => switchTab('profesores')}
                    class="px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-2 {activeTab === 'profesores' ? 'border-sky-600 bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-xs' : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 hover:bg-slate-200/50'}"
                >
                    <span>👨‍🏫</span> Profesorado
                </button>
                <button
                    type="button"
                    on:click={() => switchTab('actividades')}
                    class="px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-2 {activeTab === 'actividades' ? 'border-sky-600 bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-xs' : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 hover:bg-slate-200/50'}"
                >
                    <span>📚</span> Asignaturas / Actividades
                </button>
                <button
                    type="button"
                    on:click={() => switchTab('aulas')}
                    class="px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-2 {activeTab === 'aulas' ? 'border-sky-600 bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-xs' : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 hover:bg-slate-200/50'}"
                >
                    <span>🏫</span> Aulas y Espacios
                </button>
                <button
                    type="button"
                    on:click={() => switchTab('tramos')}
                    class="px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-2 {activeTab === 'tramos' ? 'border-sky-600 bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-xs' : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 hover:bg-slate-200/50'}"
                >
                    <span>⏱️</span> Tramos Horarios Primaria
                </button>
            </div>

            <!-- Notificaciones -->
            {#if errorMessage}
                <div class="mx-8 mt-5 p-4 bg-red-100 text-red-800 border border-red-300 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0">
                    <span class="text-base">⚠️</span> {errorMessage}
                </div>
            {/if}
            {#if successMessage}
                <div class="mx-8 mt-5 p-4 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0">
                    <span class="text-base">✅</span> {successMessage}
                </div>
            {/if}

            <!-- Contenido Principal -->
            <div class="flex-1 overflow-y-auto p-8 space-y-6">
                {#if loading}
                    <div class="text-center py-20 text-slate-500 font-semibold text-sm">Cargando datos de Supabase...</div>
                {:else if activeTab === 'profesores'}
                    <!-- Formulario Nuevo Profesor -->
                    <div class="bg-slate-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 flex flex-wrap items-end gap-4 shadow-xs">
                        <div class="flex-1 min-w-[200px]">
                            <label for="new-prof-nombre" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Nombre completo</label>
                            <input id="new-prof-nombre" type="text" bind:value={newProfesor.nombre} placeholder="Ej. Ana Garcia Lopez" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-medium focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div class="w-44">
                            <label for="new-prof-perfil" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Perfil</label>
                            <select id="new-prof-perfil" bind:value={newProfesor.perfil} class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500">
                                {#each opcionesPerfil as item}
                                    <option value={item}>{item}</option>
                                {/each}
                            </select>
                        </div>
                        {#if newProfesor.perfil === 'Tutor'}
                            <div class="w-40 animate-fade-in">
                                <label for="new-prof-clase" class="block text-xs font-extrabold uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-1.5">
                                    Grupo Tutorizado <span class="text-red-500">*</span>
                                </label>
                                <select
                                    id="new-prof-clase"
                                    bind:value={newProfesor.clase_base}
                                    class="w-full text-xs p-2.5 rounded-xl border-2 border-sky-400 dark:border-sky-500 bg-sky-50 dark:bg-gray-800 dark:text-white font-bold focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {#each opcionesClaseBase as grp}
                                        <option value={grp}>{grp}</option>
                                    {/each}
                                </select>
                            </div>
                        {/if}
                        <div class="w-44">
                            <label for="new-prof-jornada" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Jornada</label>
                            <select id="new-prof-jornada" bind:value={newProfesor.jornada} class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500">
                                {#each opcionesJornada as item}
                                    <option value={item}>{item}</option>
                                {/each}
                            </select>
                        </div>
                        <button type="button" on:click={handleCreateProfesor} class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0">
                            + Añadir Profesor
                        </button>
                    </div>

                    <!-- Tabla Profesores -->
                    <div class="rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden shadow-xs">
                        <table class="w-full text-xs text-left border-collapse">
                            <thead class="bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-200 uppercase font-extrabold tracking-wider">
                                <tr>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600">Nombre</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-44">Perfil</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-44">Grupo Tutorizado</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-44">Jornada</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-24 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {#each profesores as p (p.id)}
                                    <tr class="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            <input
                                                type="text"
                                                bind:value={p.nombre}
                                                on:change={() => handleSaveProfesorField(p, 'nombre')}
                                                on:blur={() => handleSaveProfesorField(p, 'nombre')}
                                                class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-bold transition-all focus:outline-hidden"
                                            />
                                        </td>
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            <select
                                                bind:value={p.perfil}
                                                on:change={() => handleSaveProfesorField(p, 'perfil')}
                                                class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-semibold transition-all focus:outline-hidden cursor-pointer"
                                            >
                                                {#each opcionesPerfil as item}
                                                    <option value={item}>{item}</option>
                                                {/each}
                                                {#if p.perfil && !opcionesPerfil.includes(p.perfil)}
                                                    <option value={p.perfil}>{p.perfil}</option>
                                                {/if}
                                            </select>
                                        </td>
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            {#if p.perfil === 'Tutor'}
                                                <select
                                                    bind:value={p.clase_base}
                                                    on:change={() => handleSaveProfesorField(p, 'clase_base')}
                                                    class="w-full p-2 border-2 border-sky-400 dark:border-sky-500 focus:border-sky-600 rounded-lg text-xs bg-sky-50/80 dark:bg-sky-950/40 dark:text-white font-bold transition-all focus:outline-hidden cursor-pointer"
                                                >
                                                    <option value="">-- Asignar Grupo --</option>
                                                    {#each opcionesClaseBase as grp}
                                                        <option value={grp}>{grp}</option>
                                                    {/each}
                                                    {#if p.clase_base && !opcionesClaseBase.includes(p.clase_base)}
                                                        <option value={p.clase_base}>{p.clase_base}</option>
                                                    {/if}
                                                </select>
                                            {:else}
                                                <select
                                                    bind:value={p.clase_base}
                                                    on:change={() => handleSaveProfesorField(p, 'clase_base')}
                                                    class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/30 dark:bg-gray-900/30 text-slate-500 dark:text-gray-400 transition-all focus:outline-hidden cursor-pointer"
                                                >
                                                    <option value="">-- Sin Grupo --</option>
                                                    {#each opcionesClaseBase as grp}
                                                        <option value={grp}>{grp}</option>
                                                    {/each}
                                                </select>
                                            {/if}
                                        </td>
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            <select
                                                bind:value={p.jornada}
                                                on:change={() => handleSaveProfesorField(p, 'jornada')}
                                                class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-semibold transition-all focus:outline-hidden cursor-pointer"
                                            >
                                                {#each opcionesJornada as item}
                                                    <option value={item}>{item}</option>
                                                {/each}
                                                {#if p.jornada && !opcionesJornada.includes(p.jornada)}
                                                    <option value={p.jornada}>{p.jornada}</option>
                                                {/if}
                                            </select>
                                        </td>
                                        <td class="p-2 text-center">
                                            <button type="button" on:click={() => handleDeleteProfesor(p.id, p.nombre)} class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors font-bold cursor-pointer" title="Eliminar profesor">🗑️</button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                {:else if activeTab === 'actividades'}
                    <!-- Formulario Nueva Asignatura -->
                    <div class="bg-slate-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 flex flex-wrap items-end gap-4 shadow-xs">
                        <div class="flex-1 min-w-[240px]">
                            <label for="new-act-nombre" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Nombre Asignatura</label>
                            <input id="new-act-nombre" type="text" bind:value={newActividad.nombre} placeholder="Ej. Matemáticas" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-medium focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div class="w-52">
                            <label for="new-act-cat" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Categoría</label>
                            <select id="new-act-cat" bind:value={newActividad.categoria} class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500">
                                {#each opcionesCategoria as item}
                                    <option value={item}>{item}</option>
                                {/each}
                            </select>
                        </div>
                        <button type="button" on:click={handleCreateActividad} class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0">
                            + Añadir Asignatura
                        </button>
                    </div>

                    <!-- Tabla Asignaturas -->
                    <div class="rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden shadow-xs">
                        <table class="w-full text-xs text-left border-collapse">
                            <thead class="bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-200 uppercase font-extrabold tracking-wider">
                                <tr>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600">Nombre</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-64">Categoría</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-24 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {#each actividades as a (a.id)}
                                    <tr class="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            <input
                                                type="text"
                                                bind:value={a.nombre}
                                                on:change={() => handleSaveActividadField(a, 'nombre')}
                                                on:blur={() => handleSaveActividadField(a, 'nombre')}
                                                class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-bold transition-all focus:outline-hidden"
                                            />
                                        </td>
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            <select
                                                bind:value={a.categoria}
                                                on:change={() => handleSaveActividadField(a, 'categoria')}
                                                class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-semibold transition-all focus:outline-hidden cursor-pointer"
                                            >
                                                {#each opcionesCategoria as item}
                                                    <option value={item}>{item}</option>
                                                {/each}
                                                {#if a.categoria && !opcionesCategoria.includes(a.categoria)}
                                                    <option value={a.categoria}>{a.categoria}</option>
                                                {/if}
                                            </select>
                                        </td>
                                        <td class="p-3 text-center">
                                            <button type="button" on:click={() => handleDeleteActividad(a.id, a.nombre)} class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors font-bold" title="Eliminar asignatura">🗑️</button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                {:else if activeTab === 'aulas'}
                    <!-- Formulario Nueva Aula -->
                    <div class="bg-slate-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 flex flex-wrap items-end gap-4 shadow-xs">
                        <div class="flex-1 min-w-[200px]">
                            <label for="new-aula-nombre" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Nombre Aula</label>
                            <input id="new-aula-nombre" type="text" bind:value={newAula.nombre} placeholder="Ej. LH 1A" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-medium focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div class="w-40">
                            <label for="new-aula-code" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Código</label>
                            <input id="new-aula-code" type="text" bind:value={newAula.code} placeholder="LH1A" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-medium focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div class="w-48">
                            <label for="new-aula-edificio" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Edificio</label>
                            <select id="new-aula-edificio" bind:value={newAula.edificio} class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500">
                                {#each opcionesEdificio as item}
                                    <option value={item}>{item}</option>
                                {/each}
                            </select>
                        </div>
                        <button type="button" on:click={handleCreateAula} class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0">
                            + Añadir Aula
                        </button>
                    </div>

                    <!-- Tabla Aulas -->
                    <div class="rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden shadow-xs">
                        <table class="w-full text-xs text-left border-collapse">
                            <thead class="bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-200 uppercase font-extrabold tracking-wider">
                                <tr>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600">Nombre</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-44">Código</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-52">Edificio</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-24 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {#each aulas as au (au.id)}
                                    <tr class="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            <input
                                                type="text"
                                                bind:value={au.nombre}
                                                on:change={() => handleSaveAulaField(au, 'nombre')}
                                                on:blur={() => handleSaveAulaField(au, 'nombre')}
                                                class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-bold transition-all focus:outline-hidden"
                                            />
                                        </td>
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            <input
                                                type="text"
                                                bind:value={au.code}
                                                on:change={() => handleSaveAulaField(au, 'code')}
                                                on:blur={() => handleSaveAulaField(au, 'code')}
                                                class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-semibold transition-all focus:outline-hidden"
                                            />
                                        </td>
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            <select
                                                bind:value={au.edificio}
                                                on:change={() => handleSaveAulaField(au, 'edificio')}
                                                class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-semibold transition-all focus:outline-hidden cursor-pointer"
                                            >
                                                {#each opcionesEdificio as item}
                                                    <option value={item}>{item}</option>
                                                {/each}
                                                {#if au.edificio && !opcionesEdificio.includes(au.edificio)}
                                                    <option value={au.edificio}>{au.edificio}</option>
                                                {/if}
                                            </select>
                                        </td>
                                        <td class="p-2 text-center">
                                            <button type="button" on:click={() => handleDeleteAula(au.id, au.nombre)} class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors font-bold cursor-pointer" title="Eliminar aula">🗑️</button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                {:else if activeTab === 'tramos'}
                    <!-- Formulario Nuevo Tramo Horario -->
                    <div class="bg-slate-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 flex flex-wrap items-end gap-4 shadow-xs">
                        <div class="w-40">
                            <label for="new-tramo-franja" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Franja</label>
                            <input id="new-tramo-franja" type="text" bind:value={newTramo.franja} placeholder="09:00 - 09:30 H" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-medium focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div class="w-56">
                            <label for="new-tramo-minutos" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Minutos Máximos</label>
                            <input id="new-tramo-minutos" type="number" bind:value={newTramo.minutos_maximos} min="1" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-medium focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <button type="button" on:click={handleCreateTramo} class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0">
                            + Añadir Franja Horaria
                        </button>
                    </div>

                    <!-- Tabla Tramos Horarios Primaria -->
                    <div class="rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden shadow-xs">
                        <table class="w-full text-xs text-left border-collapse">
                            <thead class="bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-200 uppercase font-extrabold tracking-wider">
                                <tr>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-44">Franja</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600">Minutos Máximos</th>
                                    <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-24 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {#each tramosHorarios as t (t.id)}
                                    <tr class="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            <input
                                                type="text"
                                                bind:value={t.franja}
                                                on:change={() => handleSaveTramoField(t, 'franja')}
                                                on:blur={() => handleSaveTramoField(t, 'franja')}
                                                class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-bold transition-all focus:outline-hidden"
                                            />
                                        </td>
                                        <td class="p-2 border-r border-slate-100 dark:border-gray-700">
                                            <input
                                                type="number"
                                                bind:value={t.minutos_maximos}
                                                on:change={() => handleSaveTramoField(t, 'minutos_maximos')}
                                                on:blur={() => handleSaveTramoField(t, 'minutos_maximos')}
                                                class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-bold transition-all focus:outline-hidden"
                                            />
                                        </td>
                                        <td class="p-2 text-center">
                                            <button type="button" on:click={() => handleDeleteTramo(t.id, t.franja)} class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors font-bold cursor-pointer" title="Eliminar tramo">🗑️</button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>

            <!-- Pie del Modal -->
            <div class="px-8 py-4 bg-slate-100 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 flex justify-end shrink-0">
                <button
                    type="button"
                    on:click={closeModal}
                    class="px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                    Cerrar Módulo
                </button>
            </div>

        </div>
    </div>
{/if}
