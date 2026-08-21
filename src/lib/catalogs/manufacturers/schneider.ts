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
        volume: 60, // water content L (chiller evaporator/loop)
        power: 100, // Fan/Compressor power approx
        specifications: { coolingCapacity: '400-1200kW', series: 'Uniflair' },
    },
    {
        id: 'se-inrow-rc-600',
        manufacturer: 'Schneider Electric',
        model: 'Uniflair™ InRow RC',
        type: 'In-Row Cooling',
        category: 'Cooling',
        description: 'Uniflair InRow Chilled Water Cooling (600mm). Close-coupled cooling for high density zones.',
        weight: 380,
        volume: 8,  // water content L (row coil)
        power: 4,
        specifications: { coolingCapacity: '70kW', width: '600mm' },
    },
    {
        id: 'se-uniflair-perimeter',
        manufacturer: 'Schneider Electric',
        model: 'Uniflair™ Room Cooling',
        type: 'CRAH / CCU',
        category: 'Cooling',
        description: 'Uniflair Chilled Water Room Cooling (120 - 250kW). Downflow perimeter unit.',
        weight: 950,
        volume: 0,  // no liquid - UPS // water content L (perimeter CW coil)
        power: 12,
        specifications: { coolingCapacity: '120-250kW' },
    },
    {
        id: 'se-inrow-dx-300',
        manufacturer: 'Schneider Electric',
        model: 'Uniflair™ InRow DX 300mm',
        type: 'In-Row Cooling',
        category: 'Cooling',
        description: 'Uniflair Direct Expansion InRow Cooling with Economizer.',
        weight: 220,
        volume: 5,  // water content L (DX circuit, small)
        power: 2,
        specifications: { coolingCapacity: '30kW', width: '300mm' },
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
        volume: 0,  // no liquid - UPS
        power: 100, // kVA
        specifications: { capacity: '10-100kVA', phase: '3-phase' },
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
    },
    {
        id: 'se-smart-ups-ultra-5k',
        manufacturer: 'APC',
        model: 'Smart-UPS™ Ultra 5kW',
        type: 'UPS',
        category: 'Power',
        description: 'APC Smart-UPS Ultra 5kW. Lightest and most compact 5kW Li-ion UPS.',
        weight: 15, // Ultra light
        volume: 0,  // no liquid - UPS
        power: 5,
        specifications: { capacity: '5kW', technology: 'Li-Ion' },
    },
    {
        id: 'se-galaxy-li-cabinet',
        manufacturer: 'Schneider Electric',
        model: 'Galaxy Li-Ion Cabinet',
        type: 'Battery System',
        category: 'Power',
        description: 'Lithium-ion Battery Cabinet for Galaxy V-Series UPS.',
        weight: 600,
        volume: 0,  // no liquid - battery cabinet
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
        volume: 0,  // rack - no liquid
        specifications: { height: '42U', color: 'Black' },
    },
    {
        id: 'se-easy-rack',
        manufacturer: 'APC',
        model: 'Easy Rack 42U',
        type: 'Rack',
        category: 'Racks',
        description: 'APC Easy Rack 42U, 600mm x 1200mm. Reliable and affordable rack solution.',
        weight: 130,
        volume: 0,  // rack - no liquid
        specifications: { height: '42U', size: '600x1200' },
    },
    {
        id: 'se-netshelter-pdu-9000',
        manufacturer: 'APC',
        model: 'NetShelter 9000 Series PDU',
        type: 'PDU',
        category: 'Power',
        description: 'Switched Rack PDU, 9000 Series.',
        weight: 8,
        volume: 0,  // no liquid - PDU
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
        volume: 10, // water content L (micro DC small loop)
    },
    {
        id: 'se-ecostruxure-pod',
        manufacturer: 'Schneider Electric',
        model: 'EcoStruxure™ Pod Data Center',
        type: 'Modular DC',
        category: 'Integrated Solutions',
        description: 'Prefabricated Modular Pod for rapid IT deployment.',
        weight: 3500,
        volume: 400, // water content L (pod hydronic loop)
        power: 500,
    }
];
