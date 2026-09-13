// Helper para formatear la jornada visualmente (JC o fracción)
export function formatJornada(jornadaRaw?: string | null): string {
    if (!jornadaRaw) return 'JC';
    const jLower = jornadaRaw.toLowerCase().trim();
    if (jLower.includes('completa') || jLower.includes('100') || jLower.includes('1/1') || jLower === 'jc' || jLower === 'completo') {
        return 'JC';
    }
    return jornadaRaw;
}

// Helper para formatear el rol visualmente (Tutor / Especialista)
export function formatRol(perfilRaw?: string | null): string {
    if (!perfilRaw) return 'Especialista';
    const pLower = perfilRaw.toLowerCase().trim();
    if (pLower.includes('tutor') || pLower.includes('tutoretza')) {
        return 'Tutor';
    }
    return 'Especialista';
}
