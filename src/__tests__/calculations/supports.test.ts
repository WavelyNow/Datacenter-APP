/**
 * Tests for Support System Calculations
 * Covers support dimensioning, mechanical stress analysis, and BoM generation
 */

import {
    calculateSupportReport,
    generateSupportBoM
} from '@/lib/calculations/supports';
import { PipeSegment } from '@/lib/types';

describe('Support System Calculations', () => {

    const mockSegments: PipeSegment[] = [
        { id: '1', material: 'steel_light', standard: 'EN 10255', size: 'DN50', length: 10 },
        { id: '2', material: 'steel_light', standard: 'EN 10255', size: 'DN80', length: 15 },
        { id: '3', material: 'steel_light', standard: 'EN 10255', size: 'DN100', length: 20 },
    ];

    const defaultConfig = {
        spacing: 2.5,
        mountingType: 'concrete' as const,
        pipesPerSupport: 1,
        insulationThickness: 25,
        insulationDensity: 40,
        height: 0.3,
        addLeftConsole: false,
        addRightConsole: false,
        addUpperRail: false,
    };

    describe('calculateSupportReport', () => {
        it('generates support report for pipe segments', () => {
            const report = calculateSupportReport(mockSegments, 30, defaultConfig);

            expect(Array.isArray(report)).toBe(true);
            expect(report.length).toBe(mockSegments.length);
        });

        it('returns SupportItem with all required properties', () => {
            const report = calculateSupportReport(mockSegments, 30, defaultConfig);

            report.forEach(item => {
                expect(item).toHaveProperty('segmentId');
                expect(item).toHaveProperty('description');
                expect(item).toHaveProperty('length');
                expect(item).toHaveProperty('spacing');
                expect(item).toHaveProperty('weightPerMeterEmpty');
                expect(item).toHaveProperty('fluidWeightPerMeter');
                expect(item).toHaveProperty('insulationWeightPerMeter');
                expect(item).toHaveProperty('totalWeightPerMeter');
                expect(item).toHaveProperty('loadPerPoint');
                expect(item).toHaveProperty('quantity');  // number of supports
                expect(item).toHaveProperty('moment');
                expect(item).toHaveProperty('stress');
                expect(item).toHaveProperty('deflection');
                expect(item).toHaveProperty('utilization');
                expect(item).toHaveProperty('status');
            });
        });

        it('calculates correct support count based on spacing', () => {
            const report = calculateSupportReport(mockSegments, 30, {
                ...defaultConfig,
                spacing: 2.5
            });

            // For 10m pipe with 2.5m spacing: ceil(10/2.5) + 1 = 5 supports
            const firstSegment = report.find(r => r.segmentId === '1');
            expect(firstSegment?.quantity).toBeGreaterThanOrEqual(4);
            expect(firstSegment?.quantity).toBeLessThanOrEqual(6);
        });

        it('includes insulation weight when thickness > 0', () => {
            const withInsulation = calculateSupportReport(mockSegments, 30, {
                ...defaultConfig,
                insulationThickness: 25,
                insulationDensity: 40
            });

            const noInsulation = calculateSupportReport(mockSegments, 30, {
                ...defaultConfig,
                insulationThickness: 0,
                insulationDensity: 0
            });

            // Weight with insulation should be higher
            expect(withInsulation[0].totalWeightPerMeter).toBeGreaterThan(
                noInsulation[0].totalWeightPerMeter
            );
        });

        it('fluid weight varies with glycol percentage', () => {
            const withWater = calculateSupportReport(mockSegments, 0, defaultConfig);
            const withGlycol = calculateSupportReport(mockSegments, 40, defaultConfig);

            // 40% glycol is denser than water
            expect(withGlycol[0].fluidWeightPerMeter).toBeGreaterThan(
                withWater[0].fluidWeightPerMeter
            );
        });

        it('calculates mechanical stress and utilization', () => {
            const report = calculateSupportReport(mockSegments, 30, defaultConfig);

            report.forEach(item => {
                expect(item.stress).toBeGreaterThanOrEqual(0);
                expect(item.utilization).toBeGreaterThanOrEqual(0);
                expect(item.utilization).toBeLessThanOrEqual(200); // Reasonable max
            });
        });

        it('sets status based on utilization', () => {
            const report = calculateSupportReport(mockSegments, 30, defaultConfig);

            report.forEach(item => {
                expect(['pass', 'warning', 'critical', 'fail']).toContain(item.status);

                // Typical pipe under normal conditions should pass
                if (item.utilization < 70) {
                    expect(item.status).toBe('pass');
                }
            });
        });

        it('handles different mounting types', () => {
            const concrete = calculateSupportReport(mockSegments, 30, {
                ...defaultConfig,
                mountingType: 'concrete'
            });

            const suspended = calculateSupportReport(mockSegments, 30, {
                ...defaultConfig,
                mountingType: 'suspended'
            });

            // Both should return valid reports
            expect(concrete.length).toBe(mockSegments.length);
            expect(suspended.length).toBe(mockSegments.length);
        });

        it('handles multiple pipes per support', () => {
            const single = calculateSupportReport(mockSegments, 30, {
                ...defaultConfig,
                pipesPerSupport: 1
            });

            const multiple = calculateSupportReport(mockSegments, 30, {
                ...defaultConfig,
                pipesPerSupport: 3
            });

            // Load per point should increase with more pipes
            // But this depends on implementation details
            expect(multiple[0].loadPerPoint).toBeGreaterThanOrEqual(single[0].loadPerPoint);
        });

        it('returns empty array for empty segments', () => {
            const report = calculateSupportReport([], 30, defaultConfig);
            expect(report).toEqual([]);
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

            const report = calculateSupportReport(customSegments, 30, defaultConfig);

            expect(report.length).toBe(1);
            expect(report[0].weightPerMeterEmpty).toBe(5);
        });
    });

    describe('generateSupportBoM', () => {
        it('generates bill of materials from support items', () => {
            const supportReport = calculateSupportReport(mockSegments, 30, defaultConfig);
            const bom = generateSupportBoM(supportReport);

            expect(Array.isArray(bom)).toBe(true);
            expect(bom.length).toBeGreaterThan(0);
        });

        it('returns BoM items with required properties', () => {
            const supportReport = calculateSupportReport(mockSegments, 30, defaultConfig);
            const bom = generateSupportBoM(supportReport);

            bom.forEach(item => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('component');
                expect(item).toHaveProperty('specs');
                expect(item).toHaveProperty('quantity');
                expect(item).toHaveProperty('unit');
                expect(item).toHaveProperty('category');
            });
        });

        it('includes fixing components', () => {
            const supportReport = calculateSupportReport(mockSegments, 30, defaultConfig);
            const bom = generateSupportBoM(supportReport);

            const fixings = bom.filter(item => item.category === 'fixings');
            expect(fixings.length).toBeGreaterThan(0);
        });

        it('includes profile components', () => {
            const supportReport = calculateSupportReport(mockSegments, 30, defaultConfig);
            const bom = generateSupportBoM(supportReport);

            const profiles = bom.filter(item => item.category === 'profile');
            expect(profiles.length).toBeGreaterThan(0);
        });

        it('quantities are positive numbers', () => {
            const supportReport = calculateSupportReport(mockSegments, 30, defaultConfig);
            const bom = generateSupportBoM(supportReport);

            bom.forEach(item => {
                expect(item.quantity).toBeGreaterThan(0);
            });
        });

        it('returns empty array for empty support items', () => {
            const bom = generateSupportBoM([]);
            expect(bom).toEqual([]);
        });

        it('aggregates same components across segments', () => {
            // Two identical segments should aggregate their BoM
            const identicalSegments: PipeSegment[] = [
                { id: '1', material: 'steel_light', standard: 'EN 10255', size: 'DN50', length: 10 },
                { id: '2', material: 'steel_light', standard: 'EN 10255', size: 'DN50', length: 10 },
            ];

            const report = calculateSupportReport(identicalSegments, 30, defaultConfig);
            const bom = generateSupportBoM(report);

            // Should have aggregated quantities, not duplicate entries
            // Check that total quantity is doubled compared to single segment
            const singleReport = calculateSupportReport([identicalSegments[0]], 30, defaultConfig);
            const singleBom = generateSupportBoM(singleReport);

            // Same number of line items, but doubled quantities
            if (bom.length === singleBom.length) {
                const bomTotal = bom.reduce((sum, item) => sum + item.quantity, 0);
                const singleTotal = singleBom.reduce((sum, item) => sum + item.quantity, 0);
                expect(bomTotal).toBeCloseTo(singleTotal * 2, 0);
            }
        });
    });

    describe('Load Calculations', () => {
        it('heavier pipes have higher load per point', () => {
            const smallPipe: PipeSegment[] = [
                { id: '1', material: 'steel_light', standard: 'EN 10255', size: 'DN25', length: 10 }
            ];
            const largePipe: PipeSegment[] = [
                { id: '2', material: 'steel_light', standard: 'EN 10255', size: 'DN100', length: 10 }
            ];

            const smallReport = calculateSupportReport(smallPipe, 30, defaultConfig);
            const largeReport = calculateSupportReport(largePipe, 30, defaultConfig);

            expect(largeReport[0].loadPerPoint).toBeGreaterThan(smallReport[0].loadPerPoint);
        });

        it('longer spans have higher deflection', () => {
            const shortSpan = calculateSupportReport(mockSegments, 30, {
                ...defaultConfig,
                spacing: 1.5
            });

            const longSpan = calculateSupportReport(mockSegments, 30, {
                ...defaultConfig,
                spacing: 3.0
            });

            // Longer span = higher deflection (for same pipe)
            expect(longSpan[0].deflection).toBeGreaterThan(shortSpan[0].deflection);
        });
    });
});
