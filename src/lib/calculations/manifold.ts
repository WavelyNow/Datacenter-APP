
import { PIPE_STANDARDS } from '../pipeStandards';
import { calculateHydraulics } from '../calc/hydraulics';
import { getPipeData } from './common';

export type FittingType = 'elbow_90' | 'tee_flow' | 'tee_branch' | 'valve_butterfly' | 'valve_ball' | 'reducer' | 'enlargement';

export const ZETA_VALUES: Record<FittingType, number> = {
    elbow_90: 0.75, // Standard 90° elbow (aligned with fittings.ts K_FACTORS)
    tee_flow: 0.60, // Run through Tee
    tee_branch: 1.80, // Flow through Branch
    valve_butterfly: 0.25, // Fully open
    valve_ball: 0.05, // Fully open
    reducer: 0.5, // Conservative estimate
    enlargement: 1.0 // Sudden expansion
};

export const FITTING_LABELS: Record<FittingType, string> = {
    elbow_90: 'Cot 90°',
    tee_flow: 'Teu (Trecere)',
    tee_branch: 'Teu (Ramificație)',
    valve_butterfly: 'Vană Fluture',
    valve_ball: 'Robinet Bilă',
    reducer: 'Reducție',
    enlargement: 'Extindere'
};

export interface ManifoldNode {
    id: string;
    type: 'inlet' | 'outlet' | 'fitting' | 'pipe';
    fittingType?: FittingType;
    dn: string; // "DN350"
    length?: number; // meters, for pipe segments (optional in manifold)
    material: string; // "steel_heavy", etc.
    customName?: string;
    flowExtract?: number; // m3/h (Only for outlets)
}

export interface SimulationResultNode {
    nodeId: string;
    velocity: number; // m/s
    pressureDropPa: number; // Pa (Local)
    cumulativePressureDropPa: number; // Pa (Total from start)
    kValue: number; // Zeta
    flowRegime: string;
    temp: number; // C
    flowRate: number; // m3/h at this node
}

/**
 * Classify flow regime from Reynolds number (Re = v·D/ν).
 * Uses the correct 2300/4000 Re thresholds (NOT velocity thresholds).
 */
export function classifyRegime(
    velocity: number,
    diameterM: number,
    fluidDensity: number,
    kinematicViscosity: number
): string {
    if (velocity <= 0 || diameterM <= 0 || kinematicViscosity <= 0) return 'Laminar';
    const Re = (velocity * diameterM) / kinematicViscosity;
    if (Re < 2300) return 'Laminar';
    if (Re < 4000) return 'Transitional';
    return 'Turbulent';
}

export const calculateManifoldSimulation = (
    nodes: ManifoldNode[],
    inletFlowRate: number, // m3/h
    inletTemp: number, // C
    fluidDensity: number = 1000, // kg/m3
    kinematicViscosity: number = 1.004e-6 // m²/s (default water 20°C)
): SimulationResultNode[] => {
    let currentFlow = inletFlowRate;
    let currentPressureDrop = 0;
    let currentTemp = inletTemp;
    const results: SimulationResultNode[] = [];
    
    // We assume water properties for specific heat capacity for thermal calc simplified
    const AMBIENT_TEMP = 20; // C
    const SPECIFIC_HEAT_WATER = 4186; // J/(kg*K)

    nodes.forEach((node) => {
        // 1. Get Geometry & Data
        const pipeData = getPipeData(node.material, node.dn);
        if (!pipeData) {
            results.push({
                nodeId: node.id,
                velocity: 0,
                pressureDropPa: 0,
                cumulativePressureDropPa: currentPressureDrop,
                kValue: 0,
                flowRegime: 'Invalid DN',
                temp: currentTemp,
                flowRate: currentFlow
            });
            return;
        }

        const id_m = pipeData.id / 1000;
        const od_m = pipeData.od / 1000;
        const area = Math.PI * Math.pow(id_m / 2, 2);
        
        // 2. Calculate Velocity
        const velocity = currentFlow > 0 ? (currentFlow / 3600) / area : 0;

        // 3. Determine Flow Rate Change (Outlets reduce flow for NEXT node)
        // If it's an outlet, we assume flow leaves AFTER the node (or at the node).
        // Velocity calculated based on INPUT flow to the node.

        // 4. Zeta / K-Value & Pressure Drop
        let zeta = 0;
        let pressureDrop = 0;
        let flowRegimeStr = 'Laminar';

        // Default length for fitting thermal calc (equivalent length or physical length)
        // For a fitting, surface area is approx same as pipe of length 2xD?
        let surfaceArea = 0;
        let elementLength = 0;

        if (node.type === 'fitting' && node.fittingType) {
            zeta = ZETA_VALUES[node.fittingType] || 0;
            pressureDrop = zeta * (fluidDensity * Math.pow(velocity, 2)) / 2;
            flowRegimeStr = classifyRegime(velocity, id_m, fluidDensity, kinematicViscosity);
            
            // Thermal: Approx surface area for fitting
            elementLength = od_m * 3; // Approx length of a fitting
            surfaceArea = Math.PI * od_m * elementLength;

        } else if (node.type === 'pipe' && node.length) {
            // Darcy-Weisbach standard pipe calc
            const res = calculateHydraulics(currentFlow, pipeData.id, 0.045, fluidDensity, kinematicViscosity);
            pressureDrop = res.pressureDropPa * node.length;
            flowRegimeStr = res.flowRegime;
            
            elementLength = node.length;
            surfaceArea = Math.PI * od_m * node.length;

        } else if (node.type === 'outlet') {
            zeta = ZETA_VALUES['tee_branch'];
            pressureDrop = zeta * (fluidDensity * Math.pow(velocity, 2)) / 2;
            flowRegimeStr = classifyRegime(velocity, id_m, fluidDensity, kinematicViscosity);
            
            elementLength = od_m * 2;
            surfaceArea = Math.PI * od_m * elementLength;
        } else if (node.type === 'inlet') {
            // Inlet has no loss usually, reference point
             pressureDrop = 0;
             surfaceArea = 0;
             flowRegimeStr = classifyRegime(velocity, id_m, fluidDensity, kinematicViscosity);
        }

        currentPressureDrop += pressureDrop;

        // 5. Thermal Loss Calculation
        // U-Value estimation (Assumed uninsulated metal for worst case or insulated if specified)
        // For Datacenter: usually insulated. U ~ 0.5 W/m2K ?
        // If uninsulated steel: U ~ 10-15 W/m2K
        const U_VALUE = 0.5; // W/m2K (Insulated)
        
        const dT_ambient = currentTemp - AMBIENT_TEMP;
        const heatLossWatts = U_VALUE * surfaceArea * dT_ambient; // W (J/s)
        
        // Temp Drop = Q / (m_dot * Cp)
        // m_dot = VolFlow (m3/s) * Density (kg/m3)
        let tempDrop = 0;
        if (currentFlow > 0) {
            const massFlow = (currentFlow / 3600) * fluidDensity; // kg/s
            tempDrop = heatLossWatts / (massFlow * SPECIFIC_HEAT_WATER);
        }

        currentTemp -= tempDrop;

        results.push({
            nodeId: node.id,
            velocity: velocity,
            pressureDropPa: pressureDrop,
            cumulativePressureDropPa: currentPressureDrop,
            kValue: zeta,
            flowRegime: flowRegimeStr,
            temp: parseFloat(currentTemp.toFixed(4)),
            flowRate: currentFlow
        });

        // Update Flow for next segment
        if (node.type === 'outlet' && node.flowExtract) {
            currentFlow -= node.flowExtract;
            if (currentFlow < 0) currentFlow = 0;
        }
    });

    return results;
};
