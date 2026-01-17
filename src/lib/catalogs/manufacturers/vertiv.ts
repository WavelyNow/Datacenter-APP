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
        volume: 350,
        power: 15, // kW (fan power)
        flowRate: 35, // m3/h
        specifications: { coolingCapacity: '30-200kW' },
        model3d: 'https://sketchfab.com/models/beb67b06582d4376aa25035e5449c0fd/embed'
    },
    {
        id: 'vertiv-liebert-crv',
        manufacturer: 'Vertiv',
        model: 'Liebert® CRV™',
        type: 'In-Row Cooling',
        category: 'Cooling',
        description: 'Liebert® CRV™ row-based cooling unit optimized for high density cooling applications.',
        weight: 320,
        volume: 120,
        power: 3,
        flowRate: 15,
        specifications: { coolingCapacity: '10-60kW' },
        model3d: 'https://sketchfab.com/models/58bcf436748a4b8db82e968323df0d56/embed'
    },
    {
        id: 'vertiv-liebert-dse',
        manufacturer: 'Vertiv',
        model: 'Liebert® DSE™ Free Cooling',
        type: 'Free Cooling',
        category: 'Cooling',
        description: 'Liebert® DSE™ Free Cooling System (50-250kW). Highly efficient water-free economization.',
        weight: 1200,
        volume: 800,
        power: 25,
        specifications: { coolingCapacity: '50-250kW' },
        model3d: 'https://sketchfab.com/models/20354502e7574cddb3bde88ec8377b21/embed'
    },
    {
        id: 'vertiv-sfn',
        manufacturer: 'Vertiv',
        model: 'Secondary Fluid Network (SFN)',
        type: 'Grup Pompare',
        category: 'Cooling Accessories',
        description: 'Vertiv Secondary Fluid Network (SFN) prefabricated pumping group for quick deployment.',
        weight: 250,
        volume: 100,
        power: 5,
        model3d: 'https://sketchfab.com/models/80dc38ce691c4f9a8afc0e7f26369319/embed'
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
        volume: 50,
        specifications: { size: '42U / 48U' },
        model3d: 'https://sketchfab.com/models/a12afbbcc41342ea9676e7457efc5960/embed'
    },
    {
        id: 'vertiv-smartcabinet-2e',
        manufacturer: 'Vertiv',
        model: 'SmartCabinet™ 2-E',
        type: 'Micro DC',
        category: 'Integrated Solutions',
        description: 'Self-contained micro data center with integrated power, cooling, and monitoring.',
        weight: 450,
        volume: 250,
        power: 5,
        model3d: 'https://sketchfab.com/models/db162a6cb7b446429231837baeb767f1/embed'
    },
    {
        id: 'vertiv-smartmod-combo',
        manufacturer: 'Vertiv',
        model: 'SmartMod™ Combo',
        type: 'Modular DC',
        category: 'Integrated Solutions',
        description: 'Prefabricated modular data center solution (PFM).',
        weight: 5000,
        volume: 15000,
        power: 100,
        model3d: 'https://sketchfab.com/models/23ab90d16cba4f1393b8a9293c9f9ff9/embed'
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
        model3d: 'https://sketchfab.com/models/5f8e6c4a4a7e4e8e8e8e8e8e8e8e8e8/embed'
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
        model3d: 'https://sketchfab.com/models/089a2521128e4b86a3b82d3d739eaab0/embed'
    },
    {
        id: 'vertiv-geist-pdu',
        manufacturer: 'Vertiv',
        model: 'Geist™ Monitored rPDU',
        type: 'PDU',
        category: 'Power',
        description: 'Rack PDU with unit-level monitoring.',
        weight: 5,
        volume: 2,
        specifications: { rating: '30A 208V' },
        model3d: 'https://sketchfab.com/models/44ac8b082b064a06acbdb81e46a73af2/embed'
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
        model3d: 'https://sketchfab.com/models/d4a5d0d347e64f9da318acd8ce75d12d/embed'
    },
    {
        id: 'vertiv-onecore',
        manufacturer: 'Vertiv',
        model: 'OneCore™ AI-Ready DC',
        type: 'Integrated Solution',
        category: 'Integrated Solutions',
        description: 'Reference design for AI-ready data center cooling and power.',
        weight: 15000,
        volume: 5000,
        model3d: 'https://sketchfab.com/models/f268dfa4a33846498843ee0e231b2418/embed'
    }
];
