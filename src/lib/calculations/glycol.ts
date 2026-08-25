/**
 * GLICOL — punct de îngheț + recomandare concentrație
 * Tabele identice cu cele din FluidComposition (deduplicate aici ca să fie
 * folosite și de logică, nu doar de UI).
 */

import { FluidType } from '../types';

const FREEZE_TABLES: Record<'ethylene' | 'propylene', [number, number][]> = {
    ethylene: [[0, 0], [10, -4], [20, -8], [30, -15], [40, -24], [50, -36], [60, -52]],
    propylene: [[0, 0], [10, -3], [20, -7], [30, -12], [40, -21], [50, -33], [60, -48]],
};

/** Punct de îngheț al amestecului (% volum). Pentru >60% returnează null (fără date). */
export function getFreezingPoint(percentage: number, fluidType: FluidType): number | null {
    if (fluidType === 'water' || percentage <= 0) return 0;
    if (percentage > 60) return null; // în afara datelor publicate

    const data = FREEZE_TABLES[fluidType === 'propylene' ? 'propylene' : 'ethylene'];
    const p = Math.max(0, Math.min(60, percentage));

    for (let i = 0; i < data.length - 1; i++) {
        const [p1, t1] = data[i];
        const [p2, t2] = data[i + 1];
        if (p >= p1 && p <= p2) {
            const ratio = (p - p1) / (p2 - p1);
            return Math.round(t1 + (t2 - t1) * ratio);
        }
    }
    return data[data.length - 1][1];
}

/** Marja practică de siguranță față de temperatura de protecție cerută (°C). */
export const FREEZE_SAFETY_MARGIN_C = 3;

/**
 * Concentrația MINIMĂ de glicol care protejează până la minTemperatureC.
 * Include marja practicǎ de +3°C față de punctul de îngheț (regula Dow/ASHRAE).
 * Returnează % volum (0–60) sau null dacă nici măcar 60% nu e suficient.
 */
export function suggestGlycolPercent(minTemperatureC: number, fluidType: 'ethylene' | 'propylene'): number | null {
    if (minTemperatureC >= 0) return 0;
    const data = FREEZE_TABLES[fluidType === 'propylene' ? 'propylene' : 'ethylene'];
    const target = minTemperatureC - FREEZE_SAFETY_MARGIN_C;

    // prima concentrație (crescătoare) al cărei punct de îngheț ≤ țintă
    for (let i = 0; i < data.length; i++) {
        const [pct, freeze] = data[i];
        if (freeze <= target) return pct;
    }
    return null; // nici 60% nu e suficient
}
