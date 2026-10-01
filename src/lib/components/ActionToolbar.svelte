<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import PrintSingleButton from './PrintSingleButton.svelte';
    import PrintBulkModal from './PrintBulkModal.svelte';

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
        executeBulkPrint: { selectedIds: string[] };
    }>();

    // Props
    export let selectedCurso: string = '2026-2027';
    export let selectedCiclo: 'LH' | 'HH' = 'LH';
    export let totalProfesorado: number = 0;
    
    export let selectedProfesor: string = '';
    export let profesoresDisponibles: { id: string; nombre: string; rol?: string; labelText?: string }[] = [];
    export let activeTab: 'profesorado' | 'aulas' = 'profesorado';

    $: void selectedProfesor;

    let isBulkPrintModalOpen: boolean = false;

    function toggleCiclo(ciclo: 'LH' | 'HH') {
        selectedCiclo = ciclo;
        dispatch('selectCiclo', ciclo);
    }

    function handleCursoChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        dispatch('selectCurso', target.value);
    }

    function handlePrintSingle() {
        dispatch('imprimirHorario');
    }

    function openBulkModal() {
        dispatch('imprimirTodos');
        isBulkPrintModalOpen = true;
    }

    function handleExecuteBulkPrint(event: CustomEvent<{ selectedIds: string[] }>) {
        dispatch('executeBulkPrint', event.detail);
    }

    function handleImageError(event: Event) {
        const target = event.target as HTMLElement;
        if (target) {
            target.style.display = 'none';
        }
    }
</script>

<style>
    @media print {
        @page {
            size: A4 landscape;
            margin: 4mm 6mm;
        }

        :global(body) {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            height: 100vh !important;
            overflow: hidden !important;
        }

        :global(.print-area) {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            height: 100% !important;
            max-height: 190mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }
    }
</style>

<header class="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-xs">
    
    <!-- 1. Cabecera Principal Centrada con Título Más Grande -->
    <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-5 flex flex-col items-center justify-center text-center border-b border-slate-100 dark:border-gray-700/60">
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div class="h-10 sm:h-12 flex items-center justify-center overflow-hidden shrink-0">
                <img src="/Logo.png" alt="Ganivet Logo" class="h-10 sm:h-12 w-auto object-contain" on:error={handleImageError} />
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-gray-100 tracking-tight font-sans">
                Gestión de Horarios
            </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">
            Colegio Público Ganivet / Ganivet Ikastetxea
        </p>
    </div>

    <!-- 2. Barra Superior de Contexto Alineada con el Bloque Inferior -->
    <div class="py-2 border-b border-amber-200/60 dark:border-amber-900/30 bg-amber-50/80 dark:bg-amber-950/20">
        <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 text-xs text-slate-700 dark:text-gray-300 flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-3">
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
                    👥 Total Profesorado: <strong class="text-sky-800 dark:text-sky-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 font-bold">{totalProfesorado}</strong>
                </span>
            </div>

            <!-- Botones de Alternancia de Ciclo Integrados en la Franja -->
            <div class="flex items-center bg-white dark:bg-gray-800 p-0.5 rounded-full border border-amber-200 dark:border-amber-900/40 shadow-xs">
                <button
                    type="button"
                    on:click={() => toggleCiclo('HH')}
                    class="px-3 py-1 text-[11px] font-bold rounded-full transition-all {selectedCiclo === 'HH' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-300 hover:text-slate-900'}"
                >
                    Infantil (HH)
                </button>
                <button
                    type="button"
                    on:click={() => toggleCiclo('LH')}
                    class="px-3 py-1 text-[11px] font-bold rounded-full transition-all {selectedCiclo === 'LH' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-300 hover:text-slate-900'}"
                >
                    Primaria (LH)
                </button>
            </div>
        </div>
    </div>

    <!-- 3. Barra de Acciones Corporativa Alineada con el Bloque Inferior -->
    <div class="py-2.5 bg-slate-50/60 dark:bg-gray-800/50">
        <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 flex flex-wrap items-center justify-between gap-2.5">
            
            <!-- Desplegable de Curso -->
            <div class="flex items-center space-x-1.5 shrink-0">
                <label for="cursoSelect" class="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
                    Curso:
                </label>
                <select
                    id="cursoSelect"
                    value={selectedCurso}
                    on:change={handleCursoChange}
                    class="bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 text-xs font-bold rounded-md border border-slate-300 dark:border-gray-600 px-2.5 py-1 focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-xs"
                >
                    <option value="2026-2027">2026-2027</option>
                </select>
            </div>

            <!-- Grupo de Botones de Acción Modulares -->
            <div class="flex flex-wrap items-center gap-1.5">
                <!-- Fin de Curso (LH) -->
                <button 
                    type="button"
                    on:click={() => dispatch('finDeCurso')}
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-xs"
                >
                    🎓 Fin de Curso (LH)
                </button>

                <!-- Control de Jornada -->
                <button 
                    type="button"
                    on:click={() => dispatch('controlJornada')}
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-sky-700 hover:bg-sky-800 active:bg-sky-900 transition-colors shadow-xs"
                >
                    ⏱️ Control de Jornada
                </button>

                <!-- Módulo de Impresión Individual Encapsulado -->
                <PrintSingleButton on:print={handlePrintSingle} />

                <!-- Imprimir Todos (Abre Modal de Selección) -->
                <button 
                    type="button"
                    on:click={openBulkModal}
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-xs"
                >
                    📑 Imprimir Todos
                </button>

                <!-- Administración -->
                <button 
                    type="button"
                    on:click={() => dispatch('administracion')}
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-slate-700 hover:bg-slate-800 active:bg-slate-900 transition-colors shadow-xs"
                >
                    ⚙️ Administración
                </button>

                <!-- Importar Excel / Staging -->
                <button 
                    type="button"
                    on:click={() => dispatch('importarAsc')}
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-sky-500 hover:bg-sky-600 active:bg-sky-700 transition-colors shadow-xs"
                >
                    📄 Importar Excel / Staging
                </button>
            </div>
        </div>
    </div>
</header>

<!-- Componente Modal Modular de Impresión Masiva -->
<PrintBulkModal
    bind:isOpen={isBulkPrintModalOpen}
    {activeTab}
    items={profesoresDisponibles}
    on:executeBulkPrint={handleExecuteBulkPrint}
/>
