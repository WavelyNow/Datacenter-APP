/**
 * Regresie: sumarul de comandă („cât trebuie să cumpăr").
 * Model nou: volumul fittingurilor se CALCULEAZĂ din numărul real introdus
 * (coturi/teuri/vane pe DN) — nu din procente generice. Marja rămâne
 * configurată de utilizator.
 */

import { calculatePurchaseSummary, calculatePipeGlycolLines, FITTING_DIAMETER_MULTIPLIERS } from '@/lib/calculations/purchase';
import { PipeSegment } from '@/lib/types';

const segments: PipeSegment[] = [
    { id: 's1', material: 'steel_light', standard: 'EN 10255', size: 'DN50', length: 10 },
    { id: 's2', material: 'steel_light', standard: 'EN 10255', size: 'DN100', length: 5 },
];

describe('Purchase summary (cât trebuie să cumpăr)', () => {
    it('exposes the pipe glycol calculation per segment for auditable exports', () => {
        const lines = calculatePipeGlycolLines(segments, 30);

        expect(lines).toHaveLength(2);
        expect(lines[0]).toMatchObject({
            segmentId: 's1',
            size: 'DN50',
            lengthM: 10,
            innerDiameterMm: 54.5,
        });
        expect(lines[0].pipeVolumeL).toBeCloseTo(23.33, 1);
        expect(lines[0].pureGlycolL).toBeCloseTo(lines[0].pipeVolumeL * 0.3, 4);
        expect(lines.reduce((sum, line) => sum + line.pipeVolumeL, 0)).toBeCloseTo(
            calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, []).pipeVolumeL,
            6
        );
    });

    it('computes pipe volumes from real diameters and aggregates per DN', () => {
        const p = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, []);
        expect(p.pipeVolumeL).toBeGreaterThan(60);
        expect(p.pipeLines.length).toBe(2);
        const dn50 = p.pipeLines.find(l => l.size === 'DN50')!;
        expect(dn50.lengthM).toBe(10);
        expect(dn50.weightKg).toBeGreaterThan(30); // ~4.08 kg/m × 10 m
    });

    it('fitting volume is COMPUTED from real counts (DN-dependent), not a % of pipe', () => {
        const fittings = [
            { id: 'f1', type: 'elbow_90_std', size: 'DN50', quantity: 4 },
            { id: 'f2', type: 'tee_branch', size: 'DN100', quantity: 2 },
        ];
        const p = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, fittings);

        const d50 = 54.5 / 1000; // ID real DN50 (oțel ușoară)
        const d100 = 107.1 / 1000;
        const expected = 4 * (Math.PI / 4) * d50 * d50 * (FITTING_DIAMETER_MULTIPLIERS['elbow_90_std'] * d50) * 1000
            + 2 * (Math.PI / 4) * d100 * d100 * (FITTING_DIAMETER_MULTIPLIERS['tee_branch'] * d100) * 1000;

        expect(p.fittingsVolumeL).toBeCloseTo(expected, 4);
        expect(p.fittingsTotalCount).toBe(6);
        // Fără marjă: raw = pipe + fittings + equip
        expect(p.rawTotalL).toBeCloseTo(p.pipeVolumeL + p.fittingsVolumeL, 1);
        expect(p.fittingsVolumeL).toBeLessThan(p.pipeVolumeL * 0.3); // sensibil, nu exagerat
    });

    it('aggregates fitting items by type+DN for the buy list (duplicates merged)', () => {
        const p = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, [
            { id: 'f1', type: 'elbow_90_std', size: 'DN50', quantity: 4 },
            { id: 'f2', type: 'elbow_90_std', size: 'DN50', quantity: 2 },
            { id: 'f3', type: 'valve_ball', size: 'DN100', quantity: 1 },
        ]);
        const elbows = p.fittingItems.find(f => f.type === 'elbow_90_std')!;
        expect(elbows.quantity).toBe(6);
        const valve = p.fittingItems.find(f => f.type === 'valve_ball')!;
        expect(valve.quantity).toBe(1);
        expect(p.fittingsTotalCount).toBe(7);
    });

    it('margin is user-configurable and applied AFTER fittings; rounds up to 10 L canisters', () => {
        const fittings = [{ id: 'f1', type: 'valve_ball', size: 'DN50', quantity: 2 }];
        const pNo = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, fittings);
        const pYes = calculatePurchaseSummary(segments, [], 30, 'ethylene', true, 10, fittings);

        expect(pYes.marginPercent).toBe(10);
        expect(pYes.marginL).toBeCloseTo(pYes.rawTotalL * 0.1 / 1.1, 1);
        expect(pYes.totalGlycolL).toBeGreaterThanOrEqual(pNo.totalGlycolL);
        expect(pYes.totalGlycolL % 10).toBe(0);
        expect(pYes.canisters10L).toBe(pYes.totalGlycolL / 10);
    });

    it('equipment water content is added to the purchase volume', () => {
        const p = calculatePurchaseSummary(segments, [{ id: 'e1', type: 'Chiller', name: 'C1', volume: 50, weight: 100 }], 30, 'ethylene', false, 0, []);
        expect(p.equipmentVolumeL).toBe(50);
        expect(p.rawTotalL).toBeCloseTo(p.pipeVolumeL + 50, 1);
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

    it('REAL scenario: equipment-heavy system — fittings from counts, small impact', () => {
        const equipment = [
            { id: 'c1', type: 'Chiller', name: 'Chiller 1', volume: 2000, weight: 4500 },
            { id: 'c2', type: 'Chiller', name: 'Chiller 2', volume: 2000, weight: 4500 },
            { id: 'v1', type: 'Puffer / Rezervor Tampon', name: 'Vas 5000L', volume: 5000, weight: 800 },
        ];
        const bigPipe: PipeSegment[] = [{ id: 'p1', material: 'gf_coolfit_4_0', standard: 'GF 4.0', size: 'd160', length: 50 }];
        const fittings = [
            { id: 'f1', type: 'elbow_90_std', size: 'd160', quantity: 6 },
            { id: 'f2', type: 'valve_ball', size: 'd160', quantity: 2 },
        ];
        const p = calculatePurchaseSummary(bigPipe, equipment, 30, 'ethylene', false, 0, fittings);
        expect(Number.isFinite(p.totalGlycolL)).toBe(true);
        expect(p.pipeVolumeL).toBeGreaterThan(700); // d160 × 50 m ≈ 780 L
        // 6 coturi + 2 vane pe d160 — volumul lor e mic față de sistemul de ~10.000 L
        expect(p.fittingsVolumeL).toBeLessThan(p.pipeVolumeL * 0.3);
        expect(p.totalGlycolL).toBeGreaterThan(9000);
    });

    it('fittings on unknown sizes do not produce NaN (safe fallback)', () => {
        const fittings = [
            { id: 'f1', type: 'elbow_90_std', size: 'DX99', quantity: 2 },
            { id: 'f2', type: 'elbow_90_std', size: 'DN50', quantity: 1 },
        ];
        const p = calculatePurchaseSummary(segments, [], 30, 'ethylene', false, 0, fittings);
        expect(Number.isFinite(p.fittingsVolumeL)).toBe(true);
        expect(p.fittingsTotalCount).toBe(3);
    });
});

describe('Margin consistency (0-20 peste tot — PDF nu poate contrazice calculul)', () => {
    it('clamps margin to 20% max (same as UI & API)', () => {
        const p = calculatePurchaseSummary(segments, [], 30, 'ethylene', true, 25, []);
        expect(p.marginPercent).toBe(20);
        const p2 = calculatePurchaseSummary(segments, [], 30, 'ethylene', true, -5, []);
        expect(p2.marginPercent).toBe(0);
        expect(p2.marginL).toBe(0);
    });

    it('marginL is consistent: rawTotalL - baseL = marginL', () => {
        const p = calculatePurchaseSummary(segments, [], 30, 'ethylene', true, 12, []);
        expect(p.rawTotalL).toBeCloseTo(p.pipeVolumeL + p.fittingsVolumeL + p.equipmentVolumeL + p.marginL, 4);
    });

    it('breakdown sum equals rawTotal (exact, no floating surprise)', () => {
        const fittings = [{ id: 'f1', type: 'elbow_90_std', size: 'DN50', quantity: 3 }];
        const p = calculatePurchaseSummary(segments, [{ id: 'e1', type: 'Chiller', name: 'C', volume: 50, weight: 100 }], 30, 'propylene', true, 8, fittings);
        const sum = p.pipeVolumeL + p.fittingsVolumeL + p.equipmentVolumeL + p.marginL;
        expect(sum).toBeCloseTo(p.rawTotalL, 4);
        expect(p.totalGlycolL).toBe(Math.ceil(p.rawTotalL / 10) * 10);
        expect(p.totalGlycolL % 10).toBe(0);
    });
});
