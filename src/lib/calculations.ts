import { PipeSegment, EquipmentItem } from './types';
import { PIPE_STANDARDS } from './pipeStandards';

// Helper to get pipe data safely
const getPipeData = (material: string, size: string) => {
    if (material === 'custom') return null;
    const standard = PIPE_STANDARDS[material];
    if (!standard) return null;
    return standard.dimensions.find(d => d.dn === size);
};

export const calculatePipeVolume = (segment: PipeSegment): number => {
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
    const pipesVolume = segments.reduce((sum, seg) => sum + calculatePipeVolume(seg), 0);
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
    totalVolume: number
): { emptyWeight: number; fluidWeight: number; totalWeight: number } => {

    // 1. Calculate Total Empty Pipe Weight
    const pipeEmptyWeight = segments.reduce((sum, seg) => {
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
    // Assumption: Glycol mix density approx 1.05 kg/L.
    const fluidDensity = 1.05;
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
    const fluidDensity = 1.05;

    // 1. Process Pipe Segments
    segments.forEach(seg => {
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
                // Fallback / Error case
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
