<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let selectedCurso: string = '2026-2027';
	export let cursosDisponibles: string[] = ['2026-2027', '2025-2026', '2024-2025'];

	const dispatch = createEventDispatcher<{
		selectCurso: string;
		finDeCurso: void;
		controlJornada: void;
		imprimirHorario: void;
		imprimirTodos: void;
		administracion: void;
		importarAsc: void;
	}>();

	function handleCursoChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		dispatch('selectCurso', target.value);
	}
</script>

<div class="bg-white border-b border-gray-200 px-6 py-3 shadow-xs">
	<div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
		
		<!-- Lado Izquierdo: Selección de Curso y Fin de Curso -->
		<div class="flex items-center space-x-3">
			<div class="relative">
				<label for="curso-select" class="sr-only">Seleccionar Curso</label>
				<select
					id="curso-select"
					bind:value={selectedCurso}
					on:change={handleCursoChange}
					class="appearance-none bg-gray-50 border border-gray-300 text-gray-800 font-medium text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 pl-3 pr-8 py-2 cursor-pointer shadow-xs hover:bg-gray-100 transition-colors"
				>
					{#each cursosDisponibles as curso}
						<option value={curso}>Curso: {curso}</option>
					{/each}
				</select>
				<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</div>
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
				class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors border border-gray-200 shadow-xs"
			>
				<svg class="w-4 h-4 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				Control de Jornada
			</button>

			<!-- Imprimir Horario (Verde) -->
			<button
				type="button"
				on:click={() => dispatch('imprimirHorario')}
				class="inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 rounded-lg transition-colors shadow-xs"
			>
				<svg class="w-4 h-4 mr-1.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
				</svg>
				Imprimir Horario
			</button>

			<!-- Imprimir Todos (Morado) -->
			<button
				type="button"
				on:click={() => dispatch('imprimirTodos')}
				class="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 border border-purple-200 rounded-lg transition-colors shadow-xs"
			>
				<svg class="w-4 h-4 mr-1.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
				</svg>
				Imprimir Todos
			</button>

			<!-- Administración (Gris) -->
			<button
				type="button"
				on:click={() => dispatch('administracion')}
				class="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 rounded-lg transition-colors shadow-xs"
			>
				<svg class="w-4 h-4 mr-1.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
