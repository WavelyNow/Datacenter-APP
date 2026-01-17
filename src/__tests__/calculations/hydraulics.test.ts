/**
 * Tests for Hydraulics Calculation Module
 * Covers volume calculations, glycol requirements, and system weights
 */

import {
    calculatePipeVolume,
    calculateTotalVolume,
    calculateGlycolVolume,
    calculateWaterVolume,
    calculateSystemWeight
} from '@/lib/calculations/hydraulics';
import { PipeSegment, EquipmentItem } from '@/lib/types';

describe('Hydraulics Calculations', () => {

    // Test data
    const mockSegments: PipeSegment[] = [
        { id: '1', material: 'steel_light', standard: 'EN 10255', size: 'DN50', length: 10 },
        { id: '2', material: 'steel_light', standard: 'EN 10255', size: 'DN80', length: 15 },
        { id: '3', material: 'copper', standard: 'EN 1057', size: 'DN25', length: 5 },
    ];

    const mockEquipment: EquipmentItem[] = [
        { id: 'eq1', name: 'Buffer Tank', type: 'Puffer / Rezervor Tampon', volume: 500, weight: 100 },
        { id: 'eq2', name: 'Pump', type: 'Grup Pompare', volume: 5, weight: 20 },
    ];

    describe('calculatePipeVolume', () => {
        it('calculates volume for a standard pipe segment', () => {
            const segment: PipeSegment = {
                id: 'test',
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN50',
                length: 10
            };

            const volume = calculatePipeVolume(segment);

            // DN50 steel has ~53mm ID, 10m length
            // Volume = π × (0.0265)² × 10 × 1000 = ~22 liters
            expect(volume).toBeGreaterThan(15);
            expect(volume).toBeLessThan(30);
        });

        it('calculates volume for custom diameter pipe', () => {
            const segment: PipeSegment = {
                id: 'custom',
                material: 'custom',
                standard: 'custom',
                size: 'custom',
                length: 10,
                customInnerDiameter: 50
            };

            const volume = calculatePipeVolume(segment);

            // 50mm ID, 10m length
            // Volume = π × (0.025)² × 10 × 1000 = 19.63 liters
            expect(volume).toBeCloseTo(19.63, 1);
        });

        it('returns 0 for null or invalid segment', () => {
            expect(calculatePipeVolume(null as unknown as PipeSegment)).toBe(0);
            expect(calculatePipeVolume({} as unknown as PipeSegment)).toBe(0);
        });

        it('uses explicit diameter if provided', () => {
            const segment: PipeSegment = {
                id: 'test',
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN50',
                length: 10,
                diameter: 100  // Override with 100mm
            };

            const volume = calculatePipeVolume(segment);

            // 100mm ID should give more volume than DN50
            expect(volume).toBeGreaterThan(50);
        });
    });

    describe('calculateTotalVolume', () => {
        it('sums pipe and equipment volumes', () => {
            const total = calculateTotalVolume(mockSegments, mockEquipment, false);

            // Should include equipment volume (500 + 5 = 505 liters) plus pipe volumes
            expect(total).toBeGreaterThan(505);
        });

        it('applies 5% safety margin when enabled', () => {
            const withoutMargin = calculateTotalVolume(mockSegments, mockEquipment, false);
            const withMargin = calculateTotalVolume(mockSegments, mockEquipment, true);

            expect(withMargin).toBeCloseTo(withoutMargin * 1.05, 1);
        });

        it('handles empty arrays', () => {
            const volume = calculateTotalVolume([], [], false);
            expect(volume).toBe(0);
        });

        it('handles null equipment list', () => {
            const volume = calculateTotalVolume(mockSegments, null as unknown as EquipmentItem[], false);
            expect(volume).toBeGreaterThan(0);
        });
    });

    describe('calculateGlycolVolume', () => {
        it('calculates glycol volume correctly', () => {
            const totalVolume = 1000; // 1000 liters

            expect(calculateGlycolVolume(totalVolume, 30)).toBe(300);
            expect(calculateGlycolVolume(totalVolume, 40)).toBe(400);
            expect(calculateGlycolVolume(totalVolume, 50)).toBe(500);
        });

        it('returns 0 for 0% glycol', () => {
            expect(calculateGlycolVolume(1000, 0)).toBe(0);
        });

        it('returns full volume for 100% glycol', () => {
            expect(calculateGlycolVolume(1000, 100)).toBe(1000);
        });
    });

    describe('calculateWaterVolume', () => {
        it('calculates water volume correctly', () => {
            const totalVolume = 1000;

            expect(calculateWaterVolume(totalVolume, 30)).toBe(700);
            expect(calculateWaterVolume(totalVolume, 40)).toBe(600);
            expect(calculateWaterVolume(totalVolume, 50)).toBe(500);
        });

        it('returns full volume for 0% glycol (pure water)', () => {
            expect(calculateWaterVolume(1000, 0)).toBe(1000);
        });

        it('glycol + water = total volume', () => {
            const total = 1000;
            const percentage = 35;

            const glycol = calculateGlycolVolume(total, percentage);
            const water = calculateWaterVolume(total, percentage);

            expect(glycol + water).toBe(total);
        });
    });

    describe('calculateSystemWeight', () => {
        it('returns all weight components', () => {
            const totalVolume = 600; // liters
            const result = calculateSystemWeight(mockSegments, mockEquipment, totalVolume, 30);

            expect(result).toHaveProperty('emptyWeight');
            expect(result).toHaveProperty('fluidWeight');
            expect(result).toHaveProperty('totalWeight');
        });

        it('total weight equals empty + fluid weight', () => {
            const result = calculateSystemWeight(mockSegments, mockEquipment, 600, 30);

            expect(result.totalWeight).toBeCloseTo(result.emptyWeight + result.fluidWeight, 1);
        });

        it('includes equipment empty weight', () => {
            const result = calculateSystemWeight([], mockEquipment, 0, 30);

            // Equipment empty weight = 100 + 20 = 120 kg
            expect(result.emptyWeight).toBe(120);
        });

        it('calculates fluid weight based on glycol density', () => {
            const volume = 1000; // 1000 liters

            const withWater = calculateSystemWeight([], [], volume, 0);
            const withGlycol30 = calculateSystemWeight([], [], volume, 30);

            // Water density ~1.0, glycol 30% ~1.038
            expect(withWater.fluidWeight).toBeCloseTo(1000, 0);
            expect(withGlycol30.fluidWeight).toBeCloseTo(1038, 0);
        });

        it('handles custom pipe weights', () => {
            const customSegments: PipeSegment[] = [
                {
                    id: 'custom',
                    material: 'custom',
                    standard: 'custom',
                    size: 'custom',
                    length: 10,
                    customWeight: 5  // 5 kg/m
                }
            ];

            const result = calculateSystemWeight(customSegments, [], 0, 30);

            // 10m × 5 kg/m = 50 kg
            expect(result.emptyWeight).toBe(50);
        });
    });
});
