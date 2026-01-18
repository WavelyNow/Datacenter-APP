
import { PipeSegment, EquipmentItem } from '@/lib/types';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';

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
    safetyMarginStats: { enabled: boolean; percentage: number }
): SystemResources => {

    // 1. Piping Volume
    const totalPipingVolume = segments.reduce((sum, s) => {
        let id_mm = 0;
        if (s.material === 'custom') {
            id_mm = s.customInnerDiameter || 0;
        } else {
            const standard = PIPE_STANDARDS[s.material];
            if (standard) {
                const pipe = standard.dimensions.find(d => d.dn === s.size);
                if (pipe) id_mm = pipe.id;
            }
        }

        // Volume = Pi * r^2 * h
        // Convert mm to dm: 1 dm = 100 mm
        const radius_dm = (id_mm / 100) / 2;
        const length_dm = s.length * 10; // 1 m = 10 dm

        const vol_liters = Math.PI * Math.pow(radius_dm, 2) * length_dm;
        return sum + vol_liters;
    }, 0);

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

    // Fluid Density approx (Water=1kg/L, Glycol~1.11kg/L pure -> Mixed density linear approx)
    // 30% Glycol density approx 1.045 kg/L
    const fluidDensity = 1 + (glycolPercentage * 0.0015); // Rough linear approx
    const totalFluidWeight = totalSystemVolume * fluidDensity;

    // Pipe Weight estimation would require standard weight data per meter
    const totalPipingWeight = 0; // Placeholder for future expansion

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
