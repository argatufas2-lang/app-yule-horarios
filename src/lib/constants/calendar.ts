export interface DayOfWeek {
    id: number;
    name: string;
}

// Días de la semana en Euskera alineados a Base 0 (0 = Astelehena / Lunes, 2 = Asteazkena / Miércoles, 4 = Ostirala / Viernes)
export const daysOfWeek: DayOfWeek[] = [
    { id: 0, name: 'Astelehena' },
    { id: 1, name: 'Asteartea' },
    { id: 2, name: 'Asteazkena' },
    { id: 3, name: 'Osteguna' },
    { id: 4, name: 'Ostirala' }
];
