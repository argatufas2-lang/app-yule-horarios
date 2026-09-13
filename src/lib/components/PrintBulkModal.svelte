<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{
        executeBulkPrint: { selectedIds: string[] };
    }>();

    export let isOpen: boolean = false;
    export let activeTab: 'profesorado' | 'aulas' = 'profesorado';
    export let items: { id: string; nombre: string; labelText?: string }[] = [];

    let selectedIds: string[] = [];

    // Al abrir el modal con elementos cargados, inicializar con todos seleccionados
    $: if (isOpen && items.length > 0 && selectedIds.length === 0) {
        selectedIds = items.map(item => item.id);
    }

    // Selecciona todos los IDs disponibles
    function seleccionarTodo() {
        selectedIds = items.map(item => item.id);
    }

    // Vacía el array de IDs seleccionados
    function deseleccionarTodo() {
        selectedIds = [];
    }

    function toggleItem(id: string) {
        if (selectedIds.includes(id)) {
            selectedIds = selectedIds.filter(i => i !== id);
        } else {
            selectedIds = [...selectedIds, id];
        }
    }

    function closeModal() {
        isOpen = false;
    }

    function handleConfirmPrint() {
        dispatch('executeBulkPrint', { selectedIds });
        closeModal();
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                window.print();
            }, 150);
        }
    }

    // Extrae únicamente el nombre limpio sin sufijos de rol ni jornada
    function getCleanName(item: { id: string; nombre: string; labelText?: string }): string {
        const raw = item.nombre || item.labelText || '';
        return raw.split('-')[0].trim().toUpperCase();
    }
</script>

{#if isOpen}
    <!-- Backdrop del Modal -->
    <div 
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden"
        role="dialog"
        aria-modal="true"
    >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            <!-- Cabecera del Modal -->
            <div class="px-5 py-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between bg-slate-50/50 dark:bg-gray-800/80">
                <div>
                    <h3 class="text-base font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2">
                        📑 Impresión Masiva de Horarios
                    </h3>
                    <p class="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                        Modo actual: <strong class="text-sky-600 dark:text-sky-400 uppercase">{activeTab === 'profesorado' ? 'Profesorado' : 'Aulas y Grupos'}</strong>
                    </p>
                </div>
                <button 
                    type="button" 
                    on:click={closeModal}
                    class="text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 text-lg font-bold p-1 rounded-lg"
                >
                    ✕
                </button>
            </div>

            <!-- Acciones de Selección Rápidas (Dos botones independientes) -->
            <div class="px-5 py-2.5 bg-slate-100/70 dark:bg-gray-700/50 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-700 dark:text-gray-300">
                    Seleccionados: <strong class="text-sky-700 dark:text-sky-400">{selectedIds.length}</strong> / {items.length}
                </span>
                
                <div class="flex items-center gap-2">
                    <button 
                        type="button" 
                        on:click={seleccionarTodo}
                        class="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800 transition-colors"
                    >
                        Seleccionar todo
                    </button>
                    <button 
                        type="button" 
                        on:click={deseleccionarTodo}
                        class="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-bold border border-slate-300 dark:border-gray-500 transition-colors"
                    >
                        Deseleccionar todo
                    </button>
                </div>
            </div>

            <!-- Lista de Elementos en 2 Columnas con Texto Limpio -->
            <div class="p-4 overflow-y-auto flex-1">
                {#if items.length === 0}
                    <p class="text-xs text-slate-500 text-center py-6">No hay elementos disponibles para seleccionar.</p>
                {:else}
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {#each items as item}
                            <label class="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700/40 p-2 rounded-lg border border-slate-100 dark:border-gray-700/60 transition-colors">
                                <input 
                                    type="checkbox"
                                    checked={selectedIds.includes(item.id)}
                                    on:change={() => toggleItem(item.id)}
                                    class="w-4 h-4 text-sky-600 rounded-md border-slate-300 dark:border-gray-600 focus:ring-sky-500 shrink-0"
                                />
                                <span class="text-sm font-bold text-slate-800 dark:text-gray-100 uppercase tracking-tight truncate">
                                    {getCleanName(item)}
                                </span>
                            </label>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Pie de Botones del Modal -->
            <div class="px-5 py-3 border-t border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/80 flex items-center justify-end gap-2">
                <button 
                    type="button"
                    on:click={closeModal}
                    class="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-300 transition-colors"
                >
                    Cancelar
                </button>

                <button 
                    type="button"
                    disabled={selectedIds.length === 0}
                    on:click={handleConfirmPrint}
                    class="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1.5"
                >
                    🖨️ Imprimir Selección ({selectedIds.length})
                </button>
            </div>

        </div>
    </div>
{/if}
