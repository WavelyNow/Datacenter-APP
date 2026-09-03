/**
 * GARANȚIA „diametrele sunt reale":
 * valori de referință din standarde/librării oficiale, verificate manual —
 * dacă cineva schimbă greșit datele din pipeStandards, testul pică.
 *
 * Surse: EN 10255 (oțel sudat), EN 1057 (cupru), EN ISO 15874 (PPR),
 * EN ISO 15494 (PE100), EN 1452 SDR13.6 (PVC-U PN16),
 * documentația oficială GF COOL-FIT, certificat KIWA (Uponor PE-Xa SDR 7.3).
 */

import { PIPE_STANDARDS } from '@/lib/pipeStandards';

const find = (std: string, dn: string) => {
    const entry = PIPE_STANDARDS[std]?.dimensions.find(d => d.dn === dn);
    if (!entry) throw new Error(`Missing ${std} ${dn}`);
    return entry;
};

const expectReal = (std: string, dn: string, exp: { od: number; t?: number; id: number; w?: number }) => {
    const d = find(std, dn);
    expect(d.od).toBeCloseTo(exp.od, 1);
    if (exp.t !== undefined) expect(d.thickness).toBeCloseTo(exp.t, 1);
    expect(d.id).toBeCloseTo(exp.id, 1);
    if (exp.w !== undefined) expect(d.weight).toBeCloseTo(exp.w, 2);
};

describe('Diametre REALE — referinte standarde (blocheaza regresii)', () => {
    it('OTEL EN 10255 — seria usoara (valori reale)', () => {
        expectReal('steel_light', 'DN15', { od: 21.3, t: 2.0, id: 17.3, w: 0.95 });
        expectReal('steel_light', 'DN25', { od: 33.7, t: 2.6, id: 28.5, w: 1.98 });
        expectReal('steel_light', 'DN50', { od: 60.3, t: 2.9, id: 54.5, w: 4.08 });
        expectReal('steel_light', 'DN100', { od: 114.3, t: 3.6, id: 107.1, w: 9.75 });
    });

    it('OTEL EN 10255 — seria grea/medie (valori reale)', () => {
        expectReal('steel_medium', 'DN25', { od: 33.7, t: 3.2, id: 27.3 });
        expectReal('steel_medium', 'DN50', { od: 60.3, t: 3.6, id: 53.1 });
    });

    it('CUPru EN 1057 (valori reale)', () => {
        expectReal('copper', '15mm', { od: 15, t: 0.7, id: 13.6, w: 0.28 });
        expectReal('copper', '22mm', { od: 22, t: 0.7, id: 20.6, w: 0.42 });
        expectReal('copper', '28mm', { od: 28, t: 1.0, id: 26.0, w: 0.75 });
        expectReal('copper', '54mm', { od: 54, t: 1.2, id: 51.6, w: 1.77 });
    });

    it('PPR PN20 SDR6 (EN ISO 15874) — valori reale', () => {
        expectReal('ppr_pn20', '25mm', { od: 25, t: 4.2, id: 16.6 });
        expectReal('ppr_pn20', '50mm', { od: 50, t: 8.3, id: 33.4 });
        expectReal('ppr_pn20', '110mm', { od: 110, t: 18.3, id: 73.4 });
    });

    it('PE100 SDR17 — valori reale', () => {
        expectReal('pehd_sdr17', '63mm', { od: 63, t: 3.8, id: 55.4 });
        expectReal('pehd_sdr17', '110mm', { od: 110, t: 6.6, id: 96.8 });
    });

    it('PVC-U PN16 SDR13.6 (EN 1452) — valori reale', () => {
        expectReal('pvc_u_pn16', 'd32', { od: 32, t: 2.4, id: 27.2 });
        expectReal('pvc_u_pn16', 'd63', { od: 63, t: 4.7, id: 53.6 });
        expectReal('pvc_u_pn16', 'd110', { od: 110, t: 8.1, id: 93.8 });
    });

    it('GF COOL-FIT 2.0 — documentație oficială (d32-d140, PN16 SDR11)', () => {
        expectReal('gf_coolfit_2_0', 'd32', { od: 32, t: 2.9, id: 26.2, w: 1.140 });
        expectReal('gf_coolfit_2_0', 'd90', { od: 90, t: 8.2, id: 73.6, w: 4.320 });
        expectReal('gf_coolfit_2_0', 'd140', { od: 140, t: 12.7, id: 114.6, w: 9.021 });
        // Pre-izolat: mantaua oficiala
        expect(find('gf_coolfit_2_0', 'd110').insulatedOd).toBe(160);
    });

    it('GF COOL-FIT 4.0 — fisa tehnica oficiala (SDR11 PN16 + SDR17 PN10)', () => {
        expectReal('gf_coolfit_4_0', 'd110', { od: 110, t: 10.0, id: 90.0, w: 6.20 });
        expectReal('gf_coolfit_4_0', 'd160', { od: 160, t: 9.5, id: 141.0, w: 9.921 });
        expectReal('gf_coolfit_4_0', 'd225', { od: 225, t: 13.4, id: 198.2, w: 16.620 });
        expectReal('gf_coolfit_4_0', 'd450', { od: 450, t: 26.7, id: 396.6, w: 55.490 });
    });

    it('UPONOR PE-Xa SDR 7.3 — certificat KIWA / EN ISO 15875', () => {
        expectReal('uponor_pexa_sdr73', '25mm', { od: 25, t: 3.5, id: 18.0 });
        expectReal('uponor_pexa_sdr73', '32mm', { od: 32, t: 4.4, id: 23.2 });
        expectReal('uponor_pexa_sdr73', '50mm', { od: 50, t: 6.9, id: 36.2 });
    });

    it('PIPELIFE PE100 SDR11 — standard metric EN ISO 15494', () => {
        expectReal('pipelife_pe100_sdr11', '63mm', { od: 63, t: 5.8, id: 51.4 });
        expectReal('pipelife_pe100_sdr11', '160mm', { od: 160, t: 14.6, id: 130.8 });
    });

    it('VALROM PPR PN20 SDR6 — EN ISO 15874', () => {
        expectReal('valrom_ppr_pn20', '32mm', { od: 32, t: 5.4, id: 21.2 });
        expectReal('valrom_ppr_pn20', '90mm', { od: 90, t: 15.0, id: 60.0 });
    });
});
