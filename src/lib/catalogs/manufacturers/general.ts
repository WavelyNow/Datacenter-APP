import { CatalogEquipment } from '@/lib/types';

export const GENERAL_CATALOG: CatalogEquipment[] = [
    // --- POWER GENERATION ---
    {
        id: 'gen-diesel-industrial',
        manufacturer: 'Generic',
        model: 'Industrial Diesel Generator 1000kVA',
        type: 'Generator',
        category: 'Power',
        description: 'Standby Diesel Generator Set (1000kVA) for mission critical backup power.',
        weight: 8500,
        volume: 0,  // no liquid - generator
        power: 800, // kW
        specifications: { capacity: '1000kVA', fuel: 'Diesel' },
    },
    {
        id: 'gen-diesel-set',
        manufacturer: 'Generic',
        model: 'Diesel Genset 500kVA',
        type: 'Generator',
        category: 'Power',
        description: 'Enclosed Diesel Generator Set (500kVA) with sound attenuation.',
        weight: 4200,
        volume: 0,  // no liquid - generator
        power: 400,
        specifications: { capacity: '500kVA', fuel: 'Diesel' },
    },

    // --- ELECTRICAL DISTRIBUTION ---
    {
        id: 'elec-switchgear-mv',
        manufacturer: 'Generic',
        model: 'MV Switchgear Panel',
        type: 'Switchgear',
        category: 'Power Distribution',
        description: 'Medium Voltage Switchgear Panel for primary power distribution.',
        weight: 1200,
        volume: 0,  // no liquid - switchgear
    },
    {
        id: 'elec-switchgear-lv',
        manufacturer: 'Generic',
        model: 'LV Electrical Switchboard',
        type: 'Switchgear',
        category: 'Power Distribution',
        description: 'Low Voltage Main Switchboard / Panelboard.',
        weight: 600,
        volume: 0,  // no liquid - switchboard
    },
    {
        id: 'elec-panel-distribution',
        manufacturer: 'Generic',
        model: 'Electrical Distribution Panel',
        type: 'Panelboard',
        category: 'Power Distribution',
        description: 'Wall-mounted or floor-standing electrical distribution panel.',
        weight: 150,
        volume: 0,  // no liquid - distribution panel
    },

    // --- EXTERIOR COOLING ---
    {
        id: 'hvac-dry-cooler',
        manufacturer: 'Generic',
        model: 'Adiabatic Dry Cooler',
        type: 'Dry Cooler',
        category: 'Cooling',
        description: 'Large V-Bank Dry Cooler for external heat rejection.',
        weight: 2200,
        volume: 30, // water content L (dry cooler coil)
        specifications: { type: 'V-Bank', placement: 'Exterior/Roof' },
    },
    {
        id: 'hvac-chiller-air',
        manufacturer: 'Generic',
        model: 'Air Cooled Chiller',
        type: 'Chiller',
        category: 'Cooling',
        description: 'Roof-top Air Cooled Chiller with scroll compressors.',
        weight: 3500,
        volume: 80, // water content L (chiller evaporator+loop)
        power: 150,
        specifications: { coolingCapacity: '300kW' },
    },
    {
        id: 'hvac-cooling-tower',
        manufacturer: 'Generic',
        model: 'Industrial Cooling Tower',
        type: 'Cooling Tower',
        category: 'Cooling',
        description: 'Open circuit cooling tower for water-cooled systems.',
        weight: 4000,
        volume: 300, // water content L (tower basin+sump)
    },
    {
        id: 'hvac-ahu-industrial',
        manufacturer: 'Blauberg',
        model: 'Industrial AHU',
        type: 'AHU',
        category: 'Cooling',
        description: 'Large capacity Air Handling Unit for building climate control.',
        weight: 1500,
        volume: 50, // water content L (AHU coil)
    },

    // --- SAFETY / FIRE SUPPRESSION ---
    {
        id: 'safety-fire-bank',
        manufacturer: 'Generic',
        model: 'Gaseous Fire Suppression Bank',
        type: 'Fire Suppression',
        category: 'Safety',
        description: 'Inert gas / Clean Agent (FM200/Novec) cylinder bank with manifold.',
        weight: 800,
        volume: 0,  // no liquid - fire suppression gas
        specifications: { agent: 'Clean Agent' },
    },
    {
        id: 'safety-fire-cabinet',
        manufacturer: 'Generic',
        model: 'Fire Extinguishing Control System',
        type: 'Fire Suppression',
        category: 'Safety',
        description: 'Automatic fire extinguishing control panel and agent cylinders.',
        weight: 250,
        volume: 0,  // no liquid - fire control panel
    },
    {
        id: 'sec-turnstile',
        manufacturer: 'Generic',
        model: 'Full Height Turnstile',
        type: 'Access Control',
        category: 'Security',
        description: 'Double Full Height Turnstile for secure perimeter access.',
        weight: 350,
        volume: 0,  // no liquid - turnstile
    },

    // --- INFRASTRUCTURE & PATHWAYS ---
    {
        id: 'infra-cable-tray',
        manufacturer: 'Generic',
        model: 'Cable Tray System',
        type: 'Cable Tray',
        category: 'Infrastructure',
        description: 'Modular cable tray system for overhead or underfloor cabling.',
        weight: 10, // per meter
        volume: 0,  // no liquid - cable tray
    },

    // --- INTEGRATED ---
    {
        id: 'dc-edge-container',
        manufacturer: 'Generic',
        model: 'Containerized Edge Data Center',
        type: 'Modular DC',
        category: 'Integrated Solutions',
        description: 'ISO Container Data Center module (Prefabricated).',
        weight: 12000,
        volume: 400, // water content L (container DC hydronic loop)
        specifications: { size: '20ft / 40ft' },
    }
];
