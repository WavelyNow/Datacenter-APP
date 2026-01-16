/**
 * Tests for Fittings K-Factor Calculator
 */

import {
    calculateFittingPressureDrop,
    calculateFittingsPressureLoss,
    getKFactor,
    getEquivalentLD,
    calculateVelocity,
    getFittingTypes,
    createFitting,
    K_FACTORS,
    Fitting
} from '@/lib/calculations/fittings';

describe('Fittings K-Factor Calculator', () => {

    const mockFittings: Fitting[] = [
        { id: '1', type: 'elbow_90_std', size: 'DN50', quantity: 4 },
        { id: '2', type: 'tee_branch', size: 'DN50', quantity: 2 },
        { id: '3', type: 'valve_ball', size: 'DN50', quantity: 1 },
    ];

    describe('getKFactor', () => {
        it('returns K-factor for standard fittings', () => {
            expect(getKFactor('elbow_90_std')).toBe(0.75);
            expect(getKFactor('elbow_90_lr')).toBe(0.45);
            expect(getKFactor('valve_ball')).toBe(0.05);
        });

        it('globe valve has highest K-factor', () => {
            expect(getKFactor('valve_globe')).toBeGreaterThan(getKFactor('valve_ball'));
            expect(getKFactor('valve_globe')).toBeGreaterThan(getKFactor('valve_gate'));
        });
    });

    describe('getEquivalentLD', () => {
        it('returns L/D for fittings', () => {
            expect(getEquivalentLD('elbow_90_std')).toBe(30);
            expect(getEquivalentLD('valve_globe')).toBe(300);
        });
    });

    describe('calculateVelocity', () => {
        it('calculates velocity correctly', () => {
            // Q = 10 m³/h, d = 53 mm (DN50)
            // v = Q / A = (10/3600) / (π × 0.0265²) = 1.26 m/s approx
            const velocity = calculateVelocity(10, 53);
            expect(velocity).toBeCloseTo(1.26, 1);
        });

        it('returns 0 for zero flow', () => {
            expect(calculateVelocity(0, 53)).toBe(0);
        });

        it('returns 0 for zero diameter', () => {
            expect(calculateVelocity(10, 0)).toBe(0);
        });
    });

    describe('calculateFittingPressureDrop', () => {
        it('calculates pressure drop for fitting', () => {
            // K = 0.75 (elbow_90_std), v = 2 m/s, ρ = 1000 kg/m³
            // ΔP = K × (ρ × v²) / 2 = 0.75 × (1000 × 4) / 2 = 1500 Pa = 1.5 kPa
            const deltaP = calculateFittingPressureDrop('elbow_90_std', 2, 1000, 1);
            expect(deltaP).toBeCloseTo(1.5, 1);
        });

        it('multiplies by quantity', () => {
            const single = calculateFittingPressureDrop('elbow_90_std', 2, 1000, 1);
            const double = calculateFittingPressureDrop('elbow_90_std', 2, 1000, 2);
            expect(double).toBeCloseTo(single * 2, 1);
        });

        it('returns 0 for zero velocity', () => {
            expect(calculateFittingPressureDrop('elbow_90_std', 0, 1000, 1)).toBe(0);
        });
    });

    describe('calculateFittingsPressureLoss', () => {
        it('calculates total pressure loss', () => {
            const result = calculateFittingsPressureLoss(mockFittings, 10, 53, 1000);

            expect(result.totalPressureDropKPa).toBeGreaterThan(0);
            expect(result.totalKFactor).toBeGreaterThan(0);
        });

        it('returns details for each fitting', () => {
            const result = calculateFittingsPressureLoss(mockFittings, 10, 53, 1000);

            expect(result.fittings.length).toBe(mockFittings.length);
            result.fittings.forEach(f => {
                expect(f).toHaveProperty('pressureDropKPa');
                expect(f).toHaveProperty('kFactor');
                expect(f).toHaveProperty('velocityMS');
            });
        });

        it('calculates total K-factor', () => {
            const result = calculateFittingsPressureLoss(mockFittings, 10, 53, 1000);

            // 4 × 0.75 + 2 × 1.8 + 1 × 0.05 = 3 + 3.6 + 0.05 = 6.65
            expect(result.totalKFactor).toBeCloseTo(6.65, 1);
        });

        it('calculates equivalent length', () => {
            const result = calculateFittingsPressureLoss(mockFittings, 10, 53, 1000);
            expect(result.totalEquivalentLength).toBeGreaterThan(0);
        });
    });

    describe('getFittingTypes', () => {
        it('returns list of fitting types', () => {
            const types = getFittingTypes();

            expect(Array.isArray(types)).toBe(true);
            expect(types.length).toBeGreaterThan(0);
        });

        it('each type has label and kFactor', () => {
            const types = getFittingTypes();

            types.forEach(t => {
                expect(t).toHaveProperty('type');
                expect(t).toHaveProperty('label');
                expect(t).toHaveProperty('kFactor');
            });
        });
    });

    describe('createFitting', () => {
        it('creates fitting object', () => {
            const fitting = createFitting('elbow_90_std', 'DN50', 3);

            expect(fitting.type).toBe('elbow_90_std');
            expect(fitting.size).toBe('DN50');
            expect(fitting.quantity).toBe(3);
            expect(fitting.id).toBeDefined();
        });

        it('defaults quantity to 1', () => {
            const fitting = createFitting('valve_ball', 'DN50');
            expect(fitting.quantity).toBe(1);
        });
    });

    describe('K_FACTORS', () => {
        it('has all common fitting types', () => {
            expect(K_FACTORS).toHaveProperty('elbow_90_std');
            expect(K_FACTORS).toHaveProperty('tee_branch');
            expect(K_FACTORS).toHaveProperty('valve_ball');
            expect(K_FACTORS).toHaveProperty('valve_gate');
            expect(K_FACTORS).toHaveProperty('strainer');
        });

        it('all values are positive', () => {
            Object.values(K_FACTORS).forEach(k => {
                expect(k).toBeGreaterThan(0);
            });
        });
    });
});
