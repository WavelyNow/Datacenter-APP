/**
 * Tests for Cost Estimation Module
 */

import {
    calculateCostEstimate,
    formatCurrency,
    CostBreakdown,
} from '@/lib/calculations/costEstimate';
import { PipeSegment, EquipmentItem } from '@/lib/types';

describe('Cost Estimation', () => {

    const mockSegments: PipeSegment[] = [
        { id: '1', material: 'steel_light', standard: 'EN 10255', size: 'DN50', length: 10 },
        { id: '2', material: 'steel_light', standard: 'EN 10255', size: 'DN80', length: 15 },
        { id: '3', material: 'copper', standard: 'EN 1057', size: 'DN25', length: 5 },
    ];

    const mockEquipment: EquipmentItem[] = [
        { id: 'eq1', name: 'Chiller 1', type: 'Chiller', volume: 100, weight: 500, power: 50 },
        { id: 'eq2', name: 'Pump 1', type: 'Grup Pompare', volume: 5, weight: 20, power: 5 },
        { id: 'eq3', name: 'Buffer Tank', type: 'Puffer / Rezervor Tampon', volume: 500, weight: 100 },
    ];

    describe('calculateCostEstimate', () => {
        it('returns a complete cost breakdown', () => {
            const result = calculateCostEstimate(mockSegments, mockEquipment);

            expect(result).toHaveProperty('pipeMaterials');
            expect(result).toHaveProperty('fittings');
            expect(result).toHaveProperty('insulation');
            expect(result).toHaveProperty('supports');
            expect(result).toHaveProperty('equipmentPurchase');
            expect(result).toHaveProperty('pipeInstallation');
            expect(result).toHaveProperty('equipmentInstallation');
            expect(result).toHaveProperty('testing');
            expect(result).toHaveProperty('commissioning');
            expect(result).toHaveProperty('totalMaterials');
            expect(result).toHaveProperty('totalLabor');
            expect(result).toHaveProperty('grandTotal');
        });

        it('returns non-zero costs for valid inputs', () => {
            const result = calculateCostEstimate(mockSegments, mockEquipment);

            expect(result.pipeMaterials).toBeGreaterThan(0);
            expect(result.equipmentPurchase).toBeGreaterThan(0);
            expect(result.grandTotal).toBeGreaterThan(0);
        });

        it('returns zero costs for empty inputs', () => {
            const result = calculateCostEstimate([], []);

            expect(result.pipeMaterials).toBe(0);
            expect(result.fittings).toBe(0);
            // Some fixed costs may still apply (commissioning)
        });

        it('respects includeInsulation config', () => {
            const withInsulation = calculateCostEstimate(mockSegments, mockEquipment, {
                includeInsulation: true,
            });

            const withoutInsulation = calculateCostEstimate(mockSegments, mockEquipment, {
                includeInsulation: false,
            });

            expect(withInsulation.insulation).toBeGreaterThan(0);
            expect(withoutInsulation.insulation).toBe(0);
        });

        it('respects includeSupports config', () => {
            const withSupports = calculateCostEstimate(mockSegments, mockEquipment, {
                includeSupports: true,
            });

            const withoutSupports = calculateCostEstimate(mockSegments, mockEquipment, {
                includeSupports: false,
            });

            expect(withSupports.supports).toBeGreaterThan(0);
            expect(withoutSupports.supports).toBe(0);
        });

        it('applies material markup correctly', () => {
            const noMarkup = calculateCostEstimate(mockSegments, mockEquipment, {
                materialMarkup: 0,
            });

            const withMarkup = calculateCostEstimate(mockSegments, mockEquipment, {
                materialMarkup: 20,
            });

            // Total materials with 20% markup should be ~20% higher
            const baseMaterials = noMarkup.pipeMaterials + noMarkup.fittings + noMarkup.insulation + noMarkup.supports;
            expect(withMarkup.totalMaterials).toBeCloseTo(baseMaterials * 1.2, -1);
        });

        it('calculates cost per meter', () => {
            const result = calculateCostEstimate(mockSegments, mockEquipment);
            const totalLength = mockSegments.reduce((sum, seg) => sum + seg.length, 0);

            expect(result.costPerMeter).toBeCloseTo(result.grandTotal / totalLength, 0);
        });
    });

    describe('formatCurrency', () => {
        it('formats EUR currency correctly', () => {
            const formatted = formatCurrency(1234);
            expect(formatted).toContain('1');
            expect(formatted).toContain('234');
        });

        it('handles zero', () => {
            const formatted = formatCurrency(0);
            expect(formatted).toContain('0');
        });

        it('handles large numbers', () => {
            const formatted = formatCurrency(1000000);
            expect(formatted).toContain('1');
            expect(formatted).toContain('000');
        });
    });
});
