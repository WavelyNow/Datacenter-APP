import { EquipmentItem, PipeSegment } from '../types';
import { PIPE_STANDARDS } from '../pipeStandards';

interface SuggestedMaterial {
    id: string;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    notes?: string;
}

interface SuggestionResult {
    equipment: Partial<EquipmentItem>[];
    segments: Partial<PipeSegment>[];
    materials: SuggestedMaterial[];
}

export const analyzeSpecifications = (text: string): SuggestionResult => {
    const result: SuggestionResult = {
        equipment: [],
        segments: [],
        materials: []
    };

    const lowerText = text.toLowerCase();

    // 1. Cooling Capacity Extraction (e.g., "50kW", "50 kW")
    const coolingMatch = lowerText.match(/(\d+)\s*kw/);
    if (coolingMatch) {
        const capacity = parseInt(coolingMatch[1]);
        
        // Suggest Chiller based on capacity
        result.equipment.push({
            id: `suggested-chiller-${Date.now()}`,
            name: `Chiller ${capacity}kW`,
            type: 'Chiller',
            volume: Math.ceil(capacity * 1.5), // Heuristic: 1.5L per kW
            weight: capacity * 20, // Heuristic: 20kg per kW
            notes: `Sugerat automat bazat pe capacitatea de ${capacity}kW detectată.`,
            power: capacity
        });

        // Detect Redundancy (N+1, 2N)
        if (lowerText.includes('n+1')) {
            result.equipment.push({
                id: `suggested-chiller-redundant-${Date.now()}`,
                name: `Chiller Rezervă (N+1) ${capacity}kW`,
                type: 'Chiller',
                volume: Math.ceil(capacity * 1.5),
                weight: capacity * 20,
                notes: 'Redundanță N+1 detectată în specificații.'
            });
        }
    }

    // 2. Piping Extraction (e.g., "100m", "DN50")
    // IMPORTANT: match only pure meters, NOT "600mm"/"30min"/"2N".
    const lengthMatches = [...lowerText.matchAll(/(?<![\w.,])(\d+(?:[.,]\d+)?)\s*m(?![\w])/g)];
    const sizeMatch = lowerText.match(/dn\s*(\d+)/);

    if (lengthMatches.length > 0 || sizeMatch) {
        // Use the LONGEST detected run as the main run (most representative)
        const detectedLengths = lengthMatches.map(m => parseFloat(m[1].replace(',', '.')));
        const pipeLength = detectedLengths.length > 0 ? Math.max(...detectedLengths) : 0;

        // Resolve a real diameter: detected DN, else plausible default DN50
        const dnDetected = sizeMatch ? `DN${sizeMatch[1]}` : null;
        // Cautam in toate seriile de otel (light -> medium -> heavy) — DN150+ nu e in light
        const steelSeries = ['steel_light', 'steel_medium', 'steel_heavy'];
        let steel: { dn: string; id: number; od: number; thickness: number; weight: number } | null = null;
        let steelLabel = '';
        let fallbackId = 54.5; // DN50 ID — fallback real (nu 0!) pentru DN-uri mari fara potrivire
        for (const key of steelSeries) {
            const std = PIPE_STANDARDS[key];
            const dim = std?.dimensions.find(d => d.dn === dnDetected) ?? null;
            if (dim) { steel = dim; steelLabel = std.label; break; }
        }
        // fallback: cauta in toate standardele cea mai apropiata dimensiune ca ID
        if (!steel && dnDetected) {
            const dnNum = parseInt(dnDetected.replace(/\D+/g, ''), 10) || 0;
            let best: { id: number } | null = null;
            let bestDiff = Infinity;
            for (const std of Object.values(PIPE_STANDARDS)) {
                for (const dim of std.dimensions) {
                    if (!dim.id) continue;
                    const diff = Math.abs(parseInt(dim.dn.replace(/\D+/g, ''), 10) - dnNum);
                    if (diff < bestDiff) { bestDiff = diff; best = dim; }
                }
            }
            if (best) fallbackId = best.id;
        }

        result.segments.push({
            id: `suggested-seg-${Date.now()}`,
            name: pipeLength > 0
                ? `Traseu Sugerat (${pipeLength}m${dnDetected ?? ''})`
                : 'Traseu Sugerat (LUNGIME IMPLICITĂ — confirmați 10m)',
            material: steel ? 'steel_light' : 'custom',
            size: dnDetected ?? 'DN50',
            length: pipeLength > 0 ? pipeLength : 10,
            customInnerDiameter: steel ? undefined : fallbackId,
            fluid: 'Apă Glicolată',
            standard: steel ? (steelLabel || 'EN 10255') : 'ISO 4200'
        });
    }

    // 3. Room Preparation (e.g., "Podea supraînălțată", "600mm", "geam 1.5m")
    if (lowerText.includes('podea') || lowerText.includes('supraînalțată')) {
        result.materials.push({
            id: `material-floor-${Date.now()}`,
            category: 'Other',
            description: 'Sistem Podea Supraînălțată',
            quantity: 1,
            unit: 'lot',
            notes: 'Detectat din specificații podea.'
        });
    }

    // 4. Window & Insulation Detection
    const windowMatch = lowerText.match(/(?:geam|fereastra|window)\s*(\d+(?:[.,]\d+)?)\s*m/i);
    if (windowMatch || lowerText.includes('geam') || lowerText.includes('izolație geam')) {
        const height = windowMatch ? parseFloat(windowMatch[1]) : 0;
        const needsStructure = height > 1.2 || lowerText.includes('structura') || lowerText.includes('suport');
        const needsInsulation = lowerText.includes('izolație') || lowerText.includes('termic') || lowerText.includes('soare');

        result.materials.push({
            id: `material-window-${Date.now()}`,
            category: 'Architecture',
            description: `Sistem Izolare/Structură Geam ${height > 0 ? `(h=${height}m)` : ''}`,
            quantity: 1,
            unit: 'buc',
            notes: `AI: ${needsStructure ? 'Necesită structură metalică (înălțime > 1.2m). ' : ''}${needsInsulation ? 'Necesită folie termică/triplu vitraj.' : ''}`
        });
    }

    return result;
};
