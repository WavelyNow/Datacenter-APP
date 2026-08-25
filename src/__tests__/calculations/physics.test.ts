/**
 * FIZICA — vas de expansiune (EN 12828) + corectia de temperatura a vâscozității.
 * Blochează corectiile din runda de deep-analysis:
 * - factorul de expansiune glicol SEPARAT pe tip (PG dilată mult mai mult)
 * - acceptanța NETĂ între umplere și max (nu 1−p0/pf simplu)
 */

import { calculateExpansionVessel } from '@/lib/calculations/expansionVessel';
import { getFluidProperties } from '@/lib/calculations/pressureDrop';

const base = {
    systemVolume: 1000,
    glycolPercentage: 30,
    minTemperature: 10,
    maxTemperature: 60,
    staticHeight: 5,
    safetyValvePressure: 6,
};

describe('Expansion vessel — fizică reală', () => {
    it('PG necesită vas MAI MARE decât EG la același % (dilată mai mult — Dow ratios)', () => {
        const pg = calculateExpansionVessel({ ...base, fluidType: 'propylene' });
        const eg = calculateExpansionVessel({ ...base, fluidType: 'ethylene' });
        expect(pg.expansionVolume).toBeGreaterThan(eg.expansionVolume);
        // la 30%: factor PG ≈1.32-1.39 vs EG ≈1.15 → diferență semnificativă
        expect(pg.expansionVolume / eg.expansionVolume).toBeGreaterThan(1.1);
    });

    it('PG 30% expansion coefficient reflects Dow ratio (~4.3% vs apa ~3%)', () => {
        // e(10→60°C): apa ≈ 0.0170−0.0003 = 0.0167; PG30 ×1.32+ → coef ≥ 0.021
        const pg = calculateExpansionVessel({ ...base, fluidType: 'propylene' });
        expect(pg.expansionCoefficient).toBeGreaterThan(0.02);
    });

    it('acceptance NETĂ: vasul e mai mare ca formula veche simplă (rezerva nu se dublează)', () => {
        // p0=2.5abs, pe=3abs, pf=4.5abs -> net=0.2778 vs vechiul 0.4444 (+60% acceptanță falsă)
        const r = calculateExpansionVessel({
            systemVolume: 500, glycolPercentage: 30, fluidType: 'propylene',
            minTemperature: 10, maxTemperature: 50, staticHeight: 15, safetyValvePressure: 6,
        });
        // staticHeight 15m => precharge ≈ 1.77bar; net acceptance < 0.44
        expect(r.acceptanceFactor).toBeLessThan(0.45);
        // si vasul rezultat acopera macar expansiunea + rezerva
        expect(r.requiredVolume).toBeGreaterThanOrEqual(r.expansionVolume);
        expect(r.isValid).toBe(true);
    });

    it('water (0% glycol) uses factor 1.0', () => {
        const w = calculateExpansionVessel({ ...base, glycolPercentage: 0, fluidType: 'water' });
        // Convenția aplicației: expansiune raportată la umplere la 10°C (baza 0)
        const expectedCoef = 0.01700; // e(60°C) - e(10°C≈0)
        expect(w.expansionCoefficient).toBeCloseTo(expectedCoef, 4);
    });
});

describe('Viscosity temperature correction (Dow-anchored piecewise)', () => {
    it('7°C: EG 30% viscosity ≈ 3.9 mPa·s (nu −14% sub real)', () => {
        const p = getFluidProperties('ethylene', 30, 7);
        const mPas = p.dynamicViscosityPaS * 1000;
        expect(mPas).toBeGreaterThan(3.4);
        expect(mPas).toBeLessThan(4.6);
    });

    it('40°C: PG 50% nu mai supraestimeaza cu +60% (Dow ~3.1 mPa·s)', () => {
        const p = getFluidProperties('propylene', 50, 40);
        const mPas = p.dynamicViscosityPaS * 1000;
        expect(mPas).toBeLessThan(5.5);
        expect(mPas).toBeGreaterThan(2.2);
    });
});
