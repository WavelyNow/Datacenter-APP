import { EquipmentItem, PipeSegment } from '../types';

interface SuggestionResult {
    equipment: Partial<EquipmentItem>[];
    segments: Partial<PipeSegment>[];
    materials: any[];
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
    const lengthMatch = lowerText.match(/(\d+)\s*m/);
    const sizeMatch = lowerText.match(/dn\s*(\d+)/);

    if (lengthMatch || sizeMatch) {
        result.segments.push({
            id: `suggested-seg-${Date.now()}`,
            name: 'Traseu Sugerat',
            material: lowerText.includes('otel') || lowerText.includes('oțel') ? 'custom' : 'custom',
            size: sizeMatch ? `DN${sizeMatch[1]}` : 'DN50',
            length: lengthMatch ? parseInt(lengthMatch[1]) : 10,
            fluid: 'Apă Glicolată',
            standard: 'ISO 4200'
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
