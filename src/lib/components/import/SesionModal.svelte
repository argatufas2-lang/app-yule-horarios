<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { StagingSessionRow } from '$lib/services/excelImportService';
	import { getAdminProfesores, getAdminRolesProfesor, type ProfesorRecord, type RolProfesorRecord } from '$lib/services/adminService';

	export let isOpen: boolean = false;
	export let session: StagingSessionRow | null = null;
	export let selectedCurso: string = '2026-2027';
	export let profesoresDisponibles: ProfesorRecord[] = [];

	export interface ProfesorApoyo {
		profesor_nombre: string;
		rol_aula: string;
		minutos: number;
		parte: 'inicio' | 'final';
	}

	const dispatch = createEventDispatcher<{
		close: void;
		save: StagingSessionRow & { profesoresApoyo?: ProfesorApoyo[] };
	}>();

	let formData: Partial<StagingSessionRow> = {};
	let profesoresApoyo: ProfesorApoyo[] = [];
	let profesoresList: ProfesorRecord[] = [];
	let rolesList: RolProfesorRecord[] = [];

	async function loadSupabaseData() {
		try {
			const [profs, roles] = await Promise.all([
				getAdminProfesores(selectedCurso),
				getAdminRolesProfesor()
			]);
			profesoresList = profs && profs.length > 0 ? profs : profesoresDisponibles;
			rolesList = roles || [];
		} catch (e) {
			console.error('Error cargando profesores o roles desde Supabase:', e);
			profesoresList = profesoresDisponibles;
		}
	}

	onMount(() => {
		loadSupabaseData();
	});

	$: if (session) {
		formData = { ...session };
		if ((session as any).profesoresApoyo) {
			profesoresApoyo = [...(session as any).profesoresApoyo];
		} else {
			profesoresApoyo = [];
		}
	}

	$: if (isOpen && profesoresList.length === 0) {
		loadSupabaseData();
	}

	function addProfesorApoyo() {
		const defaultProf = profesoresList.length > 0 ? profesoresList[0].nombre : '';
		const defaultRol = rolesList.length > 0 ? rolesList[0].codigo : 'PT';
		profesoresApoyo = [
			...profesoresApoyo,
			{
				profesor_nombre: defaultProf,
				rol_aula: defaultRol,
				minutos: formData.minutos || 45,
				parte: 'inicio'
			}
		];
	}

	function removeProfesorApoyo(index: number) {
		profesoresApoyo = profesoresApoyo.filter((_, i) => i !== index);
	}

	function handleClose() {
		dispatch('close');
	}

	function handleSave() {
		if (session) {
			dispatch('save', {
				...session,
				...formData,
				profesoresApoyo
			} as StagingSessionRow & { profesoresApoyo?: ProfesorApoyo[] });
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
			class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 dark:text-gray-100 max-h-[90vh] overflow-y-auto"
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

				<!-- Módulo: Profesores Concurrentes / Apoyo en esta Sesión -->
				<div class="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
					<div class="mb-3 flex items-center justify-between">
						<h3 class="text-sm font-semibold text-slate-800 dark:text-gray-200">
							Profesores Concurrentes / Apoyo en esta Sesión
						</h3>
						<button
							type="button"
							on:click={addProfesorApoyo}
							class="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
						>
							+ Añadir Profesor de Apoyo
						</button>
					</div>

					{#if profesoresApoyo.length === 0}
						<p class="text-xs italic text-slate-500 dark:text-gray-400">
							No hay profesores de apoyo asignados a esta sesión.
						</p>
					{:else}
						<div class="space-y-3">
							{#each profesoresApoyo as apoyo, index}
								<div class="relative flex flex-col gap-2 rounded-md border border-slate-300 bg-white p-3 shadow-sm dark:border-gray-600 dark:bg-gray-700">
									<button
										type="button"
										on:click={() => removeProfesorApoyo(index)}
										class="absolute right-2 top-2 text-slate-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
										title="Eliminar apoyo"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>

									<div class="grid grid-cols-2 gap-2 pr-6">
										<div>
											<label class="block text-xs font-medium text-slate-600 dark:text-gray-300">
												Profesor
											</label>
											<select
												bind:value={apoyo.profesor_nombre}
												class="mt-1 block w-full rounded border border-slate-300 p-1.5 text-xs text-slate-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
											>
												{#if profesoresList.length === 0}
													<option value={apoyo.profesor_nombre}>{apoyo.profesor_nombre || 'Seleccionar...'}</option>
												{/if}
												{#each profesoresList as prof}
													<option value={prof.nombre}>{prof.nombre}</option>
												{/each}
											</select>
										</div>

										<div>
											<label class="block text-xs font-medium text-slate-600 dark:text-gray-300">
												Rol
											</label>
											<select
												bind:value={apoyo.rol_aula}
												class="mt-1 block w-full rounded border border-slate-300 p-1.5 text-xs text-slate-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
											>
												{#if rolesList.length === 0}
													<option value="PT">PT</option>
													<option value="Laguntza">Laguntza</option>
													<option value="Eusle">Eusle</option>
													<option value="Hezitzaile">Hezitzaile</option>
													<option value="Principal">Principal</option>
												{:else}
													{#each rolesList as rol}
														<option value={rol.codigo}>{rol.nombre} ({rol.codigo})</option>
													{/each}
												{/if}
											</select>
										</div>
									</div>

									<div class="grid grid-cols-2 gap-2">
										<div>
											<label class="block text-xs font-medium text-slate-600 dark:text-gray-300">
												Minutos
											</label>
											<input
												type="number"
												min="5"
												max="120"
												bind:value={apoyo.minutos}
												class="mt-1 block w-full rounded border border-slate-300 p-1.5 text-xs text-slate-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
											/>
										</div>

										<div>
											<label class="block text-xs font-medium text-slate-600 dark:text-gray-300">
												Posición
											</label>
											<select
												bind:value={apoyo.parte}
												class="mt-1 block w-full rounded border border-slate-300 p-1.5 text-xs text-slate-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
											>
												<option value="inicio">Desde el inicio</option>
												<option value="final">Hasta el final</option>
											</select>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
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
