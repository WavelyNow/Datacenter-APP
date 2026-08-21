/**
 * Integritatea datelor din librăria de țevi („Standarde Țevi”).
 * Fiecare dimensiune trebuie să respecte geometria fizică:
 * Ø interior ≈ Ø exterior − 2 × grosime. Greutăți > 0. ODs rezonabile.
 */

import { PIPE_STANDARDS, getPipeStandards, saveUserPipeStandards, resetUserPipeStandards, PipeStandard } from '@/lib/pipeStandards';

describe('Pipe standards data integrity', () => {
    it('every dimension has consistent geometry (id ≈ od − 2×thickness)', () => {
        const problems: string[] = [];
        Object.entries(PIPE_STANDARDS).forEach(([key, std]) => {
            std.dimensions.forEach(d => {
                const expectedId = d.od - 2 * d.thickness;
                if (Math.abs(expectedId - d.id) > 0.3) {
                    problems.push(`${key} ${d.dn}: id=${d.id} vs od-2t=${expectedId.toFixed(1)}`);
                }
            });
        });
        expect(problems).toEqual([]);
    });

    it('no negative or zero OD/thickness/weight values', () => {
        const problems: string[] = [];
        Object.entries(PIPE_STANDARDS).forEach(([key, std]) => {
            std.dimensions.forEach(d => {
                if (!(d.od > 0) || !(d.thickness > 0) || !(d.weight > 0)) {
                    problems.push(`${key} ${d.dn}: od=${d.od} t=${d.thickness} w=${d.weight}`);
                }
            });
        });
        expect(problems).toEqual([]);
    });

    it('GF COOL-FIT 2.0 uses official 2026 dimensions (d32–d140, SDR11 PN16)', () => {
        const gf = PIPE_STANDARDS['gf_coolfit_2_0'];
        expect(gf).toBeDefined();
        expect(gf.maxPressure).toBe(16);
        const dn = gf.dimensions.map(d => d.dn);
        expect(dn).toEqual(['d32', 'd40', 'd50', 'd63', 'd75', 'd90', 'd110', 'd140']);
        // Greutăți oficiale cu manta (kg/m) — nu valorile vechi greșite
        const d32 = gf.dimensions[0];
        expect(d32.weight).toBeCloseTo(1.140, 2);
        expect(d32.insulatedOd).toBe(75);
        const d110 = gf.dimensions[6];
        expect(d110.weight).toBeCloseTo(5.692, 2);
        expect(d110.insulatedOd).toBe(160);
    });

    it('GF COOL-FIT 4.0 covers full official range d32–d450 (SDR11/17)', () => {
        const gf = PIPE_STANDARDS['gf_coolfit_4_0'];
        expect(gf).toBeDefined();
        const dns = gf.dimensions.map(d => d.dn);
        expect(dns).toContain('d32');
        expect(dns).toContain('d160');
        expect(dns).toContain('d450');
        const d225 = gf.dimensions.find(d => d.dn === 'd225')!;
        expect(d225.thickness).toBeCloseTo(13.4, 1); // SDR17 (225/17 ≈ 13.2)
        expect(d225.weight).toBeCloseTo(16.62, 1);
    });

    it('new manufacturers present: Uponor (EU), Pipelife + Valrom (RO)', () => {
        expect(PIPE_STANDARDS['uponor_pexa_sdr73']).toBeDefined();
        expect(PIPE_STANDARDS['pipelife_pe100_sdr11']).toBeDefined();
        expect(PIPE_STANDARDS['valrom_ppr_pn20']).toBeDefined();
        // PE-Xa SDR 7.3: 25×3.5 → id 18.0 (KIWA)
        const uponor25 = PIPE_STANDARDS['uponor_pexa_sdr73'].dimensions.find(d => d.od === 25)!;
        expect(uponor25.thickness).toBeCloseTo(3.5, 1);
        expect(uponor25.id).toBeCloseTo(18.0, 1);
    });

    it('getPipeStandards returns defaults when no override exists', () => {
        // In test env (jsdom), localStorage is fresh → no override
        const merged = getPipeStandards();
        expect(Object.keys(merged).length).toBeGreaterThanOrEqual(Object.keys(PIPE_STANDARDS).length);
    });

    it('local override applies INSTANTLY to PIPE_STANDARDS (Proxy view used by all calcs)', () => {
        // Save an override for one standard
        const custom: Record<string, PipeStandard> = {
            gf_coolfit_2_0: {
                ...PIPE_STANDARDS['gf_coolfit_2_0'],
                dimensions: [{ dn: 'd32', inch: '1"', od: 32, thickness: 3.0, id: 26.0, weight: 1.20 }],
            },
        };
        saveUserPipeStandards(custom);

        // Direct index access (the way calcs read it) reflects the override
        const effective = PIPE_STANDARDS['gf_coolfit_2_0'];
        expect(effective.dimensions[0].thickness).toBe(3.0);
        expect(effective.dimensions[0].id).toBe(26.0);

        // Object.entries also sees merged data
        const entries = Object.entries(PIPE_STANDARDS);
        expect(entries.length).toBeGreaterThanOrEqual(Object.keys(custom).length);

        // Reset → back to official
        resetUserPipeStandards();
        expect(PIPE_STANDARDS['gf_coolfit_2_0'].dimensions[0].thickness).toBe(2.9);
    });
});
