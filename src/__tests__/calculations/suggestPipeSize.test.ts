/**
 * Teste pentru noile funcționalități din runda 5:
 * - suggestPipeSize („aflarea diametrelor" — scopul principal)
 * - template-urile de proiect cu fittinguri + validitatea diametrelor
 */

import { suggestPipeSize } from '@/lib/calc/hydraulics';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { PROJECT_TEMPLATES } from '@/lib/templates';

describe('suggestPipeSize — recomandare DN din debit', () => {
    const steelDims = PIPE_STANDARDS['steel_light'].dimensions.map(d => ({ dn: d.dn, id: d.id }));

    it('returns smallest DN with velocity ≤ 2.5 m/s', () => {
        // 5 m³/h prin DN15 (ID 17.3mm): v = (5/3600)/(π·0.0173²/4) ≈ 5.9 m/s — prea mare
        // DN25 (28.5): v ≈ 2.18 m/s — ok
        const sugg = suggestPipeSize(5, steelDims, 2.5);
        expect(sugg).not.toBeNull();
        expect(sugg!.withinLimit).toBe(true);
        expect(sugg!.size).toBe('DN25');
        expect(sugg!.velocity).toBeLessThanOrEqual(2.5);
    });

    it('bigger flow → bigger DN (monotonic)', () => {
        const s1 = suggestPipeSize(20, steelDims, 2.5)!;
        const s2 = suggestPipeSize(5, steelDims, 2.5)!;
        const num = (dn: string) => parseInt(dn.replace(/\D+/g, ''), 10);
        expect(num(s1.size)).toBeGreaterThan(num(s2.size));
    });

    it('returns largest DN (flagged over-limit) when nothing fits', () => {
        const sugg = suggestPipeSize(500, steelDims, 2.5)!;
        expect(sugg).not.toBeNull();
        expect(sugg.size).toBe('DN100');
        expect(sugg.withinLimit).toBe(false);
    });

    it('returns null for zero flow or empty dimensions', () => {
        expect(suggestPipeSize(0, steelDims)).toBeNull();
        expect(suggestPipeSize(10, [])).toBeNull();
    });
});

describe('Project templates — date valide + fittinguri', () => {
    it('every template has fittingItems', () => {
        PROJECT_TEMPLATES.forEach(t => {
            expect(Array.isArray(t.fittingItems)).toBe(true);
        });
    });

    it('template segments use ONLY existing dimensions from their material', () => {
        const problems: string[] = [];
        PROJECT_TEMPLATES.forEach(t => {
            t.segments.forEach(seg => {
                if (seg.material === 'custom') return;
                const std = PIPE_STANDARDS[seg.material];
                if (!std) { problems.push(`${t.id}: material necunoscut ${seg.material}`); return; }
                if (!std.dimensions.find(d => d.dn === seg.size)) {
                    problems.push(`${t.id}: ${seg.size} nu exista in ${seg.material}`);
                }
            });
        });
        expect(problems).toEqual([]);
    });

    it('template fitting sizes also exist in standards', () => {
        const problems: string[] = [];
        PROJECT_TEMPLATES.forEach(t => {
            t.fittingItems.forEach(f => {
                const found = Object.values(PIPE_STANDARDS).some(std => std.dimensions.find(d => d.dn === f.size));
                if (!found) problems.push(`${t.id}: fitting ${f.type} pe ${f.size}`);
            });
        });
        expect(problems).toEqual([]);
    });
});
