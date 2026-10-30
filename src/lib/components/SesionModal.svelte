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
		profesor_nombre?: string;
		profesoresApoyo?: any[];
	} = {};

	export let actividadesDisponibles: Array<{ id: number | string; nombre: string; es_lectiva?: boolean }> = [];
	export let aulasDisponibles: Array<{ id: string; nombre: string }> = [];
	export let maxMinutosFranja: number = 60;
	export let ajusteMinutos: number = 60;
	export let ajusteParte: 'inicio' | 'final' = 'inicio';

	export interface DocenteSession {
		id?: string;
		profesor_nombre: string;
		actividad: string;
		rol_aula: string;
		es_lectiva: boolean;
		minutos: number;
		clase?: string | null;
		aula?: string | null;
	}

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
			docentesList?: DocenteSession[];
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

	let docentesList: DocenteSession[] = [];
	let activeDocenteIndex: number = 0;
	let sesionesEliminadasIds: string[] = [];

	let conflictSessions: Array<{ id: string; profesor_nombre: string; actividad: string }> = [];

	$: tieneConflicto = (() => {
		if (!docentesList || docentesList.length < 2) return false;
		const actividadesSet = new Set(
			docentesList
				.map((d) => (d.actividad || '').trim().toLowerCase().replace(/\s+/g, ' '))
				.filter(Boolean)
		);
		return actividadesSet.size > 1;
	})();

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

	function syncFieldsFromActiveDocente() {
		if (!docentesList[activeDocenteIndex]) return;
		const cur = docentesList[activeDocenteIndex];
		actividad = cur.actividad || '';
		rol_aula = cur.rol_aula || '';
		tipoLectiva = cur.es_lectiva ? 'lectiva' : 'no_lectiva';
		clase = tipoLectiva === 'no_lectiva' ? '' : (cur.clase || sesionData.clase || '');
		aula = cur.aula || sesionData.aula || '';
		ajusteMinutos = cur.minutos || maxMinutosFranja;
	}

	function updateCurrentDocenteInList() {
		if (!docentesList[activeDocenteIndex]) return;
		docentesList[activeDocenteIndex].actividad = actividad;
		docentesList[activeDocenteIndex].rol_aula = rol_aula;
		docentesList[activeDocenteIndex].es_lectiva = tipoLectiva === 'lectiva';
		docentesList[activeDocenteIndex].minutos = ajusteMinutos;
		docentesList[activeDocenteIndex].clase = tipoLectiva === 'no_lectiva' ? null : clase;
		docentesList[activeDocenteIndex].aula = aula;
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

			sesionesEliminadasIds = [];
			activeDocenteIndex = 0;
			const sDataAny = sesionData as any;
			const rawConflict = sDataAny?.conflictSessions || sDataAny?.rawData?.conflictSessions || [];

			if (Array.isArray(rawConflict) && rawConflict.length > 0) {
				docentesList = rawConflict.map((cs: any) => ({
					id: cs.id ? String(cs.id) : undefined,
					profesor_nombre: cs.profesor_nombre || cs.profesor || cs.rawData?.profesor_nombre || 'Docente',
					actividad: cs.actividad || cs.rawData?.actividad || sesionData.actividad || '',
					rol_aula: cs.rawData?.rol_aula || cs.rol_aula || sesionData.rol_aula || '',
					es_lectiva: cs.rawData?.es_lectiva ?? sesionData.es_lectiva ?? true,
					minutos: cs.rawData?.minutos ?? sesionData.minutos ?? maxMinutosFranja,
					clase: cs.rawData?.clase || sesionData.clase || null,
					aula: cs.rawData?.aula || sesionData.aula || null
				}));
			} else if (profesorNombre || sesionData.profesor_nombre) {
				const pName = profesorNombre || sesionData.profesor_nombre || '';
				docentesList = [{
					id: sesionData.id,
					profesor_nombre: pName,
					actividad: sesionData.actividad || '',
					rol_aula: sesionData.rol_aula || '',
					es_lectiva: sesionData.es_lectiva ?? true,
					minutos: sesionData.minutos ?? maxMinutosFranja,
					clase: sesionData.clase || null,
					aula: sesionData.aula || null
				}];

				if (Array.isArray(sesionData.profesoresApoyo) && sesionData.profesoresApoyo.length > 0) {
					sesionData.profesoresApoyo.forEach((apoyo: any) => {
						if (apoyo.profesor_nombre) {
							docentesList.push({
								id: apoyo.id ? String(apoyo.id) : undefined,
								profesor_nombre: apoyo.profesor_nombre,
								actividad: apoyo.actividad || sesionData.actividad || '',
								rol_aula: apoyo.rol_aula || 'PT',
								es_lectiva: apoyo.es_lectiva ?? sesionData.es_lectiva ?? true,
								minutos: apoyo.minutos ?? maxMinutosFranja,
								clase: sesionData.clase || null,
								aula: sesionData.aula || null
							});
						}
					});
				}
			} else {
				docentesList = [{
					id: sesionData.id,
					profesor_nombre: 'Docente',
					actividad: sesionData.actividad || '',
					rol_aula: sesionData.rol_aula || '',
					es_lectiva: sesionData.es_lectiva ?? true,
					minutos: sesionData.minutos ?? maxMinutosFranja,
					clase: sesionData.clase || null,
					aula: sesionData.aula || null
				}];
			}

			syncFieldsFromActiveDocente();
		} else if (!isOpen) {
			lastOpenKey = null;
		}
	}

	function selectDocenteTab(index: number) {
		updateCurrentDocenteInList();
		activeDocenteIndex = index;
		syncFieldsFromActiveDocente();
	}

	function removeActiveDocente() {
		if (docentesList.length === 0) return;
		const target = docentesList[activeDocenteIndex];
		if (target && target.id && !sesionesEliminadasIds.includes(target.id)) {
			sesionesEliminadasIds.push(target.id);
		}
		docentesList = docentesList.filter((_, idx) => idx !== activeDocenteIndex);
		if (activeDocenteIndex >= docentesList.length) {
			activeDocenteIndex = Math.max(0, docentesList.length - 1);
		}
		if (docentesList.length > 0) {
			syncFieldsFromActiveDocente();
		}
	}

	function handleTipoChange(tipo: 'lectiva' | 'no_lectiva') {
		tipoLectiva = tipo;
		actividad = '';
		if (tipo === 'no_lectiva') {
			clase = '';
		}
		updateCurrentDocenteInList();
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
		docentesList = docentesList.map((d) => ({
			...d,
			actividad: nuevaActividad
		}));
	}

	function handleSave() {
		updateCurrentDocenteInList();

		const targetDia = (dia !== null && dia !== undefined) ? dia : (sesionData as any)?.dia;
		const targetFranja = (franja !== null && franja !== undefined) ? franja : (sesionData as any)?.franja;

		if (targetDia === undefined || targetDia === null || targetFranja === undefined || targetFranja === null) {
			alert('❌ Error: No se ha podido determinar el día o la franja horaria para guardar la sesión.');
			return;
		}

		const docentesFinales = docentesList.map((d) => ({
			...d,
			clase: d.es_lectiva ? (clase.trim() || null) : null,
			aula: aula.trim() || null,
			minutos: Math.max(1, Math.min(d.minutos || maxMinutosFranja, maxMinutosFranja))
		}));

		const activeDocente = docentesFinales[activeDocenteIndex] || docentesFinales[0];

		dispatch('save', {
			id: activeDocente?.id || sesionData?.id,
			dia: targetDia,
			franja: targetFranja,
			actividad: activeDocente?.actividad || actividad.trim() || null,
			clase: tipoLectiva === 'no_lectiva' ? null : (clase.trim() || null),
			aula: aula.trim() || null,
			rol_aula: activeDocente?.rol_aula || rol_aula.trim() || null,
			es_lectiva: tipoLectiva === 'lectiva',
			minutos: activeDocente?.minutos || ajusteMinutos,
			parte: ajusteParte,
			docentesList: docentesFinales,
			conflictSessionsEliminadas: sesionesEliminadasIds
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

				<!-- Pestañas de Profesores si existen 2 o más docentes en la sesión -->
				{#if docentesList.length > 0}
					<div class="space-y-2 pb-2 border-b border-slate-200 dark:border-gray-700">
						<div class="flex items-center justify-between">
							<span class="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
								👨‍🏫 Profesores en la franja ({docentesList.length})
							</span>
							{#if docentesList.length > 1}
								<button
									type="button"
									on:click={removeActiveDocente}
									class="px-2 py-1 text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-200 rounded-md transition-colors"
									title="Quitar a este docente de la franja"
								>
									🗑️ Quitar a {docentesList[activeDocenteIndex]?.profesor_nombre || 'Docente'}
								</button>
							{/if}
						</div>

						<div class="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
							{#each docentesList as doc, idx}
								<button
									type="button"
									on:click={() => selectDocenteTab(idx)}
									class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 {activeDocenteIndex === idx ? 'bg-sky-600 text-white border-sky-600 shadow-xs' : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-600 hover:bg-slate-200'}"
								>
									👨‍🏫 {doc.profesor_nombre}
								</button>
							{/each}
						</div>
					</div>
				{/if}

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
							{#each docentesList as d, idx}
								<div class="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/80 shadow-xs">
									<div class="flex-1 min-w-0">
										<span class="font-bold text-slate-800 dark:text-gray-100 text-xs block truncate" title={d.profesor_nombre}>
											👨‍🏫 {d.profesor_nombre}
										</span>
									</div>
									<select
										bind:value={d.actividad}
										on:change={() => { if (idx === activeDocenteIndex) actividad = d.actividad; }}
										class="bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md p-1.5 text-xs text-slate-800 dark:text-gray-100 font-semibold focus:ring-2 focus:ring-amber-500"
									>
										{#each activeActividades as actOption}
											<option value={actOption.nombre}>{actOption.nombre}</option>
										{/each}
									</select>
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
						on:change={updateCurrentDocenteInList}
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
							on:change={updateCurrentDocenteInList}
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
						on:change={updateCurrentDocenteInList}
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
								on:input={updateCurrentDocenteInList}
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
