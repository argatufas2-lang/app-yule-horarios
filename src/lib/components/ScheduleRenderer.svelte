<!-- 
  =============================================================================
  ¡ATENCIÓN! ZONA PROTEGIDA Y AISLADA (COMPONENTE PRESENTADOR / PURE RENDERER)
  =============================================================================
  Este componente es puramente visual y reactivo. NO debe contener llamadas
  a servicios, Supabase, ni lógica de acceso a datos. Recibe únicamente props
  tipadas y eventos para renderizar la parrilla de horarios.
  =============================================================================
-->
<script lang="ts">
    import { daysOfWeek } from '../constants/calendar';
    import type { TimeSlotItem, GridSessionCell } from '../services/scheduleService';

    export let teacherId: string = '';
    export let classroomId: string = '';
    export let selectedEntityId: string = '';
    export let gridData: Record<string, Record<string, GridSessionCell>> = {};
    export let activeSlots: TimeSlotItem[] = [];
    export let isJornadaCompleta: boolean = false;
    export let showDebug: boolean = false;
    export let getSession: (gridObj: Record<string, Record<string, GridSessionCell>>, tId: string, dayId: number, slotOrden: number) => GridSessionCell | undefined;
    export let onCellClick: (dayId: number, dayName: string, slot: TimeSlotItem, session?: GridSessionCell) => void = () => {};

    $: void classroomId, void selectedEntityId, void isJornadaCompleta;
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

                {#each activeSlots as slot}
                    {@const isRecreo = slot.type === 'recreo' || slot.orden === 3 || slot.time.includes('11:00 - 11:30')}
                    {@const isComedor = slot.type === 'comedor' || slot.orden === 7 || slot.time.includes('14:00 - 15:00')}
                    <tr class="border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black">
                        <td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/30 font-bold text-base text-slate-700 dark:text-gray-200 whitespace-nowrap print:p-0.5 print:text-[9px] print:border-r print:border-black">
                            {slot.time}
                        </td>
                        {#each daysOfWeek as day, index}
                            {@const effectiveDayId = (typeof day.id === 'number' && day.id >= 1 && day.id <= 5 && !daysOfWeek.some(d => d.id === 0)) ? day.id - 1 : (day.id ?? index)}
                            {@const session = getSession(gridData, teacherId, effectiveDayId, slot.orden)}
                            <td 
                                class="p-1.5 border-r-2 border-slate-300 dark:border-gray-600 h-16 align-middle transition-colors relative print:p-0.5 print:h-9 print:border-r print:border-black cursor-pointer hover:bg-slate-100/60 dark:hover:bg-gray-700/40 {!session && (isRecreo || isComedor) ? 'bg-emerald-100/70 dark:bg-emerald-950/40' : ''} {session?.rawData?.hasConflict ? 'bg-amber-100/80 dark:bg-amber-950/60 ring-2 ring-amber-500 font-semibold' : ''}"
                                on:click={() => onCellClick(effectiveDayId, day.name, slot, session)}
                                on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && onCellClick(effectiveDayId, day.name, slot, session)}
                                role="button"
                                tabindex="0"
                                title={session?.rawData?.hasConflict ? '⚠️ ¡Conflicto de asignaturas detectado! Haz clic para resolver' : (showDebug ? `[DEBUG] Día: ${effectiveDayId} | Franja: ${slot.orden} | Asignatura: ${session?.actividad || 'Ninguna'} | Clase: ${session?.clase || session?.aula || 'Ninguna'}` : 'Haz clic para editar la sesión')}
                            >
                                {#if session}
                                    <div class="flex flex-col items-center justify-center space-y-0.5">
                                        {#if session.rawData?.hasConflict}
                                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 bg-amber-200 dark:bg-amber-800 dark:text-amber-100 rounded border border-amber-400 animate-pulse print:border-black">
                                                ⚠️ Conflicto
                                            </span>
                                        {/if}
                                        <span class="block font-black text-slate-900 dark:text-gray-100 text-sm uppercase tracking-wide print:text-[9px]">
                                            {session.actividad?.toUpperCase() || ''}
                                        </span>
                                        {#if session.clase || session.aula}
                                            <span class="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase print:text-[8px]">
                                                {(session.clase || session.aula)?.toUpperCase() || ''}
                                            </span>
                                        {/if}
                                    </div>
                                {:else if isRecreo}
                                    <span class="block text-center text-xs tracking-wider uppercase font-extrabold text-emerald-900 dark:text-emerald-200 print:text-[8px]">
                                        ATSEDENALDIA
                                    </span>
                                {:else if isComedor}
                                    <span class="block text-center text-xs tracking-wider uppercase font-extrabold text-emerald-900 dark:text-emerald-200 print:text-[8px]">
                                        BAZKARIA
                                    </span>
                                {/if}

                                {#if showDebug}
                                    <div class="mt-1 text-[9px] font-mono leading-tight bg-amber-100/90 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100 p-1 rounded-sm border border-amber-400/80 text-left space-y-0.5 shadow-xs print:hidden">
                                        <div><strong class="font-bold">Día:</strong> {effectiveDayId} | <strong class="font-bold">Franja:</strong> {slot.orden}</div>
                                        <div><strong class="font-bold">Act:</strong> {session?.actividad || '---'}</div>
                                        <div><strong class="font-bold">Clase:</strong> {session?.clase || session?.aula || '---'}</div>
                                        <div class="truncate text-[8px] text-amber-800 dark:text-amber-300"><strong class="font-bold">ID:</strong> {session?.id || 'sin_sesion'}</div>
                                    </div>
                                {/if}
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
