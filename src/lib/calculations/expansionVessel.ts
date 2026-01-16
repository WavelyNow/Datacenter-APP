/**
 * Expansion Vessel Sizing Calculator
 * Based on EN 12828 standard for closed water-based heating systems
 * 
 * Calculates the required expansion vessel volume to accommodate
 * thermal expansion of glycol/water mixture in datacenter cooling systems.
 */

import { FluidType } from '../types';

// ============================================================================
// Constants and Data
// ============================================================================

// Water expansion coefficients at different temperatures (relative to 10°C)
// Format: [temperature °C, expansion coefficient]
const WATER_EXPANSION: [number, number][] = [
    [10, 0.00027],
    [20, 0.00177],
    [30, 0.00435],
    [40, 0.00782],
    [50, 0.01207],
    [60, 0.01700],
    [70, 0.02253],
    [80, 0.02860],
    [90, 0.03516],
    [100, 0.04215],
];

// Glycol expansion multiplier (glycol expands more than water)
const GLYCOL_EXPANSION_MULTIPLIER: Record<number, number> = {
    0: 1.00,   // Pure water
    10: 1.02,
    20: 1.05,
    30: 1.08,
    40: 1.12,
    50: 1.16,
    60: 1.20,
};

// Standard vessel sizes (liters)
const STANDARD_VESSEL_SIZES = [8, 12, 18, 24, 35, 50, 80, 100, 150, 200, 300, 400, 500, 600, 800, 1000];

// ============================================================================
// Types
// ============================================================================

export interface ExpansionVesselInput {
    systemVolume: number;          // Total system volume in liters
    glycolPercentage: number;      // Glycol concentration (0-60%)
    fluidType: FluidType;          // ethylene, propylene, or water
    minTemperature: number;        // Fill/ambient temperature (°C)
    maxTemperature: number;        // Maximum operating temperature (°C)
    staticHeight: number;          // Height of highest point above vessel (m)
    safetyValvePressure: number;   // Safety valve set pressure (bar gauge)
}

export interface ExpansionVesselResult {
    // Calculated values
    expansionVolume: number;       // Volume of fluid expansion (L)
    expansionCoefficient: number;  // Combined expansion coefficient
    waterReserve: number;          // Water reserve / initial charge (L)

    // Pressures
    staticPressure: number;        // Static pressure from height (bar)
    prechargePressure: number;     // Required precharge pressure (bar)
    fillPressure: number;          // Recommended fill pressure (bar)
    maxPressure: number;           // Maximum allowable pressure (bar)

    // Sizing
    requiredVolume: number;        // Minimum required vessel volume (L)
    recommendedVessel: number;     // Recommended standard size (L)

    // Efficiency
    acceptanceFactor: number;      // Vessel utilization factor (0-1)

    // Validation
    isValid: boolean;
    warnings: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get water expansion coefficient at a given temperature
 * Uses linear interpolation between data points
 */
function getWaterExpansion(temperature: number): number {
    if (temperature <= 10) return 0;
    if (temperature >= 100) return WATER_EXPANSION[WATER_EXPANSION.length - 1][1];

    for (let i = 0; i < WATER_EXPANSION.length - 1; i++) {
        const [t1, e1] = WATER_EXPANSION[i];
        const [t2, e2] = WATER_EXPANSION[i + 1];

        if (temperature >= t1 && temperature <= t2) {
            const ratio = (temperature - t1) / (t2 - t1);
            return e1 + (e2 - e1) * ratio;
        }
    }

    return 0;
}

/**
 * Get glycol expansion multiplier
 */
function getGlycolMultiplier(glycolPercentage: number): number {
    const p = Math.max(0, Math.min(60, glycolPercentage));

    const percentages = Object.keys(GLYCOL_EXPANSION_MULTIPLIER).map(Number).sort((a, b) => a - b);

    for (let i = 0; i < percentages.length - 1; i++) {
        const p1 = percentages[i];
        const p2 = percentages[i + 1];

        if (p >= p1 && p <= p2) {
            const m1 = GLYCOL_EXPANSION_MULTIPLIER[p1];
            const m2 = GLYCOL_EXPANSION_MULTIPLIER[p2];
            const ratio = (p - p1) / (p2 - p1);
            return m1 + (m2 - m1) * ratio;
        }
    }

    return GLYCOL_EXPANSION_MULTIPLIER[60];
}

/**
 * Find the smallest standard vessel size that meets requirements
 */
function findStandardSize(requiredVolume: number): number {
    for (const size of STANDARD_VESSEL_SIZES) {
        if (size >= requiredVolume) {
            return size;
        }
    }
    // If larger than all standard sizes, round up to nearest 100L
    return Math.ceil(requiredVolume / 100) * 100;
}

// ============================================================================
// Main Calculation Function
// ============================================================================

/**
 * Calculate expansion vessel sizing according to EN 12828
 * 
 * Formula: Ve = (Vt × e + Vv) / [(pf + 1) / (p0 + 1) - (pf + 1) / (pe + 1)]
 * 
 * Where:
 * - Ve = Expansion vessel volume
 * - Vt = Total system volume
 * - e = Expansion coefficient
 * - Vv = Water reserve (typically 0.5-1% of Vt, min 3L)
 * - pf = Final pressure (safety valve - 0.5 bar)
 * - p0 = Precharge pressure
 * - pe = Fill pressure
 */
export function calculateExpansionVessel(input: ExpansionVesselInput): ExpansionVesselResult {
    const warnings: string[] = [];

    // Validate inputs
    if (input.systemVolume <= 0) {
        return {
            expansionVolume: 0,
            expansionCoefficient: 0,
            waterReserve: 0,
            staticPressure: 0,
            prechargePressure: 0,
            fillPressure: 0,
            maxPressure: 0,
            requiredVolume: 0,
            recommendedVessel: 0,
            acceptanceFactor: 0,
            isValid: false,
            warnings: ['Volumul sistemului trebuie să fie > 0']
        };
    }

    // 1. Calculate expansion coefficient
    const eMin = getWaterExpansion(input.minTemperature);
    const eMax = getWaterExpansion(input.maxTemperature);
    const glycolMultiplier = getGlycolMultiplier(input.glycolPercentage);

    // Net expansion from min to max temperature
    const expansionCoefficient = (eMax - eMin) * glycolMultiplier;

    // 2. Calculate expansion volume
    const expansionVolume = input.systemVolume * expansionCoefficient;

    // 3. Calculate water reserve (min 0.5% of system volume or 3L)
    const waterReserve = Math.max(input.systemVolume * 0.005, 3);

    // 4. Calculate pressures
    const staticPressure = (input.staticHeight * 9.81 * 1000) / 100000; // Convert m H2O to bar

    // Precharge pressure = static pressure + 0.2 to 0.3 bar safety margin
    const prechargePressure = staticPressure + 0.3;

    // Fill pressure = precharge + 0.3 to 0.5 bar
    const fillPressure = prechargePressure + 0.5;

    // Max pressure = safety valve pressure - 0.5 bar margin
    const maxPressure = input.safetyValvePressure - 0.5;

    // Validate pressure range
    if (fillPressure >= maxPressure) {
        warnings.push('Presiunea de umplere depășește presiunea maximă admisă!');
    }

    if (prechargePressure < 0.5) {
        warnings.push('Presiunea de preîncărcare este prea mică');
    }

    // 5. Calculate acceptance factor (vessel utilization)
    // f = 1 - (p0 + 1) / (pf + 1)
    const p0Abs = prechargePressure + 1; // Convert to absolute
    const pfAbs = maxPressure + 1;

    const acceptanceFactor = 1 - (p0Abs / pfAbs);

    if (acceptanceFactor <= 0.1) {
        warnings.push('Factor de acceptare prea mic - diferență insuficientă între presiuni');
    }

    // 6. Calculate required vessel volume
    // Ve = (Ve_exp + Vv) / f
    const requiredVolume = (expansionVolume + waterReserve) / acceptanceFactor;

    // 7. Find standard size
    const recommendedVessel = findStandardSize(requiredVolume);

    // Add warning if vessel is very large
    if (recommendedVessel > 500) {
        warnings.push('Sistem mare - considerați utilizarea mai multor vase');
    }

    // Temperature warnings
    if (input.maxTemperature > 80) {
        warnings.push('Temperatură maximă > 80°C - verificați compatibilitatea vasului');
    }

    if (input.maxTemperature - input.minTemperature < 5) {
        warnings.push('Diferență mică de temperatură - expansiune redusă');
    }

    return {
        expansionVolume: Math.round(expansionVolume * 10) / 10,
        expansionCoefficient: Math.round(expansionCoefficient * 10000) / 10000,
        waterReserve: Math.round(waterReserve * 10) / 10,
        staticPressure: Math.round(staticPressure * 100) / 100,
        prechargePressure: Math.round(prechargePressure * 10) / 10,
        fillPressure: Math.round(fillPressure * 10) / 10,
        maxPressure: Math.round(maxPressure * 10) / 10,
        requiredVolume: Math.round(requiredVolume * 10) / 10,
        recommendedVessel,
        acceptanceFactor: Math.round(acceptanceFactor * 100) / 100,
        isValid: warnings.filter(w => w.includes('!')).length === 0,
        warnings
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get list of standard vessel sizes for selection
 */
export function getStandardVesselSizes(): number[] {
    return [...STANDARD_VESSEL_SIZES];
}

/**
 * Quick estimate for initial sizing (simplified formula)
 * Useful for quick checks without full calculation
 */
export function quickEstimateVessel(systemVolume: number, tempDelta: number = 30): number {
    // Rule of thumb: ~3-5% of system volume for 30°C delta
    const estimate = systemVolume * 0.04 * (tempDelta / 30);
    return findStandardSize(estimate * 1.5); // Add 50% safety
}
