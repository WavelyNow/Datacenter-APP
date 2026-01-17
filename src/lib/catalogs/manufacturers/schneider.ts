import { CatalogEquipment } from '@/lib/types';

export const SCHNEIDER_CATALOG: CatalogEquipment[] = [
    // --- COOLING ---
    {
        id: 'se-uniflair-chiller',
        manufacturer: 'Schneider Electric',
        model: 'Uniflair™ Free Cooling Chiller',
        type: 'Chiller',
        category: 'Cooling',
        description: 'Uniflair Free Cooling Chillers (400 - 1200kW). High efficiency air-cooled chillers with integrated free cooling.',
        weight: 4500,
        volume: 2000,
        power: 100, // Fan/Compressor power approx
        specifications: { coolingCapacity: '400-1200kW', series: 'Uniflair' },
        model3d: 'https://sketchfab.com/models/65901c1371b34ac6a1a358cf1287f789/embed'
    },
    {
        id: 'se-inrow-rc-600',
        manufacturer: 'Schneider Electric',
        model: 'Uniflair™ InRow RC',
        type: 'In-Row Cooling',
        category: 'Cooling',
        description: 'Uniflair InRow Chilled Water Cooling (600mm). Close-coupled cooling for high density zones.',
        weight: 380,
        volume: 150,
        power: 4,
        specifications: { coolingCapacity: '70kW', width: '600mm' },
        model3d: 'https://sketchfab.com/models/e3422786fe34467d9893131e78e7e9e0/embed'
    },
    {
        id: 'se-uniflair-perimeter',
        manufacturer: 'Schneider Electric',
        model: 'Uniflair™ Room Cooling',
        type: 'CRAH / CCU',
        category: 'Cooling',
        description: 'Uniflair Chilled Water Room Cooling (120 - 250kW). Downflow perimeter unit.',
        weight: 950,
        volume: 400,
        power: 12,
        specifications: { coolingCapacity: '120-250kW' },
        model3d: 'https://sketchfab.com/models/7bd408015ae346619ce8a18204e137fa/embed'
    },
    {
        id: 'se-inrow-dx-300',
        manufacturer: 'Schneider Electric',
        model: 'Uniflair™ InRow DX 300mm',
        type: 'In-Row Cooling',
        category: 'Cooling',
        description: 'Uniflair Direct Expansion InRow Cooling with Economizer.',
        weight: 220,
        volume: 80,
        power: 2,
        specifications: { coolingCapacity: '30kW', width: '300mm' },
        model3d: 'https://sketchfab.com/models/869de57d32b04211850169951869abdc/embed'
    },

    // --- UPS ---
    {
        id: 'se-galaxy-vs',
        manufacturer: 'Schneider Electric',
        model: 'Galaxy VS UPS',
        type: 'UPS',
        category: 'Power',
        description: 'Galaxy VS 10-100kVA 400V 3-phase modular UPS with internal smart battery modules.',
        weight: 450,
        volume: 300,
        power: 100, // kVA
        specifications: { capacity: '10-100kVA', phase: '3-phase' },
        model3d: 'https://sketchfab.com/models/47dec2b9e9584adba2c407227644eda4/embed'
    },
    {
        id: 'se-smart-ups-srt-10k',
        manufacturer: 'APC',
        model: 'Smart-UPS™ On-Line 10kVA',
        type: 'UPS',
        category: 'Power',
        description: 'APC Smart-UPS SRT 10000VA RM. High density, double-conversion on-line power protection.',
        weight: 85,
        volume: 20,
        power: 10,
        specifications: { capacity: '10kVA' },
        model3d: 'https://sketchfab.com/models/d1aa5532011f40b09c77ad71a2a34df2/embed'
    },
    {
        id: 'se-smart-ups-ultra-5k',
        manufacturer: 'APC',
        model: 'Smart-UPS™ Ultra 5kW',
        type: 'UPS',
        category: 'Power',
        description: 'APC Smart-UPS Ultra 5kW. Lightest and most compact 5kW Li-ion UPS.',
        weight: 15, // Ultra light
        volume: 10,
        power: 5,
        specifications: { capacity: '5kW', technology: 'Li-Ion' },
        model3d: 'https://sketchfab.com/models/e3d764ddad92454fa6da8b4f95ac4614/embed'
    },
    {
        id: 'se-galaxy-li-cabinet',
        manufacturer: 'Schneider Electric',
        model: 'Galaxy Li-Ion Cabinet',
        type: 'Battery System',
        category: 'Power',
        description: 'Lithium-ion Battery Cabinet for Galaxy V-Series UPS.',
        weight: 600,
        volume: 400,
        model3d: 'https://sketchfab.com/models/09e6e1a6ba6247018060a678377fd1ab/embed'
    },

    // --- RACKS & ACCESSORIES ---
    {
        id: 'se-netshelter-sx',
        manufacturer: 'APC',
        model: 'NetShelter SX Gen 2',
        type: 'Rack',
        category: 'Racks',
        description: 'APC NetShelter SX Server Rack Enclosure. Standard cabinet for low to medium density.',
        weight: 150,
        volume: 42, // U
        specifications: { height: '42U', color: 'Black' },
        model3d: 'https://sketchfab.com/models/f6884ae802754eb4b17b3174ca6ca981/embed'
    },
    {
        id: 'se-easy-rack',
        manufacturer: 'APC',
        model: 'Easy Rack 42U',
        type: 'Rack',
        category: 'Racks',
        description: 'APC Easy Rack 42U, 600mm x 1200mm. Reliable and affordable rack solution.',
        weight: 130,
        volume: 42,
        specifications: { height: '42U', size: '600x1200' },
        model3d: 'https://sketchfab.com/models/e810e372168c40b5ae22415e9910b61a/embed'
    },
    {
        id: 'se-netshelter-pdu-9000',
        manufacturer: 'APC',
        model: 'NetShelter 9000 Series PDU',
        type: 'PDU',
        category: 'Power',
        description: 'Switched Rack PDU, 9000 Series.',
        weight: 8,
        volume: 2,
        model3d: 'https://sketchfab.com/models/706fa965c59f43ee8eea7a08ec8b147b/embed'
    },

    // --- INTEGRATED SYSTEMS ---
    {
        id: 'se-micro-dc-r-series',
        manufacturer: 'Schneider Electric',
        model: 'EcoStruxure™ Micro Data Center',
        type: 'Micro DC',
        category: 'Integrated Solutions',
        description: 'EcoStruxure Micro Data Center R-Series 42U. Ruggedized enclosure for edge environments.',
        weight: 400,
        volume: 300,
        model3d: 'https://sketchfab.com/models/88c60acd66dd482ab4de025d277746fa/embed'
    },
    {
        id: 'se-ecostruxure-pod',
        manufacturer: 'Schneider Electric',
        model: 'EcoStruxure™ Pod Data Center',
        type: 'Modular DC',
        category: 'Integrated Solutions',
        description: 'Prefabricated Modular Pod for rapid IT deployment.',
        weight: 3500,
        volume: 12000,
        power: 500,
        model3d: 'https://sketchfab.com/models/60dd04da4cd041e98b038d61d8f18336/embed'
    }
];
