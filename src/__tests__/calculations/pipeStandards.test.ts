/**
 * Integritatea datelor din librăria de țevi („Standarde Țevi”).
 * Fiecare dimensiune trebuie să respecte geometria fizică:
 * Ø interior ≈ Ø exterior − 2 × grosime. Greutăți > 0. ODs rezonabile.
 */

import { PIPE_STANDARDS, getPipeStandards } from '@/lib/pipeStandards';

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

    it('GF COOL-FIT 2.0 includes the complete catalog range d32–d140', () => {
        const gf = PIPE_STANDARDS['gf_coolfit_2_0'];
        expect(gf).toBeDefined();
        expect(gf.maxPressure).toBe(16);
        const dn = gf.dimensions.map(d => d.dn);
        expect(dn).toEqual(['d32', 'd40', 'd50', 'd63', 'd75', 'd90', 'd110', 'd140']);
        expect(gf.dimensions.map(d => [d.dn, d.nominalDn, d.od])).toEqual([
            ['d32', 'DN25', 32], ['d40', 'DN32', 40], ['d50', 'DN40', 50], ['d63', 'DN50', 63],
            ['d75', 'DN65', 75], ['d90', 'DN80', 90], ['d110', 'DN100', 110], ['d140', 'DN125', 140],
        ]);
        // Greutăți oficiale cu manta (kg/m) — nu valorile vechi greșite
        const d32 = gf.dimensions[0];
        expect(d32.weight).toBeCloseTo(1.140, 2);
        expect(d32.insulatedOd).toBe(75);
        const d110 = gf.dimensions[6];
        expect(d110.weight).toBeCloseTo(5.692, 2);
        expect(d110.insulatedOd).toBe(160);
        expect(gf.dimensions.find(d => d.dn === 'd140')?.nominalDn).toBe('DN125');
    });

    it('GF COOL-FIT 4.0 covers the full official range d32–d450 (SDR11/17)', () => {
        const gf = PIPE_STANDARDS['gf_coolfit_4_0'];
        expect(gf).toBeDefined();
        const dns = gf.dimensions.map(d => d.dn);
        expect(dns).toEqual(['d32', 'd40', 'd50', 'd63', 'd75', 'd90', 'd110', 'd140', 'd160', 'd225', 'd250', 'd280', 'd315', 'd355', 'd400', 'd450']);
        expect(gf.dimensions.map(d => [d.dn, d.nominalDn, d.od])).toEqual([
            ['d32', 'DN25', 32], ['d40', 'DN32', 40], ['d50', 'DN40', 50], ['d63', 'DN50', 63],
            ['d75', 'DN65', 75], ['d90', 'DN80', 90], ['d110', 'DN100', 110], ['d140', 'DN125', 140],
            ['d160', 'DN150', 160], ['d225', 'DN200', 225], ['d250', 'DN250', 250], ['d280', 'DN250', 280],
            ['d315', 'DN300', 315], ['d355', 'DN350', 355], ['d400', 'DN400', 400], ['d450', 'DN450', 450],
        ]);
        const d225 = gf.dimensions.find(d => d.dn === 'd225')!;
        expect(d225.thickness).toBeCloseTo(13.4, 1); // SDR17 (225/17 ≈ 13.2)
        expect(d225.weight).toBeCloseTo(16.62, 1);
        expect(d225.pressureClass).toBe(10);
        expect(d225.sdr).toBe(17);
        expect(gf.dimensions.find(d => d.dn === 'd140')?.nominalDn).toBe('DN125');
    });

    it('manufacturer series expose all catalog dimensions used by the app', () => {
        expect(PIPE_STANDARDS['uponor_pexa_sdr73']).toBeDefined();
        expect(PIPE_STANDARDS['pipelife_pe100_sdr11']).toBeDefined();
        expect(PIPE_STANDARDS['valrom_ppr_pn20']).toBeDefined();
        // PE-Xa SDR 7.3: 25×3.5 → id 18.0 (KIWA)
        const uponor25 = PIPE_STANDARDS['uponor_pexa_sdr73'].dimensions.find(d => d.od === 25)!;
        expect(uponor25.thickness).toBeCloseTo(3.5, 1);
        expect(uponor25.id).toBeCloseTo(18.0, 1);

        expect(PIPE_STANDARDS.pehd_sdr17.dimensions.map(d => d.dn)).toEqual([
            '32mm', '40mm', '50mm', '63mm', '75mm', '90mm', '110mm', '125mm', '140mm',
            '160mm', '180mm', '200mm', '225mm', '250mm', '280mm', '315mm', '355mm',
            '400mm', '450mm', '500mm',
        ]);
        expect(PIPE_STANDARDS.pipelife_pe100_sdr11.dimensions.map(d => d.dn)).toEqual([
            '32mm', '40mm', '50mm', '63mm', '75mm', '90mm', '110mm', '125mm', '140mm',
            '160mm', '180mm', '200mm', '225mm', '250mm', '280mm', '315mm', '355mm',
            '400mm', '450mm', '500mm',
        ]);
        const d500 = PIPE_STANDARDS.pipelife_pe100_sdr11.dimensions.find(d => d.dn === '500mm')!;
        expect(d500.weight).toBeCloseTo(61.597, 3);
        expect(PIPE_STANDARDS.valrom_ppr_pn20.dimensions.map(d => d.dn)).toEqual([
            '20mm', '25mm', '32mm', '40mm', '50mm', '63mm', '75mm', '90mm', '110mm',
        ]);
    });

    it('shows PN only when it is explicit or unambiguous in the source data', () => {
        expect(PIPE_STANDARDS.steel_light.dimensions[0].pressureClass).toBeUndefined();
        expect(PIPE_STANDARDS.ppr_pn20.dimensions[0].pressureClass).toBe(20);
        expect(PIPE_STANDARDS.ppr_pn20.dimensions[0].sdr).toBe(6);
        expect(PIPE_STANDARDS.pehd_sdr17.dimensions.find(d => d.dn === '75mm')?.pressureClass).toBe(10);
    });

    it('returns the same immutable catalog for every consumer', () => {
        expect(getPipeStandards()).toBe(PIPE_STANDARDS);
        expect(Object.isFrozen(PIPE_STANDARDS)).toBe(true);
        expect(Object.isFrozen(PIPE_STANDARDS.gf_coolfit_4_0)).toBe(true);
        expect(Object.isFrozen(PIPE_STANDARDS.gf_coolfit_4_0.dimensions)).toBe(true);
        expect(Object.isFrozen(PIPE_STANDARDS.gf_coolfit_4_0.dimensions[0])).toBe(true);
    });

    it('ignores legacy localStorage overrides', () => {
        localStorage.setItem('pipe_standards_user_override_v1', JSON.stringify({
            gf_coolfit_4_0: { dimensions: [{ dn: 'd32', od: 32, thickness: 1, id: 30, weight: 1 }] },
        }));

        expect(getPipeStandards().gf_coolfit_4_0.dimensions[0].id).toBe(26.2);
        localStorage.removeItem('pipe_standards_user_override_v1');
    });

    it('keeps a source reference for every series', () => {
        const missingSources = Object.entries(PIPE_STANDARDS)
            .filter(([, standard]) => !standard.sources || standard.sources.length === 0)
            .map(([key]) => key);
        expect(missingSources).toEqual([]);
    });
});
