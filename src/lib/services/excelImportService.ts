import * as XLSX from 'xlsx';
import { supabase } from '$lib/services/supabaseClient';
import { parseExcelCellContent } from '../components/import/excelCellParser';

export type ImportFormat = 'matriz_profesor' | 'periodo_multilinea';

export interface ImportedSession {
    teacher: string;
    excelPeriod: number;
    dbFranja: number;
    day: string;
    subject: string;
    classroom: string;
    group: string;
    grupo_desdoble?: string | null;
}

export function normalizarNombreProfesor(nombreRaw?: string | null): string {
    if (!nombreRaw) return '';
    return nombreRaw
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

export function mapExcelPeriodToDbFranja(excelPeriod: number): number {
    switch (excelPeriod) {
        case 1: return 0; // 9:00 - 9:30
        case 2: return 1; // 9:30 - 10:15
        case 3: return 2; // 10:15 - 11:00
        // Franja 3 es Recreo (11:00 - 11:30)
        case 4: return 4; // 11:30 - 12:15
        case 5: return 5; // 12:15 - 13:00
        // Franjas 6 y 7 son Vascaria / Almuerzo (13:00 - 15:00)
        case 6: return 8; // 15:00 - 15:45
        case 7: return 9; // 15:45 - 16:30
        default: return excelPeriod;
    }
}

export function parseAscBlockExcel(fileBuffer: ArrayBuffer): ImportedSession[] {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const sessions: ImportedSession[] = [];
    let currentTeacher = '';
    let headerRowIdx = -1;
    let daysMap: { [col: number]: string } = {};

    let i = 0;
    while (i < data.length) {
        const row = data[i];
        const val0 = row && row[0] !== undefined && row[0] !== null ? String(row[0]).trim() : '';

        if (val0 && val0 !== 'Período' && !/^\d+$/.test(val0) && !val0.startsWith('Grupo')) {
            if (i + 2 < data.length && data[i + 2] && String(data[i + 2][0]).trim() === 'Período') {
                currentTeacher = val0;
                headerRowIdx = i + 2;

                daysMap = {};
                const headerRow = data[headerRowIdx];
                for (let col = 1; col < headerRow.length; col++) {
                    const dayName = headerRow[col];
                    if (dayName) {
                        daysMap[col] = String(dayName).trim();
                    }
                }
                i = headerRowIdx;
            }
        }

        if (currentTeacher && headerRowIdx !== -1 && i > headerRowIdx) {
            if (/^\d+$/.test(val0)) {
                const excelPeriod = parseInt(val0, 10);
                const dbFranja = mapExcelPeriodToDbFranja(excelPeriod);
                const rowPeriod = i;

                for (const [colStr, dayName] of Object.entries(daysMap)) {
                    let currCol = parseInt(colStr, 10);

                    while (currCol < data[rowPeriod].length) {
                        const headerDay = data[headerRowIdx][currCol];
                        if (headerDay !== undefined && headerDay !== null && String(headerDay).trim() !== '') {
                            const hStr = String(headerDay).trim();
                            if (hStr !== dayName && Object.values(daysMap).includes(hStr)) {
                                break;
                            }
                        }

                        const subject = data[rowPeriod][currCol] ? String(data[rowPeriod][currCol]).trim() : '';

                        let classroom = '';
                        if (rowPeriod + 1 < data.length && data[rowPeriod + 1]) {
                            classroom = data[rowPeriod + 1][currCol] ? String(data[rowPeriod + 1][currCol]).trim() : '';
                        }

                        let group = '';
                        if (rowPeriod + 2 < data.length && data[rowPeriod + 2]) {
                            const possibleGroup = String(data[rowPeriod + 2][currCol] || '').trim();
                            if (possibleGroup.includes('Grupo') || !/^\d+$/.test(possibleGroup)) {
                                group = possibleGroup;
                            }
                        }

                        let cleanClassroom = classroom;
                        let cleanGroup = group;

                        if (cleanClassroom) {
                            const grupoRegex = /grupo\s*[\w\d]*/gi;
                            const match = cleanClassroom.match(grupoRegex);
                            if (match) {
                                if (!cleanGroup) {
                                    cleanGroup = match.join(', ');
                                }
                                cleanClassroom = cleanClassroom.replace(grupoRegex, '').trim();
                            }
                        }

                        if (subject) {
                            sessions.push({
                                teacher: currentTeacher,
                                excelPeriod,
                                dbFranja,
                                day: dayName,
                                subject,
                                classroom: cleanClassroom,
                                group: cleanGroup,
                                grupo_desdoble: cleanGroup.trim() ? cleanGroup.trim() : null
                            });
                        }

                        currCol++;
                        const nextHeader = data[headerRowIdx][currCol];
                        if (nextHeader && String(nextHeader).trim() !== '' && String(nextHeader).trim() !== dayName) {
                            break;
                        }
                    }
                }
            }
        }
        i++;
    }

    return sessions;
}

export interface StagingSessionRow {
    id?: string;
    batch_id: string;
    profesor_nombre: string;
    perfil_profesor?: string | null;
    clase_base?: string | null;
    tipo_jornada?: string | null;
    dia: number; 
    franja: number; 
    actividad: string | null;
    clase: string | null;
    aula: string | null;
    grupo_desdoble?: string | null;
    rol_aula: string | null;
    fuente: string;
    minutos: number;
    curso_escolar: string;
    estado_validacion: 'valido' | 'error';
    errores: string[];
}

interface ProfesorMetadata {
    nombre: string;
    perfil: string | null;
    claseBase: string | null;
    jornada: string | null;
}

function calculateMinutos(franjaIndex0: number): number {
    if (franjaIndex0 === 5) return 60; 
    if (franjaIndex0 === 0) return 30; 
    return 45;
}

function cleanCellText(value: any): string {
    if (value === null || value === undefined) return '';
    let str = String(value);

    str = str.replace(/[\r\t]/g, '');
    str = str.replace(/=3D/gi, '=');
    str = str.replace(/&nbsp;/gi, ' ');
    str = str.replace(/&quot;/gi, '"');
    str = str.replace(/&#39;/gi, "'");
    str = str.replace(/&amp;/gi, '&');

    str = str.replace(/<br\s*\/?>/gi, '\n');
    str = str.replace(/<[^>]*>/g, ' ');

    str = str.replace(/font-family:[^;\n]*;?/gi, '');
    str = str.replace(/sans-serif;?/gi, '');
    str = str.replace(/border=[^\s>\n]+/gi, '');
    str = str.replace(/style="[^"]*"/gi, '');
    str = str.replace(/class="[^"]*"/gi, '');
    str = str.replace(/width="[^"]*"/gi, '');

    const lines = str
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => {
            if (l.length === 0) return false;
            const lower = l.toLowerCase();
            if (
                lower.includes('sans-serif') ||
                lower.includes('border=') ||
                lower.includes('replace') ||
                lower.includes('width=') ||
                lower.includes('style=')
            ) {
                return false;
            }
            return true;
        });

    return lines.join('\n').trim();
}

function mapDayNameToNumberIndex0(rawDay: string | number): number {
    if (typeof rawDay === 'number') {
        if (rawDay >= 0 && rawDay <= 4) return rawDay;
        if (rawDay >= 1 && rawDay <= 5) return rawDay - 1;
    }
    const str = cleanCellText(rawDay).toLowerCase();
    if (str.includes('astelehena') || str.includes('lunes') || str === '0' || str === '1' || str === 'l') return 0;
    if (str.includes('asteartea') || str.includes('martes') || str === '1' || str === '2' || str === 'm') return 1;
    if (str.includes('asteazkena') || str.includes('miercoles') || str.includes('miércoles') || str === '2' || str === '3' || str === 'x') return 2;
    if (str.includes('osteguna') || str.includes('jueves') || str === '3' || str === '4' || str === 'j') return 3;
    if (str.includes('ostirala') || str.includes('viernes') || str === '4' || str === '5' || str === 'v') return 4;
    return 0;
}

function mapTimeSlotToFranjaIndex0(rawSlot: string | number): number {
    if (typeof rawSlot === 'number') {
        if (rawSlot >= 0 && rawSlot <= 9) return rawSlot;
        if (rawSlot >= 1 && rawSlot <= 10) return rawSlot - 1;
    }
    const str = cleanCellText(rawSlot);
    const parsedInt = parseInt(str, 10);
    if (!isNaN(parsedInt) && !str.includes(':')) {
        if (parsedInt >= 0 && parsedInt <= 9) return parsedInt;
        if (parsedInt >= 1 && parsedInt <= 10) return parsedInt - 1;
    }

    if (str.includes('09:00') || str.includes('9:00')) return 0;
    if (str.includes('09:30') || str.includes('9:30')) return 1;
    if (str.includes('10:15') || str.includes('10:30')) return 2;
    if (str.includes('11:30')) return 3;
    if (str.includes('12:15') || str.includes('12:30')) return 4;
    if (str.includes('13:00') || str.includes('14:00')) return 5;
    if (str.includes('15:00')) return 6;
    if (str.includes('15:45')) return 7;

    return 0;
}

function mapPeriodoToFranjaIndex0(periodoNum: number): number {
    switch (periodoNum) {
        case 1: return 0; 
        case 2: return 1; 
        case 3: return 2; 
        case 4: return 4; 
        case 5: return 5; 
        case 6: return 6; 
        case 7: return 8; 
        case 8: return 9; 
        default: return periodoNum >= 1 && periodoNum <= 10 ? periodoNum - 1 : 0;
    }
}

function isDayNameString(str: string): boolean {
    const lower = cleanCellText(str).toLowerCase();
    return (
        lower.includes('astelehena') || lower.includes('lunes') ||
        lower.includes('asteartea') || lower.includes('martes') ||
        lower.includes('asteazkena') || lower.includes('miercoles') || lower.includes('miércoles') ||
        lower.includes('osteguna') || lower.includes('jueves') ||
        lower.includes('ostirala') || lower.includes('viernes')
    );
}

function isTimeString(str: string): boolean {
    const clean = cleanCellText(str);
    return /^\d{1,2}:\d{2}/.test(clean) || clean.includes(' - ');
}

function isSheetOrMetadataToIgnore(name: string | null | undefined): boolean {
    if (!name) return true;
    const clean = cleanCellText(name).toUpperCase();

    if (clean.startsWith('AULA ')) return true;
    if (clean === 'IMPRESION' || clean === 'IMPRESIÓN') return true;
    if (clean === 'CONFIGURACION' || clean === 'CONFIGURACIÓN') return true;
    if (clean === 'PROFESORADO') return true;
    if (clean.includes('INDICE') || clean.includes('ÍNDICE')) return true;
    if (clean.includes('META')) return true;
    if (clean.includes('CAMBIOS')) return true;
    if (clean.includes('_WEBAPP_')) return true;
    if (clean.includes('_ASC_')) return true;
    if (
        clean.includes('AJUSTES') ||
        clean.includes('AJUSTESMINUTOS') ||
        clean.includes('AUDITORIA') ||
        clean.includes('AUDITORÍA')
    )
        return true;

    return false;
}

export interface RawExtractedSession {
    profesor: string;
    perfil: string;
    claseBase: string;
    jornada: string;
    dia: number;
    franja: number;
    actividad: string;
    clase: string;
    aula: string;
    grupo_desdoble?: string | null;
}

/**
 * Recorre todas las hojas del libro Excel aplicando un rastreo espacial por coordenadas:
 * - Busca hacia arriba para identificar el día de la semana.
 * - Busca hacia la izquierda para identificar el período/franja horaria.
 * - Lee verticalmente el bloque de celdas (Asignatura -> Clase -> Grupo).
 * - Barre horizontalmente hacia la derecha cuando encuentra matrices de múltiples grupos.
 */
export function parseMultiSheetMatrixExcel(
    workbook: XLSX.WorkBook,
    profesorMetadataMap: Map<string, ProfesorMetadata>
): RawExtractedSession[] {
    const rawSessions: RawExtractedSession[] = [];

    for (const sheetName of workbook.SheetNames) {
        const profesorNombre = cleanCellText(sheetName);

        if (isSheetOrMetadataToIgnore(profesorNombre)) {
            continue;
        }

        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;

        const data = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: false, defval: '' });
        if (!data || data.length < 2) continue;

        const meta = profesorMetadataMap.get(normalizarNombreProfesor(profesorNombre));
        const perfilProfesor = meta?.perfil || '';
        const claseBase = meta?.claseBase || '';
        const tipoJornada = meta?.jornada || '';

        // 1. Identificar la fila de cabecera de los días de la semana
        let dayHeaderRowIdx = -1;
        for (let r = 0; r < Math.min(data.length, 10); r++) {
            const row = data[r];
            if (!row) continue;
            for (let c = 0; c < row.length; c++) {
                const cellStr = cleanCellText(row[c]);
                if (isDayNameString(cellStr)) {
                    dayHeaderRowIdx = r;
                    break;
                }
            }
            if (dayHeaderRowIdx !== -1) break;
        }

        if (dayHeaderRowIdx === -1) continue;

        let currentPeriodNum = 0;

        // 2. Recorrer la parrilla a partir de la fila siguiente a la cabecera de días
        for (let rowIndex = dayHeaderRowIdx + 1; rowIndex < data.length; rowIndex++) {
            const row = data[rowIndex];
            if (!row || row.length === 0) continue;

            const col0Val = row[0] ? cleanCellText(row[0]) : '';
            if (col0Val.toUpperCase().includes('CONTROL DE JORNADA')) break;

            if (isTimeString(col0Val) || /^\d+$/.test(col0Val)) {
                currentPeriodNum = parseInt(col0Val, 10) || (currentPeriodNum + 1);
            }

            for (let colIndex = 1; colIndex < row.length; colIndex++) {
                const cellContent = cleanCellText(row[colIndex]);
                if (!cellContent) continue;

                // COORDENADA ARRIBA: Viajar hacia arriba para encontrar el día de la semana
                let foundDay = '';
                for (let rCheck = dayHeaderRowIdx; rCheck >= 0; rCheck--) {
                    const upperCell = cleanCellText(data[rCheck]?.[colIndex]);
                    if (isDayNameString(upperCell)) {
                        foundDay = upperCell;
                        break;
                    }
                }

                if (!foundDay) {
                    for (let cCheck = colIndex; cCheck >= 0; cCheck--) {
                        const upperCell = cleanCellText(data[dayHeaderRowIdx]?.[cCheck]);
                        if (isDayNameString(upperCell)) {
                            foundDay = upperCell;
                            break;
                        }
                    }
                }

                if (!foundDay) continue;
                const diaIndex0 = mapDayNameToNumberIndex0(foundDay);
                const franjaIndex0 = mapPeriodoToFranjaIndex0(currentPeriodNum);

                const subject = cellContent;
                if (isSheetOrMetadataToIgnore(subject) || isDayNameString(subject) || isTimeString(subject)) {
                    continue;
                }

                // LECTURA VERTICAL DE BLOQUES
                let classroom = '';
                if (rowIndex + 1 < data.length && data[rowIndex + 1]) {
                    classroom = cleanCellText(data[rowIndex + 1][colIndex]);
                }

                let group = '';
                if (rowIndex + 2 < data.length && data[rowIndex + 2]) {
                    group = cleanCellText(data[rowIndex + 2][colIndex]);
                }

                let cleanClass = classroom;
                let cleanGroup = group;

                if (cleanClass.toLowerCase().includes('grupo')) {
                    if (!cleanGroup) cleanGroup = cleanClass;
                    cleanClass = '';
                }

                rawSessions.push({
                    profesor: profesorNombre || 'Sin Nombre',
                    perfil: perfilProfesor,
                    claseBase: claseBase,
                    jornada: tipoJornada,
                    dia: diaIndex0,
                    franja: franjaIndex0,
                    actividad: subject,
                    clase: cleanClass,
                    aula: '',
                    grupo_desdoble: cleanGroup.trim() ? cleanGroup.trim() : null
                });
            }
        }
    }

    return rawSessions;
}

function extractProfesoradoMetadata(workbook: XLSX.WorkBook): Map<string, ProfesorMetadata> {
    const metaMap = new Map<string, ProfesorMetadata>();

    const sheetName = workbook.SheetNames.find((name) => {
        const clean = cleanCellText(name).toUpperCase();
        return clean === 'PROFESORADO';
    });

    if (!sheetName) return metaMap;

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return metaMap;

    const data = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: true });
    if (!data || data.length < 5) return metaMap;

    for (let i = 4; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        const rawNombre = row[0] ? cleanCellText(row[0]) : null;
        if (!rawNombre || isSheetOrMetadataToIgnore(rawNombre)) continue;

        const perfil = row[1] ? cleanCellText(row[1]) : '';
        const claseBase = row[2] ? cleanCellText(row[2]) : '';
        const jornada = row[3] ? cleanCellText(row[3]) : '';

        metaMap.set(normalizarNombreProfesor(rawNombre), {
            nombre: normalizarNombreProfesor(rawNombre),
            perfil: perfil || '',
            claseBase: claseBase || '',
            jornada: jornada || ''
        });
    }

    return metaMap;
}

function mergeAndConsolidateSessions(
    rawList: RawExtractedSession[],
    batchId: string,
    cursoEscolar: string
): StagingSessionRow[] {
    const map = new Map<string, {
        profesor: string;
        perfil: string;
        claseBase: string;
        jornada: string;
        dia: number;
        franja: number;
        actividades: Set<string>;
        clases: Set<string>;
        aulas: Set<string>;
        gruposDesdoble: Set<string>;
    }>();

    for (const item of rawList) {
        const profNormalizado = normalizarNombreProfesor(item.profesor);
        const key = `${profNormalizado}__${item.dia}__${item.franja}`;
        let existing = map.get(key);

        if (!existing) {
            existing = {
                profesor: profNormalizado || 'SIN NOMBRE',
                perfil: item.perfil,
                claseBase: item.claseBase,
                jornada: item.jornada,
                dia: item.dia,
                franja: item.franja,
                actividades: new Set(),
                clases: new Set(),
                aulas: new Set(),
                gruposDesdoble: new Set()
            };
            map.set(key, existing);
        }

        if (item.actividad) existing.actividades.add(item.actividad);

        if (item.clase) {
            item.clase.split(',').forEach((c) => {
                const trimmed = c.trim();
                if (trimmed.toLowerCase().includes('grupo')) {
                    existing.gruposDesdoble.add(trimmed);
                } else if (trimmed) {
                    existing.clases.add(trimmed);
                }
            });
        }

        if (item.aula) {
            item.aula.split(',').forEach((a) => {
                const trimmed = a.trim();
                if (trimmed.toLowerCase().includes('grupo')) {
                    existing.gruposDesdoble.add(trimmed);
                } else if (trimmed) {
                    existing.aulas.add(trimmed);
                }
            });
        }

        if (item.grupo_desdoble) {
            item.grupo_desdoble.split(',').forEach((g) => {
                const trimmed = g.trim();
                if (trimmed) existing.gruposDesdoble.add(trimmed);
            });
        }
    }

    const result: StagingSessionRow[] = [];

    for (const entry of map.values()) {
        const actFinal = Array.from(entry.actividades).join(' / ') || '';
        const claseFinal = Array.from(entry.clases).join(', ') || '';
        const aulaFinal = Array.from(entry.aulas).join(', ') || '';
        const grupoDesdobleFinal = Array.from(entry.gruposDesdoble).join(', ') || null;

        result.push({
            batch_id: batchId,
            profesor_nombre: entry.profesor || 'Sin Nombre',
            perfil_profesor: entry.perfil || '',
            clase_base: entry.claseBase || '',
            tipo_jornada: entry.jornada || '',
            dia: entry.dia,
            franja: entry.franja,
            actividad: actFinal,
            clase: claseFinal,
            aula: aulaFinal,
            grupo_desdoble: grupoDesdobleFinal,
            rol_aula: 'principal',
            fuente: 'excel_import',
            minutos: calculateMinutos(entry.franja),
            curso_escolar: cursoEscolar || '',
            estado_validacion: 'valido',
            errores: []
        });
    }

    return result;
}

export async function processAndUploadExcel(
    file: File,
    format: ImportFormat,
    cursoEscolar: string
): Promise<{ batchId: string; totalProcessed: number; validCount: number; errorCount: number }> {
    const batchId = crypto.randomUUID();
    const arrayBuffer = await file.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, raw: false });
    const profesorMetadataMap = extractProfesoradoMetadata(workbook);

    const tempRawList: RawExtractedSession[] = [];

    if (format === 'matriz_profesor') {
        const extracted = parseMultiSheetMatrixExcel(workbook, profesorMetadataMap);
        tempRawList.push(...extracted);
    } else if (format === 'periodo_multilinea') {
        const importedSessions = parseAscBlockExcel(arrayBuffer);
        for (const session of importedSessions) {
            const meta = profesorMetadataMap.get(normalizarNombreProfesor(session.teacher));
            const diaIndex0 = mapDayNameToNumberIndex0(session.day);

            let cleanAula = session.classroom ? session.classroom.trim() : '';
            let groupVal = session.grupo_desdoble || session.group || '';

            if (cleanAula) {
                const grupoMatch = cleanAula.match(/grupo\s*[\w\d]*/gi);
                if (grupoMatch) {
                    if (!groupVal) {
                        groupVal = grupoMatch.join(', ');
                    }
                    cleanAula = cleanAula.replace(/grupo\s*[\w\d]*/gi, '').trim();
                }
            }

            tempRawList.push({
                profesor: session.teacher,
                perfil: meta?.perfil || '',
                claseBase: meta?.claseBase || '',
                jornada: meta?.jornada || '',
                dia: diaIndex0,
                franja: session.dbFranja,
                actividad: session.subject,
                clase: '',
                aula: cleanAula,
                grupo_desdoble: groupVal.trim() ? groupVal.trim() : null
            });
        }
    }

    if (tempRawList.length === 0) {
        throw new Error('No se encontraron datos de sesiones válidos para procesar en el archivo.');
    }

    const rowsToInsert = mergeAndConsolidateSessions(tempRawList, batchId, cursoEscolar);

    const chunkSize = 1000;
    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
        const chunk = rowsToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('sesiones_staging').insert(chunk);

        if (error) {
            console.error('Error guardando bloque en sesiones_staging:', error);
            throw new Error(`Error al registrar borradores en staging: ${error.message}`);
        }
    }

    return {
        batchId,
        totalProcessed: rowsToInsert.length,
        validCount: rowsToInsert.length,
        errorCount: 0
    };
}