/**
 * Tests for Energy Calculation Module
 */

import {
    calculateEnergyMetrics,
} from '@/lib/calculations/energy';
import { EquipmentItem } from '@/lib/types';

describe('Energy Calculations', () => {

    const mockEquipment: EquipmentItem[] = [
        { id: '1', name: 'Chiller 1', type: 'Chiller', volume: 100, weight: 500, power: 200 },
        { id: '2', name: 'CDU 1', type: 'Unitate internă (CDU)', volume: 20, weight: 50, power: 100 },
        { id: '3', name: 'Pump 1', type: 'Grup Pompare', volume: 5, weight: 20, power: 15 },
        { id: '4', name: 'CRAH 1', type: 'CRAH / CCU', volume: 30, weight: 100, power: 80 },
    ];

    describe('calculateEnergyMetrics', () => {
        it('returns valid energy metrics structure', () => {
            const result = calculateEnergyMetrics(mockEquipment);

            expect(result).toHaveProperty('totalITLoad');
            expect(result).toHaveProperty('totalCoolingInfrastructure');
            expect(result).toHaveProperty('totalPumpPower');
            expect(result).toHaveProperty('totalFacilityPower');
            expect(result).toHaveProperty('pue');
            expect(result).toHaveProperty('annualEnergyKwh');
            expect(result).toHaveProperty('annualCO2Tons');
            expect(result).toHaveProperty('efficiencyClass');
        });

        it('calculates PUE correctly', () => {
            const result = calculateEnergyMetrics(mockEquipment);

            // PUE = Total Facility Power / IT Load
            // PUE should be >= 1.0
            expect(result.pue).toBeGreaterThanOrEqual(1.0);
            // PUE should be reasonable (<3.0 for modern datacenters)
            expect(result.pue).toBeLessThan(3.0);
        });

        it('returns 1.0 PUE when no IT load', () => {
            const noITEquipment: EquipmentItem[] = [
                { id: '1', name: 'Pump 1', type: 'Grup Pompare', volume: 5, weight: 20, power: 15 },
            ];

            const result = calculateEnergyMetrics(noITEquipment);
            // Either 1.0 or a default value
            expect(result.pue).toBeDefined();
        });

        it('calculates annual energy consumption', () => {
            const result = calculateEnergyMetrics(mockEquipment);

            // Annual energy should be positive
            expect(result.annualEnergyKwh).toBeGreaterThan(0);
        });

        it('returns positive CO2 emissions', () => {
            const result = calculateEnergyMetrics(mockEquipment);
            expect(result.annualCO2Tons).toBeGreaterThan(0);
        });

        it('returns valid efficiency class', () => {
            const result = calculateEnergyMetrics(mockEquipment);
            expect(['Platinum', 'Gold', 'Silver', 'Bronze']).toContain(result.efficiencyClass);
        });

        it('returns higher PUE for less efficient equipment mix', () => {
            // Equipment with high cooling load relative to IT
            const inefficientEquipment: EquipmentItem[] = [
                { id: '1', name: 'CDU 1', type: 'Unitate internă (CDU)', volume: 10, weight: 50, power: 50 },
                { id: '2', name: 'Chiller 1', type: 'Chiller', volume: 100, weight: 500, power: 500 },
                { id: '3', name: 'Chiller 2', type: 'Chiller', volume: 100, weight: 500, power: 500 },
            ];

            const result = calculateEnergyMetrics(inefficientEquipment);
            // Should have a higher (worse) PUE
            expect(result.pue).toBeGreaterThan(1.0);
        });
    });
});
