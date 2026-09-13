<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{
        selectCurso: string;
        selectProfesor: string;
        finDeCurso: void;
        controlJornada: void;
        imprimirHorario: void;
        imprimirTodos: void;
        administracion: void;
        importarAsc: void;
    }>();

    // Props
    export let selectedCurso: string = '2026-2027';
    export let cursosDisponibles: string[] = ['2026-2027', '2025-2026', '2024-2025'];
    
    export let selectedProfesor: string = '';
    export let profesoresDisponibles: { id: string; nombre: string }[] = [
        { id: '1', nombre: 'ALBA (2/3 - Especialista)' }
    ];

    function handleCursoChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        dispatch('selectCurso', target.value);
    }

    function handleProfesorChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        dispatch('selectProfesor', target.value);
    }
</script>

<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-xs space-y-3">
    <!-- Fila superior: Selector de curso y botones de acción exactos -->
    <div class="flex flex-wrap items-center justify-between gap-3">
        
        <!-- Selector de Curso -->
        <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                📅 Curso:
            </span>
            <select 
                value={selectedCurso} 
                on:change={handleCursoChange}
                class="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
                {#each cursosDisponibles as curso}
                    <option value={curso}>{curso}</option>
                {/each}
            </select>
        </div>

        <!-- Grupo de Botones de Acción -->
        <div class="flex flex-wrap items-center gap-2">
            <!-- Fin de Curso (LH) -->
            <button 
                type="button"
                on:click={() => dispatch('finDeCurso')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white text-sm font-medium bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs"
            >
                🎓 Fin de Curso (LH)
            </button>

            <!-- Control de Jornada -->
            <button 
                type="button"
                on:click={() => dispatch('controlJornada')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white text-sm font-medium bg-sky-600 hover:bg-sky-700 transition-colors shadow-xs"
            >
                ⏱️ Control de Jornada
            </button>

            <!-- Imprimir Horario -->
            <button 
                type="button"
                on:click={() => dispatch('imprimirHorario')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white text-sm font-medium bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
            >
                🖨️ Imprimir Horario
            </button>

            <!-- Imprimir Todos -->
            <button 
                type="button"
                on:click={() => dispatch('imprimirTodos')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white text-sm font-medium bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
            >
                📑 Imprimir Todos
            </button>

            <!-- Administración -->
            <button 
                type="button"
                on:click={() => dispatch('administracion')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white text-sm font-medium bg-slate-700 hover:bg-slate-800 transition-colors shadow-xs"
            >
                ⚙️ Administración
            </button>

            <!-- Importar PDF aSc -->
            <button 
                type="button"
                on:click={() => dispatch('importarAsc')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white text-sm font-medium bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            >
                📄 Importar PDF aSc
            </button>
        </div>
    </div>

    <!-- Fila inferior: Selector de Profesorado -->
    <div class="flex items-center space-x-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
        <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
            Seleccionar Profesorado:
        </span>
        <select 
            value={selectedProfesor}
            on:change={handleProfesorChange}
            class="w-full max-w-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
        >
            {#each profesoresDisponibles as prof}
                <option value={prof.id}>{prof.nombre}</option>
            {/each}
        </select>
    </div>
</div>
