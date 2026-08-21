import { CatalogEquipment } from '@/lib/types';

/**
 * Catalog 3D — DOAR modele VERIFICATE pe Sketchfab (id-uri reale, confirmate în
 * research 2026). Modelele vechi cu id-uri inventate (ex. „5f8e6c4a4a7e4e8e…")
 * au fost eliminate; folosiți aceste intrări pentru galeria 3D.
 *
 * Pentru produsele noi fără model Sketchfab public (STULZ, Delta, CoolIT,
 * Rittal, nVent, Motivair) furnizorii publică fișiere BIM/CAD native
 * (PARTcommunity, stulz.com) — pot fi importate ca .glb.
 */
export const MODEL3D_CATALOG: CatalogEquipment[] = [
    // ============================================================
    // VERTIV — produse verificate (Sketchfab, 2024–2026)
    // ============================================================
    {
        id: 'vt-liebert-crv-3d',
        manufacturer: 'Vertiv',
        model: 'Liebert® CRV™ In-Row Cooling',
        category: 'CRAH / CCU',
        type: 'CRAH / CCU',
        description: 'Răcire in-row de înaltă densitate, 20–100 kW, compresor inverter, control iCOM.',
        volume: 8,
        weight: 320,
        power: 3,
        flowRate: 15,
        specifications: { coolingCapacity: '10-60kW' },
        model3d: 'https://sketchfab.com/models/58bcf436748a4b8db82e968323df0d56/embed',
    },
    {
        id: 'vt-liebert-exm-ups-3d',
        manufacturer: 'Vertiv',
        model: 'Liebert® EXM™ UPS (10–250 kVA)',
        category: 'Power',
        type: 'Altele',
        description: 'UPS trifazat online dublă conversie, 97% eficiență / 99% Eco Mode, opțiuni Li-ion. Model Sketchfab oficial Vertiv.',
        volume: 0,
        weight: 400,
        power: 200,
        specifications: { capacity: '10-250kVA', phase: '3-phase' },
        model3d: 'https://sketchfab.com/models/30aed814753d450d9fa6aaae83d29c19/embed',
    },
    {
        id: 'vt-onecore-3d',
        manufacturer: 'Vertiv',
        model: 'Vertiv™ OneCore — AI-Ready Data Center',
        category: 'Integrated Solutions',
        type: 'Altele',
        description: 'Centru de date prefabricat, pregătit IT/AI, anvelopă din oțel. Model Sketchfab oficial Vertiv (2025).',
        volume: 0,
        weight: 15000,
        power: 100,
        specifications: { series: 'OneCore' },
        model3d: 'https://sketchfab.com/models/f268dfa4a33846498843ee0e231b2418/embed',
    },

    // ============================================================
    // SCHNEIDER ELECTRIC / APC — produse verificate (2025 launch)
    // ============================================================
    {
        id: 'se-galaxy-vxl-3d',
        manufacturer: 'Schneider Electric',
        model: 'Galaxy VXL — UPS trifazat (500–1250 kW)',
        category: 'Power',
        type: 'Altele',
        description: 'Lansare 2025: 125 kW/3U module, 1.25 MW per frame, până la 1.042 kW/m², 99% eConversion, IEC 62443-4-2.',
        volume: 0,
        weight: 1200,
        power: 1250,
        specifications: { capacity: '500-1250kW', efficiency: '99% eConversion' },
        model3d: 'https://sketchfab.com/models/0e9df001eced4656837f4a266bf2ffda/embed',
    },
    {
        id: 'se-galaxy-vl-3d',
        manufacturer: 'Schneider Electric',
        model: 'Galaxy VL — UPS trifazat (200–500 kW)',
        category: 'Power',
        type: 'Altele',
        description: 'UPS trifazat 200–500 kW pentru datacenter, model Sketchfab oficial Schneider Electric.',
        volume: 0,
        weight: 900,
        power: 500,
        specifications: { capacity: '200-500kW' },
        model3d: 'https://sketchfab.com/models/28c88ce49d164223be1c3734b6a8e747/embed',
    },
    {
        id: 'se-galaxy-3l-pro-3d',
        manufacturer: 'Schneider Electric',
        model: 'Galaxy 3L Pro — UPS trifazat (400–600 kVA)',
        category: 'Power',
        type: 'Altele',
        description: 'Lansare 2025: 400–600 kVA @400V, baterii externe, conectat EcoStruxure. Model Sketchfab oficial (2025-03).',
        volume: 0,
        weight: 700,
        power: 600,
        specifications: { capacity: '400-600kVA' },
        model3d: 'https://sketchfab.com/models/cb50cbd789654092a82e175e5c91fd8f/embed',
    },
    {
        id: 'se-ecostruxure-pod-3d',
        manufacturer: 'Schneider Electric',
        model: 'EcoStruxure™ Pod Data Center',
        category: 'Integrated Solutions',
        type: 'Altele',
        description: 'Pod prefabricat modular, până la 1 MW+, cu răcire pe lichid, busway și containment. Model Sketchfab oficial SE.',
        volume: 0,
        weight: 3500,
        power: 500,
        specifications: { series: 'EcoStruxure Pod' },
        model3d: 'https://sketchfab.com/models/88f9d8c334d54be087343527c0f5eb03/embed',
    },
    {
        id: 'se-uniflair-inrow-rc-3d',
        manufacturer: 'Schneider Electric',
        model: 'Uniflair™ InRow RC (600mm)',
        category: 'In-Row Cooling',
        type: 'CRAH / CCU',
        description: 'Răcire in-row apropiată de rack, 70 kW, apă răcită. Model Sketchfab oficial Schneider Electric.',
        volume: 8,
        weight: 380,
        power: 4,
        flowRate: 12,
        specifications: { coolingCapacity: '70kW', width: '600mm' },
        model3d: 'https://sketchfab.com/models/e3422786fe34467d9893131e78e7e9e0/embed',
    },
];
