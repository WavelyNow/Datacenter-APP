/**
 * Integritatea registry-ului de normative (src/lib/normativeRegistry.ts).
 * Fiecare intrare trebuie să aibă câmpurile obligatorii complete, sursă
 * validă, an rezonabil și conținut non-gol — pentru a evita „informații
 * false" afișate utilizatorului.
 */

import { normativeRegistry } from '@/lib/normativeRegistry';

describe('Normative registry integrity', () => {
    it('has entries and all required fields are non-empty', () => {
        expect(normativeRegistry.length).toBeGreaterThan(0);
        const problems: string[] = [];
        normativeRegistry.forEach(e => {
            if (!e.id) problems.push('missing id');
            if (!e.code || e.code.trim().length < 2) problems.push(`${e.id}: code invalid "${e.code}"`);
            if (!e.title || e.title.trim().length < 3) problems.push(`${e.id}: title invalid`);
            if (!e.summary || e.summary.trim().length < 5) problems.push(`${e.id}: summary too short`);
            if (!e.content || e.content.trim().length < 10) problems.push(`${e.id}: content empty`);
            if (!Array.isArray(e.keywords) || e.keywords.length === 0) problems.push(`${e.id}: no keywords`);
            if (e.year !== undefined && (e.year < 1900 || e.year > 2030)) problems.push(`${e.id}: year ${e.year} out of range`);
        });
        expect(problems).toEqual([]);
    });

    it('sources are from the known set', () => {
        const valid = ['ASHRAE', 'TIA-942', 'EN-50600', 'Uptime', 'Romanian', 'IEEE'];
        const invalid = normativeRegistry.filter(e => !valid.includes(e.source));
        expect(invalid).toEqual([]);
    });

    it('entry ids are unique', () => {
        const ids = normativeRegistry.map(e => e.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('keywords of each entry are non-empty strings', () => {
        const problems: string[] = [];
        normativeRegistry.forEach(e => {
            e.keywords.forEach((k, i) => {
                if (typeof k !== 'string' || k.trim().length < 2) problems.push(`${e.id}: keyword[${i}] invalid`);
            });
        });
        expect(problems).toEqual([]);
    });

    it('article references (if present) have matching structure', () => {
        const problems: string[] = [];
        normativeRegistry.forEach(e => {
            (e.articles ?? []).forEach((a, i) => {
                if (!a.id || !a.title || !a.content) problems.push(`${e.id}: article[${i}] incomplete`);
            });
        });
        expect(problems).toEqual([]);
    });
});
