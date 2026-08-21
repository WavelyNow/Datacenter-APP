/**
 * Regresie: consistența proprietăților glicolului pe TOT intervalul 0–100%.
 * Bug-uri eliminate:
 * 1. Vâscozitatea era „tăiată" la 60% (interpolate clamp) iar densitatea
 *    mergea la 100% → la concentrații mari Reynolds/căderi DE PRESIUNE false.
 * 2. Densitate din două module diferite (common vs pressureDrop) — peste 60%
 *    dădeau valori diferite.
 * 3. Formule inline rămase (1000 + %×5) în chart/rând de țeavă.
 */

import { getFluidDensity } from '@/lib/calculations/common';
import { getFluidProperties, getViscosity, getDensity } from '@/lib/calculations/pressureDrop';
import { calculatePressureDrop } from '@/lib/calculations/pressureDrop';

describe('Glycol consistency 0–100% (no more "clamp at 60" lies)', () => {
    it('viscosity is CONTINUOUS past 60% — no plateau clamp', () => {
        const v60 = getViscosity('ethylene', 60);
        const v70 = getViscosity('ethylene', 70);
        const v100 = getViscosity('ethylene', 100);
        expect(v70).toBeGreaterThan(v60);
        expect(v100).toBeGreaterThan(v70);
        // EG 100% ~ 18 mPa·s @20°C
        expect(v100).toBeCloseTo(0.018, 3);
    });

    it('propylene viscosity continuous and higher than ethylene at same %', () => {
        for (const pct of [60, 70, 80, 90, 100]) {
            expect(getViscosity('propylene', pct)).toBeGreaterThan(getViscosity('ethylene', pct));
        }
        // PG 100% ~ 52 mPa·s
        expect(getViscosity('propylene', 100)).toBeCloseTo(0.052, 2);
    });

    it('density is IDENTICAL across modules (common vs pressureDrop) at all %', () => {
        for (const pct of [0, 30, 60, 70, 80, 100]) {
            const fromCommon = getFluidDensity(pct, 'ethylene') * 1000; // kg/m³
            const fromPressure = getDensity('ethylene', pct);
            expect(Math.abs(fromCommon - fromPressure)).toBeLessThan(1.5);
        }
        for (const pct of [0, 30, 60, 80, 100]) {
            const fromCommon = getFluidDensity(pct, 'propylene') * 1000;
            const fromPressure = getDensity('propylene', pct);
            expect(Math.abs(fromCommon - fromPressure)).toBeLessThan(1.5);
        }
    });

    it('getFluidProperties at high concentrations yields finite, usable values', () => {
        const props = getFluidProperties('ethylene', 85);
        expect(Number.isFinite(props.densityKgM3)).toBe(true);
        expect(Number.isFinite(props.dynamicViscosityPaS)).toBe(true);
        expect(Number.isFinite(props.kinematicViscosityM2S)).toBe(true);
        expect(props.dynamicViscosityPaS).toBeGreaterThan(getFluidProperties('ethylene', 60).dynamicViscosityPaS);
    });

    it('pressure drop at 80% is HIGHER than at 30% (more viscous) — physically correct', () => {
        const drop30 = calculatePressureDrop(54.5, 10, 25, 'ethylene', 30);
        const drop80 = calculatePressureDrop(54.5, 10, 25, 'ethylene', 80);
        expect(drop80.totalPressureDropPa).toBeGreaterThan(drop30.totalPressureDropPa);
        // Reynolds scade corect (vâscozitate mai mare)
        expect(drop80.reynoldsNumber).toBeLessThan(drop30.reynoldsNumber);
    });

    it('propylene at 100% has WARNING for >60% but still computes (no NaN)', () => {
        const result = calculatePressureDrop(54.5, 10, 25, 'propylene', 100);
        expect(result.warnings.join(' ')).toMatch(/peste limita/i);
        expect(Number.isFinite(result.totalPressureDropPa)).toBe(true);
        expect(result.totalPressureDropPa).toBeGreaterThan(0);
    });

    it('getFluidDensity: EG monotonic, PG defined at 100% (non-monotonic max ~70-80%)', () => {
        expect(getFluidDensity(100, 'ethylene')).toBeGreaterThan(getFluidDensity(80, 'ethylene'));
        // PG: 80% > 100% (peak la ~70-80%) — tabelul are 1.063 la 80 vs 1.036 la 100
        expect(getFluidDensity(100, 'propylene')).toBeLessThan(getFluidDensity(80, 'propylene'));
        expect(Number.isFinite(getFluidDensity(100, 'propylene'))).toBe(true);
    });
});
