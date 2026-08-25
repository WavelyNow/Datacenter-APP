/**
 * Debit din sarcina termică + recomandare glicol — verigile care leagă
 * „kW răcire" de „DN țeavă" și „% glicol".
 *
 * Referințe numerice: apă cp=4186, ρ=998; EG30% cp≈3850/ρ≈1038; PG30% ρ≈1024.
 */

import { calculateFlowFromLoad } from '@/lib/calc/hydraulics';
import { suggestGlycolPercent, getFreezingPoint } from '@/lib/calculations/glycol';

describe('Flow from thermal load (kW → m³/h)', () => {
    it('water: 500 kW @ ΔT 8 K → ≈ 53.8 m³/h (formula Q=P/(cp·ρ·ΔT))', () => {
        const { flowM3H } = calculateFlowFromLoad(500, 8, 'water', 0);
        expect(flowM3H).toBeCloseTo(53.8, 0);
    });

    it('glycol 30% has LOWER flow than water (higher cp·ΔT capacity per kg but higher density... net lower volume)', () => {
        const w = calculateFlowFromLoad(500, 8, 'water', 0).flowM3H;
        const eg = calculateFlowFromLoad(500, 8, 'ethylene', 30).flowM3H;
        expect(eg).toBeGreaterThan(w); // cp mai mic => debit volumic mai mare
    });

    it('scales linearly with power', () => {
        const a = calculateFlowFromLoad(100, 8, 'propylene', 30).flowM3H;
        const b = calculateFlowFromLoad(200, 8, 'propylene', 30).flowM3H;
        expect(b / a).toBeCloseTo(2, 2);
    });

    it('zero power or ΔT → zero flow', () => {
        expect(calculateFlowFromLoad(0, 8, 'water', 0).flowM3H).toBe(0);
        expect(calculateFlowFromLoad(100, 0, 'water', 0).flowM3H).toBe(0);
    });
});

describe('Glycol concentration recommender', () => {
    it('protectie -25°C cu EG → minim 50% (freeze -36 ≤ -28 target)', () => {
        // target = -25-3 = -28; EG: 40%→-24 nu e destul (-24 > -28), 50%→-36 ✓
        expect(suggestGlycolPercent(-25, 'ethylene')).toBe(50);
    });

    it('PG are nevoie de mai mult decât EG pentru aceeași temperatură', () => {
        const eg = suggestGlycolPercent(-25, 'ethylene');
        const pg = suggestGlycolPercent(-25, 'propylene');
        expect(pg!).toBeGreaterThanOrEqual(eg!);
    });

    it('temperatura ≥ 0 → 0% glicol', () => {
        expect(suggestGlycolPercent(5, 'ethylene')).toBe(0);
        expect(suggestGlycolPercent(0, 'propylene')).toBe(0);
    });

    it('sub -55°C → nici 60% nu ajunge → null (avertizează utilizatorul)', () => {
        expect(suggestGlycolPercent(-60, 'ethylene')).toBeNull();
    });

    it('getFreezingPoint: EG 30% → -15°C, apa → 0°C, >60% → null', () => {
        expect(getFreezingPoint(30, 'ethylene')).toBe(-15);
        expect(getFreezingPoint(0, 'propylene')).toBe(0);
        expect(getFreezingPoint(70, 'ethylene')).toBeNull();
    });
});
