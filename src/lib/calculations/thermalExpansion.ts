/**
 * Thermal Expansion Calculator for Piping Systems
 * 
 * Calculates thermal elongation of pipes and required compensator sizing
 * based on material properties and temperature differentials.
 */

// ============================================================================
// Constants and Data
// ============================================================================

/**
 * Linear thermal expansion coefficients for common pipe materials
 * Units: mm per meter per degree Kelvin (mm/m·K)
 */
export const EXPANSION_COEFFICIENTS: Record<string, number> = {
    // Metals
    'steel_light': 0.012,
    'steel_medium': 0.012,
    'steel_heavy': 0.012,
    'inox_press': 0.016,
    'copper': 0.017,

    // Plastics (much higher expansion)
    'ppr_pn20': 0.15,
    'pehd_sdr17': 0.20,
    'pvc_u_pn16': 0.08,

    // GF Special (PE with insulation)
    'gf_coolfit_2_0': 0.20,
    'gf_coolfit_4_0': 0.20,

    // Default / Custom
    'custom': 0.012,
};

/**
 * Modulus of elasticity for materials (MPa)
 * Used for calculating anchor forces
 */
export const MODULUS_OF_ELASTICITY: Record<string, number> = {
    'steel_light': 210000,
    'steel_medium': 210000,
    'steel_heavy': 210000,
    'inox_press': 200000,
    'copper': 120000,
    'ppr_pn20': 800,
    'pehd_sdr17': 800,
    'pvc_u_pn16': 3000,
    'gf_coolfit_2_0': 800,
    'gf_coolfit_4_0': 800,
    'custom': 210000,
};

// ============================================================================
// Types
// ============================================================================

export interface ThermalExpansionInput {
    material: string;
    length: number;          // meters
    outerDiameter: number;   // mm
    wallThickness: number;   // mm
    installTemperature: number;   // °C (ambient during installation)
    operatingTemperature: number; // °C (max operating temperature)
    isFixedBothEnds: boolean;     // Both ends fixed (anchor) vs one end free
}

export interface ThermalExpansionResult {
    // Expansion
    temperatureDelta: number;      // °C (or K)
    expansionCoefficient: number;  // mm/m·K
    elongation: number;            // mm (free expansion)
    elongationPercent: number;     // % of original length

    // Compensator sizing (if needed)
    requiresCompensator: boolean;
    compensatorType: 'U-bend' | 'Omega' | 'Bellows' | 'None';
    compensatorLegLength: number;  // mm (for U-bend/Omega)

    // Anchor forces (if both ends fixed)
    anchorForce: number;           // kN
    axialStress: number;           // MPa

    // Guides
    guidesRequired: number;        // Number of intermediate guides
    guideSpacing: number;          // m between guides

    // Recommendations
    recommendations: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get expansion coefficient for material
 */
export function getExpansionCoefficient(material: string): number {
    return EXPANSION_COEFFICIENTS[material] ?? EXPANSION_COEFFICIENTS['custom'];
}

/**
 * Get modulus of elasticity for material
 */
function getModulus(material: string): number {
    return MODULUS_OF_ELASTICITY[material] ?? MODULUS_OF_ELASTICITY['custom'];
}

/**
 * Calculate pipe cross-sectional area
 */
function calculateCrossSection(od: number, thickness: number): number {
    const innerDiameter = od - 2 * thickness;
    const outerArea = Math.PI * Math.pow(od / 2, 2);
    const innerArea = Math.PI * Math.pow(innerDiameter / 2, 2);
    return outerArea - innerArea; // mm²
}

/**
 * Determine guide spacing based on pipe size and material
 */
function calculateGuideSpacing(material: string, od: number): number {
    // Plastics need more guides due to flexibility
    const isPlastic = ['ppr_pn20', 'pehd_sdr17', 'pvc_u_pn16', 'gf_coolfit_2_0', 'gf_coolfit_4_0'].includes(material);

    if (isPlastic) {
        // Rule: spacing = 10 × OD (in mm) but max 0.7m for small, 1.2m for large
        const spacing = Math.min(od * 0.01, 1.2);
        return Math.max(spacing, 0.5);
    } else {
        // Metal pipes: 2-4m depending on size
        if (od < 50) return 2.0;
        if (od < 100) return 3.0;
        return 4.0;
    }
}

/**
 * Determine required compensator type based on elongation
 */
function determineCompensatorType(elongation: number, material: string): 'U-bend' | 'Omega' | 'Bellows' | 'None' {
    // Small expansion - no compensator needed
    if (elongation < 5) return 'None';

    // For plastics, U-bends are common
    const isPlastic = ['ppr_pn20', 'pehd_sdr17', 'pvc_u_pn16'].includes(material);

    if (isPlastic) {
        return elongation < 30 ? 'U-bend' : 'Omega';
    }

    // For metals
    if (elongation < 20) return 'U-bend';
    if (elongation < 50) return 'Omega';
    return 'Bellows';
}

/**
 * Calculate U-bend leg length needed to absorb expansion
 * Formula: L = √(c × d × ΔL)
 * Where c is a constant (typically 75-100 for steel)
 */
function calculateCompensatorLeg(elongation: number, od: number, material: string): number {
    if (elongation <= 0) return 0;

    const isPlastic = ['ppr_pn20', 'pehd_sdr17', 'pvc_u_pn16', 'gf_coolfit_2_0', 'gf_coolfit_4_0'].includes(material);
    const c = isPlastic ? 30 : 75; // Constant depends on material flexibility

    // L = √(c × d × ΔL)
    const legLength = Math.sqrt(c * od * elongation);

    return Math.round(legLength);
}

// ============================================================================
// Main Calculation Function
// ============================================================================

/**
 * Calculate thermal expansion and related parameters
 * 
 * Main formula: ΔL = α × L × ΔT
 * Where:
 * - ΔL = elongation (mm)
 * - α = expansion coefficient (mm/m·K)
 * - L = length (m)
 * - ΔT = temperature change (K)
 */
export function calculateThermalExpansion(input: ThermalExpansionInput): ThermalExpansionResult {
    const recommendations: string[] = [];

    // Get material properties
    const alpha = getExpansionCoefficient(input.material);
    const E = getModulus(input.material);

    // Temperature delta
    const deltaT = Math.abs(input.operatingTemperature - input.installTemperature);

    // Calculate free expansion: ΔL = α × L × ΔT
    const elongation = alpha * input.length * deltaT;
    const elongationPercent = (elongation / (input.length * 1000)) * 100;

    // Determine if compensator is needed
    const requiresCompensator = elongation > 5; // More than 5mm
    const compensatorType = determineCompensatorType(elongation, input.material);
    const compensatorLegLength = compensatorType !== 'None' && compensatorType !== 'Bellows'
        ? calculateCompensatorLeg(elongation, input.outerDiameter, input.material)
        : 0;

    // Calculate anchor force (if both ends fixed)
    let anchorForce = 0;
    let axialStress = 0;

    if (input.isFixedBothEnds && deltaT > 0) {
        const crossSection = calculateCrossSection(input.outerDiameter, input.wallThickness);

        // Stress = α × E × ΔT (thermal stress in fixed pipe)
        axialStress = alpha * E * deltaT / 1000; // Convert to MPa (α is in mm/m·K, so need adjustment)

        // Force = Stress × Area
        anchorForce = (axialStress * crossSection) / 1000; // Convert to kN
    }

    // Calculate guide requirements
    const guideSpacing = calculateGuideSpacing(input.material, input.outerDiameter);
    const guidesRequired = Math.floor(input.length / guideSpacing);

    // Generate recommendations
    if (elongation > 30) {
        recommendations.push(`Dilatare mare (${elongation.toFixed(1)} mm) - necesită compensator`);
    }

    if (compensatorType === 'Bellows') {
        recommendations.push('Se recomandă compensator burduf metalic pentru flexibilitate maximă');
    }

    if (input.isFixedBothEnds && anchorForce > 10) {
        recommendations.push(`Forță mare pe ancore (${anchorForce.toFixed(1)} kN) - verificați fixările`);
    }

    const isPlastic = ['ppr_pn20', 'pehd_sdr17', 'pvc_u_pn16'].includes(input.material);
    if (isPlastic && deltaT > 40) {
        recommendations.push('Țeavă plastic cu ΔT mare - asigurați suport continuu');
    }

    if (guidesRequired >= 3) {
        recommendations.push(`Instalați ${guidesRequired} ghidaje la ${guideSpacing} m interval`);
    }

    return {
        temperatureDelta: deltaT,
        expansionCoefficient: alpha,
        elongation: Math.round(elongation * 10) / 10,
        elongationPercent: Math.round(elongationPercent * 1000) / 1000,

        requiresCompensator,
        compensatorType,
        compensatorLegLength,

        anchorForce: Math.round(anchorForce * 10) / 10,
        axialStress: Math.round(axialStress * 10) / 10,

        guidesRequired,
        guideSpacing,

        recommendations
    };
}

// ============================================================================
// Batch Calculation
// ============================================================================

export interface PipeExpansionSummary {
    segmentId: string;
    description: string;
    length: number;
    elongation: number;
    requiresCompensator: boolean;
    compensatorType: string;
}

/**
 * Calculate expansion for multiple pipe segments
 */
export function calculateBatchExpansion(
    segments: Array<{
        id: string;
        material: string;
        length: number;
        outerDiameter: number;
        wallThickness: number;
        description?: string;
    }>,
    installTemp: number,
    operatingTemp: number
): PipeExpansionSummary[] {
    return segments.map(seg => {
        const result = calculateThermalExpansion({
            material: seg.material,
            length: seg.length,
            outerDiameter: seg.outerDiameter,
            wallThickness: seg.wallThickness,
            installTemperature: installTemp,
            operatingTemperature: operatingTemp,
            isFixedBothEnds: false
        });

        return {
            segmentId: seg.id,
            description: seg.description || `${seg.material} ${seg.outerDiameter}mm`,
            length: seg.length,
            elongation: result.elongation,
            requiresCompensator: result.requiresCompensator,
            compensatorType: result.compensatorType
        };
    });
}
