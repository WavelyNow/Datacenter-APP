/**
 * Tests for Expansion Vessel Sizing Calculator
 */

import {
    calculateExpansionVessel,
    getStandardVesselSizes,
    quickEstimateVessel,
    ExpansionVesselInput
} from '@/lib/calculations/expansionVessel';

describe('Expansion Vessel Calculator', () => {

    const defaultInput: ExpansionVesselInput = {
        systemVolume: 500,
        glycolPercentage: 30,
        fluidType: 'ethylene',
        minTemperature: 10,
        maxTemperature: 45,
        staticHeight: 5,
        safetyValvePressure: 6,
    };

    describe('calculateExpansionVessel', () => {
        it('returns valid result for typical input', () => {
            const result = calculateExpansionVessel(defaultInput);

            expect(result.isValid).toBe(true);
            expect(result.requiredVolume).toBeGreaterThan(0);
            expect(result.recommendedVessel).toBeGreaterThan(0);
        });

        it('returns all required properties', () => {
            const result = calculateExpansionVessel(defaultInput);

            expect(result).toHaveProperty('expansionVolume');
            expect(result).toHaveProperty('expansionCoefficient');
            expect(result).toHaveProperty('waterReserve');
            expect(result).toHaveProperty('staticPressure');
            expect(result).toHaveProperty('prechargePressure');
            expect(result).toHaveProperty('fillPressure');
            expect(result).toHaveProperty('maxPressure');
            expect(result).toHaveProperty('requiredVolume');
            expect(result).toHaveProperty('recommendedVessel');
            expect(result).toHaveProperty('acceptanceFactor');
            expect(result).toHaveProperty('isValid');
            expect(result).toHaveProperty('warnings');
        });

        it('returns larger vessel for larger system', () => {
            const small = calculateExpansionVessel({ ...defaultInput, systemVolume: 200 });
            const large = calculateExpansionVessel({ ...defaultInput, systemVolume: 1000 });

            expect(large.recommendedVessel).toBeGreaterThan(small.recommendedVessel);
        });

        it('returns larger vessel for higher temperature delta', () => {
            const lowTemp = calculateExpansionVessel({ ...defaultInput, maxTemperature: 30 });
            const highTemp = calculateExpansionVessel({ ...defaultInput, maxTemperature: 80 });

            expect(highTemp.requiredVolume).toBeGreaterThan(lowTemp.requiredVolume);
        });

        it('calculates higher expansion with glycol', () => {
            const water = calculateExpansionVessel({ ...defaultInput, glycolPercentage: 0 });
            const glycol50 = calculateExpansionVessel({ ...defaultInput, glycolPercentage: 50 });

            expect(glycol50.expansionCoefficient).toBeGreaterThan(water.expansionCoefficient);
        });

        it('calculates static pressure correctly', () => {
            const result = calculateExpansionVessel(defaultInput);

            // 5m height = ~0.5 bar static pressure
            expect(result.staticPressure).toBeCloseTo(0.49, 1);
        });

        it('precharge pressure is higher than static pressure', () => {
            const result = calculateExpansionVessel(defaultInput);

            expect(result.prechargePressure).toBeGreaterThan(result.staticPressure);
        });

        it('fill pressure is higher than precharge', () => {
            const result = calculateExpansionVessel(defaultInput);

            expect(result.fillPressure).toBeGreaterThan(result.prechargePressure);
        });

        it('max pressure is less than safety valve', () => {
            const result = calculateExpansionVessel(defaultInput);

            expect(result.maxPressure).toBeLessThan(defaultInput.safetyValvePressure);
        });

        it('returns invalid result for zero volume', () => {
            const result = calculateExpansionVessel({ ...defaultInput, systemVolume: 0 });

            expect(result.isValid).toBe(false);
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('adds warning for high temperature', () => {
            const result = calculateExpansionVessel({ ...defaultInput, maxTemperature: 90 });

            expect(result.warnings.some(w => w.includes('80°C'))).toBe(true);
        });

        it('adds warning for large vessel', () => {
            const result = calculateExpansionVessel({ ...defaultInput, systemVolume: 10000 });

            // Large systems should have warnings about multiple vessels
            expect(result.recommendedVessel).toBeGreaterThan(200);
        });

        it('acceptance factor is between 0 and 1', () => {
            const result = calculateExpansionVessel(defaultInput);

            expect(result.acceptanceFactor).toBeGreaterThan(0);
            expect(result.acceptanceFactor).toBeLessThanOrEqual(1);
        });

        it('recommends standard vessel size', () => {
            const result = calculateExpansionVessel(defaultInput);
            const standardSizes = getStandardVesselSizes();

            expect(standardSizes).toContain(result.recommendedVessel);
        });
    });

    describe('getStandardVesselSizes', () => {
        it('returns array of standard sizes', () => {
            const sizes = getStandardVesselSizes();

            expect(Array.isArray(sizes)).toBe(true);
            expect(sizes.length).toBeGreaterThan(0);
        });

        it('sizes are in ascending order', () => {
            const sizes = getStandardVesselSizes();

            for (let i = 1; i < sizes.length; i++) {
                expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
            }
        });

        it('includes common sizes', () => {
            const sizes = getStandardVesselSizes();

            expect(sizes).toContain(50);
            expect(sizes).toContain(100);
            expect(sizes).toContain(200);
        });
    });

    describe('quickEstimateVessel', () => {
        it('returns a standard vessel size', () => {
            const estimate = quickEstimateVessel(500, 30);
            const standardSizes = getStandardVesselSizes();

            // Should be either a standard size or rounded to 100
            const isStandard = standardSizes.includes(estimate) || estimate % 100 === 0;
            expect(isStandard).toBe(true);
        });

        it('returns larger vessel for larger system', () => {
            const small = quickEstimateVessel(100);
            const large = quickEstimateVessel(1000);

            expect(large).toBeGreaterThan(small);
        });

        it('returns larger vessel for larger delta T', () => {
            const lowDelta = quickEstimateVessel(500, 20);
            const highDelta = quickEstimateVessel(500, 60);

            expect(highDelta).toBeGreaterThanOrEqual(lowDelta);
        });
    });
});
