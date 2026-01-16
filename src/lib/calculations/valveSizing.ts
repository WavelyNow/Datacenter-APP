/**
 * Valve Sizing Calculator (Kv Calculation)
 * 
 * Calculates required Kv value for valve selection based on
 * flow rate and pressure drop requirements.
 * 
 * Based on IEC 60534 / EN 60534 standards
 */

// ============================================================================
// Types
// ============================================================================

export interface ValveSizingInput {
    flowRate: number;        // m³/h (volumetric flow)
    pressureDrop: number;    // bar (ΔP across valve)
    fluidDensity: number;    // kg/m³ (fluid density)
    temperature?: number;    // °C (optional, for viscosity correction)
    viscosity?: number;      // cSt (optional, kinematic viscosity)
}

export interface ValveSizingResult {
    // Core results
    kvRequired: number;         // m³/h @ ΔP=1 bar
    kvWithMargin: number;       // Kv with 15% safety margin

    // Valve selection
    recommendedDN: string;      // Suggested nominal diameter
    kvAvailable: number;        // Kv of recommended size

    // Flow characteristics
    velocity: number;           // m/s through valve
    authority: number;          // Valve authority (ΔPv / ΔPtotal)
    openingPercent: number;     // Estimated opening percentage

    // Validation
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
}

// ============================================================================
// Standard Valve Kv Values
// ============================================================================

/**
 * Typical Kv values for ball valves (full bore)
 * Format: [DN, Kv at full open]
 */
export const BALL_VALVE_KV: Record<string, number> = {
    'DN15': 14,
    'DN20': 30,
    'DN25': 65,
    'DN32': 90,
    'DN40': 180,
    'DN50': 300,
    'DN65': 500,
    'DN80': 780,
    'DN100': 1200,
    'DN125': 1900,
    'DN150': 2800,
    'DN200': 5000,
};

/**
 * Typical Kv values for gate valves
 */
export const GATE_VALVE_KV: Record<string, number> = {
    'DN15': 8,
    'DN20': 18,
    'DN25': 40,
    'DN32': 60,
    'DN40': 120,
    'DN50': 200,
    'DN65': 350,
    'DN80': 550,
    'DN100': 850,
    'DN125': 1400,
    'DN150': 2000,
    'DN200': 3600,
};

/**
 * Typical Kv values for balancing valves (at full open)
 */
export const BALANCING_VALVE_KV: Record<string, number> = {
    'DN15': 2.5,
    'DN20': 5.5,
    'DN25': 8.0,
    'DN32': 14,
    'DN40': 26,
    'DN50': 45,
    'DN65': 80,
    'DN80': 120,
    'DN100': 190,
    'DN125': 310,
    'DN150': 450,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate Kv value
 * 
 * Formula: Kv = Q × √(ρ/ΔP)
 * Where:
 * - Q = flow rate (m³/h)
 * - ρ = relative density (water = 1)
 * - ΔP = pressure drop (bar)
 * 
 * For water at 20°C (density = 1000 kg/m³, ρ_relative = 1):
 * Kv = Q × √(1/ΔP) = Q / √ΔP
 */
export function calculateKv(flowM3H: number, deltaP: number, densityKgM3: number = 1000): number {
    if (deltaP <= 0 || flowM3H <= 0) return 0;

    // Relative density compared to water
    const relativeDensity = densityKgM3 / 1000;

    // Kv = Q × √(ρ/ΔP)
    const kv = flowM3H * Math.sqrt(relativeDensity / deltaP);

    return kv;
}

/**
 * Reverse calculation: pressure drop from Kv and flow
 * ΔP = ρ × (Q/Kv)²
 */
export function calculatePressureDropFromKv(flowM3H: number, kv: number, densityKgM3: number = 1000): number {
    if (kv <= 0 || flowM3H <= 0) return 0;

    const relativeDensity = densityKgM3 / 1000;
    const deltaP = relativeDensity * Math.pow(flowM3H / kv, 2);

    return deltaP;
}

/**
 * Find recommended valve size based on Kv requirement
 */
function findRecommendedSize(kvRequired: number, valveType: 'ball' | 'gate' | 'balancing' = 'ball'): {
    dn: string;
    kv: number;
} {
    const kvTable = valveType === 'ball'
        ? BALL_VALVE_KV
        : valveType === 'gate'
            ? GATE_VALVE_KV
            : BALANCING_VALVE_KV;

    // Find smallest valve with Kv >= required
    for (const [dn, kv] of Object.entries(kvTable)) {
        if (kv >= kvRequired) {
            return { dn, kv };
        }
    }

    // If no standard size fits, return largest
    const sizes = Object.entries(kvTable);
    const largest = sizes[sizes.length - 1];
    return { dn: largest[0], kv: largest[1] };
}

/**
 * Calculate velocity through valve
 * v = Q / A = (Q / 3600) / (π × d² / 4)
 */
function calculateVelocity(flowM3H: number, dn: string): number {
    // Extract diameter in mm from DN string
    const dnNum = parseInt(dn.replace(/\D/g, '')) || 50;

    // Approximate inner diameter (DN is roughly equal to ID in mm for small sizes)
    const diameterM = dnNum / 1000;
    const area = Math.PI * Math.pow(diameterM / 2, 2);

    // Convert m³/h to m³/s
    const flowM3S = flowM3H / 3600;

    return flowM3S / area;
}

/**
 * Calculate valve opening percentage based on Kv ratio
 * Uses equal percentage characteristic approximation
 */
function calculateOpening(kvRequired: number, kvAvailable: number): number {
    if (kvAvailable <= 0) return 100;

    const ratio = kvRequired / kvAvailable;

    // Equal percentage characteristic: Kv/Kvs = R^(x-1) where R ≈ 50
    // Simplified: x ≈ 1 + log(Kv/Kvs)/log(R)
    // For quick estimate: opening ≈ 30 + 70 × (Kv/Kvs)^0.5
    const opening = 30 + 70 * Math.pow(ratio, 0.5);

    return Math.min(100, Math.max(0, opening));
}

// ============================================================================
// Main Calculation Function
// ============================================================================

/**
 * Calculate valve sizing with full analysis
 */
export function calculateValveSizing(input: ValveSizingInput): ValveSizingResult {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Validate inputs
    if (input.flowRate <= 0) {
        return {
            kvRequired: 0,
            kvWithMargin: 0,
            recommendedDN: 'N/A',
            kvAvailable: 0,
            velocity: 0,
            authority: 0,
            openingPercent: 0,
            isValid: false,
            warnings: ['Debitul trebuie să fie > 0'],
            recommendations: []
        };
    }

    if (input.pressureDrop <= 0) {
        return {
            kvRequired: 0,
            kvWithMargin: 0,
            recommendedDN: 'N/A',
            kvAvailable: 0,
            velocity: 0,
            authority: 0,
            openingPercent: 0,
            isValid: false,
            warnings: ['Căderea de presiune trebuie să fie > 0'],
            recommendations: []
        };
    }

    // Calculate Kv
    const kvRequired = calculateKv(input.flowRate, input.pressureDrop, input.fluidDensity);
    const kvWithMargin = kvRequired * 1.15; // 15% safety margin

    // Find recommended valve
    const { dn: recommendedDN, kv: kvAvailable } = findRecommendedSize(kvWithMargin);

    // Calculate velocity
    const velocity = calculateVelocity(input.flowRate, recommendedDN);

    // Calculate opening percentage
    const openingPercent = calculateOpening(kvRequired, kvAvailable);

    // Valve authority (using the actual pressure drop as fraction of typical 10 bar system)
    // A good valve authority is > 0.5
    const authority = input.pressureDrop / (input.pressureDrop + 0.5); // Simplified

    // Validation and warnings
    if (velocity > 4) {
        warnings.push(`Viteză mare prin robinet: ${velocity.toFixed(1)} m/s - consider size larger`);
    }

    if (openingPercent < 30) {
        warnings.push('Robinet supradimensionat - opening < 30%');
        recommendations.push('Considerați o dimensiune mai mică pentru control mai bun');
    }

    if (openingPercent > 90) {
        warnings.push('Robinet la limită - opening > 90%');
        recommendations.push('Considerați o dimensiune mai mare pentru rezervă');
    }

    if (authority < 0.3) {
        recommendations.push('Autoritate scăzută - robinet poate fi instabil');
    }

    if (kvRequired > BALL_VALVE_KV['DN200']) {
        warnings.push('Kv necesar depășește valvele standard');
        recommendations.push('Considerați robineți paraleli sau robinet special');
    }

    // Good practice recommendations
    if (openingPercent >= 40 && openingPercent <= 70) {
        recommendations.push('Dimensionare optimă - zone de control bună');
    }

    return {
        kvRequired: Math.round(kvRequired * 10) / 10,
        kvWithMargin: Math.round(kvWithMargin * 10) / 10,
        recommendedDN,
        kvAvailable,
        velocity: Math.round(velocity * 100) / 100,
        authority: Math.round(authority * 100) / 100,
        openingPercent: Math.round(openingPercent),
        isValid: warnings.length === 0,
        warnings,
        recommendations
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get Kv for a specific valve size and type
 */
export function getValveKv(
    dn: string,
    type: 'ball' | 'gate' | 'balancing' = 'ball'
): number | undefined {
    const table = type === 'ball'
        ? BALL_VALVE_KV
        : type === 'gate'
            ? GATE_VALVE_KV
            : BALANCING_VALVE_KV;
    return table[dn];
}

/**
 * Get all available valve sizes
 */
export function getAvailableSizes(): string[] {
    return Object.keys(BALL_VALVE_KV);
}
