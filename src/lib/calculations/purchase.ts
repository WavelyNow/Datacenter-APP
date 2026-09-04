/**
 * SUMAR DE COMANDĂ — „cât trebuie să cumpăr"
 *
 * Cantitatea de glicol este calculată EXACT, fără procente imaginare:
 *  - volumul real al țevilor (Ø interior, standarde verificate)
 *  - VOLUMUL FITTINGURILOR — calculat din numărul real de vane/coturi/teuri
 *    trecute de utilizator (volumul intern al fiecărui fitting, în funcție
 *    de diametrul real al țevii pe care stă)
 *  - volumul apei din echipamente
 *  - marja de siguranță CONFIGURATĂ de utilizator (0–20%)
 *  - rotunjire la canistre de 10 L
 *
 * Fișierul este SINGURA SURSĂ pentru cifrele de cumpărare (PDF, Excel, Dashboard).
 */

import { PipeSegment, EquipmentItem, FluidType, FittingItem } from '../types';
import { calculateGlycolVolume, calculatePipeVolume } from './hydraulics';
import { getPipeData, getFluidDensity, resolveInnerDiameterMm as resolveSegmentInnerDiameterMm } from './common';
import { PIPE_STANDARDS } from '../pipeStandards';

/** Volumul intern estimat al fittingurilor, exprimat în MULTIPLI DE DIAMETRU
 *  (L_eq fizic ≈ lungimea echivalentă internă a corpului fittingului):
 *  V = π/4 · D² · (mult × D)  — adică un „bucățel" de țeavă de lungime mult×D. */
export const FITTING_DIAMETER_MULTIPLIERS: Record<string, number> = {
    elbow_90_std: 2.0,
    elbow_90_lr: 1.6,
    elbow_45: 1.6,
    tee_branch: 2.0,
    tee_run: 1.6,
    reducer: 1.0,
    enlargement: 1.0,
    valve_ball: 1.0,
    valve_butterfly: 1.2,
    valve_globe: 2.0,
    valve_gate: 2.0,
    check_swing: 2.0,
    check_lift: 2.0,
    valve_check_swing: 2.0,
    valve_check_lift: 2.0,
};

export interface PurchaseLine {
    size: string;
    material: string;
    label: string;
    lengthM: number;
    liters: number;
    weightKg: number;
}

export interface PipeGlycolLine {
    segmentId: string;
    label: string;
    material: string;
    size: string;
    lengthM: number;
    innerDiameterMm: number;
    pipeVolumeL: number;
    pureGlycolL: number;
}

export const calculatePipeGlycolLines = (segments: PipeSegment[], glycolPercentage: number): PipeGlycolLine[] => {
    const percentage = Math.max(0, Math.min(100, Number(glycolPercentage) || 0));

    return segments.filter(Boolean).map((segment, index) => {
        const pipeVolumeL = calculatePipeVolume(segment) || 0;
        return {
            segmentId: segment.id,
            label: segment.name || `Segment ${index + 1}`,
            material: segment.material,
            size: segment.size,
            lengthM: segment.length || 0,
            innerDiameterMm: resolveSegmentInnerDiameterMm(segment),
            pipeVolumeL,
            pureGlycolL: calculateGlycolVolume(pipeVolumeL, percentage),
        };
    });
};

export interface PurchaseSummary {
    // Țeavă
    pipeLines: PurchaseLine[];
    pipeGlycolLines: PipeGlycolLine[];
    pipeTotalLengthM: number;
    pipeVolumeL: number;
    pipeTotalWeightKg: number;

    // Fittinguri — volumul REAL din numărul introdus
    fittingsVolumeL: number;
    fittingsTotalCount: number;

    // Echipamente
    equipmentVolumeL: number;
    equipmentTotalWeightKg: number;

    // Glicol
    marginPercent: number;        // marja din proiect (configurată de utilizator)
    marginL: number;
    rawTotalL: number;            // înainte de rotunjire
    totalGlycolL: number;         // CÂT SE CUMPĂRĂ (rotunjit la 10 L)
    canisters10L: number;
    fluidWeightKg: number;

    // Fittinguri de comandat (agregate pe tip + DN)
    fittingItems: { type: string; size: string; quantity: number }[];
}

/** Rezolvă diametrul interior real (mm) pentru o mărime dată:
 *  caută întâi în standardul țevii, apoi în tabelele metalice standard. */
function resolveInnerDiameterMm(material: string, size: string, customId?: number): number {
    if (material === 'custom' && customId) return customId;
    const standard = PIPE_STANDARDS[material];
    if (standard) {
        const dim = standard.dimensions.find(d => d.dn === size);
        if (dim && dim.id > 0) return dim.id;
    }
    // Fallback: caută orice standard cu această mărime (sau DN numeric → oțel)
    for (const std of Object.values(PIPE_STANDARDS)) {
        const dim = std.dimensions.find(d => d.dn === size);
        if (dim && dim.id > 0) return dim.id;
    }
    const num = parseInt(String(size).replace(/\D+/g, ''), 10);
    if (num > 0) return Math.max(10, num - 6); // aproximare DN→ID (DN nominal - perete)
    return 0;
}

/**
 * Calculează sumarul complet de comandă.
 * @param segments trasee de țeavă
 * @param equipmentList echipamente (volume de apă)
 * @param glycolPercentage % glicol (0–100)
 * @param fluidType tip glicol
 * @param safetyMargin marja activă?
 * @param safetyMarginPercentage % marjă (0–20)
 * @param fittingItems fittingurile definite în proiect (coturi, teuri, vane — cu cantități)
 */
export function calculatePurchaseSummary(
    segments: PipeSegment[],
    equipmentList: EquipmentItem[],
    glycolPercentage: number,
    fluidType: FluidType,
    safetyMargin: boolean,
    safetyMarginPercentage: number,
    fittingItems: FittingItem[] = []
): PurchaseSummary {
    const pipeGlycolLines = calculatePipeGlycolLines(segments, glycolPercentage);

    // 1. Agregare țeavă pe (material, DN)
    const byKey = new Map<string, PurchaseLine>();
    let pipeVolumeL = 0;
    let pipeWeightKg = 0;

    for (const seg of segments) {
        if (!seg) continue;
        const liters = calculatePipeVolume(seg) || 0;
        const pipeData = getPipeData(seg.material, seg.size);
        const weightPerM = seg.material === 'custom'
            ? (seg.customWeight || 0)
            : (pipeData?.weight || 0);

        const id = `${seg.material}|${seg.size}`;
        const existing = byKey.get(id);
        const standard = PIPE_STANDARDS[seg.material];
        const entry: PurchaseLine = existing ?? {
            size: seg.size,
            material: seg.material,
            label: standard ? `${standard.label}` : (seg.material === 'custom' ? 'Teava custom' : seg.material),
            lengthM: 0,
            liters: 0,
            weightKg: 0,
        };
        entry.lengthM += seg.length || 0;
        entry.liters += liters;
        entry.weightKg += weightPerM * (seg.length || 0);
        byKey.set(id, entry);

        pipeVolumeL += liters;
        pipeWeightKg += weightPerM * (seg.length || 0);
    }

    const pipeLines = [...byKey.values()].sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }));

    // 2. VOLUMUL FITTINGURILOR — calculat din nr. real introdus
    let fittingsVolumeL = 0;
    let fittingsTotalCount = 0;
    const fitMap = new Map<string, { type: string; size: string; quantity: number }>();

    for (const f of fittingItems) {
        const count = Math.max(0, Math.floor(Number(f?.quantity) || 0));
        if (count <= 0) continue;
        fittingsTotalCount += count;

        const mult = FITTING_DIAMETER_MULTIPLIERS[f.type] ?? 1.5;
        const idMm = resolveInnerDiameterMm('', f.size) || resolveInnerDiameterMm('steel_light', f.size);
        const dM = idMm / 1000;
        // V = π/4 · D² · (mult · D) → litri
        if (dM > 0) {
            fittingsVolumeL += count * (Math.PI / 4) * dM * dM * (mult * dM) * 1000;
        }

        const key = `${f.type}|${f.size}`;
        const existing = fitMap.get(key);
        if (existing) existing.quantity += count;
        else fitMap.set(key, { type: f.type, size: f.size, quantity: count });
    }

    // 3. Echipamente
    const equipmentVolumeL = equipmentList.reduce((sum, eq) => sum + (eq.volume || 0), 0);
    const equipmentWeightKg = equipmentList.reduce((sum, eq) => sum + (eq.weight || 0), 0);

    // 4. Glicol de cumpărat: (țeavă + fittinguri + echipamente) × marjă
    const baseL = pipeVolumeL + fittingsVolumeL + equipmentVolumeL;
    const marginPercent = safetyMargin ? Math.max(0, Math.min(20, safetyMarginPercentage)) : 0;
    const marginL = baseL * (marginPercent / 100);
    const rawTotalL = baseL + marginL;

    const totalGlycolL = Math.ceil(rawTotalL / 10) * 10;
    const canisters10L = totalGlycolL / 10;

    const densityKgL = getFluidDensity(glycolPercentage, fluidType);
    const fluidWeightKg = totalGlycolL * densityKgL;

    return {
        pipeLines,
        pipeGlycolLines,
        pipeTotalLengthM: pipeLines.reduce((s, l) => s + l.lengthM, 0),
        pipeVolumeL,
        pipeTotalWeightKg: pipeWeightKg,
        fittingsVolumeL,
        fittingsTotalCount,
        equipmentVolumeL,
        equipmentTotalWeightKg: equipmentWeightKg,
        marginPercent,
        marginL,
        rawTotalL,
        totalGlycolL,
        canisters10L,
        fluidWeightKg,
        fittingItems: [...fitMap.values()].sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true })),
    };
}
