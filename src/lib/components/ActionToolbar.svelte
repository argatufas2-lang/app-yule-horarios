<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{
        selectCurso: string;
        selectProfesor: string;
        selectCiclo: 'LH' | 'HH';
        finDeCurso: void;
        controlJornada: void;
        imprimirHorario: void;
        imprimirTodos: void;
        administracion: void;
        importarAsc: void;
    }>();

    // Props
    export let selectedCurso: string = '2026-2027';
    export let selectedCiclo: 'LH' | 'HH' = 'LH';
    export let totalProfesorado: number = 0;
    
    export let selectedProfesor: string = '';
    export let profesoresDisponibles: { id: string; nombre: string; rol?: string }[] = [];
    export let activeTab: 'profesorado' | 'aulas' = 'profesorado';

    function handleProfesorChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        dispatch('selectProfesor', target.value);
    }

    function toggleCiclo(ciclo: 'LH' | 'HH') {
        selectedCiclo = ciclo;
        dispatch('selectCiclo', ciclo);
    }

    function handleImageError(event: Event) {
        const target = event.target as HTMLElement;
        if (target) {
            target.style.display = 'none';
        }
    }
</script>

<header class="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-xs">
    <!-- 1. Cabecera Principal (Logo y Título) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-slate-100 dark:border-gray-700/60">
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-xl shadow-xs overflow-hidden">
                <img src="/logo.png" alt="Ganivet Logo" class="w-full h-full object-cover" on:error={handleImageError} />
                <span class="text-lg">🏫</span>
            </div>
            <div>
                <h1 class="text-xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">
                    Gestión de Horarios
                </h1>
                <p class="text-xs text-slate-500 dark:text-gray-400">
                    Área de Organización Escolar y Calibración Horaria
                </p>
            </div>
        </div>

        <!-- Botones de Alternancia de Ciclo -->
        <div class="flex items-center bg-slate-100 dark:bg-gray-700 p-1 rounded-lg border border-slate-200 dark:border-gray-600">
            <button
                type="button"
                on:click={() => toggleCiclo('HH')}
                class="px-3 py-1 text-xs font-semibold rounded-md transition-colors {selectedCiclo === 'HH' ? 'bg-white dark:bg-gray-800 text-sky-700 dark:text-sky-300 shadow-xs' : 'text-slate-600 dark:text-gray-300 hover:text-slate-900'}"
            >
                Infantil (HH)
            </button>
            <button
                type="button"
                on:click={() => toggleCiclo('LH')}
                class="px-3 py-1 text-xs font-semibold rounded-md transition-colors {selectedCiclo === 'LH' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-300 hover:text-slate-900'}"
            >
                Primaria (LH)
            </button>
        </div>
    </div>

    <!-- 2. Franja de Contexto de Información -->
    <div class="bg-slate-50 dark:bg-gray-800/80 px-4 sm:px-6 lg:px-8 py-2 border-b border-slate-200 dark:border-gray-700 text-xs text-slate-600 dark:text-gray-300 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-4">
            <span class="inline-flex items-center gap-1.5 font-medium">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                Ciclo Activo: <strong class="text-slate-900 dark:text-gray-100">{selectedCiclo === 'LH' ? 'Primaria (LH)' : 'Infantil (HH)'}</strong>
            </span>
            <span class="text-slate-300 dark:text-gray-600">|</span>
            <span class="inline-flex items-center gap-1 font-medium">
                📅 Curso: <strong class="text-slate-900 dark:text-gray-100">{selectedCurso}</strong>
            </span>
            <span class="text-slate-300 dark:text-gray-600">|</span>
            <span class="inline-flex items-center gap-1 font-medium">
                👥 Total Profesorado: <strong class="text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">{totalProfesorado} profesores</strong>
            </span>
        </div>
    </div>

    <!-- 3. Barra de Botones de Acción Corporativos -->
    <div class="px-4 sm:px-6 lg:px-8 py-3 bg-white dark:bg-gray-800 flex flex-wrap items-center justify-between gap-3">
        
        <!-- Grupo de Botones de Acción -->
        <div class="flex flex-wrap items-center gap-2">
            <!-- Fin de Curso (LH) -->
            <button 
                type="button"
                on:click={() => dispatch('finDeCurso')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-xs"
            >
                🎓 Fin de Curso (LH)
            </button>

            <!-- Control de Jornada -->
            <button 
                type="button"
                on:click={() => dispatch('controlJornada')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-sky-600 hover:bg-sky-700 active:bg-sky-800 transition-colors shadow-xs"
            >
                ⏱️ Control de Jornada
            </button>

            <!-- Imprimir Horario -->
            <button 
                type="button"
                on:click={() => dispatch('imprimirHorario')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs"
            >
                🖨️ Imprimir Horario
            </button>

            <!-- Imprimir Todos -->
            <button 
                type="button"
                on:click={() => dispatch('imprimirTodos')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-xs"
            >
                📑 Imprimir Todos
            </button>

            <!-- Administración -->
            <button 
                type="button"
                on:click={() => dispatch('administracion')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-slate-700 hover:bg-slate-800 active:bg-slate-900 transition-colors shadow-xs"
            >
                ⚙️ Administración
            </button>

            <!-- Importar PDF aSc -->
            <button 
                type="button"
                on:click={() => dispatch('importarAsc')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs"
            >
                📄 Importar PDF aSc
            </button>
        </div>
    </div>
</header>
