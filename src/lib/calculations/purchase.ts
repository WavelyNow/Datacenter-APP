/**
 * SUMAR DE COMANDĂ — „cât trebuie să cumpăr”
 *
 * Cantitatea de glicol/ofertă finală ia în calcul:
 *  - volumul real al țevilor (Ø interior, din standardele verificate) + echipamente
 *  - FITTINGS ALLOWANCE: pierderi/volum suplimentar prin vane, coturi, teuri,
 *    umplere instalație (practică de proiect: ~8% din volumul de țeavă)
 *  - marja de siguranță configurată în proiect
 *  - rotunjire la containere comerciale (canistre de 10 L)
 *
 * Fișierul este SINGURA sursă pentru cifrele de cumpărare (PDF, Excel, Dashboard).
 */

import { PipeSegment, EquipmentItem, FluidType, FittingItem } from '../types';
import { calculatePipeVolume } from './hydraulics';
import { PIPE_STANDARDS } from '../pipeStandards';
import { getPipeData, getFluidDensity } from './common';

/** Pierderi/volum suplimentar prin fittinguri + umplere — implicit 5% DIN VOLUMUL DE ȚEAVĂ
 *  (valoare configurabilă în proiect; practică uzuală 3–10%). */
export const FITTINGS_ALLOWANCE_PERCENT = 5;

export interface PurchaseLine {
    size: string;
    material: string;
    label: string;
    lengthM: number;
    liters: number;
    weightKg: number;
}

export interface PurchaseSummary {
    // Țeavă
    pipeLines: PurchaseLine[];
    pipeTotalLengthM: number;
    pipeVolumeL: number;
    pipeTotalWeightKg: number;

    // Echipamente
    equipmentVolumeL: number;
    equipmentTotalWeightKg: number;

    // Glicol
    fittingsAllowancePercent: number;
    fittingsAllowanceL: number;   // % din volumul de țeavă (vane, coturi, teuri, umplere)
    marginPercent: number;        // marja din proiect
    marginL: number;
    rawTotalL: number;            // înainte de rotunjire
    totalGlycolL: number;         // CÂT SE CUMPĂRĂ (rotunjit la 10 L)
    canisters10L: number;
    fluidWeightKg: number;

    // Fittinguri de comandat (agregate pe tip + DN)
    fittingItems: { type: string; size: string; quantity: number }[];
}

/**
 * Calculează sumarul complet de comandă.
 * @param segments trasee de țeavă
 * @param equipmentList echipamente (volume de apă)
 * @param glycolPercentage % glicol (0–100)
 * @param fluidType tip glicol
 * @param safetyMargin marja activă?
 * @param safetyMarginPercentage % marjă
 * @param fittingItems fittingurile definite în proiect (vane, coturi, teuri)
 */
export function calculatePurchaseSummary(
    segments: PipeSegment[],
    equipmentList: EquipmentItem[],
    glycolPercentage: number,
    fluidType: FluidType,
    safetyMargin: boolean,
    safetyMarginPercentage: number,
    fittingItems: FittingItem[] = [],
    fittingsAllowancePercent: number = FITTINGS_ALLOWANCE_PERCENT
): PurchaseSummary {
    // 1. Agregare țeavă pe (material, DN)
    const byKey = new Map<string, PurchaseLine>();
    let pipeVolumeL = 0;
    let pipeWeightKg = 0;

    for (const seg of segments) {
        if (!seg) continue;
        const liters = calculatePipeVolume(seg);
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
            label: standard ? `${standard.label} ${seg.size}` : (seg.material === 'custom' ? `Custom ${seg.size}` : seg.size),
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

    // 2. Echipamente
    const equipmentVolumeL = equipmentList.reduce((sum, eq) => sum + (eq.volume || 0), 0);
    const equipmentWeightKg = equipmentList.reduce((sum, eq) => sum + (eq.weight || 0), 0);

    // 3. Glicol de cumpărat
    const allowancePct = Math.max(0, Math.min(15, fittingsAllowancePercent));
    const fittingsAllowanceL = pipeVolumeL * (allowancePct / 100);
    const baseL = pipeVolumeL + fittingsAllowanceL + equipmentVolumeL;
    const marginPercent = safetyMargin ? safetyMarginPercentage : 0;
    const marginL = baseL * (marginPercent / 100);
    const rawTotalL = baseL + marginL;

    // Rotunjire la canistre de 10 L
    const totalGlycolL = Math.ceil(rawTotalL / 10) * 10;
    const canisters10L = totalGlycolL / 10;

    // Greutate fluid pe tipul real de glicol
    const densityKgL = getFluidDensity(glycolPercentage, fluidType);
    const fluidWeightKg = totalGlycolL * densityKgL;

    // 4. Fittinguri agregate (pentru listă de cumpărat)
    const fitMap = new Map<string, { type: string; size: string; quantity: number }>();
    for (const f of fittingItems) {
        const key = `${f.type}|${f.size}`;
        const existing = fitMap.get(key);
        if (existing) existing.quantity += f.quantity;
        else fitMap.set(key, { type: f.type, size: f.size, quantity: f.quantity });
    }

    return {
        pipeLines,
        pipeTotalLengthM: pipeLines.reduce((s, l) => s + l.lengthM, 0),
        pipeVolumeL,
        pipeTotalWeightKg: pipeWeightKg,
        equipmentVolumeL,
        equipmentTotalWeightKg: equipmentWeightKg,
        fittingsAllowancePercent: allowancePct,
        fittingsAllowanceL,
        marginPercent,
        marginL,
        rawTotalL,
        totalGlycolL,
        canisters10L,
        fluidWeightKg,
        fittingItems: [...fitMap.values()].sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true })),
    };
}
