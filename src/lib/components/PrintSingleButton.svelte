<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{ print: void }>();

    function handlePrint() {
        dispatch('print');
        if (typeof window !== 'undefined') {
            window.print();
        }
    }
</script>

<button 
    type="button"
    on:click={handlePrint}
    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs"
    title="Imprimir el horario actualmente visible en A4 horizontal"
>
    🖨️ Imprimir Horario
</button>
