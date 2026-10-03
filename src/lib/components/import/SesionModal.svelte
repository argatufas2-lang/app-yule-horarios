<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { StagingSessionRow } from '$lib/services/excelImportService';

	export let isOpen: boolean = false;
	export let session: StagingSessionRow | null = null;

	const dispatch = createEventDispatcher<{
		close: void;
		save: StagingSessionRow;
	}>();

	let formData: Partial<StagingSessionRow> = {};

	$: if (session) {
		formData = { ...session };
	}

	function handleClose() {
		dispatch('close');
	}

	function handleSave() {
		if (session) {
			dispatch('save', {
				...session,
				...formData
			} as StagingSessionRow);
		}
	}
</script>

{#if isOpen && session}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 dark:text-gray-100"
		>
			<h2 class="mb-4 text-xl font-bold text-slate-800 dark:text-white">
				Editar Sesión (Borrador)
			</h2>

			<div class="space-y-4">
				<div>
					<label for="profesor_nombre" class="block text-sm font-medium text-slate-700 dark:text-gray-300">
						Profesor
					</label>
					<input
						type="text"
						id="profesor_nombre"
						bind:value={formData.profesor_nombre}
						class="mt-1 block w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="dia" class="block text-sm font-medium text-slate-700 dark:text-gray-300">
							Día (0-4)
						</label>
						<input
							type="number"
							id="dia"
							min="0"
							max="4"
							bind:value={formData.dia}
							class="mt-1 block w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div>
						<label for="franja" class="block text-sm font-medium text-slate-700 dark:text-gray-300">
							Franja
						</label>
						<input
							type="number"
							id="franja"
							bind:value={formData.franja}
							class="mt-1 block w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>
				</div>

				<div>
					<label for="actividad" class="block text-sm font-medium text-slate-700 dark:text-gray-300">
						Actividad / Asignatura
					</label>
					<input
						type="text"
						id="actividad"
						bind:value={formData.actividad}
						class="mt-1 block w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="clase" class="block text-sm font-medium text-slate-700 dark:text-gray-300">
							Clase / Grupo
						</label>
						<input
							type="text"
							id="clase"
							bind:value={formData.clase}
							class="mt-1 block w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div>
						<label for="aula" class="block text-sm font-medium text-slate-700 dark:text-gray-300">
							Aula
						</label>
						<input
							type="text"
							id="aula"
							bind:value={formData.aula}
							class="mt-1 block w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>
				</div>

				<div>
					<label for="grupo_desdoble" class="block text-sm font-medium text-slate-700 dark:text-gray-300">
						Grupo Desdoble
					</label>
					<input
						type="text"
						id="grupo_desdoble"
						bind:value={formData.grupo_desdoble}
						class="mt-1 block w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
			</div>

			<div class="mt-6 flex justify-end space-x-3">
				<button
					type="button"
					on:click={handleClose}
					class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
				>
					Cancelar
				</button>
				<button
					type="button"
					on:click={handleSave}
					class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Guardar Cambios
				</button>
			</div>
		</div>
	</div>
{/if}
