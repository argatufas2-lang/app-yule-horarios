<script lang="ts">
    import {
        fallbackTimeSlotsProfesorado,
        type TimeSlotItem,
        type GridSessionCell
    } from '../services/scheduleService';
    import ScheduleRenderer from './ScheduleRenderer.svelte';

    export let selectedEntityId: string = '';
    export let teacherId: string = '';
    export let classroomId: string = '';
    export let gridData: Record<string, Record<string, GridSessionCell>> = {};
    export let timeSlots: TimeSlotItem[] = [];
    export let isJornadaCompleta: boolean = false;
    export let showDebug: boolean = false;

    export let onCellClick: (dayId: number, dayName: string, slot: TimeSlotItem, session?: GridSessionCell) => void = () => {};

    $: targetId = teacherId || classroomId || selectedEntityId;
    $: activeSlots = (timeSlots && timeSlots.length >= 8) ? timeSlots : fallbackTimeSlotsProfesorado();

    function getSession(gridObj: Record<string, Record<string, GridSessionCell>>, tId: string, dayId: number, slotOrden: number): GridSessionCell | undefined {
        if (!gridObj) return undefined;
        const activeId = tId || targetId || selectedEntityId;
        
        const grid = activeId ? gridObj[activeId] : undefined;
        if (!grid) return undefined;

        const d = Number(dayId);
        const f = Number(slotOrden);

        return grid[`${d}_${f}`];
    }
</script>

<ScheduleRenderer
    {teacherId}
    {classroomId}
    {selectedEntityId}
    {gridData}
    {activeSlots}
    {isJornadaCompleta}
    {showDebug}
    {getSession}
    {onCellClick}
/>
