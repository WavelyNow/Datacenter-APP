import { PipeSegment, EquipmentItem, FluidType } from '../types';
import { PIPE_STANDARDS } from '../pipeStandards';
import { getPipeData, getFluidDensity } from './common';

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
    glycolPercentage: number,
    fluidType: FluidType = 'ethylene'
): DetailedWeightItem[] => {
    const report: DetailedWeightItem[] = [];
    const fluidDensity = getFluidDensity(glycolPercentage, fluidType);

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
