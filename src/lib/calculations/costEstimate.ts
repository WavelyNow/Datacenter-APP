/**
 * Cost Estimation Module
 * Calculates project costs based on materials, equipment, and labor
 */

import { PipeSegment, EquipmentItem } from '../types';
import { PIPE_STANDARDS } from '../pipeStandards';

// ============================================================================
// Price Data (EUR)
// ============================================================================

// Pipe prices per meter by material type
const PIPE_PRICES_PER_METER: Record<string, Record<string, number>> = {
    'steel_light': {
        'DN15': 8, 'DN20': 10, 'DN25': 14, 'DN32': 18, 'DN40': 22,
        'DN50': 28, 'DN65': 38, 'DN80': 48, 'DN100': 65, 'DN125': 85,
        'DN150': 110, 'DN200': 160, 'DN250': 220, 'DN300': 290
    },
    'steel_normal': {
        'DN15': 10, 'DN20': 12, 'DN25': 16, 'DN32': 21, 'DN40': 26,
        'DN50': 33, 'DN65': 45, 'DN80': 58, 'DN100': 78, 'DN125': 100,
        'DN150': 130, 'DN200': 190, 'DN250': 260, 'DN300': 340
    },
    'copper': {
        'DN15': 15, 'DN20': 20, 'DN25': 28, 'DN32': 38, 'DN40': 50,
        'DN50': 68, 'DN65': 95, 'DN80': 125, 'DN100': 175
    },
    'ppr': {
        'DN20': 4, 'DN25': 5, 'DN32': 7, 'DN40': 10, 'DN50': 14,
        'DN65': 20, 'DN80': 28, 'DN100': 40, 'DN125': 55
    },
    'pex': {
        'DN16': 3, 'DN20': 4, 'DN25': 5, 'DN32': 7
    },
    'custom': {}
};

// Fitting cost multiplier (fittings typically add 20-40% to pipe cost)
const FITTINGS_MULTIPLIER = 0.30;

// Insulation price per meter (depends on pipe diameter and insulation thickness)
const INSULATION_BASE_PRICE = 12; // EUR per meter for DN50
const INSULATION_DIAMETER_FACTOR = 0.15; // Price increase per DN step

// Labor rates (EUR per hour)
const LABOR_RATES = {
    pipeInstallation: 45,      // Per meter
    equipmentInstallation: 65, // Per unit
    testing: 55,               // Pressure testing
    commissioning: 75,         // System commissioning
};

// Labor hours estimates
const LABOR_HOURS = {
    pipePerMeter: 0.5,         // Hours per meter of pipe
    equipmentSmall: 2,         // Hours per small equipment
    equipmentMedium: 6,        // Hours per medium equipment  
    equipmentLarge: 12,        // Hours per large equipment (chiller, etc.)
    testingPerSegment: 0.25,   // Hours per segment for testing
    commissioning: 16,         // Flat hours for commissioning
};

// Support hardware prices
const SUPPORT_PRICES = {
    mountingRail: 25,          // Per meter
    clamp: 8,                  // Per clamp
    anchor: 3,                 // Per anchor point
    threadedRod: 12,           // Per meter
};

// ============================================================================
// Cost Calculation Functions
// ============================================================================

export interface CostBreakdown {
    // Materials
    pipeMaterials: number;
    fittings: number;
    insulation: number;
    supports: number;

    // Equipment
    equipmentPurchase: number;

    // Labor
    pipeInstallation: number;
    equipmentInstallation: number;
    testing: number;
    commissioning: number;

    // Totals
    totalMaterials: number;
    totalLabor: number;
    grandTotal: number;

    // Metrics
    costPerMeter: number;
    costPerKwCooling: number;
}

export interface CostEstimatorConfig {
    includeInsulation: boolean;
    insulationThicknessMm: number;
    includeSupports: boolean;
    supportSpacingM: number;
    laborMarkup: number;        // Percentage markup on labor (0-100)
    materialMarkup: number;     // Percentage markup on materials (0-100)
    coolingCapacityKw?: number; // Optional: for cost/kW metric
}

const DEFAULT_CONFIG: CostEstimatorConfig = {
    includeInsulation: true,
    insulationThicknessMm: 25,
    includeSupports: true,
    supportSpacingM: 2.5,
    laborMarkup: 15,
    materialMarkup: 10,
};

/**
 * Get pipe price per meter
 */
function getPipePrice(material: string, size: string): number {
    const materialPrices = PIPE_PRICES_PER_METER[material];
    if (materialPrices && materialPrices[size]) {
        return materialPrices[size];
    }
    // Fallback for custom or unknown - estimate based on typical steel pricing
    return 50;
}

/**
 * Get DN number from size string
 */
function getDnNumber(size: string): number {
    const match = size.match(/DN(\d+)/);
    return match ? parseInt(match[1]) : 50;
}

/**
 * Calculate insulation cost per meter
 */
function getInsulationPrice(size: string, thicknessMm: number): number {
    const dn = getDnNumber(size);
    const basePrice = INSULATION_BASE_PRICE;
    const diameterMultiplier = 1 + (dn - 50) * INSULATION_DIAMETER_FACTOR / 50;
    const thicknessMultiplier = thicknessMm / 25; // Base is 25mm
    return basePrice * Math.max(0.5, diameterMultiplier) * thicknessMultiplier;
}

/**
 * Classify equipment by size for labor estimation
 */
function classifyEquipmentSize(equipment: EquipmentItem): 'small' | 'medium' | 'large' {
    if (equipment.type === 'Chiller' || equipment.type === 'Dry Cooler / Turn Răcire') {
        return 'large';
    }
    if (equipment.type === 'Puffer / Rezervor Tampon' ||
        equipment.type === 'Schimbător Căldură (Plaques)' ||
        equipment.type === 'CRAH / CCU') {
        return 'medium';
    }
    return 'small';
}

/**
 * Main cost estimation function
 */
export function calculateCostEstimate(
    segments: PipeSegment[],
    equipment: EquipmentItem[],
    config: Partial<CostEstimatorConfig> = {}
): CostBreakdown {
    const cfg = { ...DEFAULT_CONFIG, ...config };

    // ========================================================================
    // PIPE MATERIALS
    // ========================================================================
    let pipeMaterials = 0;
    let totalPipeLength = 0;

    for (const seg of segments) {
        const pricePerMeter = getPipePrice(seg.material, seg.size);
        pipeMaterials += pricePerMeter * seg.length;
        totalPipeLength += seg.length;
    }

    // Fittings estimate
    const fittings = pipeMaterials * FITTINGS_MULTIPLIER;

    // ========================================================================
    // INSULATION
    // ========================================================================
    let insulation = 0;
    if (cfg.includeInsulation) {
        for (const seg of segments) {
            const insulationPrice = getInsulationPrice(seg.size, cfg.insulationThicknessMm);
            insulation += insulationPrice * seg.length;
        }
    }

    // ========================================================================
    // SUPPORTS
    // ========================================================================
    let supports = 0;
    if (cfg.includeSupports && totalPipeLength > 0) {
        const numberOfSupports = Math.ceil(totalPipeLength / cfg.supportSpacingM);
        supports = numberOfSupports * (SUPPORT_PRICES.clamp + SUPPORT_PRICES.anchor +
            (SUPPORT_PRICES.mountingRail * 0.3) + (SUPPORT_PRICES.threadedRod * 0.5));
    }

    // ========================================================================
    // EQUIPMENT PURCHASE (Estimate based on specifications)
    // ========================================================================
    let equipmentPurchase = 0;

    for (const eq of equipment) {
        // Rough estimate based on type and size
        let basePrice = 0;

        switch (eq.type) {
            case 'Chiller':
                basePrice = 15000 + (eq.power || 0) * 80; // Base + per kW
                break;
            case 'Dry Cooler / Turn Răcire':
                basePrice = 8000 + (eq.power || 0) * 50;
                break;
            case 'CRAH / CCU':
                basePrice = 5000 + (eq.power || 0) * 40;
                break;
            case 'Unitate internă (CDU)':
                basePrice = 3000 + (eq.power || 0) * 30;
                break;
            case 'Grup Pompare':
                basePrice = 1500 + (eq.power || 0) * 100;
                break;
            case 'Puffer / Rezervor Tampon':
                basePrice = 500 + (eq.volume || 0) * 0.8;
                break;
            case 'Schimbător Căldură (Plaques)':
                basePrice = 2000 + (eq.power || 0) * 25;
                break;
            default:
                basePrice = 1000 + (eq.weight || 0) * 2;
        }

        equipmentPurchase += basePrice;
    }

    // ========================================================================
    // LABOR COSTS
    // ========================================================================

    // Pipe installation
    const pipeInstallationHours = totalPipeLength * LABOR_HOURS.pipePerMeter;
    const pipeInstallation = pipeInstallationHours * LABOR_RATES.pipeInstallation;

    // Equipment installation
    let equipmentInstallationHours = 0;
    for (const eq of equipment) {
        const size = classifyEquipmentSize(eq);
        equipmentInstallationHours += LABOR_HOURS[
            size === 'small' ? 'equipmentSmall' :
                size === 'medium' ? 'equipmentMedium' : 'equipmentLarge'
        ];
    }
    const equipmentInstallation = equipmentInstallationHours * LABOR_RATES.equipmentInstallation;

    // Testing
    const testingHours = segments.length * LABOR_HOURS.testingPerSegment;
    const testing = testingHours * LABOR_RATES.testing;

    // Commissioning
    const commissioning = LABOR_HOURS.commissioning * LABOR_RATES.commissioning;

    // ========================================================================
    // TOTALS WITH MARKUPS
    // ========================================================================

    const materialMarkupMultiplier = 1 + (cfg.materialMarkup / 100);
    const laborMarkupMultiplier = 1 + (cfg.laborMarkup / 100);

    const totalMaterials = (pipeMaterials + fittings + insulation + supports) * materialMarkupMultiplier;
    const totalLabor = (pipeInstallation + equipmentInstallation + testing + commissioning) * laborMarkupMultiplier;
    const grandTotal = totalMaterials + equipmentPurchase + totalLabor;

    // ========================================================================
    // METRICS
    // ========================================================================

    const costPerMeter = totalPipeLength > 0 ? grandTotal / totalPipeLength : 0;

    // Cost per kW cooling capacity
    let costPerKwCooling = 0;
    if (cfg.coolingCapacityKw && cfg.coolingCapacityKw > 0) {
        costPerKwCooling = grandTotal / cfg.coolingCapacityKw;
    } else {
        // Estimate from equipment power
        const totalCoolingPower = equipment
            .filter(eq => ['Chiller', 'CRAH / CCU', 'Dry Cooler / Turn Răcire'].includes(eq.type))
            .reduce((sum, eq) => sum + (eq.power || 0), 0);
        if (totalCoolingPower > 0) {
            costPerKwCooling = grandTotal / totalCoolingPower;
        }
    }

    return {
        pipeMaterials: Math.round(pipeMaterials),
        fittings: Math.round(fittings),
        insulation: Math.round(insulation),
        supports: Math.round(supports),
        equipmentPurchase: Math.round(equipmentPurchase),
        pipeInstallation: Math.round(pipeInstallation),
        equipmentInstallation: Math.round(equipmentInstallation),
        testing: Math.round(testing),
        commissioning: Math.round(commissioning),
        totalMaterials: Math.round(totalMaterials),
        totalLabor: Math.round(totalLabor),
        grandTotal: Math.round(grandTotal),
        costPerMeter: Math.round(costPerMeter),
        costPerKwCooling: Math.round(costPerKwCooling),
    };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
