/**
 * Tests for Common Utility Functions
 */

import {
    getFluidDensity,
    getPipeData,
    getClampWeight,
    ACCESSORY_WEIGHTS
} from '@/lib/calculations/common';

describe('Common Utility Functions', () => {

    describe('getFluidDensity', () => {
        it('returns 1.000 kg/L for pure water (0% glycol) — physical value 0.998 kg/L @20°C', () => {
            const density = getFluidDensity(0);
            expect(density).toBeCloseTo(0.998, 3);
        });

        it('returns higher density for glycol mixtures', () => {
            const waterDensity = getFluidDensity(0);
            const glycol30 = getFluidDensity(30);
            const glycol50 = getFluidDensity(50);

            expect(glycol30).toBeGreaterThan(waterDensity);
            expect(glycol50).toBeGreaterThan(glycol30);
        });

        it('interpolates correctly between data points', () => {
            // 25% should be between 20% and 30%
            const density25 = getFluidDensity(25);
            const density20 = getFluidDensity(20);
            const density30 = getFluidDensity(30);

            expect(density25).toBeGreaterThan(density20);
            expect(density25).toBeLessThan(density30);
        });

        it('clamps values to valid range', () => {
            const negativeResult = getFluidDensity(-10);
            const overResult = getFluidDensity(150);

            expect(negativeResult).toBe(getFluidDensity(0));
            expect(overResult).toBeDefined();
        });

        it('returns typical values for common concentrations', () => {
            expect(getFluidDensity(30)).toBeCloseTo(1.038, 2);
            expect(getFluidDensity(40)).toBeCloseTo(1.051, 2);
        });

        it('distinguishes propylene from ethylene glycol (PG is less dense at same %)', () => {
            const eg30 = getFluidDensity(30, 'ethylene');
            const pg30 = getFluidDensity(30, 'propylene');
            const water = getFluidDensity(30, 'water');

            expect(pg30).toBeLessThan(eg30);
            expect(pg30).toBeCloseTo(1.024, 2); // PG 30% vol @20°C ≈ 1.024 kg/L
            expect(water).toBe(0.998);
        });
    });

    describe('getPipeData', () => {
        it('returns pipe data for valid material and size', () => {
            const data = getPipeData('steel_light', 'DN50');

            expect(data).not.toBeNull();
            expect(data).toHaveProperty('id');  // inner diameter
            expect(data).toHaveProperty('od');  // outer diameter
            expect(data).toHaveProperty('weight');
        });

        it('returns null for custom material', () => {
            const data = getPipeData('custom', 'DN50');
            expect(data).toBeNull();
        });

        it('returns null for unknown material', () => {
            const data = getPipeData('unknown_material', 'DN50');
            expect(data).toBeNull();
        });

        it('returns undefined for unknown size', () => {
            const data = getPipeData('steel_light', 'DN9999');
            expect(data).toBeUndefined();
        });

        it('returns different data for different materials', () => {
            const steel = getPipeData('steel_light', 'DN50');
            const copper = getPipeData('copper', '54mm');

            // Both should exist but have different dimensions
            if (steel && copper) {
                expect(steel.id).not.toEqual(copper.id);
            }
        });
    });

    describe('getClampWeight', () => {
        it('returns small clamp weight for DN <= 50', () => {
            expect(getClampWeight('DN25')).toBe(ACCESSORY_WEIGHTS.CLAMP_SMALL);
            expect(getClampWeight('DN50')).toBe(ACCESSORY_WEIGHTS.CLAMP_SMALL);
        });

        it('returns medium clamp weight for DN50 < size <= DN100', () => {
            expect(getClampWeight('DN65')).toBe(ACCESSORY_WEIGHTS.CLAMP_MEDIUM);
            expect(getClampWeight('DN80')).toBe(ACCESSORY_WEIGHTS.CLAMP_MEDIUM);
            expect(getClampWeight('DN100')).toBe(ACCESSORY_WEIGHTS.CLAMP_MEDIUM);
        });

        it('returns large clamp weight for DN > 100', () => {
            expect(getClampWeight('DN125')).toBe(ACCESSORY_WEIGHTS.CLAMP_LARGE);
            expect(getClampWeight('DN150')).toBe(ACCESSORY_WEIGHTS.CLAMP_LARGE);
            expect(getClampWeight('DN200')).toBe(ACCESSORY_WEIGHTS.CLAMP_LARGE);
        });
    });

    describe('ACCESSORY_WEIGHTS', () => {
        it('has all required weight constants', () => {
            expect(ACCESSORY_WEIGHTS).toHaveProperty('ANCHOR');
            expect(ACCESSORY_WEIGHTS).toHaveProperty('CLAMP_SMALL');
            expect(ACCESSORY_WEIGHTS).toHaveProperty('CLAMP_MEDIUM');
            expect(ACCESSORY_WEIGHTS).toHaveProperty('CLAMP_LARGE');
            expect(ACCESSORY_WEIGHTS).toHaveProperty('BOLT_SET');
            expect(ACCESSORY_WEIGHTS).toHaveProperty('CONEXPAND');
        });

        it('has positive weight values', () => {
            Object.values(ACCESSORY_WEIGHTS).forEach(weight => {
                expect(weight).toBeGreaterThan(0);
            });
        });
    });
});
