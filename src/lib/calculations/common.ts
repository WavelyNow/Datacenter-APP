import { PIPE_STANDARDS } from '../pipeStandards';
import { FluidType } from '../types';

// Accessory Weights (Estimated Average)
export const ACCESSORY_WEIGHTS = {
    ANCHOR: 0.15, // kg (M10/M12)
    CLAMP_SMALL: 0.25, // kg (< DN50)
    CLAMP_MEDIUM: 0.55, // kg (DN50 - DN100)
    CLAMP_LARGE: 1.20, // kg (> DN100)
    BOLT_SET: 0.08, // kg (Bolt + Nut + Washer)
    CONEXPAND: 0.12 // kg
};

// Helper to estimate clamp weight based on size
export const getClampWeight = (sizeStr: string): number => {
    const size = parseInt(sizeStr.replace(/\D/g, '')) || 50;
    if (size <= 50) return ACCESSORY_WEIGHTS.CLAMP_SMALL;
    if (size <= 100) return ACCESSORY_WEIGHTS.CLAMP_MEDIUM;
    return ACCESSORY_WEIGHTS.CLAMP_LARGE;
};

/** Diametrul interior REAL (mm) al unui segment — SINGURA sursa comuna.
 *  Prioritate documentata: custom -> diameter explicit (BIM) -> standard.
 *  Regula pentru `diameter`: daca e EXACT numarul DN din nume (ex. 100 pt
 *  DN100) il tratam ca DN nominal si folosim ID-ul real din standard;
 *  altfel il folosim ca diametru interior explicit (valoare BIM). */
export function resolveInnerDiameterMm(segment: { material: string; size: string; customInnerDiameter?: number; diameter?: number } | null | undefined): number {
    if (!segment) return 0;
    if (segment.material === 'custom' && segment.customInnerDiameter && segment.customInnerDiameter > 0) {
        return segment.customInnerDiameter;
    }
    const dim = getPipeData(segment.material, segment.size);
    if (segment.diameter && segment.diameter > 0) {
        const dnNum = parseInt(String(segment.size).replace(/\D+/g, ''), 10);
        const isNominalDn = dnNum > 0 && Math.abs(segment.diameter - dnNum) < 0.6;
        if (!isNominalDn) {
            return segment.diameter; // valoare explicită de ID (BIM/custom numeric)
        }
    }
    return dim?.id || 0;
}

// Helper to get pipe data safely
export const getPipeData = (material: string, size: string) => {
    if (material === 'custom') return null;
    const standard = PIPE_STANDARDS[material];
    if (!standard) return null;
    return standard.dimensions.find(d => d.dn === size);
};

// Precise density interpolation for glycol-water mixtures at 20°C (VOLUME %)
// Water: 0.998 kg/L @20°C. Ethylene Glycol (EG) & Propylene Glycol (PG) per
// ASHRAE Handbook—Fundamentals Ch.31 / Dow tables (%vol, 20°C).
const DENSITY_POINTS: Record<FluidType, [number, number][]> = {
    water: [[0, 0.998]],
    ethylene: [
        [0, 0.998],
        [10, 1.011],
        [20, 1.024],
        [30, 1.038],
        [40, 1.051],
        [50, 1.065],
        [60, 1.077],
        [80, 1.098],
        [100, 1.113]
    ],
    propylene: [
        [0, 0.998],
        [10, 1.008],
        [20, 1.016],
        [30, 1.024],
        [40, 1.032],
        [50, 1.041],
        [60, 1.050],
        [80, 1.063],
        [100, 1.036] // neat PG 1.036 at 20°C (non-monotonic at high %, keep table)
    ]
};

/**
 * Density of a glycol-water mixture at 20°C in kg/L.
 * @param percentage volume % of glycol (0–100)
 * @param fluidType 'water' | 'ethylene' | 'propylene' (default 'ethylene' — backward compatible)
 */
export const getFluidDensity = (percentage: number, fluidType: FluidType = 'ethylene'): number => {
    if (fluidType === 'water') return 0.998;
    const points = DENSITY_POINTS[fluidType] ?? DENSITY_POINTS['ethylene'];

    const p = Math.max(0, Math.min(100, percentage));

    for (let i = 0; i < points.length - 1; i++) {
        const [p1, d1] = points[i];
        const [p2, d2] = points[i + 1];

        if (p >= p1 && p <= p2) {
            const ratio = (p1 === p2) ? 0 : (p - p1) / (p2 - p1);
            return d1 + (d2 - d1) * ratio;
        }
    }

    return 0.998; // Fallback
};
