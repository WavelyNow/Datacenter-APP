import { PipeSegment, EquipmentItem } from './types';
import { PIPE_DATABASE, PipeMaterial } from './constants';

export const calculatePipeVolume = (segment: PipeSegment): number => {
    let innerDiameterMm = 0;

    if (segment.material === 'custom') {
        innerDiameterMm = segment.customInnerDiameter || 0;
    } else {
        // Correctly cast material to the Key type
        const materialData = PIPE_DATABASE[segment.material as PipeMaterial];
        if (!materialData) return 0;

        // In the new structure, standards are keys in the material object
        // @ts-ignore - Dynamic access to standard keys
        const standardData = materialData[segment.standard];
        if (!standardData) return 0;

        const pipeInfo = standardData[segment.size];
        if (!pipeInfo) return 0;

        innerDiameterMm = pipeInfo.id_mm;
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
    const equipmentVolume = equipmentList.reduce((sum, item) => sum + (item.volume || 0), 0);

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
    totalVolume: number
): { emptyWeight: number; fluidWeight: number; totalWeight: number } => {
    // 1. Calculate Empty Pipe Weight
    const emptyWeight = segments.reduce((sum, seg) => {
        let weightPerMeter = 0;

        if (seg.material === 'custom') {
            weightPerMeter = seg.customWeight || 0;
        } else {
            const materialData = PIPE_DATABASE[seg.material as PipeMaterial];
            if (!materialData) return sum;

            // @ts-ignore
            const standardData = materialData[seg.standard];
            if (!standardData) return sum;

            const pipeInfo = standardData[seg.size];
            if (!pipeInfo) return sum;

            weightPerMeter = pipeInfo.weight_kg_m;
        }

        return sum + (weightPerMeter * seg.length);
    }, 0);

    // 2. Calculate Fluid Weight
    // Assumption: Glycol mix density approx 1.05 kg/L.
    const fluidDensity = 1.05;
    const fluidWeight = totalVolume * fluidDensity;

    return {
        emptyWeight,
        fluidWeight,
        totalWeight: emptyWeight + fluidWeight
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
            key = `${segment.material}|${segment.standard}|${segment.size}`;
            materialName = segment.material;
            standardName = segment.standard;
            sizeName = segment.size;
        }

        if (boqMap.has(key)) {
            const item = boqMap.get(key)!;
            item.totalLength += segment.length;
        } else {
            // Validate standard if not custom
            if (segment.material !== 'custom') {
                const materialData = PIPE_DATABASE[segment.material as PipeMaterial];
                if (!materialData) return;
                // @ts-ignore
                const standardData = materialData[segment.standard];
                if (!standardData) return;
            }

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
            description = `Pipe Custom: ID ${innerDiameterMm}mm`;
        } else {
            const materialData = PIPE_DATABASE[seg.material as PipeMaterial];
            if (materialData) {
                // @ts-ignore
                const standardData = materialData[seg.standard];
                if (standardData) {
                    const pipeInfo = standardData[seg.size];
                    if (pipeInfo) {
                        weightPerMeter = pipeInfo.weight_kg_m;
                        innerDiameterMm = pipeInfo.id_mm;
                        description = `Pipe: ${seg.material} - ${seg.size}`;
                    }
                }
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
            totalWeight: emptyWeight + fluidWeight
        });
    });

    // 2. Process Equipment
    equipmentList.forEach(item => {
        const fluidWeight = (item.volume || 0) * fluidDensity;
        const emptyWeight = item.weight || 0; // Ensure we take the manual weight

        report.push({
            id: item.id,
            description: `Echipament: ${item.type} (${item.name || 'Fără Nume'})`,
            quantity: "1 buc",
            emptyWeight: emptyWeight,
            fluidWeight,
            totalWeight: emptyWeight + fluidWeight
        });
    });

    return report;
};
