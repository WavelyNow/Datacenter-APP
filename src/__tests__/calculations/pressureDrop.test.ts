/**
 * Tests for Pressure Drop Calculation Module
 */

import {
    getViscosity,
    getDensity,
    getRoughness,
    calculatePressureDrop,
    calculateSegmentPressureDrop,
} from '@/lib/calculations/pressureDrop';
import { PipeSegment } from '@/lib/types';

// Mock getPipeData function for tests
const mockGetPipeData = (material: string, size: string): { id: number } | null => {
    const pipeData: Record<string, Record<string, number>> = {
        'steel_light': {
            'DN15': 16, 'DN20': 21.6, 'DN25': 27.2, 'DN32': 35.9,
            'DN40': 41.8, 'DN50': 53, 'DN65': 68.8, 'DN80': 80.8,
            'DN100': 105.3, 'DN125': 130.7, 'DN150': 155.1
        },
        'copper': {
            'DN15': 13.6, 'DN20': 17.6, 'DN25': 22, 'DN32': 28
        }
    };

    const materialData = pipeData[material];
    if (materialData && materialData[size]) {
        return { id: materialData[size] };
    }
    return null;
};

describe('Pressure Drop Calculations', () => {

    describe('getViscosity', () => {
        it('returns correct viscosity for pure water', () => {
            const viscosity = getViscosity('water', 0);
            expect(viscosity).toBeGreaterThan(0);
            expect(viscosity).toBeCloseTo(0.001, 3);
        });

        it('returns higher viscosity for ethylene glycol mixtures', () => {
            const waterViscosity = getViscosity('water', 0);
            const glycolViscosity = getViscosity('ethylene', 30);
            expect(glycolViscosity).toBeGreaterThan(waterViscosity);
        });

        it('returns different viscosity for propylene vs ethylene', () => {
            const ethylene = getViscosity('ethylene', 30);
            const propylene = getViscosity('propylene', 30);
            expect(propylene).not.toEqual(ethylene);
        });
    });

    describe('getDensity', () => {
        it('returns ~998 kg/m³ for pure water', () => {
            const density = getDensity('water', 0);
            expect(density).toBeCloseTo(998, 0);
        });

        it('returns higher density for glycol mixtures', () => {
            const waterDensity = getDensity('water', 0);
            const glycolDensity = getDensity('ethylene', 30);
            expect(glycolDensity).toBeGreaterThan(waterDensity);
        });
    });

    describe('getRoughness', () => {
        it('returns roughness for known pipe materials', () => {
            expect(getRoughness('steel_light')).toBeGreaterThan(0);
            expect(getRoughness('copper')).toBeGreaterThan(0);
            expect(getRoughness('ppr')).toBeGreaterThan(0);
        });

        it('returns default roughness for unknown materials', () => {
            expect(getRoughness('unknown_material')).toBeGreaterThan(0);
        });
    });

    describe('calculatePressureDrop', () => {
        it('calculates pressure drop for given inputs', () => {
            const result = calculatePressureDrop(
                50,    // innerDiameterMM
                10,    // lengthM
                5,     // flowRateM3H
                'ethylene',
                30,
                'steel_light'
            );

            expect(result).toHaveProperty('velocityMS');
            expect(result).toHaveProperty('reynoldsNumber');
            expect(result).toHaveProperty('frictionFactor');
            expect(result).toHaveProperty('pressureDropPaM');
            expect(result).toHaveProperty('totalPressureDropPa');
            expect(result).toHaveProperty('flowRegime');

            expect(result.velocityMS).toBeGreaterThan(0);
            expect(result.totalPressureDropPa).toBeGreaterThan(0);
        });

        it('returns zero for zero flow rate', () => {
            const result = calculatePressureDrop(50, 10, 0, 'ethylene', 30);
            expect(result.velocityMS).toBe(0);
            expect(result.totalPressureDropPa).toBe(0);
        });

        it('detects laminar, transitional, and turbulent regimes', () => {
            // Low flow - should be laminar or transitional
            const lowFlow = calculatePressureDrop(100, 10, 0.1, 'ethylene', 50);
            expect(['laminar', 'transitional', 'turbulent']).toContain(lowFlow.flowRegime);

            // High flow - should be turbulent
            const highFlow = calculatePressureDrop(50, 10, 10, 'ethylene', 30);
            expect(highFlow.flowRegime).toBe('turbulent');
        });

        it('provides velocity warnings', () => {
            // Very high velocity should trigger warning
            const highVelocity = calculatePressureDrop(20, 10, 10, 'ethylene', 30);
            expect(highVelocity.warnings.length).toBeGreaterThan(0);
        });
    });

    describe('calculateSegmentPressureDrop', () => {
        it('returns pressure drop result for a pipe segment', () => {
            const segment: PipeSegment = {
                id: 'test-1',
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN50',
                length: 10,
                flowRate: 5,
            };

            const result = calculateSegmentPressureDrop(segment, 'ethylene', 30, mockGetPipeData);

            expect(result).toHaveProperty('velocityMS');
            expect(result).toHaveProperty('reynoldsNumber');
            expect(result).toHaveProperty('totalPressureDropPa');
            expect(result).toHaveProperty('flowRegime');

            expect(result.velocityMS).toBeGreaterThan(0);
            expect(result.totalPressureDropPa).toBeGreaterThan(0);
        });

        it('returns zero pressure drop for zero flow rate', () => {
            const segment: PipeSegment = {
                id: 'test-2',
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN50',
                length: 10,
                flowRate: 0,
            };

            const result = calculateSegmentPressureDrop(segment, 'ethylene', 30, mockGetPipeData);

            expect(result.velocityMS).toBe(0);
            expect(result.totalPressureDropPa).toBe(0);
        });

        it('handles segments with custom diameter', () => {
            const segment: PipeSegment = {
                id: 'test-3',
                material: 'custom',
                standard: 'custom',
                size: 'custom',
                length: 10,
                flowRate: 5,
                customInnerDiameter: 50,
            };

            const result = calculateSegmentPressureDrop(segment, 'ethylene', 30, mockGetPipeData);
            expect(result.velocityMS).toBeGreaterThan(0);
        });
    });
});
