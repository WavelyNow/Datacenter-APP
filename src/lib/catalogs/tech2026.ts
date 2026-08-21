import { CatalogEquipment } from '@/lib/types';

/**
 * PRODUSE NOI 2024–2026 — tehnologie datacenter (verificate din research:
 * lansări oficiale comunicate de producători — capacități/an confirmate).
 * Nu există modele Sketchfab pentru aceste serii (verificate) — BIM/CAD se
 * descarcă de pe site-urile producătorilor.
 */
export const TECH_2026_CATALOG: CatalogEquipment[] = [
    // ============ VERTIV — CoolChip & Liebert XDU ============
    {
        id: 'vt-coolchip-cdu-70',
        manufacturer: 'Vertiv',
        model: 'CoolChip CDU 70 (in-row, lichid-aer)',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: 'Lansare EMEA 2025: CDU in-row răcire lichid-aer, 70 kW, fără apă rece de instalație — retrofit-friendly pentru săli existente.',
        volume: 5, weight: 120, power: 3, flowRate: 8,
        specifications: { launch: '2025', cooling: '70 kW', style: 'liquid-to-air' },
    },
    {
        id: 'vt-coolchip-cdu-100',
        manufacturer: 'Vertiv',
        model: 'CoolChip CDU 100 (in-rack, lichid-lichid)',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: 'Lansare 2025: CDU in-rack 4U, 100 kW, control ±1°C — perfect pentru rack-uri AI de înaltă densitate.',
        volume: 3, weight: 80, power: 2, flowRate: 10,
        specifications: { launch: '2025', cooling: '100 kW', mount: 'in-rack 4U' },
    },
    {
        id: 'vt-coolchip-cdu-600',
        manufacturer: 'Vertiv',
        model: 'CoolChip CDU 600 (in-row, lichid-lichid)',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: 'Lansare 2025: CDU in-row 600 kW, pompe redundante, alimentare duală — pentru poduri AI.',
        volume: 15, weight: 350, power: 8, flowRate: 45,
        specifications: { launch: '2025', cooling: '600 kW', redundancy: 'pompe N+1' },
    },
    {
        id: 'vt-liebert-xdu1350',
        manufacturer: 'Vertiv',
        model: 'Liebert XDU1350 (CDU lichid-lichid)',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: 'Generație CoolTera (2024): 1.368 kW lichid-lichid, buclă secundară din oțel inox, filtrare 50 µm, pompe N+N.',
        volume: 30, weight: 600, power: 12, flowRate: 95,
        specifications: { launch: '2024', cooling: '1368 kW', loop: 'stainless steel' },
    },

    // ============ SCHNEIDER / MOTIVAIR ============
    {
        id: 'se-motivair-mcdu-70',
        manufacturer: 'Schneider Electric',
        model: 'Motivair MCDU-70 (CDU 2.5 MW)',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: 'Lansare 2026: 2.500 kW per unitate, scalabil la 10 MW+ centralizat — primul CDU de la achiziția Motivair. Gândit pentru platforme NVIDIA de tip DSX.',
        volume: 60, weight: 1200, power: 25, flowRate: 180,
        specifications: { launch: '2026', cooling: '2500 kW', scalable: '10 MW+' },
    },
    {
        id: 'se-motivair-mcdu-55',
        manufacturer: 'Schneider Electric',
        model: 'Motivair MCDU-45/55 (CDU coridor utilitar)',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: 'Lansare decembrie 2025: CDU pentru coridor utilitar, game largi de temperatură apă răcită, variante podea + in-rack.',
        volume: 25, weight: 500, power: 10, flowRate: 70,
        specifications: { launch: '2025', mount: 'floor + in-rack' },
    },
    {
        id: 'se-motivair-chilleddoor',
        manufacturer: 'Schneider Electric',
        model: 'Motivair ChilledDoor RDHx',
        category: 'Cooling',
        type: 'CRAH / CCU',
        description: '2025: schimbător de căldură pe ușa spate, până la 75 kW/rack, agnostic de rack (OCP/Open19), 2–6 ventilatoare EC, elimină 100% din căldură.',
        volume: 2, weight: 45, power: 2, flowRate: 6,
        specifications: { launch: '2025', perRack: '75 kW' },
    },

    // ============ STULZ / DELTA / COOLIT ============
    {
        id: 'stulz-cybercool-cdu',
        manufacturer: 'STULZ',
        model: 'CyberCool CMU / CDU (345–1380 kW)',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: 'Lansare 2024 (DCW Frankfurt): CDU 345–1.380 kW, izolare FWS/TCS, free-cooling cu apă caldă ASHRAE W32–W+, pompe redundante VSD.',
        volume: 30, weight: 700, power: 15, flowRate: 80,
        specifications: { launch: '2024', range: '345–1380 kW', ashrae: 'W32–W+' },
    },
    {
        id: 'delta-gocool-3000',
        manufacturer: 'Delta Electronics',
        model: 'GoCool-3000 (CDU lichid-lichid 3 MW)',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: 'GTC 2026: 3.000 kW @6°C approach (2.500 kW @5°C), 1.200×1.500×2.300 mm, grupabil până la 8 unități.',
        volume: 80, weight: 1500, power: 30, flowRate: 220,
        specifications: { launch: '2026', cooling: '3000 kW', groupable: '8 units' },
    },
    {
        id: 'coolit-chx2000',
        manufacturer: 'CoolIT Systems',
        model: 'CHx2000 (CDU rând, 2 MW)',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: '2025: 2.000 kW lichid-lichid, 5°C ATD, amprentă 750×1.200 mm, 2.125 LPM @35 psi, control de grup până la 20 CDU.',
        volume: 55, weight: 1100, power: 22, flowRate: 150,
        specifications: { launch: '2025', cooling: '2000 kW', atd: '5°C' },
    },

    // ============ RITTAL / NVENT — infrastructură AI ============
    {
        id: 'rittal-cdu-inrow',
        manufacturer: 'Rittal',
        model: 'CDU In-Row (până la 1 MW)',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: '2025 (SC25): CDU in-row lichid-lichid până la 1 MW, sertare scalabile 250 kW N+1, bază ORV3.',
        volume: 40, weight: 800, power: 18, flowRate: 110,
        specifications: { launch: '2025', cooling: '1 MW', orv3: 'da' },
    },
    {
        id: 'nvent-row-cdu',
        manufacturer: 'nVent',
        model: 'Row CDU + Project Deschutes 5.0',
        category: 'Cooling',
        type: 'Unitate internă (CDU)',
        description: 'SC25 2025: CDU-uri modulare pe rând și AC/DC, design 5.0 conform spec Google/OCP 800VDC, manifolzi TCS.',
        volume: 35, weight: 700, power: 15, flowRate: 90,
        specifications: { launch: '2025', standard: 'Deschutes 5.0' },
    },

    // ============ PUTERE NOUĂ ============
    {
        id: 'vt-trinergy-ups',
        manufacturer: 'Vertiv',
        model: 'Trinergy UPS (1500–2500 kVA)',
        category: 'Power',
        type: 'Altele',
        description: 'Gama 2025–2026: module segregare 500 kW, ≥97% dublă conversie, 99% Dynamic Online, Tier IV+ (99.9999998%), posibilitate integrare LFP/NiZn + DynaFlex BESS.',
        volume: 0, weight: 2500, power: 2500,
        specifications: { launch: '2025', capacity: '1500–2500 kVA', tier: 'IV+' },
    },
    {
        id: 'se-netshelter-sx-advanced',
        manufacturer: 'Schneider Electric',
        model: 'NetShelter SX Advanced (AI-ready)',
        category: 'Racks',
        type: 'Altele',
        description: '2025: rack-uri mai înalte/mai adânci/mai robuste, rating transport ranforsat pentru servere AI, versiune open architecture inspirată OCP (ORV3).',
        volume: 0, weight: 160,
        specifications: { launch: '2025', orv3: 'da', aiReady: 'da' },
    },
];
