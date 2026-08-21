
import { PipeSegment, EquipmentItem, FluidType } from '@/lib/types';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { getFluidDensity } from '@/lib/calculations/common';

export interface SystemResources {
    // Volumes (Liters)
    totalPipingVolume: number;
    totalEquipmentVolume: number;
    baseSystemVolume: number; // Pipes + Equipment

    // Safety
    safetyMarginStats: { enabled: boolean; percentage: number };
    safetyMarginVolume: number;

    // Final
    totalSystemVolume: number; // Base + Safety

    // Breakdowns (still useful for engineering, but maybe less for purchasing)
    waterContentVolume: number;
    pureChemicalVolume: number;

    // Weights (Kg)
    totalEquipmentWeight: number; // Empty
    totalPipingWeight: number;    // Empty (approx)
    totalFluidWeight: number;
    totalOperationalWeight: number;
}

export const calculateSystemResources = (
    segments: PipeSegment[],
    equipmentList: EquipmentItem[],
    glycolPercentage: number,
    safetyMarginStats: { enabled: boolean; percentage: number },
    fluidType: FluidType = 'ethylene'
): SystemResources => {

    // 1. Piping Volume + Weight
    let totalPipingVolume = 0;
    let totalPipingWeight = 0;

    for (const s of segments) {
        let id_mm = 0;
        let weightPerM = 0;
        if (s.material === 'custom') {
            id_mm = s.customInnerDiameter || 0;
            weightPerM = s.customWeight || 0;
        } else {
            const standard = PIPE_STANDARDS[s.material];
            if (standard) {
                const pipe = standard.dimensions.find(d => d.dn === s.size);
                if (pipe) {
                    id_mm = pipe.id;
                    weightPerM = pipe.weight || 0;
                }
            }
        }

        // Volume = Pi * r^2 * h
        // Convert mm to dm: 1 dm = 100 mm
        const radius_dm = (id_mm / 100) / 2;
        const length_dm = s.length * 10; // 1 m = 10 dm

        const vol_liters = Math.PI * Math.pow(radius_dm, 2) * length_dm;
        totalPipingVolume += vol_liters;
        totalPipingWeight += weightPerM * s.length;
    }

    // 2. Equipment Volume
    const totalEquipmentVolume = equipmentList.reduce((sum, eq) => sum + (eq.volume || 0), 0);

    // 3. Base System Volume
    const baseSystemVolume = totalPipingVolume + totalEquipmentVolume;

    // 4. Safety Margin
    const safetyMarginVolume = safetyMarginStats.enabled
        ? baseSystemVolume * (safetyMarginStats.percentage / 100)
        : 0;

    // Round UP to nearest 10L for purchasing cans
    const rawTotal = baseSystemVolume + safetyMarginVolume;
    const totalSystemVolume = Math.ceil(rawTotal / 10) * 10;

    // 5. Chemical Composition (Internal Engineering Data)
    const pureChemicalVolume = totalSystemVolume * (glycolPercentage / 100);
    const waterContentVolume = totalSystemVolume - pureChemicalVolume;

    // 6. Weights (Simplified)
    const totalEquipmentWeight = equipmentList.reduce((sum, eq) => sum + (eq.weight || 0), 0);

    // Fluid density via the SINGLE source of truth (glycol-type aware)
    const fluidDensity = getFluidDensity(glycolPercentage, fluidType) * 1000; // kg/L → kg/m³ (density per L used below)
    const totalFluidWeight = totalSystemVolume * (fluidDensity / 1000); // L × kg/L

    const totalOperationalWeight = totalEquipmentWeight + totalPipingWeight + totalFluidWeight;

    return {
        totalPipingVolume,
        totalEquipmentVolume,
        baseSystemVolume,
        safetyMarginStats,
        safetyMarginVolume,
        totalSystemVolume,
        waterContentVolume,
        pureChemicalVolume,
        totalEquipmentWeight,
        totalPipingWeight,
        totalFluidWeight,
        totalOperationalWeight
    };
};
