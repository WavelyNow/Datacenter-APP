/**
 * Tests for Bill of Quantities (BoQ) Module
 */

import {
    generateBoQ,
    getDetailedWeightReport,
    BoQItem,
    DetailedWeightItem
} from '@/lib/calculations/boq';
import { PipeSegment, EquipmentItem } from '@/lib/types';

describe('Bill of Quantities (BoQ)', () => {

    const mockSegments: PipeSegment[] = [
        { id: '1', material: 'steel_light', standard: 'EN 10255', size: 'DN50', length: 10 },
        { id: '2', material: 'steel_light', standard: 'EN 10255', size: 'DN50', length: 15 },
        { id: '3', material: 'steel_light', standard: 'EN 10255', size: 'DN80', length: 20 },
        { id: '4', material: 'copper', standard: 'EN 1057', size: '28mm', length: 5 },
    ];

    const mockEquipment: EquipmentItem[] = [
        { id: 'eq1', name: 'Chiller 1', type: 'Chiller', volume: 100, weight: 500 },
        { id: 'eq2', name: 'Buffer Tank', type: 'Puffer / Rezervor Tampon', volume: 500, weight: 100 },
    ];

    describe('generateBoQ', () => {
        it('generates bill of quantities from segments', () => {
            const boq = generateBoQ(mockSegments);

            expect(Array.isArray(boq)).toBe(true);
            expect(boq.length).toBeGreaterThan(0);
        });

        it('aggregates same material and size', () => {
            const boq = generateBoQ(mockSegments);

            // Should combine the two DN50 segments (10 + 15 = 25m)
            const dn50Item = boq.find(item => item.size === 'DN50');
            expect(dn50Item).toBeDefined();
            expect(dn50Item?.totalLength).toBe(25);
        });

        it('separates different sizes of same material', () => {
            const boq = generateBoQ(mockSegments);

            // Look for steel items (Oțel with diacritics or Light)
            const steelItems = boq.filter(item =>
                item.materialName.includes('Oțel') ||
                item.materialName.includes('Light') ||
                item.materialName.includes('Steel')
            );

            // Should have DN50 and DN80 as separate items
            expect(steelItems.length).toBeGreaterThanOrEqual(2);
        });

        it('separates different materials', () => {
            const boq = generateBoQ(mockSegments);

            const materials = new Set(boq.map(item => item.materialName));
            expect(materials.size).toBeGreaterThanOrEqual(2);
        });

        it('returns BoQ items with required properties', () => {
            const boq = generateBoQ(mockSegments);

            boq.forEach(item => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('materialName');
                expect(item).toHaveProperty('standardName');
                expect(item).toHaveProperty('size');
                expect(item).toHaveProperty('totalLength');
            });
        });

        it('handles custom pipe segments', () => {
            const customSegments: PipeSegment[] = [
                {
                    id: 'custom',
                    material: 'custom',
                    standard: 'N/A',
                    size: 'custom',
                    length: 10,
                    customInnerDiameter: 50
                }
            ];

            const boq = generateBoQ(customSegments);

            expect(boq.length).toBe(1);
            expect(boq[0].materialName).toContain('Custom');
        });

        it('returns empty array for empty segments', () => {
            const boq = generateBoQ([]);
            expect(boq).toEqual([]);
        });

        it('sorts output by material then size', () => {
            const boq = generateBoQ(mockSegments);

            // Check that items are sorted
            for (let i = 1; i < boq.length; i++) {
                const prev = boq[i - 1];
                const curr = boq[i];

                if (prev.materialName === curr.materialName) {
                    // Same material, size should be in order
                    const prevSize = parseInt(prev.size.replace(/\D/g, '')) || 0;
                    const currSize = parseInt(curr.size.replace(/\D/g, '')) || 0;
                    expect(currSize).toBeGreaterThanOrEqual(prevSize);
                }
            }
        });
    });

    describe('getDetailedWeightReport', () => {
        it('returns detailed weight report', () => {
            const report = getDetailedWeightReport(mockSegments, mockEquipment, 30);

            expect(Array.isArray(report)).toBe(true);
            expect(report.length).toBeGreaterThan(0);
        });

        it('includes both pipes and equipment', () => {
            const report = getDetailedWeightReport(mockSegments, mockEquipment, 30);

            const pipeItems = report.filter(item => item.type === 'pipe');
            const equipmentItems = report.filter(item => item.type === 'equipment');

            expect(pipeItems.length).toBe(mockSegments.length);
            expect(equipmentItems.length).toBe(mockEquipment.length);
        });

        it('returns items with all required properties', () => {
            const report = getDetailedWeightReport(mockSegments, mockEquipment, 30);

            report.forEach(item => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('description');
                expect(item).toHaveProperty('quantity');
                expect(item).toHaveProperty('emptyWeight');
                expect(item).toHaveProperty('fluidWeight');
                expect(item).toHaveProperty('totalWeight');
                expect(item).toHaveProperty('type');
            });
        });

        it('calculates total weight = empty + fluid', () => {
            const report = getDetailedWeightReport(mockSegments, mockEquipment, 30);

            report.forEach(item => {
                expect(item.totalWeight).toBeCloseTo(item.emptyWeight + item.fluidWeight, 1);
            });
        });

        it('fluid weight increases with glycol percentage', () => {
            const report0 = getDetailedWeightReport(mockSegments, mockEquipment, 0);
            const report40 = getDetailedWeightReport(mockSegments, mockEquipment, 40);

            const totalFluid0 = report0.reduce((sum, item) => sum + item.fluidWeight, 0);
            const totalFluid40 = report40.reduce((sum, item) => sum + item.fluidWeight, 0);

            expect(totalFluid40).toBeGreaterThan(totalFluid0);
        });

        it('includes equipment empty weight correctly', () => {
            const report = getDetailedWeightReport([], mockEquipment, 30);

            const chiller = report.find(item => item.description.includes('Chiller'));
            expect(chiller).toBeDefined();
            expect(chiller?.emptyWeight).toBe(500);  // Matches mockEquipment weight
        });

        it('handles custom pipe segments', () => {
            const customSegments: PipeSegment[] = [
                {
                    id: 'custom',
                    material: 'custom',
                    standard: 'N/A',
                    size: 'custom',
                    length: 10,
                    customInnerDiameter: 50,
                    customWeight: 5
                }
            ];

            const report = getDetailedWeightReport(customSegments, [], 30);

            expect(report.length).toBe(1);
            expect(report[0].emptyWeight).toBe(50);  // 10m × 5 kg/m
        });
    });
});
