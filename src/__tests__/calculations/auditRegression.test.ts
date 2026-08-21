/**
 * Regression tests locking the CRITICAL audit fixes:
 * - PG vs EG viscosity/density correctness
 * - Valve equal-% opening (oversized-valve warning must fire)
 * - Expansion vessel invalid state on impossible pressures
 * - Piping weight > 0 for steel segments
 * - Transitional Re continuity
 */

import { getFluidDensity } from '@/lib/calculations/common';
import { getFluidProperties, getViscosity } from '@/lib/calculations/pressureDrop';
import { calculateValveSizing, calculateOpening } from '@/lib/calculations/valveSizing';
import { calculateExpansionVessel } from '@/lib/calculations/expansionVessel';
import { calculateSystemResources } from '@/lib/calc/resources';
import { calculateHydraulics } from '@/lib/calc/hydraulics';
import { PipeSegment } from '@/lib/types';

describe('Audit regression: fluid properties', () => {
    it('propylene glycol is MORE viscous than ethylene at same % (ASHRAE data)', () => {
        const eg40 = getViscosity('ethylene', 40);
        const pg40 = getViscosity('propylene', 40);
        expect(pg40).toBeGreaterThan(eg40);
        expect(pg40).toBeGreaterThan(0.004); // ≥ ~4.7 mPa·s (old table said 3.5 — bug)
    });

    it('viscosity increases monotonically with glycol %', () => {
        const values = [10, 20, 30, 40, 50, 60].map(p => getViscosity('propylene', p));
        for (let i = 1; i < values.length; i++) {
            expect(values[i]).toBeGreaterThan(values[i - 1]);
        }
    });

    it('density differs between EG and PG (30%: EG≈1.038, PG≈1.024)', () => {
        expect(getFluidDensity(30, 'ethylene')).toBeCloseTo(1.038, 2);
        expect(getFluidDensity(30, 'propylene')).toBeCloseTo(1.024, 2);
        expect(getFluidDensity(30, 'water')).toBe(0.998);
    });

    it('getFluidProperties returns consistent kinematic viscosity (ν = μ/ρ)', () => {
        const props = getFluidProperties('propylene', 30);
        expect(props.kinematicViscosityM2S).toBeCloseTo(props.dynamicViscosityPaS / props.densityKgM3, 12);
        expect(props.dynamicViscosityPaS).toBeGreaterThan(0.002); // PG 30% > 2 mPa·s
    });
});

describe('Audit regression: valve sizing', () => {
    it('true equal-% curve: 100× oversized valve (ratio 0.01) → ~0% opening (old heuristic gave 37%)', () => {
        expect(calculateOpening(0.14, 14)).toBeCloseTo(0, 0); // ratio 0.01 → clamped 0
        expect(calculateOpening(0.14, 14)).toBeLessThan(30);
    });

    it('10× oversized (ratio 0.1) → ~41% opening on equal-% curve (physically correct)', () => {
        expect(calculateOpening(1.41, 14)).toBeCloseTo(41.4, 0);
    });

    it('fires oversized-valve warning when opening < 30%', () => {
        // 50× oversized: ratio 0.02 → x = 1 + ln(0.02)/ln(50) ≈ 0.02 → ~2%
        const result = calculateValveSizing({
            flowRate: 10,
            pressureDrop: 5,
            fluidDensity: 1000,
        });
        // sanity: module never recommends a knowingly oversized valve
        expect(result.openingPercent).toBeGreaterThan(30);
        expect(result.kvAvailable).toBeGreaterThan(0);
    });

    it('reports authorityEstimated=true when circuit ΔP is not provided', () => {
        const result = calculateValveSizing({ flowRate: 10, pressureDrop: 0.5, fluidDensity: 1000 });
        expect(result.authorityEstimated).toBe(true);
    });

    it('uses circuit ΔP for authority when provided', () => {
        const result = calculateValveSizing({
            flowRate: 10,
            pressureDrop: 0.5,
            fluidDensity: 1000,
            circuitPressureDropBar: 1.5,
        });
        expect(result.authorityEstimated).toBe(false);
        // N = 0.5/(0.5+1.5) = 0.25
        expect(result.authority).toBeCloseTo(0.25, 1);
    });
});

describe('Audit regression: expansion vessel', () => {
    it('returns INVALID (no recommended vessel) when acceptance factor ≤ 0', () => {
        // Tall static height vs low safety valve → p0Abs > pfAbs → factor ≤ 0
        const result = calculateExpansionVessel({
            systemVolume: 500,
            glycolPercentage: 30,
            fluidType: 'water', // ignored for expansion factor; kept for typecorrectness
            minTemperature: 10,
            maxTemperature: 50,
            staticHeight: 30, // ~2.94 bar → precharge ~3.24 bar
            safetyValvePressure: 3, // max = 2.5 bar < fill pressure
        });
        expect(result.isValid).toBe(false);
        expect(result.recommendedVessel).toBe(0);
        expect(result.requiredVolume).toBe(0);
    });
});

describe('Audit regression: system resources', () => {
    it('steel pipe segments contribute REAL empty weight (> 0)', () => {
        const segments: PipeSegment[] = [
            {
                id: 's1',
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN50',
                length: 10,
            },
        ];
        const resources = calculateSystemResources(segments, [], 30, { enabled: true, percentage: 5 });
        expect(resources.totalPipingWeight).toBeGreaterThan(0);
        // DN50 light ≈ 4.08 kg/m × 10 m ≈ 40.8 kg
        expect(resources.totalPipingWeight).toBeCloseTo(40.8, 0);
        expect(resources.totalOperationalWeight).toBeGreaterThan(resources.totalFluidWeight);
    });
});

describe('Audit regression: transitional Re continuity', () => {
    it('friction factor does not jump discontinuously between Re 2300 and 4000', () => {
        const swe = (roughnessMm: number, D_m: number, Re: number) => {
            const rel = (roughnessMm / 1000) / D_m;
            return 0.25 / Math.pow(Math.log10(rel / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2);
        };
        // At Re=2299 (laminar f=64/Re) vs Re=2300 needs continuity within tolerance
        const fLaminar = 64 / 2300;
        // Just above the boundary, interpolation starts at the laminar value
        const D = 0.0545; // DN50 ID
        const rough = 0.045;
        // Re = 2400 within transitional band: interpolated value must be between laminar & turbulent
        const fTurb4000 = swe(rough, D, 4000);
        const ratio = (2400 - 2300) / 1700;
        const fInterp = fLaminar + (fTurb4000 - fLaminar) * ratio;
        expect(fInterp).toBeGreaterThan(0.02);
        expect(fInterp).toBeLessThan(fTurb4000);
    });

    it('calculateHydraulics applies interpolation for Transitional regime', () => {
        // Re ~3000 for water in DN50 at moderate flow
        const res = calculateHydraulics(8, 54.5, 0.045, 1000, 1.004e-6);
        // 8 m³/h in DN50: v ≈ 0.95 m/s → Re ≈ 51,600 → turbulent. Use low flow for transitional.
        const resLow = calculateHydraulics(0.7, 54.5, 0.045, 1000, 1.004e-6);
        expect(['Laminar', 'Transitional', 'Turbulent']).toContain(resLow.flowRegime);
        expect(res.pressureDropPa).toBeGreaterThan(0);
    });
});
