/**
 * Fittings and Local Pressure Losses Calculator
 * 
 * Calculates pressure drop through fittings (elbows, tees, valves, etc.)
 * using K-factor (resistance coefficient) method.
 * 
 * ΔP = K × (ρ × v²) / 2
 */

// ============================================================================
// Types
// ============================================================================

export type FittingType =
    | 'elbow_90_std'      // Standard 90° elbow
    | 'elbow_90_lr'       // Long radius 90° elbow
    | 'elbow_45'          // 45° elbow
    | 'tee_branch'        // Tee, flow through branch
    | 'tee_run'           // Tee, flow through run
    | 'reducer_conc'      // Concentric reducer
    | 'reducer_ecc'       // Eccentric reducer
    | 'valve_gate'        // Gate valve (full open)
    | 'valve_ball'        // Ball valve (full open)
    | 'valve_globe'       // Globe valve
    | 'valve_check_swing' // Swing check valve
    | 'valve_check_lift'  // Lift check valve
    | 'valve_butterfly'   // Butterfly valve (full open)
    | 'strainer'          // Y-strainer
    | 'filter'            // Filter/separator
    | 'expansion_joint'   // Expansion joint/bellows
    | 'union'             // Union fitting
    | 'flange'            // Flanged connection
    | 'sudden_expansion'  // Sudden pipe expansion
    | 'sudden_contraction'// Sudden pipe contraction
    | 'entry_sharp'       // Sharp edged entry
    | 'entry_rounded'     // Rounded entry
    | 'exit';             // Pipe exit

export interface Fitting {
    id: string;
    type: FittingType;
    size: string;           // DN size
    quantity: number;
    description?: string;
}

export interface FittingPressureLoss {
    fittingId: string;
    type: FittingType;
    quantity: number;
    kFactor: number;
    velocityMS: number;
    pressureDropKPa: number;  // Total for all fittings of this type
    pressureDropBar: number;
    equivalentLengthM: number; // Equivalent pipe length
}

export interface FittingsSummary {
    fittings: FittingPressureLoss[];
    totalKFactor: number;
    totalPressureDropKPa: number;
    totalPressureDropBar: number;
    totalEquivalentLength: number;
}

// ============================================================================
// K-Factor Data
// ============================================================================

/**
 * K-factors (resistance coefficients) for various fittings
 * Values are for turbulent flow (Re > 10000)
 */
export const K_FACTORS: Record<FittingType, number> = {
    // Elbows
    'elbow_90_std': 0.75,       // Standard radius (r/d = 1)
    'elbow_90_lr': 0.45,        // Long radius (r/d = 1.5)
    'elbow_45': 0.35,           // 45° elbow

    // Tees
    'tee_branch': 1.80,         // Flow through branch
    'tee_run': 0.60,            // Flow through run (straight)

    // Reducers
    'reducer_conc': 0.50,       // Concentric (gradual)
    'reducer_ecc': 0.70,        // Eccentric

    // Valves - Full Open
    'valve_gate': 0.20,         // Gate valve
    'valve_ball': 0.05,         // Ball valve (full bore)
    'valve_globe': 6.00,        // Globe valve (high loss!)
    'valve_check_swing': 2.50,  // Swing check
    'valve_check_lift': 10.00,  // Lift check (very high)
    'valve_butterfly': 0.25,    // Butterfly (full open)

    // Inline components
    'strainer': 2.00,           // Y-strainer
    'filter': 3.00,             // Filter/separator
    'expansion_joint': 0.30,    // Bellows compensator
    'union': 0.04,              // Union
    'flange': 0.02,             // Flanged joint

    // Entry/Exit
    'sudden_expansion': 1.00,   // Approximation (actual depends on ratio)
    'sudden_contraction': 0.50,
    'entry_sharp': 0.50,        // Sharp edged tank entry
    'entry_rounded': 0.05,      // Well-rounded entry
    'exit': 1.00,               // Discharge to tank
};

/**
 * Equivalent length in pipe diameters (L/D) for fittings
 * Alternative method for pressure loss calculation
 */
export const EQUIVALENT_LD: Record<FittingType, number> = {
    'elbow_90_std': 30,
    'elbow_90_lr': 20,
    'elbow_45': 16,
    'tee_branch': 60,
    'tee_run': 20,
    'reducer_conc': 10,
    'reducer_ecc': 15,
    'valve_gate': 8,
    'valve_ball': 3,
    'valve_globe': 300,
    'valve_check_swing': 100,
    'valve_check_lift': 400,
    'valve_butterfly': 10,
    'strainer': 80,
    'filter': 120,
    'expansion_joint': 10,
    'union': 2,
    'flange': 1,
    'sudden_expansion': 50,
    'sudden_contraction': 25,
    'entry_sharp': 25,
    'entry_rounded': 3,
    'exit': 50,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get K-factor for a fitting type
 */
export function getKFactor(type: FittingType): number {
    return K_FACTORS[type] ?? 0.5;
}

/**
 * Get equivalent L/D for a fitting
 */
export function getEquivalentLD(type: FittingType): number {
    return EQUIVALENT_LD[type] ?? 20;
}

/**
 * Calculate equivalent pipe length for a fitting
 */
export function calculateEquivalentLength(type: FittingType, diameterMM: number): number {
    const ld = getEquivalentLD(type);
    return (ld * diameterMM) / 1000; // Convert to meters
}

/**
 * Calculate velocity in pipe
 * v = Q / A = (Q / 3600) / (π × d² / 4)
 */
export function calculateVelocity(flowM3H: number, innerDiameterMM: number): number {
    if (innerDiameterMM <= 0 || flowM3H <= 0) return 0;

    const diameterM = innerDiameterMM / 1000;
    const area = Math.PI * Math.pow(diameterM / 2, 2);
    const flowM3S = flowM3H / 3600;

    return flowM3S / area;
}

// ============================================================================
// Main Calculation Functions
// ============================================================================

/**
 * Calculate pressure drop for a single fitting
 * 
 * ΔP = K × (ρ × v²) / 2 [Pa]
 * 
 * @param type Fitting type
 * @param velocity Flow velocity (m/s)
 * @param density Fluid density (kg/m³)
 * @param quantity Number of fittings
 * @returns Pressure drop in kPa
 */
export function calculateFittingPressureDrop(
    type: FittingType,
    velocity: number,
    density: number,
    quantity: number = 1
): number {
    if (velocity <= 0 || density <= 0) return 0;

    const k = getKFactor(type);

    // ΔP = K × (ρ × v²) / 2 [Pa]
    const deltaPPa = k * (density * Math.pow(velocity, 2)) / 2;

    // Convert to kPa and multiply by quantity
    return (deltaPPa / 1000) * quantity;
}

/**
 * Calculate pressure losses for a list of fittings
 */
export function calculateFittingsPressureLoss(
    fittings: Fitting[],
    flowM3H: number,
    innerDiameterMM: number,
    fluidDensity: number = 1000
): FittingsSummary {
    const velocity = calculateVelocity(flowM3H, innerDiameterMM);

    const results: FittingPressureLoss[] = fittings.map(fitting => {
        const k = getKFactor(fitting.type);
        const pressureDropKPa = calculateFittingPressureDrop(
            fitting.type,
            velocity,
            fluidDensity,
            fitting.quantity
        );
        const equivalentLength = calculateEquivalentLength(fitting.type, innerDiameterMM) * fitting.quantity;

        return {
            fittingId: fitting.id,
            type: fitting.type,
            quantity: fitting.quantity,
            kFactor: k,
            velocityMS: velocity,
            pressureDropKPa: Math.round(pressureDropKPa * 100) / 100,
            pressureDropBar: Math.round(pressureDropKPa / 100 * 1000) / 1000,
            equivalentLengthM: Math.round(equivalentLength * 100) / 100
        };
    });

    const totalKFactor = results.reduce((sum, r) => sum + (r.kFactor * r.quantity), 0);
    const totalPressureDropKPa = results.reduce((sum, r) => sum + r.pressureDropKPa, 0);
    const totalEquivalentLength = results.reduce((sum, r) => sum + r.equivalentLengthM, 0);

    return {
        fittings: results,
        totalKFactor: Math.round(totalKFactor * 100) / 100,
        totalPressureDropKPa: Math.round(totalPressureDropKPa * 100) / 100,
        totalPressureDropBar: Math.round(totalPressureDropKPa / 100 * 1000) / 1000,
        totalEquivalentLength: Math.round(totalEquivalentLength * 100) / 100
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get list of all fitting types with descriptions
 */
export function getFittingTypes(): Array<{ type: FittingType; label: string; kFactor: number }> {
    return [
        { type: 'elbow_90_std', label: 'Cot 90° Standard', kFactor: K_FACTORS['elbow_90_std'] },
        { type: 'elbow_90_lr', label: 'Cot 90° Rază Mare', kFactor: K_FACTORS['elbow_90_lr'] },
        { type: 'elbow_45', label: 'Cot 45°', kFactor: K_FACTORS['elbow_45'] },
        { type: 'tee_branch', label: 'Teu - Ramificație', kFactor: K_FACTORS['tee_branch'] },
        { type: 'tee_run', label: 'Teu - Pasant', kFactor: K_FACTORS['tee_run'] },
        { type: 'reducer_conc', label: 'Reducție Concentrică', kFactor: K_FACTORS['reducer_conc'] },
        { type: 'reducer_ecc', label: 'Reducție Excentrică', kFactor: K_FACTORS['reducer_ecc'] },
        { type: 'valve_gate', label: 'Robinet Sertar', kFactor: K_FACTORS['valve_gate'] },
        { type: 'valve_ball', label: 'Robinet Bilă', kFactor: K_FACTORS['valve_ball'] },
        { type: 'valve_globe', label: 'Robinet Ventil', kFactor: K_FACTORS['valve_globe'] },
        { type: 'valve_check_swing', label: 'Clapetă Reținere (Swing)', kFactor: K_FACTORS['valve_check_swing'] },
        { type: 'valve_check_lift', label: 'Clapetă Reținere (Lift)', kFactor: K_FACTORS['valve_check_lift'] },
        { type: 'valve_butterfly', label: 'Robinet Fluture', kFactor: K_FACTORS['valve_butterfly'] },
        { type: 'strainer', label: 'Filtru Y', kFactor: K_FACTORS['strainer'] },
        { type: 'filter', label: 'Filtru/Separator', kFactor: K_FACTORS['filter'] },
        { type: 'expansion_joint', label: 'Compensator/Burduf', kFactor: K_FACTORS['expansion_joint'] },
        { type: 'union', label: 'Racord Olandez', kFactor: K_FACTORS['union'] },
        { type: 'flange', label: 'Îmbinare Flanșată', kFactor: K_FACTORS['flange'] },
        { type: 'entry_sharp', label: 'Intrare din Rezervor (Ascuțită)', kFactor: K_FACTORS['entry_sharp'] },
        { type: 'entry_rounded', label: 'Intrare din Rezervor (Rotunjită)', kFactor: K_FACTORS['entry_rounded'] },
        { type: 'exit', label: 'Evacuare în Rezervor', kFactor: K_FACTORS['exit'] },
    ];
}

/**
 * Create a fitting object
 */
export function createFitting(
    type: FittingType,
    size: string,
    quantity: number = 1,
    description?: string
): Fitting {
    return {
        id: `${type}_${size}_${Date.now()}`,
        type,
        size,
        quantity,
        description
    };
}
