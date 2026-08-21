/**
 * Pressure Drop Calculator
 * Implements Darcy-Weisbach equation for pipe friction losses
 * Supports glycol-water mixtures at various concentrations
 */

import { PipeSegment, FluidType } from '../types';

// ============================================================================
// Fluid Properties Data
// ============================================================================

// Dynamic viscosity (Pa·s) at 20°C for different glycol concentrations (VOLUME %)
// Format: [percentage, ethylene viscosity, propylene viscosity]
// Source: ASHRAE Handbook—Fundamentals Ch.31 / Dow Fluid Tables (adjustments per audit)
const VISCOSITY_DATA: [number, number, number][] = [
    [0, 0.00100, 0.00100],  // Pure water
    [10, 0.00135, 0.00155],
    [20, 0.00200, 0.00220],
    [30, 0.00245, 0.00310],
    [40, 0.00320, 0.00470],
    [50, 0.00440, 0.00820],
    [60, 0.00600, 0.01600],
];

// Density (kg/m³) at 20°C (VOLUME %) — aligned with common.ts getFluidDensity (kg/L × 1000)
const DENSITY_DATA: [number, number, number][] = [
    [0, 998, 998],   // Pure water
    [10, 1011, 1008],
    [20, 1024, 1016],
    [30, 1038, 1024],
    [40, 1051, 1032],
    [50, 1065, 1041],
    [60, 1077, 1050],
];

// Pipe roughness (mm) by material type
const PIPE_ROUGHNESS: Record<string, number> = {
    'steel_light': 0.045,
    'steel_normal': 0.045,
    'steel_galvanized': 0.15,
    'copper': 0.0015,
    'ppr': 0.007,
    'pex': 0.007,
    'hdpe': 0.007,
    'custom': 0.045,  // Default to steel
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Linear interpolation for fluid properties
 */
function interpolate(data: [number, number, number][], percentage: number, fluidIndex: 1 | 2): number {
    const p = Math.max(0, Math.min(60, percentage));

    for (let i = 0; i < data.length - 1; i++) {
        const [p1, ...values1] = data[i];
        const [p2, ...values2] = data[i + 1];

        if (p >= p1 && p <= p2) {
            const ratio = (p - p1) / (p2 - p1);
            return values1[fluidIndex - 1] + (values2[fluidIndex - 1] - values1[fluidIndex - 1]) * ratio;
        }
    }

    return data[data.length - 1][fluidIndex];
}

/**
 * Get dynamic viscosity (Pa·s) based on fluid type and concentration
 */
export function getViscosity(fluidType: FluidType, glycolPercentage: number): number {
    if (fluidType === 'water') return 0.00100;
    const index = fluidType === 'ethylene' ? 1 : 2;
    return interpolate(VISCOSITY_DATA, glycolPercentage, index as 1 | 2);
}

/**
 * Get fluid density (kg/m³) based on fluid type and concentration
 */
export function getDensity(fluidType: FluidType, glycolPercentage: number): number {
    if (fluidType === 'water') return 998;
    const index = fluidType === 'ethylene' ? 1 : 2;
    return interpolate(DENSITY_DATA, glycolPercentage, index as 1 | 2);
}

export interface FluidProperties {
    densityKgM3: number;
    dynamicViscosityPaS: number;
    kinematicViscosityM2S: number;
    specificHeatJkgK: number;
    note?: string;
}

/**
 * Single source of truth for glycol-water fluid properties at 20°C.
 * Use everywhere instead of inline density/viscosity approximations.
 * @param fluidType water | ethylene | propylene (see FluidType)
 * @param glycolPercentage volume %
 * @param tempC design temperature (defaults 20°C; data table is 20°C)
 */
export function getFluidProperties(fluidType: FluidType, glycolPercentage: number, tempC: number = 20): FluidProperties {
    const densityKgM3 = getDensity(fluidType, glycolPercentage);
    const dynamicViscosityPaS = getViscosity(fluidType, glycolPercentage);
    const kinematicViscosityM2S = dynamicViscosityPaS / densityKgM3;

    // Specific heat approximation (linear, valid 0–60%): water 4186 J/kg·K
    // EG ~ -11.2 J/kg·K per % (30% → ~3850), PG ~ -14.5 J/kg·K per % (30% → ~3750)
    let specificHeatJkgK = 4186;
    if (fluidType === 'ethylene') specificHeatJkgK = Math.max(3300, 4186 - 11.2 * Math.min(100, Math.max(0, glycolPercentage)));
    else if (fluidType === 'propylene') specificHeatJkgK = Math.max(3100, 4186 - 14.5 * Math.min(100, Math.max(0, glycolPercentage)));

    // Temperature correction: viscosity decreases with temperature (~2.5%/°C above 20°C, increases below)
    const tempFactor = Math.max(0.5, Math.min(2.5, Math.pow(1.025, 20 - tempC)));
    const correctedViscosity = dynamicViscosityPaS * tempFactor;

    return {
        densityKgM3,
        dynamicViscosityPaS: correctedViscosity,
        kinematicViscosityM2S: correctedViscosity / densityKgM3,
        specificHeatJkgK,
        note: tempC !== 20 ? `Proprietăți corectate aproximativ pentru ${tempC}°C` : undefined
    };
}

/**
 * Get pipe roughness in mm
 */
export function getRoughness(material: string): number {
    return PIPE_ROUGHNESS[material] || 0.045;
}

// ============================================================================
// Pressure Drop Calculation
// ============================================================================

export interface PressureDropResult {
    // Flow parameters
    velocityMS: number;           // Flow velocity (m/s)
    volumetricFlowM3H: number;    // Volumetric flow (m³/h)

    // Reynolds analysis
    reynoldsNumber: number;       // Dimensionless
    flowRegime: 'laminar' | 'transitional' | 'turbulent';

    // Friction
    frictionFactor: number;       // Darcy friction factor (dimensionless)

    // Pressure drop
    pressureDropPaM: number;      // Pa per meter
    pressureDropKPaM: number;     // kPa per meter  
    totalPressureDropPa: number;  // Total for segment (Pa)
    totalPressureDropKPa: number; // Total for segment (kPa)
    totalPressureDropBar: number; // Total for segment (bar)

    // Head loss
    headLossM: number;            // Equivalent head in meters

    // Warnings
    warnings: string[];
}

/**
 * Calculate Colebrook-White friction factor iteratively
 * Using Swamee-Jain approximation for initial guess, then Newton-Raphson
 */
function calculateFrictionFactor(Re: number, relativeRoughness: number): number {
    if (Re < 2300) {
        // Laminar flow: f = 64/Re
        return 64 / Re;
    }

    if (Re < 4000) {
        // Transitional: interpolate between laminar and turbulent
        const fLaminar = 64 / Re;
        const fTurbulent = calculateFrictionFactor(4000, relativeRoughness);
        const ratio = (Re - 2300) / 1700;
        return fLaminar + (fTurbulent - fLaminar) * ratio;
    }

    // Turbulent: Swamee-Jain equation (explicit approximation of Colebrook-White)
    const term1 = relativeRoughness / 3.7;
    const term2 = 5.74 / Math.pow(Re, 0.9);
    const f = 0.25 / Math.pow(Math.log10(term1 + term2), 2);

    return f;
}

/**
 * Main pressure drop calculation using Darcy-Weisbach equation
 * ΔP = f × (L/D) × (ρ × v² / 2)
 */
export function calculatePressureDrop(
    innerDiameterMM: number,
    lengthM: number,
    flowRateM3H: number,
    fluidType: FluidType = 'ethylene',
    glycolPercentage: number = 30,
    material: string = 'steel_light'
): PressureDropResult {
    const warnings: string[] = [];

    // Handle edge cases
    if (innerDiameterMM <= 0 || lengthM <= 0) {
        return {
            velocityMS: 0,
            volumetricFlowM3H: flowRateM3H,
            reynoldsNumber: 0,
            flowRegime: 'laminar',
            frictionFactor: 0,
            pressureDropPaM: 0,
            pressureDropKPaM: 0,
            totalPressureDropPa: 0,
            totalPressureDropKPa: 0,
            totalPressureDropBar: 0,
            headLossM: 0,
            warnings: ['Invalid pipe dimensions']
        };
    }

    if (flowRateM3H <= 0) {
        return {
            velocityMS: 0,
            volumetricFlowM3H: 0,
            reynoldsNumber: 0,
            flowRegime: 'laminar',
            frictionFactor: 0,
            pressureDropPaM: 0,
            pressureDropKPaM: 0,
            totalPressureDropPa: 0,
            totalPressureDropKPa: 0,
            totalPressureDropBar: 0,
            headLossM: 0,
            warnings: []
        };
    }

    // Convert units
    const D = innerDiameterMM / 1000;  // Diameter in meters
    const A = Math.PI * Math.pow(D / 2, 2);  // Cross-sectional area (m²)
    const Q = flowRateM3H / 3600;  // Flow rate (m³/s)

    // Calculate velocity
    const velocity = Q / A;  // m/s

    // Velocity check
    if (velocity > 3.0) {
        warnings.push(`Viteză mare: ${velocity.toFixed(2)} m/s (recomandat < 2.5 m/s)`);
    } else if (velocity > 2.5) {
        warnings.push(`Viteză la limită: ${velocity.toFixed(2)} m/s`);
    } else if (velocity < 0.5 && flowRateM3H > 0) {
        warnings.push(`Viteză mică: ${velocity.toFixed(2)} m/s (risc de depuneri)`);
    }

    // Get fluid properties
    if (glycolPercentage > 60) {
        warnings.push(`Concentrație ${glycolPercentage}% glicol peste limita datelor (60%) — proprietăți extrapolate/clampate`);
    }
    const density = getDensity(fluidType, glycolPercentage);
    const viscosity = getViscosity(fluidType, glycolPercentage);
    const roughness = getRoughness(material) / 1000;  // Convert to meters

    // Calculate Reynolds number: Re = ρvD/μ
    const Re = (density * velocity * D) / viscosity;

    // Determine flow regime
    let flowRegime: 'laminar' | 'transitional' | 'turbulent';
    if (Re < 2300) {
        flowRegime = 'laminar';
    } else if (Re < 4000) {
        flowRegime = 'transitional';
        warnings.push('Regim tranzitoriu - calcule aproximative');
    } else {
        flowRegime = 'turbulent';
    }

    // Calculate relative roughness
    const relativeRoughness = roughness / D;

    // Calculate friction factor
    const f = calculateFrictionFactor(Re, relativeRoughness);

    // Darcy-Weisbach equation: ΔP = f × (L/D) × (ρ × v² / 2)
    const pressureDropPaM = f * (1 / D) * (density * Math.pow(velocity, 2) / 2);
    const totalPressureDropPa = pressureDropPaM * lengthM;

    // Head loss: h = ΔP / (ρ × g)
    const g = 9.81;  // m/s²
    const headLossM = totalPressureDropPa / (density * g);

    return {
        velocityMS: Math.round(velocity * 100) / 100,
        volumetricFlowM3H: flowRateM3H,
        reynoldsNumber: Math.round(Re),
        flowRegime,
        frictionFactor: Math.round(f * 10000) / 10000,
        pressureDropPaM: Math.round(pressureDropPaM * 10) / 10,
        pressureDropKPaM: Math.round(pressureDropPaM / 100) / 10,
        totalPressureDropPa: Math.round(totalPressureDropPa),
        totalPressureDropKPa: Math.round(totalPressureDropPa / 100) / 10,
        totalPressureDropBar: Math.round(totalPressureDropPa / 10000) / 10,
        headLossM: Math.round(headLossM * 100) / 100,
        warnings
    };
}

/**
 * Calculate pressure drop for a pipe segment with automatic diameter lookup
 */
export function calculateSegmentPressureDrop(
    segment: PipeSegment,
    fluidType: FluidType = 'ethylene',
    glycolPercentage: number = 30,
    getPipeData: (material: string, size: string) => { id: number } | null
): PressureDropResult {
    let innerDiameterMM = 0;

    if (segment.material === 'custom') {
        innerDiameterMM = segment.customInnerDiameter || 0;
    } else if (segment.diameter) {
        innerDiameterMM = segment.diameter;
    } else {
        const pipeData = getPipeData(segment.material, segment.size);
        if (pipeData) {
            innerDiameterMM = pipeData.id;
        }
    }

    return calculatePressureDrop(
        innerDiameterMM,
        segment.length,
        segment.flowRate || 0,
        fluidType,
        glycolPercentage,
        segment.material
    );
}

/**
 * Calculate total system pressure drop across all segments
 */
export function calculateSystemPressureDrop(
    segments: PipeSegment[],
    fluidType: FluidType,
    glycolPercentage: number,
    getPipeData: (material: string, size: string) => { id: number } | null
): {
    totalDropKPa: number;
    totalDropBar: number;
    totalHeadM: number;
    maxVelocity: number;
    segmentResults: PressureDropResult[];
    hasWarnings: boolean;
} {
    const segmentResults = segments.map(seg =>
        calculateSegmentPressureDrop(seg, fluidType, glycolPercentage, getPipeData)
    );

    const totalDropKPa = segmentResults.reduce((sum, r) => sum + r.totalPressureDropKPa, 0);
    const totalDropBar = totalDropKPa / 100;
    const totalHeadM = segmentResults.reduce((sum, r) => sum + r.headLossM, 0);
    const maxVelocity = Math.max(...segmentResults.map(r => r.velocityMS), 0);
    const hasWarnings = segmentResults.some(r => r.warnings.length > 0);

    return {
        totalDropKPa: Math.round(totalDropKPa * 10) / 10,
        totalDropBar: Math.round(totalDropBar * 100) / 100,
        totalHeadM: Math.round(totalHeadM * 100) / 100,
        maxVelocity: Math.round(maxVelocity * 100) / 100,
        segmentResults,
        hasWarnings
    };
}
