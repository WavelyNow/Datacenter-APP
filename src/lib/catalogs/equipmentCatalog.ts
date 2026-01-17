
import { CatalogEquipment } from '@/lib/types';
import { WILO_PUMPS } from './manufacturers/wilo';
import { VICTAULIC_EQUIPMENT } from './manufacturers/victaulic';
import { BELIMO_VALVES } from './manufacturers/belimo';
import { VERTIV_CATALOG } from './manufacturers/vertiv';
import { SCHNEIDER_CATALOG } from './manufacturers/schneider';
import { GENERAL_CATALOG } from './manufacturers/general';

export const EQUIPMENT_CATALOG: CatalogEquipment[] = [
    // ==========================================================================
    // VERTIV - Liebert Precision Cooling
    // ==========================================================================
    {
        id: 'vt-xdv-vertical',
        category: 'Unitate internă (CDU)',
        manufacturer: 'Vertiv',
        model: 'Liebert XDV (Racktop)',
        volume: 5,
        weight: 35,
        description: 'Vertical cooling module, pumped refrigerant.'
    },
    {
        id: 'vt-xdh-row',
        category: 'CRAH / CCU',
        manufacturer: 'Vertiv',
        model: 'Liebert XDH (Row Cooler)',
        volume: 18,
        weight: 112,
        description: 'Horizontal row cooler, 20-30kW capacity.'
    },
    {
        id: 'vt-xdo-overhead',
        category: 'CRAH / CCU',
        manufacturer: 'Vertiv',
        model: 'Liebert XDO (Overhead)',
        volume: 12,
        weight: 68,
        description: 'Overhead cooling module for high-density racks.'
    },
    {
        id: 'vt-xdp-pump-unit',
        category: 'Grup Pompare',
        manufacturer: 'Vertiv',
        model: 'Liebert XDP 130-160kW',
        volume: 85,
        weight: 372,
        description: 'Pumping unit, interface to chilled water.'
    },
    {
        id: 'vt-xdc-chiller',
        category: 'Chiller',
        manufacturer: 'Vertiv',
        model: 'Liebert XDC 160kW',
        volume: 120,
        weight: 816,
        description: 'Refrigerant chiller unit, 160kW @ 60Hz.'
    },
    {
        id: 'vt-pdx-perimeter',
        category: 'CRAH / CCU',
        manufacturer: 'Vertiv',
        model: 'Liebert PDX 30kW',
        volume: 28,
        weight: 380,
        description: 'Perimeter precision cooling, downflow.'
    },
    {
        id: 'vt-pdx-perimeter-50',
        category: 'CRAH / CCU',
        manufacturer: 'Vertiv',
        model: 'Liebert PDX 50kW',
        volume: 42,
        weight: 520,
        description: 'Perimeter precision cooling, upflow.'
    },

    // ==========================================================================
    // GRUNDFOS - Circulation Pumps
    // ==========================================================================
    {
        id: 'gf-magna3-25-60',
        category: 'Grup Pompare',
        manufacturer: 'Grundfos',
        model: 'MAGNA3 25-60',
        volume: 0.8,
        weight: 5.5,
        description: 'Variable speed circulator, 25mm, H=6m.'
    },
    {
        id: 'gf-magna3-32-80',
        category: 'Grup Pompare',
        manufacturer: 'Grundfos',
        model: 'MAGNA3 32-80',
        volume: 1.2,
        weight: 7.8,
        description: 'Variable speed circulator, 32mm, H=8m.'
    },
    {
        id: 'gf-magna3-40-120',
        category: 'Grup Pompare',
        manufacturer: 'Grundfos',
        model: 'MAGNA3 40-120 F',
        volume: 2.5,
        weight: 14,
        description: 'Flanged circulator, 40mm, H=12m.'
    },
    {
        id: 'gf-magna3-50-150',
        category: 'Grup Pompare',
        manufacturer: 'Grundfos',
        model: 'MAGNA3 50-150 F',
        volume: 4.2,
        weight: 22,
        description: 'Flanged circulator, 50mm, H=15m.'
    },
    {
        id: 'gf-magna3-65-120',
        category: 'Grup Pompare',
        manufacturer: 'Grundfos',
        model: 'MAGNA3 65-120 F',
        volume: 6.5,
        weight: 32,
        description: 'Flanged circulator, 65mm, H=12m.'
    },
    {
        id: 'gf-magna3-80-120',
        category: 'Grup Pompare',
        manufacturer: 'Grundfos',
        model: 'MAGNA3 80-120 F',
        volume: 9.5,
        weight: 45,
        description: 'Flanged circulator, 80mm, H=12m.'
    },
    {
        id: 'gf-tpe3-32-200',
        category: 'Grup Pompare',
        manufacturer: 'Grundfos',
        model: 'TPE3 32-200',
        volume: 3.5,
        weight: 28,
        description: 'In-line pump, 32mm, variable speed.'
    },
    {
        id: 'gf-tpe3-50-180',
        category: 'Grup Pompare',
        manufacturer: 'Grundfos',
        model: 'TPE3 50-180',
        volume: 5.8,
        weight: 42,
        description: 'In-line pump, 50mm, variable speed.'
    },

    // ==========================================================================
    // GENERIC / COMMON EQUIPMENT
    // ==========================================================================
    {
        id: 'buffer-500',
        category: 'Puffer / Rezervor Tampon',
        manufacturer: 'Generic',
        model: 'Buffer Tank 500L',
        volume: 500,
        weight: 120,
        description: 'Rezervor de acumulare fără izolație.'
    },
    {
        id: 'buffer-1000',
        category: 'Puffer / Rezervor Tampon',
        manufacturer: 'Generic',
        model: 'Buffer Tank 1000L',
        volume: 1000,
        weight: 210,
        description: 'Rezervor de acumulare 1000L.'
    },
    {
        id: 'buffer-2000',
        category: 'Puffer / Rezervor Tampon',
        manufacturer: 'Generic',
        model: 'Buffer Tank 2000L',
        volume: 2000,
        weight: 380,
        description: 'Rezervor de acumulare 2000L.'
    },
    {
        id: 'hx-plate-50',
        category: 'Schimbător Căldură (Plaques)',
        manufacturer: 'Generic',
        model: 'Schimbător Plăci 50kW',
        volume: 8,
        weight: 35,
        description: 'Schimbător căldură cu plăci, 50kW.'
    },
    {
        id: 'hx-plate-100',
        category: 'Schimbător Căldură (Plaques)',
        manufacturer: 'Generic',
        model: 'Schimbător Plăci 100kW',
        volume: 15,
        weight: 65,
        description: 'Schimbător căldură cu plăci, 100kW.'
    },
    {
        id: 'hx-plate-200',
        category: 'Schimbător Căldură (Plaques)',
        manufacturer: 'Generic',
        model: 'Schimbător Plăci 200kW',
        volume: 28,
        weight: 120,
        description: 'Schimbător căldură cu plăci, 200kW.'
    },

    // ==========================================================================
    // WILO - Added via Catalog Expansion
    // ==========================================================================
    ...WILO_PUMPS,

    // ==========================================================================
    // VICTAULIC - Series 761, 716, 731
    // ==========================================================================
    ...VICTAULIC_EQUIPMENT,

    // ==========================================================================
    // BELIMO - Control Valves
    // ==========================================================================
    ...BELIMO_VALVES,

    // ==========================================================================
    // VERTIV - Integrated Systems
    // ==========================================================================
    ...VERTIV_CATALOG,

    // ==========================================================================
    // SCHNEIDER ELECTRIC - Integrated Systems
    // ==========================================================================
    ...SCHNEIDER_CATALOG,

    // ==========================================================================
    // GENERAL INFRASTRUCTURE - Generators, Fire, Power
    // ==========================================================================
    ...GENERAL_CATALOG
];
