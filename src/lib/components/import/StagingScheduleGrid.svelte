<script lang="ts">
	import { daysOfWeek } from '../../constants/calendar';
	import { fallbackTimeSlotsProfesorado, type TimeSlotItem } from '../../services/scheduleService';
	import type { StagingSessionRow } from '../../services/excelImportService';
	import { parseExcelCellContent } from './excelCellParser';

	export let rows: StagingSessionRow[] = [];
	export let selectedProfesor: string = '';

	const slots: TimeSlotItem[] = fallbackTimeSlotsProfesorado();

	function normalizeText(str: string | null | undefined): string {
		if (!str) return '';
		return str
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');
	}

	/**
	 * Mapea la franja proveniente de los datos temporales a la franja real base 0 (0..9).
	 * Respetando los huecos institucionales (recreo = 3, comida = 6,7):
	 *   Excel 1 -> 0
	 *   Excel 2 -> 1
	 *   Excel 3 -> 2
	 *   Excel 4 -> 4 (salta recreo 3)
	 *   Excel 5 -> 5
	 *   Excel 6 -> 8 (salta comida 6 y 7)
	 *   Excel 7 -> 9
	 */
	function mapFranjaToDatabaseSlot(rawFranja: number): number {
		switch (rawFranja) {
			case 1: return 0;
			case 2: return 1;
			case 3: return 2;
			case 4: return 4;
			case 5: return 5;
			case 6: return 8;
			case 7: return 9;

			case 0: return 0;
			case 8: return 8;
			case 9: return 9;

			default:
				return rawFranja;
		}
	}

	function getSessionForSlot(profesor: string, dayId: number, slotOrden: number): StagingSessionRow | undefined {
		if (!profesor || !rows || rows.length === 0) return undefined;

		const normProfesor = normalizeText(profesor);

		return rows.find((r) => {
			if (r.estado_validacion === 'error') return false;

			const rProf = normalizeText(r.profesor_nombre);
			if (rProf !== normProfesor) return false;

			const rawDay = Number(r.dia);
			const rawFranja = Number(r.franja);

			const normDay = rawDay;
			const mappedFranja = mapFranjaToDatabaseSlot(rawFranja);

			return normDay === dayId && mappedFranja === slotOrden;
		});
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-slate-300 dark:border-gray-600 overflow-hidden print:border print:border-black print:shadow-none print:rounded-none">
	<div class="overflow-x-auto">
		<table class="w-full border-collapse border-2 border-slate-300 dark:border-gray-600 text-center text-xs md:text-sm print:border print:border-black print:text-[10px]">
			<thead>
				<tr class="bg-sky-100 dark:bg-sky-950/70 text-sky-950 dark:text-sky-100 border-b-2 border-slate-300 dark:border-gray-600 font-bold print:border-b print:border-black print:bg-sky-50">
					<th class="p-3 border-r-2 border-slate-300 dark:border-gray-600 w-40 font-extrabold text-sky-900 dark:text-sky-200 text-base print:p-1 print:text-[10px] print:w-24 print:border-r print:border-black">Ordua</th>
					{#each daysOfWeek as day}
						<th class="p-3 border-r-2 border-slate-300 dark:border-gray-600 min-w-[140px] print:p-1 print:min-w-0 print:border-r print:border-black">
							<span class="block text-lg font-black text-sky-900 dark:text-sky-100 tracking-wide print:text-[11px] print:font-bold">{day.name}</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y-2 divide-slate-300 dark:divide-gray-600 print:divide-y print:divide-black">
				<tr class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black">
					<td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-200/70 dark:bg-gray-700 font-bold text-base text-slate-800 dark:text-slate-100 whitespace-nowrap print:p-0.5 print:text-[9px] print:border-r print:border-black">
						📌 Presencia / Zaintza
					</td>
					{#each daysOfWeek as day}
						<td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-xs font-semibold text-sky-800 dark:text-sky-300 bg-slate-50 dark:bg-slate-800/60 print:p-0.5 print:text-[9px] print:border-r print:border-black">
							09:00 - 16:30 (4h 30m)
						</td>
					{/each}
				</tr>

				{#each slots as slot}
					{#if slot.type === 'recreo' || slot.orden === 3 || slot.time.includes('11:00 - 11:30')}
						<tr class="bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black">
							<td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-emerald-200/60 dark:bg-emerald-900/60 font-bold text-base whitespace-nowrap text-emerald-950 dark:text-emerald-200 print:p-0.5 print:text-[9px] print:border-r print:border-black">
								{slot.time}
							</td>
							{#each daysOfWeek as day}
								<td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-center text-xs tracking-wider uppercase font-extrabold text-emerald-900 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-950/40 print:p-0.5 print:text-[8px] print:border-r print:border-black">
									ATSEDENALDIA
								</td>
							{/each}
						</tr>
					{:else if slot.type === 'comedor' || slot.orden === 7 || slot.time.includes('14:00 - 15:00')}
						<tr class="bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black">
							<td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-emerald-200/60 dark:bg-emerald-900/60 font-bold text-base whitespace-nowrap text-emerald-950 dark:text-emerald-200 print:p-0.5 print:text-[9px] print:border-r print:border-black">
								{slot.time}
							</td>
							{#each daysOfWeek as day}
								<td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-center text-xs tracking-wider uppercase font-extrabold text-emerald-900 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-950/40 print:p-0.5 print:text-[8px] print:border-r print:border-black">
									BAZKARIA
								</td>
							{/each}
						</tr>
					{:else}
						<tr class="border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black">
							<td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/30 font-bold text-base text-slate-700 dark:text-gray-200 whitespace-nowrap print:p-0.5 print:text-[9px] print:border-r print:border-black">
								{slot.time}
							</td>
							{#each daysOfWeek as day}
								{@const session = getSessionForSlot(selectedProfesor, day.id, slot.orden)}
								{@const isViernesLibre = day.id === 4 && slot.time.includes('13:00 - 14:00')}
								<td
									class="p-1.5 border-r-2 border-slate-300 dark:border-gray-600 h-16 align-middle transition-colors relative print:p-0.5 print:h-9 print:border-r print:border-black {isViernesLibre ? 'bg-slate-100/80 dark:bg-gray-800/80' : ''}"
								>
									{#if isViernesLibre}
										<!-- Hora libre universal Viernes tarde -->
									{:else if session}
										{@const parsedCell = parseExcelCellContent(session.actividad, session.clase, session.aula)}
										<div class="flex flex-col items-center justify-center space-y-0.5">
											<!-- Línea 1: Asignatura / Actividad -->
											{#if parsedCell.actividad}
												<span class="block font-black text-slate-900 dark:text-gray-100 text-sm uppercase tracking-wide print:text-[9px]">
													{parsedCell.actividad.toUpperCase()}
												</span>
											{/if}
											<!-- Línea 2: Aula / Clase -->
											{#if parsedCell.clase}
												<span class="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase print:text-[8px]">
													{parsedCell.clase.toUpperCase()}
												</span>
											{/if}
										</div>
									{/if}
								</td>
							{/each}
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>
