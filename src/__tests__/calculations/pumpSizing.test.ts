/**
 * Tests for Pump Sizing Calculator
 */

import {
    calculatePumpSizing,
    generateSystemCurve,
    findOperatingPoint,
    findBestPump,
    kpaToHeadM,
    STANDARD_PUMPS,
    PumpSizingInput
} from '@/lib/calculations/pumpSizing';

describe('Pump Sizing Calculator', () => {

    const defaultInput: PumpSizingInput = {
        designFlowM3H: 5,
        staticHeadM: 2,
        frictionLossKPa: 30, // ~3m head
        safetyFactor: 1.1
    };

    describe('kpaToHeadM', () => {
        it('converts correctly', () => {
            // 9.81 kPa = 1m head
            expect(kpaToHeadM(9.81)).toBeCloseTo(1, 2);
            expect(kpaToHeadM(98.1)).toBeCloseTo(10, 1);
        });
    });

    describe('generateSystemCurve', () => {
        it('generates correct number of points', () => {
            const points = generateSystemCurve(2, 3, 5, 11);
            expect(points.length).toBe(11);
        });

        it('starts at static head', () => {
            const points = generateSystemCurve(2, 3, 5);
            // At 0 flow, head should be static head
            expect(points[0].flowM3H).toBe(0);
            expect(points[0].headM).toBe(2);
        });

        it('passes through design point', () => {
            const points = generateSystemCurve(2, 3, 5);
            // Design point is at index ~7 (0.7 * 10 = 7 for flow 5 which is roughly mid range relative to max of curve?)
            // Actually the generator goes from 0 to 1.5x design flow.
            // So design flow is at 1/1.5 = 0.66 of the array.

            // Find closest point to design flow (5)
            const match = points.reduce((prev, curr) =>
                Math.abs(curr.flowM3H - 5) < Math.abs(prev.flowM3H - 5) ? curr : prev
            );

            expect(match).toBeDefined();
            if (match) {
                // Head should be static (2) + friction (3) = 5
                expect(match.headM).toBeCloseTo(5, 0);
            }
        });

        it('curve is quadratic', () => {
            const points = generateSystemCurve(0, 4, 2); // K = 4/2^2 = 1. H = 1 * Q^2
            // point at Q=1 should be H=1
            // point at Q=2 should be H=4
            // point at Q=3 should be H=9

            const p1 = points.find(p => Math.abs(p.flowM3H - 1) < 0.1);
            const p3 = points.find(p => Math.abs(p.flowM3H - 3) < 0.1);

            if (p1) expect(p1.headM).toBeCloseTo(1, 0); // Allow +/- 0.5 error for discrete steps
            if (p3) expect(p3.headM).toBeCloseTo(9, 0); // Allow +/- 0.5 error
        });
    });

    describe('findOperatingPoint', () => {
        const simpleSystemCurve = generateSystemCurve(2, 3, 5); // Design: 5m³/h @ 5m
        const mockPump = STANDARD_PUMPS.find(p => p.id === 'grundfos_magna3_25-60')!; // Max 6m head

        it('finds intersection point', () => {
            const op = findOperatingPoint(simpleSystemCurve, mockPump);

            expect(op).not.toBeNull();
            if (op) {
                expect(op.flowM3H).toBeGreaterThan(0);
                expect(op.headM).toBeGreaterThan(0);
                expect(op.efficiency).toBeGreaterThan(0);
                expect(op.powerKW).toBeGreaterThan(0);
            }
        });

        it('returns null if no intersection', () => {
            const highHeadSystem = generateSystemCurve(20, 5, 5); // Min head 20m
            const op = findOperatingPoint(highHeadSystem, mockPump); // Pump max head 6m
            expect(op).toBeNull();
        });
    });

    describe('calculatePumpSizing', () => {
        it('returns valid result', () => {
            const result = calculatePumpSizing(defaultInput);

            expect(result.designFlow).toBe(5);
            expect(result.requiredPower).toBeGreaterThan(0);
            expect(result.requiredNPSH).toBeGreaterThan(0);
            expect(result.systemCurve.length).toBeGreaterThan(0);
        });

        it('applies safety factor to design head', () => {
            // Static 2 + Friction (30kPa ~= 3.05m) = 5.05m
            // With 1.1 safety: ~5.55m
            const result = calculatePumpSizing(defaultInput);
            const expectedHead = (2 + kpaToHeadM(30)) * 1.1;

            expect(result.designHead).toBeCloseTo(expectedHead, 1);
        });

        it('recommends pump type', () => {
            const result = calculatePumpSizing(defaultInput);
            expect(result.recommendedPumpType).toBeDefined();
        });

        it('validates high head requirements', () => {
            const result = calculatePumpSizing({ ...defaultInput, staticHeadM: 20 });
            expect(result.recommendations.some(r => r.includes('NPSH'))).toBe(true);
        });
    });

    describe('findBestPump', () => {
        it('selects suitable pump', () => {
            // 2m³/h @ 4m head
            const sysCurve = generateSystemCurve(2, 2, 2);
            const designFlow = 2;
            const designHead = 4;

            const match = findBestPump(sysCurve, designFlow, designHead);

            expect(match).not.toBeNull();
            if (match) {
                expect(match.operatingPoint.flowM3H).toBeCloseTo(2, 0); // approx
                expect(match.operatingPoint.headM).toBeCloseTo(4.5, 0); // approx 4-5m allowed range
            }
        });

        it('returns null for impossible requirements', () => {
            // 100m³/h @ 100m head (way beyond our standard pumps)
            const sysCurve = generateSystemCurve(50, 50, 100);

            const match = findBestPump(sysCurve, 100, 100);
            expect(match).toBeNull();
        });
    });
});
