/**
 * Tests for Thermal Expansion Calculator
 */

import {
    calculateThermalExpansion,
    getExpansionCoefficient,
    EXPANSION_COEFFICIENTS,
    ThermalExpansionInput
} from '@/lib/calculations/thermalExpansion';

describe('Thermal Expansion Calculator', () => {

    const defaultInput: ThermalExpansionInput = {
        material: 'steel_light',
        length: 20,
        outerDiameter: 60,
        wallThickness: 3,
        installTemperature: 10,
        operatingTemperature: 50,
        isFixedBothEnds: false
    };

    describe('calculateThermalExpansion', () => {
        it('returns valid result for typical input', () => {
            const result = calculateThermalExpansion(defaultInput);

            expect(result.elongation).toBeGreaterThan(0);
            expect(result.temperatureDelta).toBe(40);
        });

        it('returns all required properties', () => {
            const result = calculateThermalExpansion(defaultInput);

            expect(result).toHaveProperty('temperatureDelta');
            expect(result).toHaveProperty('expansionCoefficient');
            expect(result).toHaveProperty('elongation');
            expect(result).toHaveProperty('elongationPercent');
            expect(result).toHaveProperty('requiresCompensator');
            expect(result).toHaveProperty('compensatorType');
            expect(result).toHaveProperty('compensatorLegLength');
            expect(result).toHaveProperty('anchorForce');
            expect(result).toHaveProperty('axialStress');
            expect(result).toHaveProperty('guidesRequired');
            expect(result).toHaveProperty('recommendations');
        });

        it('calculates elongation correctly for steel', () => {
            const result = calculateThermalExpansion(defaultInput);

            // ΔL = α × L × ΔT = 0.012 × 20 × 40 = 9.6 mm
            expect(result.elongation).toBeCloseTo(9.6, 0);
        });

        it('plastic pipes expand more than steel', () => {
            const steel = calculateThermalExpansion(defaultInput);
            const plastic = calculateThermalExpansion({ ...defaultInput, material: 'ppr_pn20' });

            expect(plastic.elongation).toBeGreaterThan(steel.elongation * 5);
        });

        it('longer pipes have more elongation', () => {
            const short = calculateThermalExpansion({ ...defaultInput, length: 10 });
            const long = calculateThermalExpansion({ ...defaultInput, length: 30 });

            expect(long.elongation).toBeGreaterThan(short.elongation);
        });

        it('higher temperature delta increases elongation', () => {
            const low = calculateThermalExpansion({ ...defaultInput, operatingTemperature: 30 });
            const high = calculateThermalExpansion({ ...defaultInput, operatingTemperature: 80 });

            expect(high.elongation).toBeGreaterThan(low.elongation);
        });

        it('determines compensator requirement', () => {
            const small = calculateThermalExpansion({ ...defaultInput, length: 2 });
            const large = calculateThermalExpansion({ ...defaultInput, length: 50 });

            expect(small.requiresCompensator).toBe(false);
            expect(large.requiresCompensator).toBe(true);
        });

        it('calculates anchor force when both ends fixed', () => {
            const free = calculateThermalExpansion(defaultInput);
            const fixed = calculateThermalExpansion({ ...defaultInput, isFixedBothEnds: true });

            expect(free.anchorForce).toBe(0);
            expect(fixed.anchorForce).toBeGreaterThan(0);
        });

        it('calculates guide requirements', () => {
            const result = calculateThermalExpansion(defaultInput);

            expect(result.guidesRequired).toBeGreaterThanOrEqual(0);
            expect(result.guideSpacing).toBeGreaterThan(0);
        });
    });

    describe('getExpansionCoefficient', () => {
        it('returns coefficient for known materials', () => {
            expect(getExpansionCoefficient('steel_light')).toBe(0.012);
            expect(getExpansionCoefficient('copper')).toBe(0.017);
            expect(getExpansionCoefficient('ppr_pn20')).toBe(0.15);
        });

        it('returns default for unknown material', () => {
            expect(getExpansionCoefficient('unknown')).toBe(0.012);
        });
    });

    describe('EXPANSION_COEFFICIENTS', () => {
        it('has coefficients for all common materials', () => {
            expect(EXPANSION_COEFFICIENTS).toHaveProperty('steel_light');
            expect(EXPANSION_COEFFICIENTS).toHaveProperty('copper');
            expect(EXPANSION_COEFFICIENTS).toHaveProperty('ppr_pn20');
            expect(EXPANSION_COEFFICIENTS).toHaveProperty('pehd_sdr17');
        });

        it('plastics have higher coefficients than metals', () => {
            expect(EXPANSION_COEFFICIENTS['ppr_pn20']).toBeGreaterThan(EXPANSION_COEFFICIENTS['steel_light']);
            expect(EXPANSION_COEFFICIENTS['pehd_sdr17']).toBeGreaterThan(EXPANSION_COEFFICIENTS['copper']);
        });
    });
});
