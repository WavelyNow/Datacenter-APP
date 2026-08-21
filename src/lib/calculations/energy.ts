/**
 * Energy Calculations Module
 * Provides real PUE and energy efficiency calculations based on equipment data
 */

import { EquipmentItem } from '../types';

// Equipment type categories for PUE calculation
const IT_LOAD_TYPES = ['CRAH / CCU', 'Unitate internă (CDU)'];
const COOLING_INFRASTRUCTURE_TYPES = ['Chiller', 'Dry Cooler / Turn Răcire'];
const PUMP_TYPES = ['Grup Pompare'];

// CO2 emission factor (kg CO2 per kWh) - EU average
const CO2_FACTOR_KG_PER_KWH = 0.233;

// Free cooling hours based on location (simplified - Romania climate)
const FREE_COOLING_HOURS_BY_REGION: Record<string, number> = {
    'București': 2400,
    'Cluj': 2800,
    'Timișoara': 2600,
    'Iași': 2700,
    'default': 2500,
};

export type EfficiencyClass = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

export interface EnergyMetrics {
    // Power breakdown
    totalITLoad: number;              // kW - IT equipment power (CDUs, CRAHs)
    totalCoolingInfrastructure: number; // kW - Chillers, Dry Coolers
    totalPumpPower: number;           // kW - Pump groups
    totalFacilityPower: number;       // kW - All equipment combined

    // PUE calculation
    pue: number;                      // Power Usage Effectiveness
    pueIsEstimate: boolean;           // true when PUE could not be computed from real IT load (fallback used)
    pueIdeal: number;                 // Theoretical best PUE based on equipment

    // Annual estimates (80% load factor)
    annualEnergyKwh: number;          // kWh/year
    annualCO2Tons: number;            // tons CO2/year

    // Efficiency ratings
    efficiencyClass: EfficiencyClass;
    efficiencyScore: number;          // 0-100 score

    // Optimization potential
    freeCoolingHours: number;         // Hours/year where free cooling is possible
    freeCoolingSavingsKwh: number;    // Potential savings from free cooling
    heatRecoveryPotentialKw: number;  // Recoverable heat
    potentialCO2Reduction: number;    // tons CO2/year potential reduction

    // Equipment analysis
    hasVSDPumps: boolean;
    hasFreeCooling: boolean;
    hasHeatRecovery: boolean;

    // Recommendations
    recommendations: EnergyRecommendation[];
}

export interface EnergyRecommendation {
    id: string;
    title: string;
    description: string;
    potentialSavings: string;
    priority: 'high' | 'medium' | 'low';
    category: 'efficiency' | 'sustainability' | 'cost';
}

/**
 * Calculate comprehensive energy metrics based on equipment list
 */
export function calculateEnergyMetrics(
    equipmentList: EquipmentItem[],
    location: string = 'București'
): EnergyMetrics {
    // 1. Calculate power by category
    const totalITLoad = equipmentList
        .filter(e => IT_LOAD_TYPES.includes(e.type))
        .reduce((acc, e) => acc + (e.power || 0), 0);

    const totalCoolingInfrastructure = equipmentList
        .filter(e => COOLING_INFRASTRUCTURE_TYPES.includes(e.type))
        .reduce((acc, e) => acc + (e.power || 0), 0);

    const totalPumpPower = equipmentList
        .filter(e => PUMP_TYPES.includes(e.type))
        .reduce((acc, e) => acc + (e.power || 0), 0);

    const totalFacilityPower = equipmentList.reduce((acc, e) => acc + (e.power || 0), 0);

    // 2. Calculate PUE (Power Usage Effectiveness)
    // PUE = Total Facility Power / IT Equipment Power
    let pue: number;
    let pueIsEstimate = false;
    if (totalITLoad > 0 && totalFacilityPower > 0) {
        // Real measurement: total facility power / IT power
        pue = totalFacilityPower / totalITLoad;
    } else if (totalFacilityPower > 0) {
        // No IT-type equipment defined — cannot compute a real PUE.
        // Fall back to a typical industry figure but FLAG it as an estimate
        // (never present a guessed ratio as a calculation).
        pue = 1.6; // Industry average fallback (labeled estimate)
        pueIsEstimate = true;
    } else {
        // No equipment at all — no meaningful PUE
        pue = 1.0;
        pueIsEstimate = true;
    }

    // Clamp PUE to realistic range (flag when clamped)
    const clamped = Math.max(1.0, Math.min(3.0, pue));
    if (clamped !== pue) pueIsEstimate = true;
    pue = clamped;

    // 3. Calculate ideal PUE based on equipment selection
    const hasModernChiller = equipmentList.some(e =>
        e.type === 'Chiller' && (e.name?.toLowerCase().includes('vsd') || e.options?.includes('VSD'))
    );
    const hasFreeCoolingEquip = equipmentList.some(e =>
        e.type === 'Dry Cooler / Turn Răcire' || e.options?.includes('Free Cooling')
    );

    let pueIdeal = 1.4; // Modern DC baseline
    if (hasModernChiller) pueIdeal -= 0.1;
    if (hasFreeCoolingEquip) pueIdeal -= 0.15;
    pueIdeal = Math.max(1.1, pueIdeal);

    // 4. Annual energy calculations (80% average load factor, 8760 hours/year)
    const LOAD_FACTOR = 0.8;
    const HOURS_PER_YEAR = 8760;
    const annualEnergyKwh = totalFacilityPower * LOAD_FACTOR * HOURS_PER_YEAR;
    const annualCO2Tons = (annualEnergyKwh * CO2_FACTOR_KG_PER_KWH) / 1000;

    // 5. Efficiency classification
    let efficiencyClass: EfficiencyClass;
    let efficiencyScore: number;

    if (pue < 1.2) {
        efficiencyClass = 'Platinum';
        efficiencyScore = 95;
    } else if (pue < 1.4) {
        efficiencyClass = 'Gold';
        efficiencyScore = 80;
    } else if (pue < 1.6) {
        efficiencyClass = 'Silver';
        efficiencyScore = 65;
    } else {
        efficiencyClass = 'Bronze';
        efficiencyScore = 50;
    }

    // Adjust score based on additional factors
    if (hasFreeCoolingEquip) efficiencyScore += 5;
    if (hasModernChiller) efficiencyScore += 5;
    efficiencyScore = Math.min(100, efficiencyScore);

    // 6. Free cooling potential
    const freeCoolingHours = FREE_COOLING_HOURS_BY_REGION[location] || FREE_COOLING_HOURS_BY_REGION['default'];
    const freeCoolingSavingsKwh = hasFreeCoolingEquip
        ? totalCoolingInfrastructure * 0.6 * freeCoolingHours  // 60% savings during free cooling
        : 0;

    // 7. Heat recovery potential (90% of rejected heat is recoverable)
    const heatRecoveryPotentialKw = totalFacilityPower * 0.9;

    // 8. Potential CO2 reduction from optimizations
    const potentialCO2Reduction = (freeCoolingSavingsKwh * CO2_FACTOR_KG_PER_KWH) / 1000;

    // 9. Equipment feature detection
    const hasVSDPumps = equipmentList.some(e =>
        e.type === 'Grup Pompare' && (
            e.name?.toLowerCase().includes('magna') ||
            e.name?.toLowerCase().includes('vsd') ||
            e.options?.includes('VSD')
        )
    );
    const hasHeatRecovery = equipmentList.some(e => e.options?.includes('Heat Recovery'));

    // 10. Generate recommendations
    const recommendations: EnergyRecommendation[] = [];

    if (!hasFreeCoolingEquip) {
        recommendations.push({
            id: 'free-cooling',
            title: 'Free Cooling Potential',
            description: `Locația ${location} permite aproximativ ${freeCoolingHours} ore/an de free cooling. Considerați adăugarea unui dry cooler.`,
            potentialSavings: '15-25% reducere consum energie cooling',
            priority: 'high',
            category: 'efficiency'
        });
    }

    if (!hasVSDPumps && totalPumpPower > 0) {
        recommendations.push({
            id: 'vsd-pumps',
            title: 'Variable Speed Drives',
            description: 'Pompele cu VSD pot reduce consumul cu până la 30% prin control ΔP-v.',
            potentialSavings: '~30% reducere consum pompe',
            priority: 'high',
            category: 'efficiency'
        });
    }

    if (heatRecoveryPotentialKw > 50 && !hasHeatRecovery) {
        const heatedArea = Math.round(heatRecoveryPotentialKw * 25); // ~25m² per kW
        recommendations.push({
            id: 'heat-recovery',
            title: 'Heat Recovery',
            description: `Căldura reziduală de ${heatRecoveryPotentialKw.toFixed(0)} kW poate încălzi ~${heatedArea.toLocaleString()} m² spațiu de birouri.`,
            potentialSavings: 'Reducere costuri încălzire clădire',
            priority: 'medium',
            category: 'sustainability'
        });
    }

    if (pue > 1.5 && !pueIsEstimate) {
        recommendations.push({
            id: 'optimize-pue',
            title: 'Optimizare PUE',
            description: 'PUE-ul curent este peste media industriei. Revizuiți dimensionarea echipamentelor și pierderile din sistem.',
            potentialSavings: 'Target PUE < 1.4',
            priority: 'high',
            category: 'efficiency'
        });
    }

    return {
        totalITLoad,
        totalCoolingInfrastructure,
        totalPumpPower,
        totalFacilityPower,
        pue,
        pueIsEstimate,
        pueIdeal,
        annualEnergyKwh,
        annualCO2Tons,
        efficiencyClass,
        efficiencyScore,
        freeCoolingHours,
        freeCoolingSavingsKwh,
        heatRecoveryPotentialKw,
        potentialCO2Reduction,
        hasVSDPumps,
        hasFreeCooling: hasFreeCoolingEquip,
        hasHeatRecovery,
        recommendations
    };
}

/**
 * Calculate simple metrics for widgets
 */
export function getQuickEnergyStats(equipmentList: EquipmentItem[]): {
    totalPower: number;
    pue: number;
    efficiencyClass: EfficiencyClass;
} {
    const metrics = calculateEnergyMetrics(equipmentList);
    return {
        totalPower: metrics.totalFacilityPower,
        pue: metrics.pue,
        efficiencyClass: metrics.efficiencyClass
    };
}
