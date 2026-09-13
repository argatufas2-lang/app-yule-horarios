<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let selectedCurso: string = '2026-2027';
	export let cursosDisponibles: string[] = ['2026-2027', '2025-2026', '2024-2025'];
	export let selectedId: string | null = null;

	const dispatch = createEventDispatcher<{
		selectCurso: string;
		finDeCurso: void;
		controlJornada: void;
		imprimirHorario: void;
		imprimirTodos: void;
		administracion: void;
		importarAsc: void;
		new: void;
		edit: string;
		delete: string;
		exportExcel: void;
	}>();

	function handleCursoChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		dispatch('selectCurso', target.value);
	}
</script>

<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 shadow-xs transition-colors">
	<div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
		
		<!-- Lado Izquierdo: Selección de Curso, Acciones de Elemento y Fin de Curso -->
		<div class="flex flex-wrap items-center gap-3">
			<div class="relative">
				<label for="curso-select" class="sr-only">Seleccionar Curso</label>
				<select
					id="curso-select"
					bind:value={selectedCurso}
					on:change={handleCursoChange}
					class="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-medium text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 pl-3 pr-8 py-2 cursor-pointer shadow-xs hover:bg-gray-100 dark:hover:bg-gray-650 transition-colors"
				>
					{#each cursosDisponibles as curso}
						<option value={curso}>Curso: {curso}</option>
					{/each}
				</select>
				<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</div>

			<!-- Botones de Gestión CRUD -->
			<div class="flex items-center space-x-1.5 border-l border-r border-gray-200 dark:border-gray-700 px-3">
				<!-- Nuevo -->
				<button
					type="button"
					on:click={() => dispatch('new')}
					class="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 rounded-md transition-colors shadow-xs"
					title="Crear nuevo registro"
				>
					<svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Nuevo
				</button>

				<!-- Editar -->
				<button
					type="button"
					disabled={!selectedId}
					on:click={() => selectedId && dispatch('edit', selectedId)}
					class="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border-blue-300 dark:border-blue-700"
					title={selectedId ? "Editar elemento seleccionado" : "Selecciona un elemento para editar"}
				>
					<svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
					</svg>
					Editar
				</button>

				<!-- Eliminar -->
				<button
					type="button"
					disabled={!selectedId}
					on:click={() => selectedId && dispatch('delete', selectedId)}
					class="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border-rose-300 dark:border-rose-700"
					title={selectedId ? "Eliminar elemento seleccionado" : "Selecciona un elemento para eliminar"}
				>
					<svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.998-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					Eliminar
				</button>
			</div>

			<!-- Botón destacado Fin de Curso -->
			<button
				type="button"
				on:click={() => dispatch('finDeCurso')}
				class="inline-flex items-center px-3.5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
			>
				<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
				</svg>
				Fin de Curso (LH)
			</button>
		</div>

		<!-- Lado Derecho: Botones de Acción Rápida -->
		<div class="flex flex-wrap items-center gap-2">
			<!-- Control de Jornada -->
			<button
				type="button"
				on:click={() => dispatch('controlJornada')}
				class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 shadow-xs"
			>
				<svg class="w-4 h-4 mr-1.5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				Control de Jornada
			</button>

			<!-- Exportar Excel -->
			<button
				type="button"
				on:click={() => dispatch('exportExcel')}
				class="inline-flex items-center px-3 py-2 text-sm font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-700 rounded-lg transition-colors shadow-xs"
			>
				<svg class="w-4 h-4 mr-1.5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				Exportar Excel
			</button>

			<!-- Imprimir Horario (Verde) -->
			<button
				type="button"
				on:click={() => dispatch('imprimirHorario')}
				class="inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-700 rounded-lg transition-colors shadow-xs"
			>
				<svg class="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
				</svg>
				Imprimir Horario
			</button>

			<!-- Imprimir Todos (Morado) -->
			<button
				type="button"
				on:click={() => dispatch('imprimirTodos')}
				class="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-700 rounded-lg transition-colors shadow-xs"
			>
				<svg class="w-4 h-4 mr-1.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
				</svg>
				Imprimir Todos
			</button>

			<!-- Administración (Gris) -->
			<button
				type="button"
				on:click={() => dispatch('administracion')}
				class="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors shadow-xs"
			>
				<svg class="w-4 h-4 mr-1.5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				Administración
			</button>

			<!-- Importar PDF aSc (Azul) -->
			<button
				type="button"
				on:click={() => dispatch('importarAsc')}
				class="inline-flex items-center px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
			>
				<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
				</svg>
				Importar PDF aSc
			</button>
		</div>

	</div>
</div>
