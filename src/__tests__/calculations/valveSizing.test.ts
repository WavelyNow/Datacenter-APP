/**
 * Tests for Valve Kv Sizing Calculator
 */

import {
    calculateKv,
    calculateValveSizing,
    calculatePressureDropFromKv,
    getValveKv,
    getAvailableSizes,
    BALL_VALVE_KV,
    ValveSizingInput
} from '@/lib/calculations/valveSizing';

describe('Valve Sizing Calculator', () => {

    const defaultInput: ValveSizingInput = {
        flowRate: 10,        // m³/h
        pressureDrop: 0.5,   // bar
        fluidDensity: 1000,  // kg/m³ (water)
    };

    describe('calculateKv', () => {
        it('calculates Kv for water correctly', () => {
            // Kv = Q × √(ρ/ΔP) = 10 × √(1/0.5) = 14.14
            const kv = calculateKv(10, 0.5, 1000);
            expect(kv).toBeCloseTo(14.14, 1);
        });

        it('returns 0 for zero flow', () => {
            expect(calculateKv(0, 0.5, 1000)).toBe(0);
        });

        it('returns 0 for zero pressure drop', () => {
            expect(calculateKv(10, 0, 1000)).toBe(0);
        });

        it('higher density requires higher Kv', () => {
            const water = calculateKv(10, 0.5, 1000);
            const glycol = calculateKv(10, 0.5, 1050);

            expect(glycol).toBeGreaterThan(water);
        });
    });

    describe('calculatePressureDropFromKv', () => {
        it('calculates pressure drop correctly', () => {
            // ΔP = ρ × (Q/Kv)² = 1 × (10/14.14)² = 0.5 bar
            const deltaP = calculatePressureDropFromKv(10, 14.14, 1000);
            expect(deltaP).toBeCloseTo(0.5, 1);
        });

        it('returns 0 for zero Kv', () => {
            expect(calculatePressureDropFromKv(10, 0, 1000)).toBe(0);
        });

        it('is inverse of calculateKv', () => {
            const kv = calculateKv(10, 0.5, 1000);
            const deltaP = calculatePressureDropFromKv(10, kv, 1000);
            expect(deltaP).toBeCloseTo(0.5, 1);
        });
    });

    describe('calculateValveSizing', () => {
        it('returns valid result for typical input', () => {
            const result = calculateValveSizing(defaultInput);

            // May have recommendations but should still work
            expect(result.kvRequired).toBeGreaterThan(0);
            expect(result.recommendedDN).not.toBe('N/A');
        });

        it('returns all required properties', () => {
            const result = calculateValveSizing(defaultInput);

            expect(result).toHaveProperty('kvRequired');
            expect(result).toHaveProperty('kvWithMargin');
            expect(result).toHaveProperty('recommendedDN');
            expect(result).toHaveProperty('kvAvailable');
            expect(result).toHaveProperty('velocity');
            expect(result).toHaveProperty('authority');
            expect(result).toHaveProperty('openingPercent');
            expect(result).toHaveProperty('isValid');
            expect(result).toHaveProperty('warnings');
            expect(result).toHaveProperty('recommendations');
        });

        it('adds 15% safety margin to Kv', () => {
            const result = calculateValveSizing(defaultInput);
            // Allow for rounding differences
            expect(result.kvWithMargin).toBeCloseTo(result.kvRequired * 1.15, 0);
        });

        it('recommends larger valve for larger flow', () => {
            const small = calculateValveSizing({ ...defaultInput, flowRate: 5 });
            const large = calculateValveSizing({ ...defaultInput, flowRate: 50 });

            const smallDN = parseInt(small.recommendedDN.replace(/\D/g, ''));
            const largeDN = parseInt(large.recommendedDN.replace(/\D/g, ''));

            expect(largeDN).toBeGreaterThanOrEqual(smallDN);
        });

        it('returns invalid for zero flow', () => {
            const result = calculateValveSizing({ ...defaultInput, flowRate: 0 });
            expect(result.isValid).toBe(false);
        });

        it('returns invalid for zero pressure drop', () => {
            const result = calculateValveSizing({ ...defaultInput, pressureDrop: 0 });
            expect(result.isValid).toBe(false);
        });

        it('calculates velocity through valve', () => {
            const result = calculateValveSizing(defaultInput);
            expect(result.velocity).toBeGreaterThan(0);
        });

        it('calculates opening percentage', () => {
            const result = calculateValveSizing(defaultInput);
            expect(result.openingPercent).toBeGreaterThan(0);
            expect(result.openingPercent).toBeLessThanOrEqual(100);
        });
    });

    describe('getValveKv', () => {
        it('returns Kv for valid size', () => {
            expect(getValveKv('DN50', 'ball')).toBe(300);
            expect(getValveKv('DN100', 'ball')).toBe(1200);
        });

        it('returns undefined for invalid size', () => {
            expect(getValveKv('DN999', 'ball')).toBeUndefined();
        });
    });

    describe('getAvailableSizes', () => {
        it('returns array of sizes', () => {
            const sizes = getAvailableSizes();
            expect(Array.isArray(sizes)).toBe(true);
            expect(sizes.length).toBeGreaterThan(0);
        });

        it('includes common sizes', () => {
            const sizes = getAvailableSizes();
            expect(sizes).toContain('DN50');
            expect(sizes).toContain('DN100');
        });
    });

    describe('BALL_VALVE_KV', () => {
        it('has Kv values for standard sizes', () => {
            expect(BALL_VALVE_KV).toHaveProperty('DN25');
            expect(BALL_VALVE_KV).toHaveProperty('DN50');
            expect(BALL_VALVE_KV).toHaveProperty('DN100');
        });

        it('Kv increases with size', () => {
            expect(BALL_VALVE_KV['DN100']).toBeGreaterThan(BALL_VALVE_KV['DN50']);
            expect(BALL_VALVE_KV['DN50']).toBeGreaterThan(BALL_VALVE_KV['DN25']);
        });
    });
});
