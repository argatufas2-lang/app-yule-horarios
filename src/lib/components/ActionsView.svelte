<script lang="ts">
	import ActionToolbar from './ActionToolbar.svelte';

	// Estado
	let selectedCurso: string = '2026-2027';
	let selectedId: string | null = null;
	let isLoading: boolean = false;

	// Datos de prueba simulados (se reemplazarán con consultas a Supabase)
	interface DemoItem {
		id: string;
		nombre: string;
		tipo: string;
		estado: string;
	}

	let items: DemoItem[] = [
		{ id: '1', nombre: 'Horario General Primaria 1º', tipo: 'Horario Base', estado: 'Activo' },
		{ id: '2', nombre: 'Guardias Recreo Grupo A', tipo: 'Coordinación', estado: 'Pendiente' },
		{ id: '3', nombre: 'Atención a Familias LH2', tipo: 'No Lectiva', estado: 'Activo' }
	];

	// Handlers placeholder para lógica de negocio / Supabase
	function handleSelectCurso(event: CustomEvent<string>) {
		selectedCurso = event.detail;
		console.log('Curso seleccionado:', selectedCurso);
		// Lógica: Volver a cargar datos filtrando por curso en Supabase
	}

	function handleNew() {
		console.log('Acción: Crear nuevo registro');
		// Lógica: Abrir modal de creación o navegar a formulario
	}

	function handleEdit(event: CustomEvent<string>) {
		const id = event.detail;
		console.log('Acción: Editar elemento ID:', id);
		// Lógica: Abrir modal de edición con los datos del ID
	}

	function handleDelete(event: CustomEvent<string>) {
		const id = event.detail;
		console.log('Acción: Eliminar elemento ID:', id);
		// Lógica: Confirmar y llamar a deleteSession / repositorio Supabase
		items = items.filter(item => item.id !== id);
		if (selectedId === id) selectedId = null;
	}

	function handleFinDeCurso() {
		console.log('Acción: Fin de curso (LH)');
	}

	function handleControlJornada() {
		console.log('Acción: Control de jornada');
	}

	function handleExportExcel() {
		console.log('Acción: Exportar a Excel');
	}

	function handleImprimirHorario() {
		console.log('Acción: Imprimir horario del elemento seleccionado');
	}

	function handleImprimirTodos() {
		console.log('Acción: Imprimir todos los horarios');
	}

	function handleAdministracion() {
		console.log('Acción: Abrir panel de administración');
	}

	function handleImportarAsc() {
		console.log('Acción: Importar PDF aSc');
	}

	function handleSelectItem(id: string) {
		selectedId = selectedId === id ? null : id;
	}
</script>

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
	<!-- Componente Barra de Acciones Superior -->
	<ActionToolbar
		{selectedCurso}
		{selectedId}
		on:selectCurso={handleSelectCurso}
		on:new={handleNew}
		on:edit={handleEdit}
		on:delete={handleDelete}
		on:finDeCurso={handleFinDeCurso}
		on:controlJornada={handleControlJornada}
		on:exportExcel={handleExportExcel}
		on:imprimirHorario={handleImprimirHorario}
		on:imprimirTodos={handleImprimirTodos}
		on:administracion={handleAdministracion}
		on:importarAsc={handleImportarAsc}
	/>

	<!-- Área Contenedora Principal -->
	<main class="flex-1 max-w-7xl w-full mx-auto p-6">
		<!-- Encabezado de Sección -->
		<div class="flex items-center justify-between mb-6">
			<div>
				<h2 class="text-2xl font-bold tracking-tight">Gestión de Registros de Horario</h2>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Selecciona un registro para habilitar las acciones de edición o eliminación.
				</p>
			</div>
			{#if selectedId}
				<div class="inline-flex items-center px-3 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full">
					Elemento seleccionado ID: <strong class="ml-1">{selectedId}</strong>
				</div>
			{/if}
		</div>

		<!-- Listado / Tabla de Datos Simulados -->
		<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs overflow-hidden transition-colors">
			{#if isLoading}
				<div class="p-8 text-center text-gray-500 dark:text-gray-400">
					Cargando registros...
				</div>
			{:else if items.length === 0}
				<div class="p-8 text-center text-gray-500 dark:text-gray-400">
					No hay registros disponibles para el curso actual.
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider border-b border-gray-200 dark:border-gray-700">
							<tr>
								<th scope="col" class="p-4 w-12 text-center">Sel.</th>
								<th scope="col" class="px-6 py-3">Nombre</th>
								<th scope="col" class="px-6 py-3">Tipo</th>
								<th scope="col" class="px-6 py-3">Estado</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
							{#each items as item}
								<tr
									on:click={() => handleSelectItem(item.id)}
									class="cursor-pointer transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 {selectedId === item.id ? 'bg-indigo-50 dark:bg-indigo-950/50 font-medium' : ''}"
								>
									<td class="p-4 text-center">
										<input
											type="checkbox"
											checked={selectedId === item.id}
											on:change={() => handleSelectItem(item.id)}
											class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
										/>
									</td>
									<td class="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{item.nombre}</td>
									<td class="px-6 py-4 text-gray-600 dark:text-gray-300">{item.tipo}</td>
									<td class="px-6 py-4">
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {item.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}">
											{item.estado}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</main>
</div>
