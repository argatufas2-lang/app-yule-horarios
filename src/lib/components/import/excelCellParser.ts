export interface ParsedCell {
    actividad: string;
    clase: string;
}

/**
 * Parsea y separa las celdas de sesión del Excel basándose en la estructura de bloques de aSc Timetables:
 * 1. Combina y divide el contenido por saltos de línea (\n o \r\n), aplicando trim a cada línea.
 * 2. Filtra únicamente las líneas vacías para no perder ningún dato válido.
 * 3. Asignación flexible de filas:
 *    - Primera línea válida -> Actividad / Asignatura (ej. Mus, Ingelesa).
 *    - Segunda línea en adelante -> Clase / Aula / Grupo (ej. 2A, 5B).
 */
export function parseExcelCellContent(
    rawActividad: string | null | undefined,
    rawClase: string | null | undefined = '',
    rawAula: string | null | undefined = ''
): ParsedCell {
    const combinedText = [rawActividad, rawClase, rawAula]
        .filter(Boolean)
        .join('\n')
        .trim();

    if (!combinedText) {
        return { actividad: '', clase: '' };
    }

    // 1. Dividir por saltos de línea reales y limpiar espacios, descartando solo líneas vacías
    const validLines = combinedText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (validLines.length === 0) {
        return { actividad: '', clase: '' };
    }

    // 2. Asignación de filas del bloque de forma limpia
    const actividad = validLines[0] || '';
    // Si hay más líneas, unimos las siguientes por si hay combinación de clase y aula, o cogemos la segunda directamente
    const clase = validLines.length >= 2 ? validLines.slice(1).join(' - ') : '';

    return {
        actividad,
        clase
    };
}