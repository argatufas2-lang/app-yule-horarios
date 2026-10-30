<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { getAdminAulas, getAdminActividades, type ActividadRecord } from '../services/adminService';

	export let isOpen: boolean = false;
	export let profesorNombre: string = '';
	export let dia: number | null = null;
	export let franja: number | null = null;
	export let diaNombre: string = '';
	export let franjaNombre: string = '';
	export let sesionData: {
		id?: string;
		actividad?: string | null;
		clase?: string | null;
		aula?: string | null;
		rol_aula?: string | null;
		es_lectiva?: boolean;
		minutos?: number;
	} = {};

	export let actividadesDisponibles: Array<{ id: number | string; nombre: string; es_lectiva?: boolean }> = [];
	export let aulasDisponibles: Array<{ id: string; nombre: string }> = [];
	export let maxMinutosFranja: number = 60;
	export let ajusteMinutos: number = 60;
	export let ajusteParte: 'inicio' | 'final' = 'inicio';

	const dispatch = createEventDispatcher<{
		close: void;
		save: {
			id?: string;
			dia: number;
			franja: number;
			actividad: string | null;
			clase: string | null;
			aula: string | null;
			rol_aula: string | null;
			es_lectiva: boolean;
			minutos?: number;
			parte?: 'inicio' | 'final';
			conflictSessionsActualizadas?: Array<{ id: string; profesor_nombre: string; actividad: string }>;
			conflictSessionsEliminadas?: string[];
		};
		delete: { id: string };
	}>();

	const euskaraDays: Record<string, string> = {
		'Lunes': 'Astelehena',
		'Martes': 'Asteartea',
		'Miércoles': 'Asteazkena',
		'Jueves': 'Osteguna',
		'Viernes': 'Ostirala',
		'Sábado': 'Larunbata',
		'Domingo': 'Igandea'
	};

	$: diaEuskera = euskaraDays[diaNombre] || diaNombre;

	// Estados locales enlazados (binds) a los controles del formulario
	let tipoLectiva: 'lectiva' | 'no_lectiva' = 'lectiva';
	let actividad: string = '';
	let clase: string = '';
	let aula: string = '';
	let rol_aula: string = '';

	let conflictSessions: Array<{ id: string; profesor_nombre: string; actividad: string }> = [];
	let conflictSessionsEliminadas: string[] = [];
	let tieneConflicto: boolean = false;

	let loadedAulas: Array<{ id: string; nombre: string }> = [];
	$: activeAulas = (aulasDisponibles && aulasDisponibles.length > 0) ? aulasDisponibles : loadedAulas;

	let catalogActividades: ActividadRecord[] = [];
	$: activeActividades = (actividadesDisponibles && actividadesDisponibles.length > 0)
		? actividadesDisponibles
		: catalogActividades;

	async function fetchAulasFromSupabase() {
		try {
			const data = await getAdminAulas('2026-2027');
			if (data) {
				loadedAulas = data.map((a: { id: string; nombre: string }) => ({ id: a.id, nombre: a.nombre }));
			}
		} catch (e) {
			console.error('Error cargando aulas directamente en SesionModal:', e);
		}
	}

	async function fetchActividadesFromSupabase() {
		try {
			const data = await getAdminActividades('2026-2027');
			if (data) {
				catalogActividades = data;
			}
		} catch (e) {
			console.error('Error cargando actividades directamente en SesionModal:', e);
		}
	}

	// Flag para controlar cuando sincronizar campos locales únicamente al abrir el modal o cambiar de sesión
	let lastOpenKey: string | null = null;

	$: {
		const currentKey = isOpen ? `${sesionData?.id || ''}_${dia}_${franja}` : null;
		if (isOpen && currentKey !== lastOpenKey) {
			lastOpenKey = currentKey;

			if (!aulasDisponibles || aulasDisponibles.length === 0) {
				fetchAulasFromSupabase();
			}
			if (!actividadesDisponibles || actividadesDisponibles.length === 0) {
				fetchActividadesFromSupabase();
			}

			if (sesionData) {
				const actNombre = sesionData.actividad || '';
				rol_aula = sesionData.rol_aula || '';
				aula = sesionData.aula || '';

				if (sesionData.es_lectiva !== undefined) {
					tipoLectiva = sesionData.es_lectiva ? 'lectiva' : 'no_lectiva';
				} else if (actNombre) {
					const foundAct = activeActividades.find(
						(a) => a.nombre.toLowerCase().trim() === actNombre.toLowerCase().trim()
					);
					if (foundAct && foundAct.es_lectiva !== undefined) {
						tipoLectiva = foundAct.es_lectiva ? 'lectiva' : 'no_lectiva';
					} else {
						tipoLectiva = 'lectiva';
					}
				} else {
					tipoLectiva = 'lectiva';
				}

				actividad = actNombre;
				clase = tipoLectiva === 'no_lectiva' ? '' : (sesionData.clase || '');
				ajusteMinutos = sesionData?.minutos !== undefined ? sesionData.minutos : maxMinutosFranja;

				conflictSessionsEliminadas = [];
				const sDataAny = sesionData as any;
				const rawConflict = sDataAny?.conflictSessions || sDataAny?.rawData?.conflictSessions || [];
				if (Array.isArray(rawConflict) && rawConflict.length > 0) {
					conflictSessions = rawConflict.map((cs: any) => ({
						id: String(cs.id),
						profesor_nombre: cs.profesor_nombre || cs.profesor || 'Docente sin nombre',
						actividad: cs.actividad || ''
					}));
				} else {
					conflictSessions = [];
				}

				const distintasActividades = new Set(
					conflictSessions
						.map((cs) => (cs.actividad || '').trim().toLowerCase().replace(/\s+/g, ' '))
						.filter(Boolean)
				);
				tieneConflicto = conflictSessions.length > 1 && distintasActividades.size > 1;
			}
		} else if (!isOpen) {
			lastOpenKey = null;
		}
	}

	function handleTipoChange(tipo: 'lectiva' | 'no_lectiva') {
		tipoLectiva = tipo;
		actividad = '';
		if (tipo === 'no_lectiva') {
			clase = '';
		}
	}

	// Filtro de actividades según el tipo activo (lectiva / no lectiva)
	$: actividadesFiltradas = activeActividades.filter((act) => {
		const isLectiva = act.es_lectiva ?? true;
		return tipoLectiva === 'lectiva' ? isLectiva : !isLectiva;
	});

	function closeModal() {
		isOpen = false;
		dispatch('close');
	}

	function unificarAsignaturaConflictos(nuevaActividad: string) {
		if (!nuevaActividad) return;
		actividad = nuevaActividad;
		conflictSessions = conflictSessions.map((cs) => ({
			...cs,
			actividad: nuevaActividad
		}));
		tieneConflicto = false;
	}

	function eliminarConflictoProfesor(id: string) {
		conflictSessions = conflictSessions.filter((cs) => cs.id !== id);
		if (id && !conflictSessionsEliminadas.includes(id)) {
			conflictSessionsEliminadas.push(id);
		}
		const distintasActividades = new Set(
			conflictSessions
				.map((cs) => (cs.actividad || '').trim().toLowerCase().replace(/\s+/g, ' '))
				.filter(Boolean)
		);
		tieneConflicto = conflictSessions.length > 1 && distintasActividades.size > 1;
	}

	function handleSave() {
		const targetDia = (dia !== null && dia !== undefined) ? dia : (sesionData as any)?.dia;
		const targetFranja = (franja !== null && franja !== undefined) ? franja : (sesionData as any)?.franja;

		if (targetDia === undefined || targetDia === null || targetFranja === undefined || targetFranja === null) {
			alert('❌ Error: No se ha podido determinar el día o la franja horaria para guardar la sesión.');
			return;
		}

		const minutosValidados = Math.max(1, Math.min(ajusteMinutos, maxMinutosFranja));
		dispatch('save', {
			id: sesionData?.id,
			dia: targetDia,
			franja: targetFranja,
			actividad: actividad.trim() || null,
			clase: tipoLectiva === 'no_lectiva' ? null : (clase.trim() || null),
			aula: aula.trim() || null,
			rol_aula: rol_aula.trim() || null,
			es_lectiva: tipoLectiva === 'lectiva',
			minutos: minutosValidados,
			parte: ajusteParte,
			conflictSessionsActualizadas: conflictSessions,
			conflictSessionsEliminadas: conflictSessionsEliminadas
		});
		closeModal();
	}

	function handleDelete() {
		if (sesionData?.id) {
			dispatch('delete', { id: sesionData.id });
		}
		closeModal();
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
		on:click|self={closeModal}
		on:keydown={(e) => e.key === 'Escape' && closeModal()}
		role="button"
		tabindex="-1"
	>
		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-lg overflow-hidden flex flex-col"
		>
			<!-- Header -->
			<div
				class="px-6 py-4 bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between"
			>
				<div>
					<h3 class="text-lg font-bold text-slate-800 dark:text-gray-100">
						{profesorNombre ? profesorNombre : (sesionData?.id ? 'Editar Sesión' : 'Nueva Sesión')}
					</h3>
					<p class="text-xs font-semibold text-sky-700 dark:text-sky-400">
						{diaEuskera} {franjaNombre ? `• ${franjaNombre}` : ''}
					</p>
				</div>
				<button
					type="button"
					on:click={closeModal}
					class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold p-1 rounded-lg transition-colors"
				>
					&times;
				</button>
			</div>

			<!-- Body / Form -->
			<form on:submit|preventDefault={handleSave} class="p-6 space-y-4 text-sm">
				<!-- Panel de Detección y Resolución Manual de Conflictos de Asignatura -->
				{#if tieneConflicto}
					<div class="p-3.5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 rounded-xl space-y-3 shadow-xs">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<span class="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
								⚠️ Conflicto de Asignaturas en la Franja
							</span>
							{#if actividad}
								<button
									type="button"
									on:click={() => unificarAsignaturaConflictos(actividad)}
									class="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg transition-all shadow-xs"
								>
									Unificar todas a "{actividad}"
								</button>
							{/if}
						</div>

						<p class="text-xs text-amber-800 dark:text-amber-300">
							Existen diferentes asignaturas asignadas a este grupo en el mismo horario. Selecciona la asignatura adecuada para cada profesor o elimina la asignación errónea:
						</p>

						<div class="space-y-2 max-h-48 overflow-y-auto pr-1">
							{#each conflictSessions as cs}
								<div class="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/80 shadow-xs">
									<div class="flex-1 min-w-0">
										<span class="font-bold text-slate-800 dark:text-gray-100 text-xs block truncate" title={cs.profesor_nombre}>
											👨‍🏫 {cs.profesor_nombre}
										</span>
									</div>
									<select
										bind:value={cs.actividad}
										class="bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md p-1.5 text-xs text-slate-800 dark:text-gray-100 font-semibold focus:ring-2 focus:ring-amber-500"
									>
										{#each activeActividades as actOption}
											<option value={actOption.nombre}>{actOption.nombre}</option>
										{/each}
									</select>
									{#if cs.id}
										<button
											type="button"
											on:click={() => eliminarConflictoProfesor(cs.id)}
											class="p-1.5 text-red-600 hover:text-red-700 dark:hover:text-red-400 font-bold text-base rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
											title="Eliminar esta sesión conflictiva"
										>
											🗑️
										</button>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Selector de tipo Lectiva / No Lectiva -->
				<div>
					<span class="block font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
						Mota / Tipo de Actividad
					</span>
					<div class="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-gray-700/60 p-1 rounded-lg border border-slate-200 dark:border-gray-600">
						<button
							type="button"
							on:click={() => handleTipoChange('lectiva')}
							class="py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 {tipoLectiva === 'lectiva' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'}"
						>
							📚 Lectiva (Irakaskuntza)
						</button>
						<button
							type="button"
							on:click={() => handleTipoChange('no_lectiva')}
							class="py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 {tipoLectiva === 'no_lectiva' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'}"
						>
							📝 No Lectiva (Bestelakoak)
						</button>
					</div>
				</div>

				<!-- Actividad / Asignatura Filtrada -->
				<div>
					<label for="actividad" class="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
						Actividad / Asignatura ({tipoLectiva === 'lectiva' ? 'Lectiva' : 'No Lectiva'})
					</label>
					<select
						id="actividad"
						bind:value={actividad}
						required
						class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2.5 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer"
					>
						<option value="" disabled selected={!actividad}>-- Seleccionar Actividad --</option>
						{#each actividadesFiltradas as act}
							<option value={act.nombre}>{act.nombre}</option>
						{/each}
					</select>
				</div>

				<!-- Grupo / Clase -->
				<div>
					<label for="clase" class="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
						Grupo / Clase {tipoLectiva === 'no_lectiva' ? '(No aplica en No Lectivas)' : ''}
					</label>
					{#if tipoLectiva === 'no_lectiva'}
						<input
							type="text"
							id="clase"
							value=""
							disabled
							placeholder="Sin grupo asignado"
							class="w-full bg-slate-100 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-lg p-2.5 text-slate-400 dark:text-gray-500 cursor-not-allowed italic"
						/>
					{:else}
						<select
							id="clase"
							bind:value={clase}
							class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2.5 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer"
						>
							<option value="">-- Seleccionar Grupo / Clase --</option>
							{#each activeAulas as aulaItem}
								<option value={aulaItem.nombre}>{aulaItem.nombre}</option>
							{/each}
						</select>
					{/if}
				</div>

				<!-- Rol / Rol Aula -->
				<div>
					<label for="rol_aula" class="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
						Rol (Rola)
					</label>
					<select
						id="rol_aula"
						bind:value={rol_aula}
						class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2.5 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer"
					>
						<option value="">-- Aukeratu Rola / Seleccionar Rol --</option>
						<option value="Principal">Principal</option>
						<option value="PT">PT</option>
						<option value="Laguntza">Laguntza</option>
						<option value="Eusle">Eusle</option>
						<option value="Hezitzaile">Hezitzaile</option>
					</select>
				</div>

				<!-- Ajuste Personalizado de Tramo Horario (Integrado en Modal) -->
				<div class="pt-3 border-t border-slate-200 dark:border-gray-700 space-y-2">
					<span class="block text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
						⏱️ Ajuste de Duración y Posición
					</span>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="ajusteMinutosInput" class="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
								Minutos (máx. {maxMinutosFranja}):
							</label>
							<input
								id="ajusteMinutosInput"
								type="number"
								min="1"
								max={maxMinutosFranja}
								bind:value={ajusteMinutos}
								class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 font-medium"
							/>
						</div>
						<div>
							<label for="ajusteParteSelect" class="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
								Posición (Parte):
							</label>
							<select
								id="ajusteParteSelect"
								bind:value={ajusteParte}
								class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer"
							>
								<option value="inicio">Desde el inicio</option>
								<option value="final">Hasta el final</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Footer Buttons -->
				<div class="pt-4 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between">
					{#if sesionData?.id}
						<button
							type="button"
							on:click={handleDelete}
							class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition-colors"
						>
							Eliminar Sesión
						</button>
					{:else}
						<div></div>
					{/if}
					<div class="flex items-center gap-2">
						<button
							type="button"
							on:click={closeModal}
							class="px-4 py-2 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-lg font-semibold text-xs transition-colors"
						>
							Cancelar
						</button>
						<button
							type="submit"
							class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
						>
							Guardar
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}
