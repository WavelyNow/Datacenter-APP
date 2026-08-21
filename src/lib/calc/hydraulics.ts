
export interface HydraulicResult {
    velocity: number; // m/s
    pressureDropPa: number; // Pa/m
    pressureDropKpa: number; // kPa/m
    flowRegime: 'Laminar' | 'Transitional' | 'Turbulent';
    reynoldsNumber: number;
}

/**
 * Calculates hydraulic parameters for a pipe segment.
 * 
 * @param flowRate m³/h
 * @param innerDiameterMm mm
 * @param roughnessMm mm (default 0.045 for typical steel/plastic)
 * @param fluidDensity kg/m³ (default 1000 for water)
 * @param kinematicViscosity m²/s (default 1.004e-6 for water at 20°C)
 */
export const calculateHydraulics = (
    flowRate: number,
    innerDiameterMm: number,
    roughnessMm: number = 0.045,
    fluidDensity: number = 1000,
    kinematicViscosity: number = 1.004e-6
): HydraulicResult => {

    if (flowRate <= 0 || innerDiameterMm <= 0) {
        return {
            velocity: 0,
            pressureDropPa: 0,
            pressureDropKpa: 0,
            flowRegime: 'Laminar',
            reynoldsNumber: 0
        };
    }

    // 1. Convert Units
    const Q_m3s = flowRate / 3600; // m³/h -> m³/s
    const D_m = innerDiameterMm / 1000; // mm -> m
    const Area = Math.PI * Math.pow(D_m / 2, 2); // m²

    // 2. Calculate Velocity
    const velocity = Q_m3s / Area; // m/s

    // 3. Reynolds Number
    const Re = (velocity * D_m) / kinematicViscosity;

    // 4. Flow Regime
    let regime: 'Laminar' | 'Transitional' | 'Turbulent' = 'Turbulent';
    if (Re < 2300) regime = 'Laminar';
    else if (Re < 4000) regime = 'Transitional';

    // 5. Friction Factor (Darcy-Weisbach)
    let f = 0;

    if (regime === 'Laminar') {
        f = 64 / Re;
    } else {
        // Swamee-Jain approximation for turbulent flow (explicit, no iteration needed)
        // Valid for 5000 < Re < 10^8 and 10^-6 < e/D < 10^-2
        const epsilon = roughnessMm / 1000; // absolute roughness in m
        const relativeRoughness = epsilon / D_m;

        const term1 = relativeRoughness / 3.7;
        const term2 = 5.74 / Math.pow(Re, 0.9);

        const fTurbulent = 0.25 / Math.pow(Math.log10(term1 + term2), 2);

        // Transitional (2300 ≤ Re < 4000): interpolate between laminar and turbulent
        // — matches pressureDrop.ts behavior (no regime discontinuity)
        if (regime === 'Transitional') {
            const fLaminar = 64 / Re;
            const f4000 = 0.25 / Math.pow(Math.log10(term1 + 5.74 / Math.pow(4000, 0.9)), 2);
            const ratio = (Re - 2300) / 1700;
            f = fLaminar + (f4000 - fLaminar) * ratio;
        } else {
            f = fTurbulent;
        }
    }

    // 6. Pressure Drop (Darcy-Weisbach Equation)
    // ΔP = f * (L/D) * (ρ * v² / 2) -> We calculate per meter, so L = 1
    const pressureDropPaPerMeter = f * (1 / D_m) * (fluidDensity * Math.pow(velocity, 2) / 2);

    return {
        velocity: parseFloat(velocity.toFixed(2)),
        pressureDropPa: parseFloat(pressureDropPaPerMeter.toFixed(2)),
        pressureDropKpa: parseFloat((pressureDropPaPerMeter / 1000).toFixed(4)),
        flowRegime: regime,
        reynoldsNumber: Math.round(Re)
    };
};
