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
        volume: 6000,
        power: 800, // kW
        specifications: { capacity: '1000kVA', fuel: 'Diesel' },
        model3d: 'https://sketchfab.com/models/7a0b72c7d01944a8aafab59d44eb120e/embed'
    },
    {
        id: 'gen-diesel-set',
        manufacturer: 'Generic',
        model: 'Diesel Genset 500kVA',
        type: 'Generator',
        category: 'Power',
        description: 'Enclosed Diesel Generator Set (500kVA) with sound attenuation.',
        weight: 4200,
        volume: 4000,
        power: 400,
        specifications: { capacity: '500kVA', fuel: 'Diesel' },
        model3d: 'https://sketchfab.com/models/4728a2a1c30d460c8f3f186192137266/embed'
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
        volume: 800,
        model3d: 'https://sketchfab.com/models/915e1501509944b68fcf00f1d16b4d73/embed'
    },
    {
        id: 'elec-switchgear-lv',
        manufacturer: 'Generic',
        model: 'LV Electrical Switchboard',
        type: 'Switchgear',
        category: 'Power Distribution',
        description: 'Low Voltage Main Switchboard / Panelboard.',
        weight: 600,
        volume: 400,
        model3d: 'https://sketchfab.com/models/1b036514c7e342dfb6058bcd4e3beab1/embed'
    },
    {
        id: 'elec-panel-distribution',
        manufacturer: 'Generic',
        model: 'Electrical Distribution Panel',
        type: 'Panelboard',
        category: 'Power Distribution',
        description: 'Wall-mounted or floor-standing electrical distribution panel.',
        weight: 150,
        volume: 100,
        model3d: 'https://sketchfab.com/models/454393dd86874310a87dd6d4ee954b63/embed'
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
        volume: 3500,
        specifications: { type: 'V-Bank', placement: 'Exterior/Roof' },
        model3d: 'https://sketchfab.com/models/8b94b3bf1d9f4678bcb523adb26543c9/embed'
    },
    {
        id: 'hvac-chiller-air',
        manufacturer: 'Generic',
        model: 'Air Cooled Chiller',
        type: 'Chiller',
        category: 'Cooling',
        description: 'Roof-top Air Cooled Chiller with scroll compressors.',
        weight: 3500,
        volume: 4000,
        power: 150,
        specifications: { coolingCapacity: '300kW' },
        model3d: 'https://sketchfab.com/models/dadc245779e84f9198d5fc1bfa8a7884/embed'
    },
    {
        id: 'hvac-cooling-tower',
        manufacturer: 'Generic',
        model: 'Industrial Cooling Tower',
        type: 'Cooling Tower',
        category: 'Cooling',
        description: 'Open circuit cooling tower for water-cooled systems.',
        weight: 4000,
        volume: 5000,
        model3d: 'https://sketchfab.com/models/d38387ee11494e6081f4bccca1dba0fb/embed'
    },
    {
        id: 'hvac-ahu-industrial',
        manufacturer: 'Blauberg',
        model: 'Industrial AHU',
        type: 'AHU',
        category: 'Cooling',
        description: 'Large capacity Air Handling Unit for building climate control.',
        weight: 1500,
        volume: 2500,
        model3d: 'https://sketchfab.com/models/6d8503be8c7a4ffcb4ff7df8f6e37d25/embed'
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
        volume: 600,
        specifications: { agent: 'Clean Agent' },
        model3d: 'https://sketchfab.com/models/ad569da2f4c14ae4ba1d1f82368bc7fa/embed'
    },
    {
        id: 'safety-fire-cabinet',
        manufacturer: 'Generic',
        model: 'Fire Extinguishing Control System',
        type: 'Fire Suppression',
        category: 'Safety',
        description: 'Automatic fire extinguishing control panel and agent cylinders.',
        weight: 250,
        volume: 200,
        model3d: 'https://sketchfab.com/models/1dd797d783774295ac17ba8bf2c96924/embed'
    },
    {
        id: 'sec-turnstile',
        manufacturer: 'Generic',
        model: 'Full Height Turnstile',
        type: 'Access Control',
        category: 'Security',
        description: 'Double Full Height Turnstile for secure perimeter access.',
        weight: 350,
        volume: 1200,
        model3d: 'https://sketchfab.com/models/993581a938ff4bd0aff70b77f3278b81/embed'
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
        volume: 5,
        model3d: 'https://sketchfab.com/models/06b7ba70ae024fd88307e9c829d53d91/embed'
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
        volume: 30000,
        specifications: { size: '20ft / 40ft' },
        model3d: 'https://sketchfab.com/models/052e1f8804d04e2586cf75ccd6a68aa5/embed'
    }
];
