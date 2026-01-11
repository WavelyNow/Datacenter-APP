import { PIPE_STANDARDS } from '../pipeStandards';

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

// Helper to get pipe data safely
export const getPipeData = (material: string, size: string) => {
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
