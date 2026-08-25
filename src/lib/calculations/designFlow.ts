/**
 * ASISTENT DE DIMENSIONARE — generatorul complet de proiect hidraulic.
 *
 * Întreabă în ordinea corectă de inginerie (sarcină → chillere → CRAH-uri →
 * topologie → fluid), calculează debitele cumulate pe fiecare tronson,
 * recomandă DN-ul pentru fiecare segment și generează proiectul complet:
 * segmente + echipamente + fittinguri. Fiecare pas are explicația sa
 * (pentru interni).
 */

import { PipeSegment, EquipmentItem, FluidType, FittingItem } from '../types';
import { PIPE_STANDARDS } from '../pipeStandards';
import { getFluidProperties } from './pressureDrop';
import { suggestGlycolPercent } from './glycol';

export interface WizardConfig {
    // Pas 1 — Proiect
    projectName: string;
    location: string;

    // Pas 2 — Sarcina
    totalLoadKw: number;
    deltaTK: number;

    // Pas 3 — Chillere
    chillerInstalled: number;      // cate sunt instalate (cu redundanta)
    chillerActive: number;         // cate lucreaza simultan (N)
    chillerCapacityKwEach: number; // capacitatea declarata per chiller
    chillerFlowDatasheet?: number | null; // m³/h din fisa tehnica (optional)

    // Pas 4 — Unitati interioare
    crahInstalled: number;
    crahActive: number;            // cele care lucreaza simultan
    crahFlowDatasheet?: number | null;

    // Pas 5 — Topologie (lungimile estimate)
    lenExtMainsM: number;          // chillere -> inel exterior (tur)
    lenExtRingM: number;           // lungimea inelului exterior
    lenIntMainsM: number;          // PHE/pompe -> inel interior
    lenIntRingM: number;           // inelul interior
    lenBranchM: number;            // ramura catre fiecare CRAH

    // Pas 6 — Fluid
    fluidType: 'ethylene' | 'propylene' | 'water';
    glycolPercentage: number;
    minTempProtect: number;        // °C — pentru recomandarea concentratiei

    material: string;              // materialul conductelor (steel_light etc.)
}

export interface WizardResult {
    totalFlowM3H: number;
    chillerFlowM3H: number;
    crahFlowM3H: number;
    recommendedGlycolPercent: number | null;

    segments: PipeSegment[];
    equipment: EquipmentItem[];
    fittingItems: FittingItem[];

    explanation: string[];
}

const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function bestSizeFor(material: string, flowM3H: number, fluidType: FluidType, glycol: number, vMax = 2.5): { dn: string; velocity: number } {
    const std = PIPE_STANDARDS[material];
    const props = getFluidProperties(fluidType, glycol, 20);
    if (!std) return { dn: 'DN50', velocity: 0 };

    let last = std.dimensions[std.dimensions.length - 1];
    for (const d of [...std.dimensions].sort((a, b) => a.id - b.id)) {
        if (!d.id || d.id <= 0) continue;
        const area = Math.PI * Math.pow(d.id / 2000, 2);
        const v = (flowM3H / 3600) / area;
        if (v <= vMax) return { dn: d.dn, velocity: v };
        last = d;
    }
    const area = Math.PI * Math.pow(last.id / 2000, 2);
    return { dn: last.dn, velocity: (flowM3H / 3600) / area };
}

/** Construiește întregul proiect din configuratia wizard-ului. */
export function buildFromWizard(cfg: WizardConfig): WizardResult {
    const explanation: string[] = [];

    // --- Debitul total: Q = P / (cp · ΔT) / ρ × 3600 ---
    const props = getFluidProperties(cfg.fluidType, cfg.glycolPercentage, 20);
    const massFlowKgS = (cfg.totalLoadKw * 1000) / (props.specificHeatJkgK * Math.max(0.5, cfg.deltaTK));
    const totalFlowM3H = (massFlowKgS / props.densityKgM3) * 3600;

    explanation.push(
        `Debit total: ${cfg.totalLoadKw} kW / (${props.specificHeatJkgK.toFixed(0)} J/kgK × ${cfg.deltaTK} K) ÷ ${props.densityKgM3.toFixed(0)} kg/m³ × 3600 s/h = ${totalFlowM3H.toFixed(1)} m³/h`
    );

    // --- Debite per echipament ---
    const activeChillers = Math.max(1, cfg.chillerActive);
    const activeCrah = Math.max(1, cfg.crahActive);
    const chillerFlowM3H = cfg.chillerFlowDatasheet && cfg.chillerFlowDatasheet > 0
        ? cfg.chillerFlowDatasheet
        : totalFlowM3H / activeChillers;
    const crahFlowM3H = cfg.crahFlowDatasheet && cfg.crahFlowDatasheet > 0
        ? cfg.crahFlowDatasheet
        : totalFlowM3H / activeCrah;

    explanation.push(
        `Debit per chiller: ${totalFlowM3H.toFixed(1)} / ${activeChillers} active = ${chillerFlowM3H.toFixed(1)} m³/h` +
        (cfg.chillerFlowDatasheet ? ' (din fișa tehnică)' : '') +
        `. Debit per CRAH: ${crahFlowM3H.toFixed(1)} m³/h.`
    );

    // --- Recomandarea glicolului ---
    const recGlycol = cfg.fluidType === 'water'
        ? null
        : suggestGlycolPercent(cfg.minTempProtect, cfg.fluidType === 'propylene' ? 'propylene' : 'ethylene');
    const recommendedGlycolPercent = recGlycol === null ? null : recGlycol;

    // --- Dimensiuni pe tronsoane ---
    const extSize = bestSizeFor(cfg.material, totalFlowM3H, cfg.fluidType, cfg.glycolPercentage);
    const intSize = bestSizeFor(cfg.material, totalFlowM3H, cfg.fluidType, cfg.glycolPercentage);
    const branchSize = bestSizeFor(cfg.material, crahFlowM3H, cfg.fluidType, cfg.glycolPercentage);

    explanation.push(
        `Diametre recomandate (v ≤ 2,5 m/s): inel exterior ${extSize.dn}, inel interior ${intSize.dn}, ramuri CRAH ${branchSize.dn}.`
    );

    // --- GENERAREA SEGMENTELOR (debite cumulate corect) ---
    const segments: PipeSegment[] = [];
    const fittingItems: FittingItem[] = [];

    const addSeg = (
        name: string,
        size: string,
        length: number,
        flow: number,
        note?: string
    ) => {
        segments.push({
            id: genId('wz'),
            name: note ? `${name} — ${note}` : name,
            material: cfg.material,
            standard: PIPE_STANDARDS[cfg.material]?.label ?? '',
            size,
            length,
            flowRate: flow,
            fluid: cfg.fluidType === 'propylene' ? 'Propilen Glicol' : cfg.fluidType === 'ethylene' ? 'Etilen Glicol' : 'Apă',
        });
    };

    // Inelul EXTERIOR: tur + retur (chillere ↔ schimbător/pompe)
    addSeg('Inel exterior — TUR (chillere)', extSize.dn, cfg.lenExtRingM, totalFlowM3H, 'transporta tot debitul');
    addSeg('Inel exterior — RETUR (chillere)', extSize.dn, cfg.lenExtRingM, totalFlowM3H);
    // Alimentare spre inel (pe jumătate dacă ambele chillere alimentează din capete opuse)
    addSeg('Alimentare chillere → inel ext.', extSize.dn, cfg.lenExtMainsM, totalFlowM3H);

    // Inelul INTERIOR: tur + retur
    addSeg('Inel interior — TUR (CRAH)', intSize.dn, cfg.lenIntRingM, totalFlowM3H);
    addSeg('Inel interior — RETUR (CRAH)', intSize.dn, cfg.lenIntRingM, totalFlowM3H);
    addSeg('Alimentare inel int. → inel ext.', intSize.dn, cfg.lenIntMainsM, totalFlowM3H);

    // Ramuri individuale către fiecare CRAH activ+rezervă
    for (let i = 1; i <= cfg.crahInstalled; i++) {
        addSeg(`Ramură CRAH ${i}`, branchSize.dn, cfg.lenBranchM, crahFlowM3H);
    }

    // Fittinguri estimate (reguli practice, editabile ulterior):
    // - coturi: 2 pe fiecare ramură + 4 colțuri per inel
    // - teuri: pe inelul interior = nr. CRAH-uri (alimentarea ramurilor)
    // - vane: izolare per echipament + bypass
    const pushFit = (type: string, size: string, quantity: number) => {
        if (quantity <= 0) return;
        const key = `${type}|${size}`;
        const ex = fittingItems.find(f => f.type === type && f.size === size);
        if (ex) ex.quantity += quantity;
        else fittingItems.push({ id: genId('fit'), type, size, quantity });
    };

    pushFit('elbow_90_std', intSize.dn, 4 + 2);                    // colțuri inel + alimentare
    pushFit('tee_branch', intSize.dn, cfg.crahInstalled);          // alimentările ramurilor
    pushFit('valve_ball', branchSize.dn, cfg.crahInstalled);       // izolare per CRAH
    pushFit('elbow_90_std', branchSize.dn, cfg.crahInstalled * 2); // 2 coturi per ramură
    pushFit('valve_ball', extSize.dn, cfg.chillerInstalled);       // izolare per chiller
    pushFit('elbow_90_std', extSize.dn, 4);                        // colțuri inel exterior

    explanation.push(
        `Segmentele generate includ tur + retur pentru ambele inele, alimentările și o ramură individuală per CRAH. Fittingurile au fost estimate după practica uzuală — ajustează-le în tabel.`
    );

    // --- ECHIPAMENTELE ---
    const equipment: EquipmentItem[] = [];
    for (let i = 1; i <= cfg.chillerInstalled; i++) {
        equipment.push({
            id: genId('eq'),
            type: 'Chiller',
            name: `Chiller ${i} (${cfg.chillerCapacityKwEach} kW)`,
            volume: 0,
            weight: 0,
            power: cfg.totalLoadKw / Math.max(1, cfg.chillerInstalled),
            notes: `Completează volumul de apă din fișa tehnică.`,
        });
    }
    for (let i = 1; i <= cfg.crahInstalled; i++) {
        equipment.push({
            id: genId('eq'),
            type: 'CRAH / CCU',
            name: `CRAH ${i}`,
            volume: 0,
            weight: 0,
            power: cfg.totalLoadKw / Math.max(1, cfg.crahActive),
            notes: 'Completează volumul de apă din fișa tehnică.',
        });
    }

    return {
        totalFlowM3H,
        chillerFlowM3H,
        crahFlowM3H,
        recommendedGlycolPercent,
        segments,
        equipment,
        fittingItems,
        explanation,
    };
}
