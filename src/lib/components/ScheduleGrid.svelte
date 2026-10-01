<script lang="ts">
	import type { TimeSlotItem, GridSessionCell } from '../services/scheduleService';

	export let selectedEntityId: string = '';
	export let teacherId: string = '';
	export let classroomId: string = '';
	export let timeSlots: TimeSlotItem[] = [];
	export let gridData: Record<string, Record<string, GridSessionCell>> = {};
	export let activeTab: 'profesorado' | 'aulas' = 'aulas';
	export let loading: boolean = false;
	export let onCellClick: (dayId: number, dayName: string, slot: TimeSlotItem, session?: GridSessionCell) => void = () => {};

	$: targetId = teacherId || classroomId || selectedEntityId;

	const diasSemana = [
		{ id: 0, label: 'Lunes' },
		{ id: 1, label: 'Martes' },
		{ id: 2, label: 'Miércoles' },
		{ id: 3, label: 'Jueves' },
		{ id: 4, label: 'Viernes' }
	];

	function getSession(entityId: string, dayId: number, slotOrden: number): GridSessionCell | undefined {
		if (!gridData) return undefined;

		const activeId = entityId || targetId;
		const grid = activeId ? gridData[activeId] : undefined;
		if (!grid) return undefined;

		const d = Number(dayId);
		const f = Number(slotOrden);

		return grid[`${d}_${f}`];
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow border border-slate-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col">
	{#if loading}
		<div class="flex-1 flex items-center justify-center p-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<span class="ml-3 text-sm text-slate-500 dark:text-gray-400">Cargando horario...</span>
		</div>
	{:else}
		<div class="overflow-x-auto flex-1">
			<table class="w-full border-collapse text-left text-sm">
				<thead>
					<tr class="bg-slate-50 dark:bg-gray-700/50 border-b border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300">
						<th class="p-3 font-semibold w-28 text-center border-r border-slate-200 dark:border-gray-700">Franja</th>
						<th class="p-3 font-semibold w-32 text-center border-r border-slate-200 dark:border-gray-700">Horario</th>
						{#each diasSemana as dia}
							<th class="p-3 font-semibold text-center border-r border-slate-200 dark:border-gray-700 last:border-r-0">{dia.label}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200 dark:divide-gray-700">
					{#each timeSlots as slot}
						<tr class="hover:bg-slate-50/50 dark:hover:bg-gray-700/20">
							<td class="p-3 text-center font-medium text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-gray-700 bg-slate-50/30 dark:bg-gray-800/30">
								{slot.label}
							</td>
							<td class="p-3 text-center text-xs text-slate-500 dark:text-gray-400 border-r border-slate-200 dark:border-gray-700">
								{slot.time}
							</td>

							{#each diasSemana as dia}
								{@const session = getSession(selectedEntityId, dia.id, slot.orden)}
								<td 
									class="p-2 border-r border-slate-200 dark:border-gray-700 last:border-r-0 h-20 align-top relative group transition-all cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
									on:click={() => onCellClick(dia.id, dia.label, slot, session)}
									role="button"
									tabindex="0"
									on:keydown={(e) => e.key === 'Enter' && onCellClick(dia.id, dia.label, slot, session)}
								>
									{#if session}
										<div class="h-full w-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-lg p-2 flex flex-col justify-between shadow-xs">
											<div class="font-bold text-blue-900 dark:text-blue-200 text-xs truncate" title={session.actividad}>
												{session.actividad}
											</div>

											<div class="text-[11px] text-slate-500 dark:text-gray-400 italic flex flex-col gap-0.5">
												{#if activeTab === 'aulas'}
													{#if session.profesor && !session.esTutor}
														<span class="truncate italic" title={session.profesor}>
															{session.profesor}
														</span>
													{/if}
												{:else}
													{#if session.clase || session.aula}
														<span class="truncate font-semibold not-italic text-blue-700 dark:text-blue-400" title={session.clase || session.aula}>
															🏫 {session.clase || session.aula}
														</span>
													{/if}
												{/if}
											</div>
										</div>
									{:else}
										<div class="h-full w-full rounded-lg border border-dashed border-transparent hover:border-slate-300 dark:hover:border-gray-600 flex items-center justify-center text-slate-300 dark:text-gray-600 text-xs">
											-
										</div>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
