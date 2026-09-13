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

    function toggleCiclo(ciclo: 'LH' | 'HH') {
        selectedCiclo = ciclo;
        dispatch('selectCiclo', ciclo);
    }

    function handleCursoChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        dispatch('selectCurso', target.value);
    }

    function handleImageError(event: Event) {
        const target = event.target as HTMLElement;
        if (target) {
            target.style.display = 'none';
        }
    }
</script>

<header class="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-xs">
    
    <!-- 1. Cabecera Principal (Logotipo Oficial + Título + Selección de Ciclo) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-gray-700/60">
        <div class="flex items-center space-x-4">
            <div class="h-10 flex items-center justify-center overflow-hidden shrink-0">
                <img src="/Logo.png" alt="Ganivet Logo" class="h-10 w-auto max-w-[180px] object-contain" on:error={handleImageError} />
            </div>
            <div>
                <h1 class="text-2xl font-extrabold text-slate-900 dark:text-gray-100 tracking-tight font-sans">
                    Gestión de Horarios
                </h1>
                <p class="text-xs text-slate-500 dark:text-gray-400 font-medium">
                    Colegio Público Ganivet / Ganivet Ikastetxea
                </p>
            </div>
        </div>

        <!-- Botones de Alternancia de Ciclo (Esquina Superior Derecha) -->
        <div class="flex items-center bg-slate-100 dark:bg-gray-700 p-1 rounded-full border border-slate-200 dark:border-gray-600 shadow-xs">
            <button
                type="button"
                on:click={() => toggleCiclo('HH')}
                class="px-4 py-1.5 text-xs font-bold rounded-full transition-all {selectedCiclo === 'HH' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-300 hover:text-slate-900'}"
            >
                Infantil (HH)
            </button>
            <button
                type="button"
                on:click={() => toggleCiclo('LH')}
                class="px-4 py-1.5 text-xs font-bold rounded-full transition-all {selectedCiclo === 'LH' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-300 hover:text-slate-900'}"
            >
                Primaria (LH)
            </button>
        </div>
    </div>

    <!-- 2. Barra Superior de Contexto con fondo amarillo/pastel muy sutil -->
    <div class="bg-amber-50/80 dark:bg-amber-950/20 px-4 sm:px-6 lg:px-8 py-2 border-b border-amber-200/60 dark:border-amber-900/30 text-xs text-slate-700 dark:text-gray-300 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-4">
            <span class="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-gray-200">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Ciclo Activo: <strong class="text-sky-800 dark:text-sky-300 ml-1">{selectedCiclo === 'LH' ? 'Primaria (LH)' : 'Infantil (HH)'}</strong>
            </span>
            <span class="text-amber-300 dark:text-amber-800">|</span>
            <span class="inline-flex items-center gap-1 font-medium">
                📅 Curso: <strong class="text-slate-900 dark:text-gray-100">{selectedCurso}</strong>
            </span>
            <span class="text-amber-300 dark:text-amber-800">|</span>
            <span class="inline-flex items-center gap-1 font-medium">
                👥 Total Profesorado: <strong class="text-sky-800 dark:text-sky-300 bg-white dark:bg-gray-800 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 font-bold">{totalProfesorado}</strong>
            </span>
        </div>
    </div>

    <!-- 3. Barra de Acciones Corporativa -->
    <div class="px-4 sm:px-6 lg:px-8 py-3 bg-slate-50/50 dark:bg-gray-800/50 flex flex-wrap items-center justify-between gap-3">
        
        <!-- Desplegable de Curso a la izquierda -->
        <div class="flex items-center space-x-2">
            <label for="cursoSelect" class="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
                Curso:
            </label>
            <select
                id="cursoSelect"
                value={selectedCurso}
                on:change={handleCursoChange}
                class="bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 text-xs font-bold rounded-lg border border-slate-300 dark:border-gray-600 px-3 py-1.5 focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-xs"
            >
                <option value="2026-2027">2026-2027</option>
            </select>
        </div>

        <!-- Grupo de Botones de Acción Corporativos -->
        <div class="flex flex-wrap items-center gap-2">
            <!-- Fin de Curso (LH): Naranja Intenso -->
            <button 
                type="button"
                on:click={() => dispatch('finDeCurso')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-xs"
            >
                🎓 Fin de Curso (LH)
            </button>

            <!-- Control de Jornada: Azul Oscuro Corporativo -->
            <button 
                type="button"
                on:click={() => dispatch('controlJornada')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-sky-700 hover:bg-sky-800 active:bg-sky-900 transition-colors shadow-xs"
            >
                ⏱️ Control de Jornada
            </button>

            <!-- Imprimir Horario: Verde Esmeralda -->
            <button 
                type="button"
                on:click={() => dispatch('imprimirHorario')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs"
            >
                🖨️ Imprimir Horario
            </button>

            <!-- Imprimir Todos: Púrpura / Violeta -->
            <button 
                type="button"
                on:click={() => dispatch('imprimirTodos')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-xs"
            >
                📑 Imprimir Todos
            </button>

            <!-- Administración: Gris Pizarra Oscuro -->
            <button 
                type="button"
                on:click={() => dispatch('administracion')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-slate-700 hover:bg-slate-800 active:bg-slate-900 transition-colors shadow-xs"
            >
                ⚙️ Administración
            </button>

            <!-- Importar PDF aSc: Azul Brillante -->
            <button 
                type="button"
                on:click={() => dispatch('importarAsc')}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-sky-500 hover:bg-sky-600 active:bg-sky-700 transition-colors shadow-xs"
            >
                📄 Importar PDF aSc
            </button>
        </div>
    </div>
</header>
