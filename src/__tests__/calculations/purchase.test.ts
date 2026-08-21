/**
 * Regresie: sumarul de comandă („cât trebuie să cumpăr").
 * Verifică: volum țeavă real, allowance fittinguri, marjă, rotunjire 10 L,
 * agregare mărimi și cantități de vană/cot/teu.
 */

import { calculatePurchaseSummary, FITTINGS_ALLOWANCE_PERCENT } from '@/lib/calculations/purchase';
import { PipeSegment } from '@/lib/types';

const segments: PipeSegment[] = [
    { id: 's1', material: 'steel_light', standard: 'EN 10255', size: 'DN50', length: 10 },
    { id: 's2', material: 'steel_light', standard: 'EN 10255', size: 'DN100', length: 5 },
];

describe('Purchase summary (cât trebuie să cumpăr)', () => {
    it('computes pipe volumes from real diameters and aggregates per DN', () => {
        const p = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, []);
        // DN50: id 54.5 → π·(0.0545/2)²·10·1000 ≈ 23.3 L ; DN100: id 107.1 → π·(0.1071/2)²·5·1000 ≈ 45.0 L
        expect(p.pipeVolumeL).toBeGreaterThan(60);
        expect(p.pipeLines.length).toBe(2);
        const dn50 = p.pipeLines.find(l => l.size === 'DN50')!;
        expect(dn50.lengthM).toBe(10);
        expect(dn50.weightKg).toBeGreaterThan(30); // ~4.08 kg/m × 10 m
    });

    it('applies fittings allowance (8% explicit) and margin, then rounds up to 10 L canisters', () => {
        const p = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, [], 8);
        expect(p.fittingsAllowancePercent).toBe(8);
        expect(p.fittingsAllowanceL).toBeCloseTo(p.pipeVolumeL * 0.08, 1);
        // fără marjă: raw = pipe + 8%
        expect(p.rawTotalL).toBeCloseTo(p.pipeVolumeL * 1.08, 1);
        expect(p.totalGlycolL).toBe(p.rawTotalL > 0 ? Math.ceil(p.rawTotalL / 10) * 10 : 0);
        expect(p.canisters10L).toBe(p.totalGlycolL / 10);
        expect(p.totalGlycolL % 10).toBe(0);
    });

    it('margin increases quantity and is included in canister count', () => {
        const pNo = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, []);
        const pYes = calculatePurchaseSummary(segments, [], 30, 'ethylene', true, 10, []);
        expect(pYes.marginPercent).toBe(10);
        expect(pYes.marginL).toBeGreaterThan(0);
        expect(pYes.totalGlycolL).toBeGreaterThanOrEqual(pNo.totalGlycolL);
    });

    it('equipment water content is added to the purchase volume', () => {
        const p = calculatePurchaseSummary(segments, [{ id: 'e1', type: 'Chiller', name: 'C1', volume: 50, weight: 100 }], 30, 'ethylene', false, 0, []);
        expect(p.equipmentVolumeL).toBe(50);
        expect(p.rawTotalL).toBeCloseTo((p.pipeVolumeL + p.fittingsAllowanceL) + 50, 1);
    });

    it('aggregates fitting items by type+DN for the buy list', () => {
        const p = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, [
            { id: 'f1', type: 'elbow_90_std', size: 'DN50', quantity: 4 },
            { id: 'f2', type: 'elbow_90_std', size: 'DN50', quantity: 2 },
            { id: 'f3', type: 'valve_ball', size: 'DN100', quantity: 1 },
        ]);
        const elbows = p.fittingItems.find(f => f.type === 'elbow_90_std')!;
        expect(elbows.quantity).toBe(6);
        const valve = p.fittingItems.find(f => f.type === 'valve_ball')!;
        expect(valve.quantity).toBe(1);
    });

    it('fluid weight uses the real glycol density for the selected type', () => {
        const p = calculatePurchaseSummary([], [], 30, 'water', false, 0, []);
        expect(p.fluidWeightKg).toBeCloseTo(p.totalGlycolL * 0.998, 1);
    });

    it('empty project does not produce NaN', () => {
        const p = calculatePurchaseSummary([], [], 30, 'ethylene', true, 5, []);
        expect(Number.isFinite(p.totalGlycolL)).toBe(true);
        expect(p.totalGlycolL).toBe(0);
    });

    it('REAL scenario: equipment-heavy system (2×2000L chillers + 5000L vessel) — allowance is ONLY on pipe volume', () => {
        // 10,000 L sistem "înainte": 9000 L echipamente + 1000 L țeavă
        const equipment = [
            { id: 'c1', type: 'Chiller', name: 'Chiller 1', volume: 2000, weight: 4500 },
            { id: 'c2', type: 'Chiller', name: 'Chiller 2', volume: 2000, weight: 4500 },
            { id: 'v1', type: 'Puffer / Rezervor Tampon', name: 'Vas 5000L', volume: 5000, weight: 800 },
        ];
        const pipe: PipeSegment[] = [{ id: 'p1', material: 'steel_light', standard: 'EN 10255', size: 'DN100', length: 20 }];
        // țeavă DN100: id 107.1 → π·(0.1071/2)²·20·1000 ≈ 180 L — ajustăm lungimea ca să iasă ~1000 L
        // DN250: id 254.5? folosim DN250 steel_light...
        const bigPipe: PipeSegment[] = [{ id: 'p1', material: 'steel_light', standard: 'EN 10255', size: 'DN250', length: 50 }];
        const p = calculatePurchaseSummary(bigPipe, equipment, 30, 'ethylene', false, 0, [], 8);

        // Verificare: allowance-ul se aplică DOAR pe volumul de țeavă
        expect(p.fittingsAllowancePercent).toBe(8);
        expect(p.fittingsAllowanceL).toBeCloseTo(p.pipeVolumeL * 0.08, 1);
        // Impactul pe tot sistemul e mic: allowance = 8% × (țeavă / sistem total)
        const totalImpactPct = p.fittingsAllowanceL / (p.pipeVolumeL + p.equipmentVolumeL) * 100;
        expect(totalImpactPct).toBeLessThan(3); // sub 3% din totalul sistemului
    });

    it('allowance is clamped to 0–15%', () => {
        const p = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, [], 150);
        expect(p.fittingsAllowancePercent).toBe(15);
        const p2 = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, [], -3);
        expect(p2.fittingsAllowancePercent).toBe(0);
    });
});
