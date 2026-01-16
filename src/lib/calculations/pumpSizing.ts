/**
 * Pump Sizing Calculator
 * 
 * Calculates system curve and helps select appropriate pump
 * based on flow requirements and system resistance.
 */

// ============================================================================
// Types
// ============================================================================

export interface SystemCurvePoint {
    flowM3H: number;
    headM: number;
}

export interface PumpCurvePoint {
    flowM3H: number;
    headM: number;
    efficiencyPercent?: number;
    powerKW?: number;
}

export interface PumpData {
    id: string;
    manufacturer: string;
    model: string;
    curve: PumpCurvePoint[];
    maxFlow: number;      // m³/h
    maxHead: number;      // m
    nominalPower: number; // kW
}

export interface PumpSizingInput {
    designFlowM3H: number;      // Required flow rate
    staticHeadM: number;        // Static head (elevation difference)
    frictionLossKPa: number;    // Total friction loss at design flow
    safetyFactor?: number;      // Default 1.1 (10%)
}

export interface OperatingPoint {
    flowM3H: number;
    headM: number;
    efficiency: number;
    powerKW: number;
    npshRequired?: number;
}

export interface PumpSizingResult {
    // Design requirements
    designFlow: number;         // m³/h
    designHead: number;         // m

    // System curve (10 points from 0 to 150% of design flow)
    systemCurve: SystemCurvePoint[];

    // Pump requirements
    requiredPower: number;      // kW (estimated)
    requiredNPSH: number;       // m (estimated)

    // Recommendations
    recommendedPumpType: string;
    recommendations: string[];
}

// ============================================================================
// Standard Pump Data (Common circulation pumps for HVAC)
// ============================================================================

export const STANDARD_PUMPS: PumpData[] = [
    {
        id: 'grundfos_magna3_25-60',
        manufacturer: 'Grundfos',
        model: 'MAGNA3 25-60',
        curve: [
            { flowM3H: 0, headM: 6.0, efficiencyPercent: 0, powerKW: 0.04 },
            { flowM3H: 1, headM: 5.8, efficiencyPercent: 35, powerKW: 0.05 },
            { flowM3H: 2, headM: 5.2, efficiencyPercent: 48, powerKW: 0.06 },
            { flowM3H: 3, headM: 4.2, efficiencyPercent: 52, powerKW: 0.07 },
            { flowM3H: 4, headM: 2.8, efficiencyPercent: 45, powerKW: 0.08 },
            { flowM3H: 5, headM: 1.0, efficiencyPercent: 30, powerKW: 0.09 },
        ],
        maxFlow: 5,
        maxHead: 6,
        nominalPower: 0.09
    },
    {
        id: 'grundfos_magna3_32-100',
        manufacturer: 'Grundfos',
        model: 'MAGNA3 32-100',
        curve: [
            { flowM3H: 0, headM: 10.0, efficiencyPercent: 0, powerKW: 0.1 },
            { flowM3H: 2, headM: 9.5, efficiencyPercent: 40, powerKW: 0.15 },
            { flowM3H: 4, headM: 8.5, efficiencyPercent: 55, powerKW: 0.20 },
            { flowM3H: 6, headM: 7.0, efficiencyPercent: 60, powerKW: 0.25 },
            { flowM3H: 8, headM: 5.0, efficiencyPercent: 55, powerKW: 0.30 },
            { flowM3H: 10, headM: 2.5, efficiencyPercent: 40, powerKW: 0.35 },
        ],
        maxFlow: 10,
        maxHead: 10,
        nominalPower: 0.35
    },
    {
        id: 'grundfos_magna3_40-150',
        manufacturer: 'Grundfos',
        model: 'MAGNA3 40-150',
        curve: [
            { flowM3H: 0, headM: 15.0, efficiencyPercent: 0, powerKW: 0.2 },
            { flowM3H: 5, headM: 14.5, efficiencyPercent: 45, powerKW: 0.4 },
            { flowM3H: 10, headM: 13.0, efficiencyPercent: 58, powerKW: 0.6 },
            { flowM3H: 15, headM: 10.5, efficiencyPercent: 62, powerKW: 0.8 },
            { flowM3H: 20, headM: 7.0, efficiencyPercent: 55, powerKW: 1.0 },
            { flowM3H: 25, headM: 3.0, efficiencyPercent: 40, powerKW: 1.2 },
        ],
        maxFlow: 25,
        maxHead: 15,
        nominalPower: 1.2
    },
    {
        id: 'wilo_stratos_50-12',
        manufacturer: 'Wilo',
        model: 'Stratos 50/1-12',
        curve: [
            { flowM3H: 0, headM: 12.0, efficiencyPercent: 0, powerKW: 0.15 },
            { flowM3H: 5, headM: 11.5, efficiencyPercent: 50, powerKW: 0.3 },
            { flowM3H: 10, headM: 10.0, efficiencyPercent: 60, powerKW: 0.5 },
            { flowM3H: 15, headM: 8.0, efficiencyPercent: 62, powerKW: 0.7 },
            { flowM3H: 20, headM: 5.5, efficiencyPercent: 55, powerKW: 0.9 },
            { flowM3H: 25, headM: 2.5, efficiencyPercent: 40, powerKW: 1.1 },
        ],
        maxFlow: 25,
        maxHead: 12,
        nominalPower: 1.1
    },
    {
        id: 'wilo_stratos_65-15',
        manufacturer: 'Wilo',
        model: 'Stratos 65/1-15',
        curve: [
            { flowM3H: 0, headM: 15.0, efficiencyPercent: 0, powerKW: 0.3 },
            { flowM3H: 10, headM: 14.0, efficiencyPercent: 52, powerKW: 0.6 },
            { flowM3H: 20, headM: 12.0, efficiencyPercent: 62, powerKW: 1.0 },
            { flowM3H: 30, headM: 9.0, efficiencyPercent: 65, powerKW: 1.3 },
            { flowM3H: 40, headM: 5.5, efficiencyPercent: 55, powerKW: 1.6 },
            { flowM3H: 50, headM: 2.0, efficiencyPercent: 38, powerKW: 2.0 },
        ],
        maxFlow: 50,
        maxHead: 15,
        nominalPower: 2.0
    },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert pressure loss in kPa to head in meters of water column
 * H = ΔP / (ρ × g) = ΔP (kPa) × 1000 / (1000 × 9.81) ≈ ΔP / 9.81
 */
export function kpaToHeadM(kpa: number): number {
    return kpa / 9.81;
}

/**
 * Convert head in meters to pressure in kPa
 */
export function headMToKpa(headM: number): number {
    return headM * 9.81;
}

/**
 * Generate system curve points
 * System curve: H = H_static + K × Q²
 * Where K is derived from: K = (H_friction at design flow) / Q_design²
 */
export function generateSystemCurve(
    staticHeadM: number,
    frictionHeadM: number,
    designFlowM3H: number,
    numPoints: number = 11
): SystemCurvePoint[] {
    if (designFlowM3H <= 0) return [];

    // Calculate K factor: H_friction = K × Q²
    const K = frictionHeadM / Math.pow(designFlowM3H, 2);

    const points: SystemCurvePoint[] = [];

    // Generate points from 0 to 150% of design flow
    for (let i = 0; i < numPoints; i++) {
        const flowRatio = (i / (numPoints - 1)) * 1.5; // 0 to 1.5
        const flow = designFlowM3H * flowRatio;
        const frictionHead = K * Math.pow(flow, 2);
        const totalHead = staticHeadM + frictionHead;

        points.push({
            flowM3H: Math.round(flow * 100) / 100,
            headM: Math.round(totalHead * 100) / 100
        });
    }

    return points;
}

/**
 * Interpolate pump curve to find head at specific flow
 */
function interpolatePumpHead(curve: PumpCurvePoint[], flowM3H: number): number {
    if (curve.length === 0) return 0;
    if (flowM3H <= curve[0].flowM3H) return curve[0].headM;
    if (flowM3H >= curve[curve.length - 1].flowM3H) return curve[curve.length - 1].headM;

    for (let i = 0; i < curve.length - 1; i++) {
        if (flowM3H >= curve[i].flowM3H && flowM3H <= curve[i + 1].flowM3H) {
            const ratio = (flowM3H - curve[i].flowM3H) / (curve[i + 1].flowM3H - curve[i].flowM3H);
            return curve[i].headM + (curve[i + 1].headM - curve[i].headM) * ratio;
        }
    }

    return 0;
}

/**
 * Interpolate pump efficiency at specific flow
 */
function interpolateEfficiency(curve: PumpCurvePoint[], flowM3H: number): number {
    if (curve.length === 0) return 0;

    for (let i = 0; i < curve.length - 1; i++) {
        if (flowM3H >= curve[i].flowM3H && flowM3H <= curve[i + 1].flowM3H) {
            const ratio = (flowM3H - curve[i].flowM3H) / (curve[i + 1].flowM3H - curve[i].flowM3H);
            const eff1 = curve[i].efficiencyPercent ?? 0;
            const eff2 = curve[i + 1].efficiencyPercent ?? 0;
            return eff1 + (eff2 - eff1) * ratio;
        }
    }

    return 0;
}

/**
 * Find operating point (intersection of system and pump curves)
 */
export function findOperatingPoint(
    systemCurve: SystemCurvePoint[],
    pumpData: PumpData
): OperatingPoint | null {
    if (systemCurve.length === 0 || pumpData.curve.length === 0) return null;

    // Find intersection by checking each segment
    for (let i = 0; i < systemCurve.length - 1; i++) {
        const sysFlow1 = systemCurve[i].flowM3H;
        const sysFlow2 = systemCurve[i + 1].flowM3H;
        const sysHead1 = systemCurve[i].headM;
        const sysHead2 = systemCurve[i + 1].headM;

        // Check flows within pump range
        const midFlow = (sysFlow1 + sysFlow2) / 2;
        const pumpHeadAtMid = interpolatePumpHead(pumpData.curve, midFlow);
        const sysHeadAtMid = sysHead1 + (sysHead2 - sysHead1) * 0.5;

        // Check for crossover
        const pumpHead1 = interpolatePumpHead(pumpData.curve, sysFlow1);
        const pumpHead2 = interpolatePumpHead(pumpData.curve, sysFlow2);

        const diff1 = pumpHead1 - sysHead1;
        const diff2 = pumpHead2 - sysHead2;

        // Intersection when sign changes
        if (diff1 >= 0 && diff2 <= 0) {
            // Linear interpolation to find intersection
            const ratio = diff1 / (diff1 - diff2);
            const intersectFlow = sysFlow1 + (sysFlow2 - sysFlow1) * ratio;
            const intersectHead = sysHead1 + (sysHead2 - sysHead1) * ratio;

            const efficiency = interpolateEfficiency(pumpData.curve, intersectFlow);

            // Calculate power: P = (Q × H × ρ × g) / (η × 3600 × 1000)
            const powerKW = (intersectFlow * intersectHead * 1000 * 9.81) / (efficiency / 100 * 3600 * 1000);

            return {
                flowM3H: Math.round(intersectFlow * 100) / 100,
                headM: Math.round(intersectHead * 100) / 100,
                efficiency: Math.round(efficiency),
                powerKW: Math.round(powerKW * 100) / 100
            };
        }
    }

    return null;
}

// ============================================================================
// Main Calculation Function
// ============================================================================

/**
 * Calculate pump sizing requirements and system curve
 */
export function calculatePumpSizing(input: PumpSizingInput): PumpSizingResult {
    const recommendations: string[] = [];
    const safetyFactor = input.safetyFactor ?? 1.1;

    // Convert friction loss to head
    const frictionHeadM = kpaToHeadM(input.frictionLossKPa);

    // Calculate design head with safety factor
    const designHead = (input.staticHeadM + frictionHeadM) * safetyFactor;
    const designFlow = input.designFlowM3H;

    // Generate system curve
    const systemCurve = generateSystemCurve(
        input.staticHeadM,
        frictionHeadM * safetyFactor,
        designFlow
    );

    // Estimate required power (assuming 60% efficiency)
    const estimatedEfficiency = 0.60;
    const requiredPower = (designFlow * designHead * 1000 * 9.81) / (estimatedEfficiency * 3600 * 1000);

    // Estimate NPSH required (rough estimate: 2-4m for most pumps)
    const requiredNPSH = 2 + (designFlow / 20); // Increases with flow

    // Determine pump type
    let recommendedPumpType = 'Circulație';
    if (designHead > 30) {
        recommendedPumpType = 'Multietajată';
    } else if (designFlow > 100) {
        recommendedPumpType = 'In-line sau Split-case';
    } else if (designFlow < 5 && designHead < 6) {
        recommendedPumpType = 'Circulație mică (wet rotor)';
    }

    // Generate recommendations
    if (designFlow > 50) {
        recommendations.push('Consider pompă cu VSD pentru economie de energie');
    }

    if (frictionHeadM > designHead * 0.7) {
        recommendations.push('Pierderi de fricțiune mari - verificați dimensiunea țevilor');
    }

    if (input.staticHeadM > 10) {
        recommendations.push('Înălțime statică mare - verificați NPSH disponibil');
    }

    recommendations.push(`Alegeți pompă cu debit nominal ${(designFlow * 1.1).toFixed(0)} m³/h și înălțime ${(designHead * 1.1).toFixed(1)} m`);

    return {
        designFlow: Math.round(designFlow * 100) / 100,
        designHead: Math.round(designHead * 100) / 100,
        systemCurve,
        requiredPower: Math.round(requiredPower * 100) / 100,
        requiredNPSH: Math.round(requiredNPSH * 10) / 10,
        recommendedPumpType,
        recommendations
    };
}

/**
 * Find best matching pump from standard pumps
 */
export function findBestPump(
    systemCurve: SystemCurvePoint[],
    designFlow: number,
    designHead: number
): { pump: PumpData; operatingPoint: OperatingPoint } | null {
    let bestMatch: { pump: PumpData; operatingPoint: OperatingPoint; score: number } | null = null;

    for (const pump of STANDARD_PUMPS) {
        const opPoint = findOperatingPoint(systemCurve, pump);

        if (opPoint && opPoint.flowM3H >= designFlow * 0.9) {
            // Score based on efficiency and closeness to design point
            const flowDiff = Math.abs(opPoint.flowM3H - designFlow) / designFlow;
            const headDiff = Math.abs(opPoint.headM - designHead) / designHead;
            const score = opPoint.efficiency - (flowDiff + headDiff) * 20;

            if (!bestMatch || score > bestMatch.score) {
                bestMatch = { pump, operatingPoint: opPoint, score };
            }
        }
    }

    return bestMatch ? { pump: bestMatch.pump, operatingPoint: bestMatch.operatingPoint } : null;
}

/**
 * Get all available standard pumps
 */
export function getAvailablePumps(): PumpData[] {
    return [...STANDARD_PUMPS];
}
