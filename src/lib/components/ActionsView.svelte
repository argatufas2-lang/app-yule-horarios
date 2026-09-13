<script lang="ts">
    import ActionToolbar from './ActionToolbar.svelte';

    // Estados reactivos principales
    export let selectedCurso: string = '2026-2027';
    export let cursosDisponibles: string[] = ['2026-2027', '2025-2026', '2024-2025'];
    
    export let selectedProfesor: string = '1';
    export let profesoresDisponibles: { id: string; nombre: string }[] = [
        { id: '1', nombre: 'ALBA (2/3 - Especialista)' }
    ];

    // Manejadores de eventos emitidos por la ActionToolbar
    function handleSelectCurso(event: CustomEvent<string>) {
        selectedCurso = event.detail;
        console.log('Curso seleccionado:', selectedCurso);
    }

    function handleSelectProfesor(event: CustomEvent<string>) {
        selectedProfesor = event.detail;
        console.log('Profesor seleccionado ID:', selectedProfesor);
    }

    function handleFinDeCurso() {
        console.log('Acción: Fin de Curso (LH)');
        // Aquí puedes abrir tu modal o lógica correspondiente
    }

    function handleControlJornada() {
        console.log('Acción: Control de Jornada');
    }

    function handleImprimirHorario() {
        console.log('Acción: Imprimir Horario');
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
</script>

<div class="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
    <!-- Barra de Herramientas Superior -->
    <ActionToolbar
        {selectedCurso}
        {cursosDisponibles}
        {selectedProfesor}
        {profesoresDisponibles}
        on:selectCurso={handleSelectCurso}
        on:selectProfesor={handleSelectProfesor}
        on:finDeCurso={handleFinDeCurso}
        on:controlJornada={handleControlJornada}
        on:imprimirHorario={handleImprimirHorario}
        on:imprimirTodos={handleImprimirTodos}
        on:administracion={handleAdministracion}
        on:importarAsc={handleImportarAsc}
    />

    <!-- Área de Contenido Principal (donde se mostrarán los datos del profesor/horarios) -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-6">
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Panel de Gestión</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Visualizando datos para el curso <strong>{selectedCurso}</strong> y el profesorado activo.
            </p>
        </div>
    </main>
</div>