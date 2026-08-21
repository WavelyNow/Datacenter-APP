/**
 * Project Templates
 * Pre-configured project setups for common datacenter scenarios
 */

import { PipeSegment, EquipmentItem, ProjectDetails } from '../types';

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    category: 'small' | 'medium' | 'enterprise';
    icon: string;  // Lucide icon name
    specs: {
        racks: string;
        power: string;
        cooling: string;
    };
    projectDetails: Partial<ProjectDetails>;
    segments: PipeSegment[];
    equipment: EquipmentItem[];
    glycolPercentage: number;
    fluidType: 'ethylene' | 'propylene' | 'water';
}

// Generate unique IDs
const genId = () => `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    // =========================================================================
    // SMALL DATACENTER
    // =========================================================================
    {
        id: 'small-dc',
        name: 'Datacenter Mic',
        description: 'Configurație tipică pentru ~20-50 rack-uri IT. Sistem de răcire cu 2 chillere în redundanță N+1.',
        category: 'small',
        icon: 'Server',
        specs: {
            racks: '20-50',
            power: '500 kW',
            cooling: '2x Chiller'
        },
        projectDetails: {
            projectName: 'Small Datacenter Project',
            projectNumber: `DC-SM-${new Date().getFullYear()}`,
        },
        glycolPercentage: 30,
        fluidType: 'ethylene',
        segments: [
            {
                id: genId(),
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN100',
                length: 25,
                flowRate: 50,
            },
            {
                id: genId(),
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN80',
                length: 40,
                flowRate: 35,
            },
            {
                id: genId(),
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN65',
                length: 60,
                flowRate: 25,
            },
            {
                id: genId(),
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN50',
                length: 80,
                flowRate: 15,
            },
        ],
        equipment: [
            {
                id: genId(),
                type: 'Chiller',
                name: 'Chiller Principal',
                volume: 450,
                weight: 3500,
                power: 180,
            },
            {
                id: genId(),
                type: 'Chiller',
                name: 'Chiller Backup (N+1)',
                volume: 450,
                weight: 3500,
                power: 180,
            },
            {
                id: genId(),
                type: 'Puffer / Rezervor Tampon',
                name: 'Buffer Tank',
                volume: 2000,
                weight: 500,
            },
            {
                id: genId(),
                type: 'Grup Pompare',
                name: 'Pompe Primare',
                volume: 25,
                weight: 180,
                power: 15,
            },
            {
                id: genId(),
                type: 'CRAH / CCU',
                name: 'CRAH Unit 1',
                volume: 35,
                weight: 450,
                power: 85,
            },
            {
                id: genId(),
                type: 'CRAH / CCU',
                name: 'CRAH Unit 2',
                volume: 35,
                weight: 450,
                power: 85,
            },
        ],
    },

    // =========================================================================
    // MEDIUM DATACENTER
    // =========================================================================
    {
        id: 'medium-dc',
        name: 'Datacenter Mediu',
        description: 'Configurație pentru ~100 rack-uri. Chillers cu free-cooling, sistem primar-secundar.',
        category: 'medium',
        icon: 'Building',
        specs: {
            racks: '80-120',
            power: '1.5 MW',
            cooling: '3x Chiller + Free Cooling'
        },
        projectDetails: {
            projectName: 'Medium Datacenter Project',
            projectNumber: `DC-MD-${new Date().getFullYear()}`,
        },
        glycolPercentage: 35,
        fluidType: 'ethylene',
        segments: [
            {
                id: genId(),
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN150',
                length: 30,
                flowRate: 150,
            },
            {
                id: genId(),
                material: 'steel_medium',
                standard: 'EN 10255',
                size: 'DN125',
                length: 45,
                flowRate: 100,
            },
            {
                id: genId(),
                material: 'steel_medium',
                standard: 'EN 10255',
                size: 'DN100',
                length: 80,
                flowRate: 70,
            },
            {
                id: genId(),
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN80',
                length: 120,
                flowRate: 45,
            },
            {
                id: genId(),
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN65',
                length: 100,
                flowRate: 30,
            },
        ],
        equipment: [
            {
                id: genId(),
                type: 'Chiller',
                name: 'Chiller 1',
                volume: 650,
                weight: 5200,
                power: 350,
            },
            {
                id: genId(),
                type: 'Chiller',
                name: 'Chiller 2',
                volume: 650,
                weight: 5200,
                power: 350,
            },
            {
                id: genId(),
                type: 'Chiller',
                name: 'Chiller 3 (Backup)',
                volume: 650,
                weight: 5200,
                power: 350,
            },
            {
                id: genId(),
                type: 'Dry Cooler / Turn Răcire',
                name: 'Free Cooler 1',
                volume: 120,
                weight: 2800,
                power: 45,
            },
            {
                id: genId(),
                type: 'Dry Cooler / Turn Răcire',
                name: 'Free Cooler 2',
                volume: 120,
                weight: 2800,
                power: 45,
            },
            {
                id: genId(),
                type: 'Puffer / Rezervor Tampon',
                name: 'Buffer Tank Primar',
                volume: 5000,
                weight: 1200,
            },
            {
                id: genId(),
                type: 'Grup Pompare',
                name: 'Pompe Primare',
                volume: 45,
                weight: 350,
                power: 37,
            },
            {
                id: genId(),
                type: 'Grup Pompare',
                name: 'Pompe Secundare',
                volume: 35,
                weight: 280,
                power: 22,
            },
        ],
    },

    // =========================================================================
    // ENTERPRISE DATACENTER
    // =========================================================================
    {
        id: 'enterprise-dc',
        name: 'Datacenter Enterprise',
        description: 'Datacenter de mare capacitate, >200 rack-uri. Sistem cu redundanță 2N, heat recovery.',
        category: 'enterprise',
        icon: 'Building2',
        specs: {
            racks: '200+',
            power: '5+ MW',
            cooling: '2N Redundancy'
        },
        projectDetails: {
            projectName: 'Enterprise Datacenter Project',
            projectNumber: `DC-ENT-${new Date().getFullYear()}`,
        },
        glycolPercentage: 40,
        fluidType: 'propylene',  // Food-grade for heat recovery
        segments: [
            {
                id: genId(),
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN200',
                length: 50,
                flowRate: 350,
            },
            {
                id: genId(),
                material: 'steel_medium',
                standard: 'EN 10255',
                size: 'DN150',
                length: 80,
                flowRate: 200,
            },
            {
                id: genId(),
                material: 'steel_medium',
                standard: 'EN 10255',
                size: 'DN125',
                length: 120,
                flowRate: 150,
            },
            {
                id: genId(),
                material: 'steel_medium',
                standard: 'EN 10255',
                size: 'DN100',
                length: 200,
                flowRate: 100,
            },
            {
                id: genId(),
                material: 'steel_light',
                standard: 'EN 10255',
                size: 'DN80',
                length: 250,
                flowRate: 60,
            },
        ],
        equipment: [
            // Primary Chillers
            {
                id: genId(),
                type: 'Chiller',
                name: 'Chiller Train A - Unit 1',
                volume: 1200,
                weight: 12000,
                power: 800,
            },
            {
                id: genId(),
                type: 'Chiller',
                name: 'Chiller Train A - Unit 2',
                volume: 1200,
                weight: 12000,
                power: 800,
            },
            {
                id: genId(),
                type: 'Chiller',
                name: 'Chiller Train B - Unit 1 (2N)',
                volume: 1200,
                weight: 12000,
                power: 800,
            },
            {
                id: genId(),
                type: 'Chiller',
                name: 'Chiller Train B - Unit 2 (2N)',
                volume: 1200,
                weight: 12000,
                power: 800,
            },
            // Free Coolers
            {
                id: genId(),
                type: 'Dry Cooler / Turn Răcire',
                name: 'Free Cooler Bank A',
                volume: 350,
                weight: 8500,
                power: 120,
            },
            {
                id: genId(),
                type: 'Dry Cooler / Turn Răcire',
                name: 'Free Cooler Bank B',
                volume: 350,
                weight: 8500,
                power: 120,
            },
            // Buffers
            {
                id: genId(),
                type: 'Puffer / Rezervor Tampon',
                name: 'Thermal Storage Tank',
                volume: 15000,
                weight: 3500,
            },
            // Pumps
            {
                id: genId(),
                type: 'Grup Pompare',
                name: 'Primary Pump Group A',
                volume: 85,
                weight: 650,
                power: 75,
            },
            {
                id: genId(),
                type: 'Grup Pompare',
                name: 'Primary Pump Group B',
                volume: 85,
                weight: 650,
                power: 75,
            },
            // CDUs
            {
                id: genId(),
                type: 'Unitate internă (CDU)',
                name: 'Rear Door Heat Exchanger Bank',
                volume: 250,
                weight: 1800,
                power: 450,
            },
        ],
    },

    // =========================================================================
    // EMPTY / CUSTOM
    // =========================================================================
    {
        id: 'custom',
        name: 'Proiect Gol',
        description: 'Începe un proiect nou complet gol, fără pre-configurare.',
        category: 'small',
        icon: 'FilePlus',
        specs: {
            racks: 'Custom',
            power: 'Custom',
            cooling: 'Custom'
        },
        projectDetails: {
            projectName: 'New Project',
            projectNumber: `PROJ-${new Date().getFullYear()}-001`,
        },
        glycolPercentage: 30,
        fluidType: 'ethylene',
        segments: [],
        equipment: [],
    },
];

/**
 * Get template by ID
 */
export function getTemplate(id: string): ProjectTemplate | undefined {
    return PROJECT_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: 'small' | 'medium' | 'enterprise'): ProjectTemplate[] {
    return PROJECT_TEMPLATES.filter(t => t.category === category);
}
