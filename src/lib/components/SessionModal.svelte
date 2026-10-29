<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { getActividadesCatalogo, type ActividadCatalogoItem } from '$lib/services/primaryService';
	import type { Session } from '$lib/types/schedule';

	export function isLectivaSession(
		session: Partial<Session>,
		actividadesCatalogo?: Array<{ nombre: string; es_lectiva: boolean }>
	): boolean {
		if (!session.actividad) {
			return session.es_lectiva ?? true;
		}

		const actLimpia = session.actividad.trim().toUpperCase();

		if (actividadesCatalogo && actividadesCatalogo.length > 0) {
			const encontrada = actividadesCatalogo.find(
				(a) => a.nombre.trim().toUpperCase() === actLimpia
			);
			if (encontrada && encontrada.es_lectiva !== undefined && encontrada.es_lectiva !== null) {
				return encontrada.es_lectiva;
			}
		}

		return session.es_lectiva ?? true;
	}

	export let isOpen: boolean = false;
	export let session: Partial<Session> | null = null;
	export let selectedCurso: string = '2026-2027';

	const dispatch = createEventDispatcher<{
		close: void;
		save: Partial<Session>;
		delete: string;
	}>();

	let actividades: ActividadCatalogoItem[] = [];
	let loadingActividades: boolean = false;

	let formData: Partial<Session> = {
		profesor_nombre: '',
		dia: 0,
		franja: 0,
		actividad: '',
		clase: '',
		aula: '',
		grupo_desdoble: '',
		rol_aula: 'principal',
		minutos: 45,
		es_lectiva: true
	};

	let lastOpenedSession: any = null;

	$: if (isOpen) {
		if (session !== lastOpenedSession) {
			formData = {
				...session,
				profesor_nombre: session?.profesor_nombre || '',
				dia: session?.dia ?? 0,
				franja: session?.franja ?? 0,
				actividad: session?.actividad || '',
				clase: session?.clase || '',
				aula: session?.aula || '',
				grupo_desdoble: session?.grupo_desdoble || '',
				rol_aula: session?.rol_aula || 'principal',
				minutos: session?.minutos ?? 45,
				es_lectiva: session?.es_lectiva ?? true
			};
			lastOpenedSession = session;
		}
	} else {
		lastOpenedSession = null;
	}

	$: if (isOpen && selectedCurso) {
		loadActividades();
	}

	async function loadActividades() {
		loadingActividades = true;
		try {
			actividades = await getActividadesCatalogo(selectedCurso);
		} catch (error) {
			console.error('Error al cargar catálogo de actividades:', error);
			actividades = [];
		} finally {
			loadingActividades = false;
		}
	}

	$: lectivas = actividades.filter((a) => a.es_lectiva);
	$: noLectivas = actividades.filter((a) => !a.es_lectiva);

	function handleActividadChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const selectedVal = target.value;
		formData.actividad = selectedVal;

		const actEncontrada = actividades.find(
			(a) => a.nombre.trim().toUpperCase() === selectedVal.trim().toUpperCase()
		);
		if (actEncontrada) {
			formData.es_lectiva = actEncontrada.es_lectiva;
		}
	}

	function handleClose() {
		dispatch('close');
	}

	function handleSave() {
		dispatch('save', { ...formData });
	}

	function handleDelete() {
		if (formData.id) {
			dispatch('delete', formData.id);
		}
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
		<div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between border-b pb-3 dark:border-gray-700">
				<h3 class="text-xl font-bold text-gray-800 dark:text-white">
					{formData.id ? 'Editar Sesión' : 'Nueva Sesión'}
				</h3>
				<button
					type="button"
					on:click={handleClose}
					class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
				>
					✕
				</button>
			</div>

			<form on:submit|preventDefault={handleSave} class="space-y-4">
				<div>
					<label for="profesor_nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Profesor
					</label>
					<input
						type="text"
						id="profesor_nombre"
						bind:value={formData.profesor_nombre}
						required
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label for="actividad_select" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Actividad / Asignatura
					</label>
					{#if loadingActividades}
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Cargando actividades...</p>
					{:else}
						<select
							id="actividad_select"
							value={formData.actividad || ''}
							on:change={handleActividadChange}
							required
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						>
							<option value="" disabled selected={!formData.actividad}>-- Selecciona una actividad --</option>

							{#if lectivas.length > 0}
								<optgroup label="Lectivas">
									{#each lectivas as act}
										<option value={act.nombre}>{act.nombre}</option>
									{/each}
								</optgroup>
							{/if}

							{#if noLectivas.length > 0}
								<optgroup label="No Lectivas">
									{#each noLectivas as act}
										<option value={act.nombre}>{act.nombre}</option>
									{/each}
								</optgroup>
							{/if}
						</select>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="clase" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Clase / Grupo
						</label>
						<input
							type="text"
							id="clase"
							bind:value={formData.clase}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div>
						<label for="aula" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Aula
						</label>
						<input
							type="text"
							id="aula"
							bind:value={formData.aula}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="grupo_desdoble" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Grupo Desdoble
						</label>
						<input
							type="text"
							id="grupo_desdoble"
							bind:value={formData.grupo_desdoble}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div>
						<label for="minutos" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Duración (minutos)
						</label>
						<input
							type="number"
							id="minutos"
							bind:value={formData.minutos}
							min="0"
							step="5"
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>
				</div>

				<div class="flex items-center space-x-2 pt-2">
					<input
						type="checkbox"
						id="es_lectiva"
						bind:checked={formData.es_lectiva}
						class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
					/>
					<label for="es_lectiva" class="text-sm font-medium text-gray-700 dark:text-gray-300">
						Es sesión lectiva
					</label>
				</div>

				<div class="mt-6 flex items-center justify-between border-t pt-4 dark:border-gray-700">
					{#if formData.id}
						<button
							type="button"
							on:click={handleDelete}
							class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
						>
							Eliminar
						</button>
					{:else}
						<div></div>
					{/if}

					<div class="flex space-x-3">
						<button
							type="button"
							on:click={handleClose}
							class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
						>
							Cancelar
						</button>
						<button
							type="submit"
							class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							Guardar
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}
