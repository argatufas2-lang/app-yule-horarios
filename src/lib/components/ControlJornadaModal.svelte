<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		getTeachers,
		getSessionsForTeacher,
		getActividadesCatalogo,
		getTimeSlots,
		type ActividadCatalogoItem
	} from '../services/primaryService';
	import { fetchTiposJornada, type TipoJornadaItem } from '$lib/services/scheduleService';
	import { calculateScheduleSummary, formatMinutes, type ScheduleSummary } from '../services/timeCalculationService';
	import type { Teacher, Session } from '../types/schedule';
	import { formatJornada } from '$lib/utils/formatters';

	export let isOpen: boolean = false;
	export let selectedCurso: string = '2026-2027';

	const dispatch = createEventDispatcher<{
		close: void;
		selectTeacher: { id: string; nombre: string };
	}>();

	interface TeacherSummaryRow {
		teacher: Teacher;
		summary: ScheduleSummary;
		sessionsCount: number;
		targetLectivasMinutos: number;
		targetNoLectivasMinutos: number;
	}

	let loading: boolean = false;
	let teacherRows: TeacherSummaryRow[] = [];
	let actividadesCatalogo: ActividadCatalogoItem[] = [];
	let searchTerm: string = '';

	$: if (isOpen) {
		loadControlJornadaData();
	}

	let tiposJornada: TipoJornadaItem[] = [];

	function getJornadaMinutosObjetivo(jornadaRaw?: string | null, tiposList: any[] = []) {
		if (!jornadaRaw) {
			return { minutosLectivosObjetivo: 0, minutosNoLectivosObjetivo: 0 };
		}

		const teacherJornadaNorm = String(jornadaRaw).trim().toLowerCase();

		const matched = tiposList.find((tj: any) => {
			const dbName = String(tj.nombre || '').trim().toLowerCase();
			if (!dbName) return false;
			return dbName === teacherJornadaNorm ||
				   teacherJornadaNorm.includes(dbName) ||
				   dbName.includes(teacherJornadaNorm);
		});

		if (matched) {
			const hL = Number(matched.objetivo_lectivas_horas);
			const hNL = Number(matched.objetivo_no_lectivas_horas);
			if (!isNaN(hL) && !isNaN(hNL)) {
				return {
					minutosLectivosObjetivo: Math.round(hL * 60),
					minutosNoLectivosObjetivo: Math.round(hNL * 60)
				};
			}
		}

		return { minutosLectivosObjetivo: 0, minutosNoLectivosObjetivo: 0 };
	}

	async function loadControlJornadaData() {
		loading = true;
		try {
			const [teachers, tramos, catalogo, tiposJ] = await Promise.all([
				getTeachers(selectedCurso),
				getTimeSlots(),
				getActividadesCatalogo(selectedCurso),
				fetchTiposJornada()
			]);

			actividadesCatalogo = catalogo;
			tiposJornada = tiposJ;

			const rows: TeacherSummaryRow[] = await Promise.all(
				teachers.map(async (teacher) => {
					const sessions = await getSessionsForTeacher(selectedCurso, teacher.nombre);
					const targets = getJornadaMinutosObjetivo(teacher.jornada, tiposJornada);
					const summary = calculateScheduleSummary(sessions, targets, actividadesCatalogo);
					return {
						teacher,
						summary,
						sessionsCount: sessions.length,
						targetLectivasMinutos: targets.minutosLectivosObjetivo,
						targetNoLectivasMinutos: targets.minutosNoLectivosObjetivo
					};
				})
			);

			teacherRows = rows;
		} catch (error) {
			console.error('Error cargando datos de control de jornada:', error);
		} finally {
			loading = false;
		}
	}

	function handleSelectTeacher(teacher: Teacher) {
		dispatch('selectTeacher', { id: teacher.id, nombre: teacher.nombre });
		handleClose();
	}

	function handleClose() {
		isOpen = false;
		dispatch('close');
	}

	let filtroBalance: 'todos' | 'exceso' | 'equilibrado' | 'pendiente' = 'todos';

	function toggleFiltroBalance(tipo: 'exceso' | 'equilibrado' | 'pendiente') {
		filtroBalance = filtroBalance === tipo ? 'todos' : tipo;
	}

	// Métricas globales sobre el total de profesores cargados
	$: totalExceso = teacherRows.filter((r) => r.summary.balanceTotalMinutos > 0).length;
	$: totalEquilibrado = teacherRows.filter((r) => r.summary.balanceTotalMinutos === 0).length;
	$: totalPendiente = teacherRows.filter((r) => r.summary.balanceTotalMinutos < 0).length;

	$: filteredRows = teacherRows.filter((r) => {
		if (filtroBalance === 'exceso' && r.summary.balanceTotalMinutos <= 0) return false;
		if (filtroBalance === 'equilibrado' && r.summary.balanceTotalMinutos !== 0) return false;
		if (filtroBalance === 'pendiente' && r.summary.balanceTotalMinutos >= 0) return false;

		if (!searchTerm) return true;
		const term = searchTerm.toLowerCase().trim();
		return (
			r.teacher.nombre.toLowerCase().includes(term) ||
			(r.teacher.perfil && r.teacher.perfil.toLowerCase().includes(term))
		);
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
		on:click|self={handleClose}
		on:keydown={(e) => e.key === 'Escape' && handleClose()}
		role="button"
		tabindex="-1"
	>
		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
		>
			<!-- Header -->
			<div
				class="px-6 py-4 bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between"
			>
				<div>
					<h2 class="text-xl font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2">
						📊 Control y Balance de Jornada del Profesorado
					</h2>
					<p class="text-xs text-slate-500 dark:text-gray-400">
						Curso Escolar: <strong class="text-sky-600 dark:text-sky-400">{selectedCurso}</strong>
					</p>
				</div>
				<button
					type="button"
					on:click={handleClose}
					class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold p-1 rounded-lg transition-colors cursor-pointer"
				>
					&times;
				</button>
			</div>

			<!-- Controls / Search bar -->
			<div class="p-4 bg-slate-50/50 dark:bg-gray-900/30 border-b border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
				<div class="w-full sm:w-80">
					<input
						type="text"
						bind:value={searchTerm}
						placeholder="🔍 Buscar profesor o especialidad..."
						class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
					/>
				</div>
				<div class="text-xs text-slate-500 dark:text-gray-400 font-medium">
					Mostrando <strong>{filteredRows.length}</strong> de <strong>{teacherRows.length}</strong> profesores
				</div>
			</div>

			<!-- Tarjetas de Resumen Global Interactivas -->
			<div class="px-6 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
				<!-- Tarjeta Exceso de Horas -->
				<button
					type="button"
					on:click={() => toggleFiltroBalance('exceso')}
					class="text-left rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer border {filtroBalance === 'exceso' ? 'bg-sky-100 dark:bg-sky-900 border-sky-500 shadow-md ring-2 ring-sky-400' : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 hover:border-sky-400'}"
				>
					<div>
						<span class="block text-[11px] font-extrabold uppercase tracking-wider text-sky-800 dark:text-sky-300">Exceso de Horas</span>
						<span class="text-xs text-sky-600 dark:text-sky-400 font-medium">Balance &gt; 0 min {filtroBalance === 'exceso' ? '✓' : ''}</span>
					</div>
					<div class="text-2xl font-black text-sky-900 dark:text-sky-100 bg-sky-200/60 dark:bg-sky-900 px-3 py-1 rounded-lg">
						{totalExceso}
					</div>
				</button>

				<!-- Tarjeta Jornada Equilibrada -->
				<button
					type="button"
					on:click={() => toggleFiltroBalance('equilibrado')}
					class="text-left rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer border {filtroBalance === 'equilibrado' ? 'bg-emerald-100 dark:bg-emerald-900 border-emerald-500 shadow-md ring-2 ring-emerald-400' : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'}"
				>
					<div>
						<span class="block text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Jornada Equilibrada</span>
						<span class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Balance = 0 min {filtroBalance === 'equilibrado' ? '✓' : ''}</span>
					</div>
					<div class="text-2xl font-black text-emerald-900 dark:text-emerald-100 bg-emerald-200/60 dark:bg-emerald-900 px-3 py-1 rounded-lg">
						{totalEquilibrado}
					</div>
				</button>

				<!-- Tarjeta Horas Pendientes -->
				<button
					type="button"
					on:click={() => toggleFiltroBalance('pendiente')}
					class="text-left rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer border {filtroBalance === 'pendiente' ? 'bg-amber-100 dark:bg-amber-900 border-amber-500 shadow-md ring-2 ring-amber-400' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 hover:border-amber-400'}"
				>
					<div>
						<span class="block text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">Horas Pendientes</span>
						<span class="text-xs text-amber-600 dark:text-amber-400 font-medium">Balance &lt; 0 min {filtroBalance === 'pendiente' ? '✓' : ''}</span>
					</div>
					<div class="text-2xl font-black text-amber-900 dark:text-amber-100 bg-amber-200/60 dark:bg-amber-900 px-3 py-1 rounded-lg">
						{totalPendiente}
					</div>
				</button>
			</div>

			<!-- Body / Table -->
			<div class="p-6 overflow-y-auto flex-1 space-y-4">
				{#if loading}
					<div class="flex flex-col items-center justify-center py-12 space-y-3">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
						<p class="text-xs font-semibold text-slate-500 dark:text-gray-400">
							Calculando horas y balance de jornada para el profesorado...
						</p>
					</div>
				{:else if filteredRows.length === 0}
					<div class="text-center py-12 text-slate-400 text-xs">
						No se encontraron registros de profesorado para la búsqueda o el curso seleccionado.
					</div>
				{:else}
					<div class="overflow-x-auto border border-slate-200 dark:border-gray-700 rounded-xl">
						<table class="w-full text-left text-xs">
							<thead class="bg-slate-100 dark:bg-gray-700/80 text-slate-700 dark:text-gray-200 font-bold sticky top-0">
								<tr>
									<th class="p-3">Profesor / Especialidad</th>
									<th class="p-3 text-center">Jornada</th>
									<th class="p-3 text-center">Horas Lectivas</th>
									<th class="p-3 text-center">Horas No Lectivas</th>
									<th class="p-3 text-center">Total Asignado</th>
									<th class="p-3 text-center">Balance</th>
									<th class="p-3 text-center">Acciones</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200 dark:divide-gray-700">
								{#each filteredRows as row}
									<tr class="hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors">
										<td class="p-3">
											<div class="font-bold text-slate-800 dark:text-gray-100 uppercase">
												{row.teacher.nombre}
											</div>
											<div class="text-[11px] text-slate-500 dark:text-gray-400">
												{row.teacher.perfil || 'Especialista'}
											</div>
										</td>
										<td class="p-3 text-center">
											<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300 border border-slate-200 dark:border-gray-600">
												{row.teacher.jornada || 'Jornada completa'}
											</span>
										</td>
										<td class="p-3 text-center">
											<span class="font-bold text-slate-800 dark:text-gray-200">{row.summary.horasLectivasFormatted}</span>
											<span class="block text-[10px] text-slate-400">Obj: {formatMinutes(row.targetLectivasMinutos)}</span>
										</td>
										<td class="p-3 text-center">
											<span class="font-bold text-slate-800 dark:text-gray-200">{row.summary.horasNoLectivasFormatted}</span>
											<span class="block text-[10px] text-slate-400">Obj: {formatMinutes(row.targetNoLectivasMinutos)}</span>
										</td>
										<td class="p-3 text-center">
											<span class="font-bold text-slate-900 dark:text-gray-100">{row.summary.horasTotalesFormatted}</span>
											<span class="block text-[10px] text-slate-400">Obj: {formatMinutes(row.targetLectivasMinutos + row.targetNoLectivasMinutos)}</span>
										</td>
										<td class="p-3 text-center">
											<span class="font-extrabold px-2 py-1 rounded-md text-xs {row.summary.balanceTotalMinutos === 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : row.summary.balanceTotalMinutos > 0 ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
												{row.summary.balanceTotalFormatted}
											</span>
										</td>
										<td class="p-3 text-center">
											<button
												type="button"
												on:click={() => handleSelectTeacher(row.teacher)}
												class="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-1 mx-auto cursor-pointer"
												title="Ver horario individual"
											>
												👁️ Ver Horario
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="px-6 py-4 bg-slate-50 dark:bg-gray-800/80 border-t border-slate-200 dark:border-gray-700 flex items-center justify-end">
				<button
					type="button"
					on:click={handleClose}
					class="px-4 py-2 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
				>
					Cerrar
				</button>
			</div>
		</div>
	</div>
{/if}
