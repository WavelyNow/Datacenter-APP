import { PipeSegment, EquipmentItem, FluidType } from '../types';
import { getPipeData, getFluidDensity, resolveInnerDiameterMm } from './common';

export const calculatePipeVolume = (segment: PipeSegment): number => {
    if (!segment) return 0;
    const innerDiameterMm = resolveInnerDiameterMm(segment);

    if (innerDiameterMm <= 0) return 0;

    const radius = innerDiameterMm / 2 / 1000; // convert mm to meters
    const area = Math.PI * Math.pow(radius, 2);
    const volumeCubicMeters = area * segment.length;

    return volumeCubicMeters * 1000; // convert to Liters
};

export const calculateTotalVolume = (
    segments: PipeSegment[],
    equipmentList: EquipmentItem[],
    safetyMargin: boolean,
    safetyMarginPercentage: number = 5
): number => {
    const pipesVolume = segments.reduce((sum, seg) => sum + (seg ? calculatePipeVolume(seg) : 0), 0);
    const equipmentVolume = equipmentList?.reduce((sum, item) => sum + (item.volume || 0), 0) || 0;

    const baseVolume = pipesVolume + equipmentVolume;

    // Use the user's CONFIGURED percentage (default 5% — no longer hardcoded)
    return safetyMargin ? baseVolume * (1 + safetyMarginPercentage / 100) : baseVolume;
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
    glycolPercentage: number = 0, // Default to water if not provided
    fluidType: FluidType = 'ethylene'
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
    const fluidDensity = getFluidDensity(glycolPercentage, fluidType);
    const fluidWeight = totalVolume * fluidDensity;

    const totalEmptyWeight = pipeEmptyWeight + equipmentEmptyWeight;

    return {
        emptyWeight: totalEmptyWeight,
        fluidWeight,
        totalWeight: totalEmptyWeight + fluidWeight
    };
};
