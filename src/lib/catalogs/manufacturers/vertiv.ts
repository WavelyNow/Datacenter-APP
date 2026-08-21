import { CatalogEquipment } from '@/lib/types';

export const VERTIV_CATALOG: CatalogEquipment[] = [
    // --- COOLING SYSTEMS ---
    {
        id: 'vertiv-liebert-pdx-pcw',
        manufacturer: 'Vertiv',
        model: 'Liebert® PDX™ / PCW™',
        type: 'CRAH / CCU',
        category: 'Cooling',
        description: 'Liebert® PDX™ direct expansion and PCW™ chilled water cooling systems for data centers.',
        weight: 850,
        volume: 15, // water content L (chilled-water coil)
        power: 15, // kW (fan power)
        flowRate: 35, // m3/h
        specifications: { coolingCapacity: '30-200kW' },
    },
    {
        id: 'vertiv-liebert-crv',
        manufacturer: 'Vertiv',
        model: 'Liebert® CRV™',
        type: 'In-Row Cooling',
        category: 'Cooling',
        description: 'Liebert® CRV™ row-based cooling unit optimized for high density cooling applications.',
        weight: 320,
        volume: 8,  // water content L (row coil)
        power: 3,
        flowRate: 15,
        specifications: { coolingCapacity: '10-60kW' },
    },
    {
        id: 'vertiv-liebert-dse',
        manufacturer: 'Vertiv',
        model: 'Liebert® DSE™ Free Cooling',
        type: 'Free Cooling',
        category: 'Cooling',
        description: 'Liebert® DSE™ Free Cooling System (50-250kW). Highly efficient water-free economization.',
        weight: 1200,
        volume: 0,  // no liquid - KVM console  // water content L (water-free economizer, minimal)
        power: 25,
        specifications: { coolingCapacity: '50-250kW' },
    },
    {
        id: 'vertiv-sfn',
        manufacturer: 'Vertiv',
        model: 'Secondary Fluid Network (SFN)',
        type: 'Grup Pompare',
        category: 'Cooling Accessories',
        description: 'Vertiv Secondary Fluid Network (SFN) prefabricated pumping group for quick deployment.',
        weight: 250,
        volume: 20, // water content L (piping manifold/group)
        power: 5,
    },

    // --- RACKS & ENCLOSURES ---
    {
        id: 'vertiv-vr-rack',
        manufacturer: 'Vertiv',
        model: 'Vertiv™ VR Rack',
        type: 'Rack',
        category: 'Racks',
        description: 'Vertiv™ VR Rack System. Standardized rack solution for fast deployment.',
        weight: 120,
        volume: 0,  // no liquid - racks
        specifications: { size: '42U / 48U' },
    },
    {
        id: 'vertiv-smartcabinet-2e',
        manufacturer: 'Vertiv',
        model: 'SmartCabinet™ 2-E',
        type: 'Micro DC',
        category: 'Integrated Solutions',
        description: 'Self-contained micro data center with integrated power, cooling, and monitoring.',
        weight: 450,
        volume: 0,  // no liquid - UPS // water content L (onboard loop)
        power: 5,
    },
    {
        id: 'vertiv-smartmod-combo',
        manufacturer: 'Vertiv',
        model: 'SmartMod™ Combo',
        type: 'Modular DC',
        category: 'Integrated Solutions',
        description: 'Prefabricated modular data center solution (PFM).',
        weight: 5000,
        volume: 0,  // no liquid - power distribution // water content L (full PFM hydronic loop)
        power: 100,
    },

    // --- POWER & UPS ---
    {
        id: 'vertiv-liebert-gxt5-li',
        manufacturer: 'Vertiv',
        model: 'Liebert® GXT5 Lithium-Ion',
        type: 'UPS',
        category: 'Power',
        description: 'Online Double Conversion UPS with Lithium-Ion batteries (1k-3k VA).',
        weight: 25,
        volume: 10,
        power: 3,
        specifications: { capacity: '1000-3000VA' },
    },
    {
        id: 'vertiv-power-nexus',
        manufacturer: 'Vertiv',
        model: 'Power Nexus',
        type: 'Power Distribution',
        category: 'Power',
        description: 'Integrated power train solution saving space and installation time.',
        weight: 800,
        volume: 500,
        power: 200,
    },
    {
        id: 'vertiv-geist-pdu',
        manufacturer: 'Vertiv',
        model: 'Geist™ Monitored rPDU',
        type: 'PDU',
        category: 'Power',
        description: 'Rack PDU with unit-level monitoring.',
        weight: 5,
        volume: 0,  // no liquid - PDU
        specifications: { rating: '30A 208V' },
    },

    // --- IT SYSTEMS ---
    {
        id: 'vertiv-avocent-lra',
        manufacturer: 'Vertiv',
        model: 'Avocent® LRA Console',
        type: 'KVM',
        category: 'IT Systems',
        description: 'Local Rack Access (LRA) LCD Console Tray.',
        weight: 12,
        volume: 5,
    },
    {
        id: 'vertiv-onecore',
        manufacturer: 'Vertiv',
        model: 'OneCore™ AI-Ready DC',
        type: 'Integrated Solution',
        category: 'Integrated Solutions',
        description: 'Reference design for AI-ready data center cooling and power.',
        weight: 15000,
        volume: 800, // water content L (reference design hydronic loop)
    }
];
