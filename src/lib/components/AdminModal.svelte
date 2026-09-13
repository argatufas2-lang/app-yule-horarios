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
        type ProfesorRecord,
        type ActividadRecord,
        type AulaRecord
    } from '$lib/services/adminService';

    export let isOpen: boolean = false;
    export let selectedCurso: string = '2026-2027';

    const dispatch = createEventDispatcher();

    type TabType = 'profesores' | 'actividades' | 'aulas';
    let activeTab: TabType = 'profesores';

    let loading: boolean = false;
    let errorMessage: string = '';
    let successMessage: string = '';

    // Datos
    let profesores: ProfesorRecord[] = [];
    let actividades: ActividadRecord[] = [];
    let aulas: AulaRecord[] = [];

    // Formulario de edición/creación
    let editingId: string | number | null = null;

    // Campos temporales para Nuevo / Edición
    let newProfesor = { nombre: '', perfil: 'Especialista', jornada: 'Jornada completa' };
    let newActividad = { nombre: '', categoria: 'General', es_lectiva: true };
    let newAula = { nombre: '', code: '', edificio: 'Principal', capacidad: '30' };

    $: if (isOpen && selectedCurso) {
        loadData();
    }

    async function loadData() {
        loading = true;
        errorMessage = '';
        try {
            if (activeTab === 'profesores') {
                profesores = await getAdminProfesores(selectedCurso);
            } else if (activeTab === 'actividades') {
                actividades = await getAdminActividades(selectedCurso);
            } else if (activeTab === 'aulas') {
                aulas = await getAdminAulas(selectedCurso);
            }
        } catch (e: any) {
            errorMessage = e.message || 'Error al cargar datos';
        } finally {
            loading = false;
        }
    }

    function switchTab(tab: TabType) {
        activeTab = tab;
        editingId = null;
        errorMessage = '';
        successMessage = '';
        loadData();
    }

    function closeModal() {
        isOpen = false;
        dispatch('close');
    }

    // --- ACCIONES PROFESORES ---
    async function handleCreateProfesor() {
        if (!newProfesor.nombre.trim()) return;
        try {
            await createAdminProfesor({
                nombre: newProfesor.nombre,
                perfil: newProfesor.perfil,
                jornada: newProfesor.jornada,
                curso_escolar: selectedCurso
            });
            newProfesor = { nombre: '', perfil: 'Especialista', jornada: 'Jornada completa' };
            showSuccess('Profesor creado con éxito');
            await loadData();
        } catch (e: any) {
            errorMessage = e.message;
        }
    }

    async function handleUpdateProfesor(p: ProfesorRecord) {
        try {
            await updateAdminProfesor(p.id, {
                nombre: p.nombre,
                perfil: p.perfil,
                jornada: p.jornada
            });
            editingId = null;
            showSuccess('Profesor actualizado');
        } catch (e: any) {
            errorMessage = e.message;
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
                es_lectiva: newActividad.es_lectiva,
                curso_escolar: selectedCurso
            });
            newActividad = { nombre: '', categoria: 'General', es_lectiva: true };
            showSuccess('Asignatura creada con éxito');
            await loadData();
        } catch (e: any) {
            errorMessage = e.message;
        }
    }

    async function handleUpdateActividad(a: ActividadRecord) {
        try {
            await updateAdminActividad(a.id, {
                nombre: a.nombre,
                categoria: a.categoria,
                es_lectiva: a.es_lectiva
            });
            editingId = null;
            showSuccess('Asignatura actualizada');
        } catch (e: any) {
            errorMessage = e.message;
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

    async function handleUpdateAula(a: AulaRecord) {
        try {
            await updateAdminAula(a.id, {
                nombre: a.nombre,
                code: a.code,
                edificio: a.edificio,
                capacidad: a.capacidad
            });
            editingId = null;
            showSuccess('Aula actualizada');
        } catch (e: any) {
            errorMessage = e.message;
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

    function showSuccess(msg: string) {
        successMessage = msg;
        setTimeout(() => successMessage = '', 3000);
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <!-- Cabecera -->
            <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div class="flex items-center space-x-2">
                    <span class="text-xl">⚙️</span>
                    <h2 class="text-lg font-bold tracking-wide">Módulo de Administración ({selectedCurso})</h2>
                </div>
                <button
                    type="button"
                    on:click={closeModal}
                    class="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    ✕
                </button>
            </div>

            <!-- Navegación de Pestañas -->
            <div class="flex border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 px-6 pt-3 space-x-2">
                <button
                    type="button"
                    on:click={() => switchTab('profesores')}
                    class="px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 {activeTab === 'profesores' ? 'border-sky-600 bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900'}"
                >
                    👨‍🏫 Profesorado
                </button>
                <button
                    type="button"
                    on:click={() => switchTab('actividades')}
                    class="px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 {activeTab === 'actividades' ? 'border-sky-600 bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900'}"
                >
                    📚 Asignaturas / Actividades
                </button>
                <button
                    type="button"
                    on:click={() => switchTab('aulas')}
                    class="px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 {activeTab === 'aulas' ? 'border-sky-600 bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900'}"
                >
                    🏫 Aulas y Espacios
                </button>
            </div>

            <!-- Notificaciones -->
            {#if errorMessage}
                <div class="mx-6 mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-lg text-xs font-semibold">
                    ⚠️ {errorMessage}
                </div>
            {/if}
            {#if successMessage}
                <div class="mx-6 mt-4 p-3 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold">
                    ✅ {successMessage}
                </div>
            {/if}

            <!-- Contenido Principal -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
                {#if loading}
                    <div class="text-center py-12 text-slate-500 font-medium">Cargando datos de Supabase...</div>
                {:else if activeTab === 'profesores'}
                    <!-- Formulario Nuevo Profesor -->
                    <div class="bg-slate-50 dark:bg-gray-900/60 p-4 rounded-xl border border-slate-200 dark:border-gray-700 flex flex-wrap items-end gap-3">
                        <div class="flex-1 min-w-[200px]">
                            <label class="block text-[11px] font-bold uppercase text-slate-600 dark:text-gray-300 mb-1">Nombre</label>
                            <input type="text" bind:value={newProfesor.nombre} placeholder="Nombre completo" class="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div class="w-40">
                            <label class="block text-[11px] font-bold uppercase text-slate-600 dark:text-gray-300 mb-1">Perfil</label>
                            <input type="text" bind:value={newProfesor.perfil} placeholder="Tutor / Especialista" class="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div class="w-40">
                            <label class="block text-[11px] font-bold uppercase text-slate-600 dark:text-gray-300 mb-1">Jornada</label>
                            <input type="text" bind:value={newProfesor.jornada} placeholder="Jornada completa" class="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                        </div>
                        <button type="button" on:click={handleCreateProfesor} class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors">
                            + Añadir
                        </button>
                    </div>

                    <!-- Tabla Profesores -->
                    <table class="w-full text-xs text-left border-collapse border border-slate-200 dark:border-gray-700">
                        <thead class="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 uppercase font-bold">
                            <tr>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600">Nombre</th>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600 w-36">Perfil</th>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600 w-36">Jornada</th>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600 w-28 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 dark:divide-gray-700">
                            {#each profesores as p}
                                <tr class="hover:bg-slate-50 dark:hover:bg-gray-700/50">
                                    {#if editingId === p.id}
                                        <td class="p-2"><input type="text" bind:value={p.nombre} class="w-full p-1 border rounded text-xs" /></td>
                                        <td class="p-2"><input type="text" bind:value={p.perfil} class="w-full p-1 border rounded text-xs" /></td>
                                        <td class="p-2"><input type="text" bind:value={p.jornada} class="w-full p-1 border rounded text-xs" /></td>
                                        <td class="p-2 text-center space-x-1">
                                            <button type="button" on:click={() => handleUpdateProfesor(p)} class="px-2 py-1 bg-sky-600 text-white rounded font-bold text-[10px]">Guardar</button>
                                            <button type="button" on:click={() => editingId = null} class="px-2 py-1 bg-slate-300 text-slate-800 rounded font-bold text-[10px]">Cancelar</button>
                                        </td>
                                    {:else}
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600 font-semibold">{p.nombre}</td>
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600">{p.perfil || 'Especialista'}</td>
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600">{p.jornada || 'Jornada completa'}</td>
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600 text-center space-x-1">
                                            <button type="button" on:click={() => editingId = p.id} class="text-sky-600 hover:text-sky-800 font-bold">✏️</button>
                                            <button type="button" on:click={() => handleDeleteProfesor(p.id, p.nombre)} class="text-red-600 hover:text-red-800 font-bold">🗑️</button>
                                        </td>
                                    {/if}
                                </tr>
                            {/each}
                        </tbody>
                    </table>

                {:else if activeTab === 'actividades'}
                    <!-- Formulario Nueva Asignatura -->
                    <div class="bg-slate-50 dark:bg-gray-900/60 p-4 rounded-xl border border-slate-200 dark:border-gray-700 flex flex-wrap items-end gap-3">
                        <div class="flex-1 min-w-[200px]">
                            <label class="block text-[11px] font-bold uppercase text-slate-600 dark:text-gray-300 mb-1">Nombre Asignatura</label>
                            <input type="text" bind:value={newActividad.nombre} placeholder="Ej. Matemáticas" class="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div class="w-40">
                            <label class="block text-[11px] font-bold uppercase text-slate-600 dark:text-gray-300 mb-1">Categoría</label>
                            <input type="text" bind:value={newActividad.categoria} placeholder="Troncal / Optativa" class="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div class="flex items-center space-x-2 h-9 px-2">
                            <input type="checkbox" id="esLectiva" bind:checked={newActividad.es_lectiva} />
                            <label for="esLectiva" class="text-xs font-bold text-slate-700 dark:text-gray-300">Lectiva</label>
                        </div>
                        <button type="button" on:click={handleCreateActividad} class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors">
                            + Añadir
                        </button>
                    </div>

                    <!-- Tabla Asignaturas -->
                    <table class="w-full text-xs text-left border-collapse border border-slate-200 dark:border-gray-700">
                        <thead class="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 uppercase font-bold">
                            <tr>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600">Asignatura</th>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600 w-36">Categoría</th>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600 w-28 text-center">Es Lectiva</th>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600 w-28 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 dark:divide-gray-700">
                            {#each actividades as a}
                                <tr class="hover:bg-slate-50 dark:hover:bg-gray-700/50">
                                    {#if editingId === a.id}
                                        <td class="p-2"><input type="text" bind:value={a.nombre} class="w-full p-1 border rounded text-xs" /></td>
                                        <td class="p-2"><input type="text" bind:value={a.categoria} class="w-full p-1 border rounded text-xs" /></td>
                                        <td class="p-2 text-center"><input type="checkbox" bind:checked={a.es_lectiva} /></td>
                                        <td class="p-2 text-center space-x-1">
                                            <button type="button" on:click={() => handleUpdateActividad(a)} class="px-2 py-1 bg-sky-600 text-white rounded font-bold text-[10px]">Guardar</button>
                                            <button type="button" on:click={() => editingId = null} class="px-2 py-1 bg-slate-300 text-slate-800 rounded font-bold text-[10px]">Cancelar</button>
                                        </td>
                                    {:else}
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600 font-semibold">{a.nombre}</td>
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600">{a.categoria || 'General'}</td>
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600 text-center">{a.es_lectiva ? '✅ Sí' : '❌ No'}</td>
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600 text-center space-x-1">
                                            <button type="button" on:click={() => editingId = a.id} class="text-sky-600 hover:text-sky-800 font-bold">✏️</button>
                                            <button type="button" on:click={() => handleDeleteActividad(a.id, a.nombre)} class="text-red-600 hover:text-red-800 font-bold">🗑️</button>
                                        </td>
                                    {/if}
                                </tr>
                            {/each}
                        </tbody>
                    </table>

                {:else if activeTab === 'aulas'}
                    <!-- Formulario Nueva Aula -->
                    <div class="bg-slate-50 dark:bg-gray-900/60 p-4 rounded-xl border border-slate-200 dark:border-gray-700 flex flex-wrap items-end gap-3">
                        <div class="flex-1 min-w-[150px]">
                            <label class="block text-[11px] font-bold uppercase text-slate-600 dark:text-gray-300 mb-1">Nombre Aula</label>
                            <input type="text" bind:value={newAula.nombre} placeholder="Ej. LH 1A" class="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div class="w-32">
                            <label class="block text-[11px] font-bold uppercase text-slate-600 dark:text-gray-300 mb-1">Código</label>
                            <input type="text" bind:value={newAula.code} placeholder="LH1A" class="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div class="w-36">
                            <label class="block text-[11px] font-bold uppercase text-slate-600 dark:text-gray-300 mb-1">Edificio</label>
                            <input type="text" bind:value={newAula.edificio} placeholder="Principal" class="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                        </div>
                        <button type="button" on:click={handleCreateAula} class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors">
                            + Añadir
                        </button>
                    </div>

                    <!-- Tabla Aulas -->
                    <table class="w-full text-xs text-left border-collapse border border-slate-200 dark:border-gray-700">
                        <thead class="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 uppercase font-bold">
                            <tr>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600">Nombre</th>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600 w-32">Código</th>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600 w-36">Edificio</th>
                                <th class="p-2.5 border border-slate-200 dark:border-gray-600 w-28 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 dark:divide-gray-700">
                            {#each aulas as au}
                                <tr class="hover:bg-slate-50 dark:hover:bg-gray-700/50">
                                    {#if editingId === au.id}
                                        <td class="p-2"><input type="text" bind:value={au.nombre} class="w-full p-1 border rounded text-xs" /></td>
                                        <td class="p-2"><input type="text" bind:value={au.code} class="w-full p-1 border rounded text-xs" /></td>
                                        <td class="p-2"><input type="text" bind:value={au.edificio} class="w-full p-1 border rounded text-xs" /></td>
                                        <td class="p-2 text-center space-x-1">
                                            <button type="button" on:click={() => handleUpdateAula(au)} class="px-2 py-1 bg-sky-600 text-white rounded font-bold text-[10px]">Guardar</button>
                                            <button type="button" on:click={() => editingId = null} class="px-2 py-1 bg-slate-300 text-slate-800 rounded font-bold text-[10px]">Cancelar</button>
                                        </td>
                                    {:else}
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600 font-semibold">{au.nombre}</td>
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600">{au.code || au.nombre}</td>
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600">{au.edificio || 'Principal'}</td>
                                        <td class="p-2.5 border border-slate-200 dark:border-gray-600 text-center space-x-1">
                                            <button type="button" on:click={() => editingId = au.id} class="text-sky-600 hover:text-sky-800 font-bold">✏️</button>
                                            <button type="button" on:click={() => handleDeleteAula(au.id, au.nombre)} class="text-red-600 hover:text-red-800 font-bold">🗑️</button>
                                        </td>
                                    {/if}
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </div>

            <!-- Pie del Modal -->
            <div class="px-6 py-3 bg-slate-100 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 flex justify-end">
                <button
                    type="button"
                    on:click={closeModal}
                    class="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    Cerrar
                </button>
            </div>

        </div>
    </div>
{/if}
