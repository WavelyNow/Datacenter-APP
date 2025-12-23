import { PipeSegment, EquipmentItem } from './types';
import { PIPE_STANDARDS } from './pipeStandards';
import { getRecommendedSupport, SupportProfile } from './supportStandards';

// Helper to get pipe data safely
const getPipeData = (material: string, size: string) => {
    if (material === 'custom') return null;
    const standard = PIPE_STANDARDS[material];
    if (!standard) return null;
    return standard.dimensions.find(d => d.dn === size);
};

// Precise density interpolation for Ethylene Glycol at 20°C
export const getFluidDensity = (percentage: number): number => {
    // Data points: [Percentage, Density kg/L]
    const points = [
        [0, 1.000],
        [10, 1.011],
        [20, 1.024],
        [30, 1.038],
        [40, 1.051],
        [50, 1.065],
        [60, 1.077],
        [100, 1.115]
    ];

    // Clamp percentage
    const p = Math.max(0, Math.min(100, percentage));

    // Find the two points surrounding P
    for (let i = 0; i < points.length - 1; i++) {
        const [p1, d1] = points[i];
        const [p2, d2] = points[i + 1];

        if (p >= p1 && p <= p2) {
            // Linear interpolation
            const ratio = (p - p1) / (p2 - p1);
            return d1 + (d2 - d1) * ratio;
        }
    }

    return 1.000; // Fallback
};

export const calculatePipeVolume = (segment: PipeSegment): number => {
    if (!segment) return 0;
    let innerDiameterMm = 0;

    if (segment.material === 'custom') {
        innerDiameterMm = segment.customInnerDiameter || 0;
    } else {
        const pipeData = getPipeData(segment.material, segment.size);
        if (pipeData) {
            innerDiameterMm = pipeData.id;
        }
    }

    if (innerDiameterMm <= 0) return 0;

    const radius = innerDiameterMm / 2 / 1000; // convert mm to meters
    const area = Math.PI * Math.pow(radius, 2);
    const volumeCubicMeters = area * segment.length;

    return volumeCubicMeters * 1000; // convert to Liters
};

export const calculateTotalVolume = (
    segments: PipeSegment[],
    equipmentList: EquipmentItem[],
    safetyMargin: boolean
): number => {
    const pipesVolume = segments.reduce((sum, seg) => sum + (seg ? calculatePipeVolume(seg) : 0), 0);
    const equipmentVolume = equipmentList?.reduce((sum, item) => sum + (item.volume || 0), 0) || 0;

    const baseVolume = pipesVolume + equipmentVolume;

    return safetyMargin ? baseVolume * 1.05 : baseVolume;
};

export const calculateGlycolVolume = (totalVolume: number, percentage: number): number => {
    return totalVolume * (percentage / 100);
};

export const calculateWaterVolume = (totalVolume: number, percentage: number): number => {
    return totalVolume * (1 - percentage / 100);
};

export const calculateSystemWeight = (
    segments: PipeSegment[],
    equipmentList: EquipmentItem[],
    totalVolume: number,
    glycolPercentage: number = 0 // Default to water if not provided
): { emptyWeight: number; fluidWeight: number; totalWeight: number } => {

    // 1. Calculate Total Empty Pipe Weight
    const pipeEmptyWeight = segments.reduce((sum, seg) => {
        if (!seg) return sum;
        let weightPerMeter = 0;

        if (seg.material === 'custom') {
            weightPerMeter = seg.customWeight || 0;
        } else {
            const pipeData = getPipeData(seg.material, seg.size);
            if (pipeData) {
                weightPerMeter = pipeData.weight;
            }
        }
        return sum + (weightPerMeter * seg.length);
    }, 0);

    // 2. Calculate Empty Equipment Weight
    const equipmentEmptyWeight = equipmentList?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;

    // 3. Calculate Fluid Weight
    const fluidDensity = getFluidDensity(glycolPercentage);
    const fluidWeight = totalVolume * fluidDensity;

    const totalEmptyWeight = pipeEmptyWeight + equipmentEmptyWeight;

    return {
        emptyWeight: totalEmptyWeight,
        fluidWeight,
        totalWeight: totalEmptyWeight + fluidWeight
    };
};

export interface BoQItem {
    id: string;
    materialName: string;
    standardName: string;
    size: string;
    totalLength: number;
}

export const generateBoQ = (segments: PipeSegment[]): BoQItem[] => {
    const boqMap = new Map<string, BoQItem>();

    segments.forEach(segment => {
        if (!segment) return;
        let key = '';
        let materialName = '';
        let standardName = '';
        let sizeName = '';

        if (segment.material === 'custom') {
            key = `custom|manual|${segment.customInnerDiameter}`;
            materialName = 'Otel/Custom (Manual)';
            standardName = 'N/A';
            sizeName = `ID: ${segment.customInnerDiameter}mm`;
        } else {
            key = `${segment.material}|${segment.size}`;

            // Get pretty name from standards
            const standard = PIPE_STANDARDS[segment.material];
            materialName = standard ? standard.label : segment.material;
            standardName = 'Standard';
            sizeName = segment.size;
        }

        if (boqMap.has(key)) {
            const item = boqMap.get(key)!;
            item.totalLength += segment.length;
        } else {
            boqMap.set(key, {
                id: key,
                materialName: materialName,
                standardName: standardName,
                size: sizeName,
                totalLength: segment.length
            });
        }
    });

    // Convert map to array and sort by material name then size
    return Array.from(boqMap.values()).sort((a, b) => {
        if (a.materialName !== b.materialName) {
            return a.materialName.localeCompare(b.materialName);
        }
        return a.size.localeCompare(b.size, undefined, { numeric: true, sensitivity: 'base' });
    });
};

export interface DetailedWeightItem {
    id: string;
    description: string;
    quantity: string;
    emptyWeight: number;
    fluidWeight: number;
    totalWeight: number;
    type: 'pipe' | 'equipment';
}

export const getDetailedWeightReport = (
    segments: PipeSegment[],
    equipmentList: EquipmentItem[],
    glycolPercentage: number
): DetailedWeightItem[] => {
    const report: DetailedWeightItem[] = [];
    const fluidDensity = getFluidDensity(glycolPercentage);

    // 1. Process Pipe Segments
    segments.forEach(seg => {
        if (!seg) return;
        let weightPerMeter = 0;
        let innerDiameterMm = 0;
        let description = '';

        if (seg.material === 'custom') {
            weightPerMeter = seg.customWeight || 0;
            innerDiameterMm = seg.customInnerDiameter || 0;
            description = `Teava Custom: ID ${innerDiameterMm}mm`;
        } else {
            const standard = PIPE_STANDARDS[seg.material];
            const pipeData = getPipeData(seg.material, seg.size);

            if (standard && pipeData) {
                weightPerMeter = pipeData.weight;
                innerDiameterMm = pipeData.id;
                description = `Teava ${standard.label} - ${seg.size}`;
            } else {
                description = `Unknown Pipe: ${seg.material} - ${seg.size}`;
            }
        }

        const emptyWeight = weightPerMeter * seg.length;

        const radius = innerDiameterMm / 2 / 1000;
        const area = Math.PI * Math.pow(radius, 2);
        const volLitres = (area * seg.length) * 1000;
        const fluidWeight = volLitres * fluidDensity;

        report.push({
            id: seg.id,
            description,
            quantity: `${seg.length.toFixed(2)} m`,
            emptyWeight,
            fluidWeight,
            totalWeight: emptyWeight + fluidWeight,
            type: 'pipe'
        });
    });

    // 2. Process Equipment
    equipmentList?.forEach(item => {
        const fluidWeight = (item.volume || 0) * fluidDensity;
        const emptyWeight = item.weight || 0;

        report.push({
            id: item.id,
            description: `Echipament: ${item.type} (${item.name || 'Fără Nume'})`,
            quantity: "1 buc",
            emptyWeight: emptyWeight,
            fluidWeight,
            totalWeight: emptyWeight + fluidWeight,
            type: 'equipment'
        });
    });

    return report;
};

// --- SUPPORT CALCULATIONS ---

export interface SupportItem {
    segmentId: string;
    description: string;
    length: number; // m
    spacing: number;
    loadPerPoint: number; // kg
    recommendedSupport: SupportProfile;
    quantity: number;
    mountingType: 'concrete' | 'suspended';
    pipesPerSupport: number;
    anchorReaction: number; // kg per anchor point
}

export const calculateSupportReport = (
    segments: PipeSegment[],
    glycolPercentage: number,
    config: { spacing: number, mountingType: 'concrete' | 'suspended', pipesPerSupport: number }
): SupportItem[] => {
    const spacing = config.spacing;
    const fluidDensity = getFluidDensity(glycolPercentage);

    return segments.map(seg => {
        if (!seg) return null; // Handle nulls in map
        let weightPerMeterEmpty = 0;
        let innerDiameterMm = 0;
        let description = '';

        if (seg.material === 'custom') {
            weightPerMeterEmpty = seg.customWeight || 0;
            innerDiameterMm = seg.customInnerDiameter || 0;
            description = `Teava Custom: ID ${innerDiameterMm}mm`;
        } else {
            const standard = PIPE_STANDARDS[seg.material];
            const pipeData = getPipeData(seg.material, seg.size);
            if (standard && pipeData) {
                weightPerMeterEmpty = pipeData.weight;
                innerDiameterMm = pipeData.id;
                description = `Teava ${standard.label} - ${seg.size}`;
            } else {
                description = `Unknown ${seg.material}`;
            }
        }

        // Fluid Weight per meter
        const radius = innerDiameterMm / 2 / 1000; // m
        const area = Math.PI * Math.pow(radius, 2); // m^2
        const volPerMeter = area * 1000; // Liters per meter
        const fluidWeightPerMeter = volPerMeter * fluidDensity;

        const totalWeightPerMeter = weightPerMeterEmpty + fluidWeightPerMeter;

        // Point Load = (Weight per meter * Spacing) * config.pipesPerSupport
        const pointLoad = (totalWeightPerMeter * spacing) * config.pipesPerSupport;

        // Recommended Support
        const recommendedSupport = getRecommendedSupport(pointLoad);

        // Anchor Reaction (Pull-out force)
        // We add a 20% safety factor for dynamic loads/vibrations
        const anchorReaction = (pointLoad * 1.2) / 2;

        // Quantity (Total Length / Spacing, round up)
        const quantity = Math.ceil(seg.length / spacing) + 1;

        return {
            segmentId: seg.id,
            description,
            length: seg.length,
            spacing,
            loadPerPoint: pointLoad,
            recommendedSupport,
            quantity,
            mountingType: config.mountingType,
            pipesPerSupport: config.pipesPerSupport,
            anchorReaction
        };
    }).filter(item => item !== null) as SupportItem[];
};
