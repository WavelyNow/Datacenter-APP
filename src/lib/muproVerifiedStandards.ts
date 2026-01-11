
export interface MuproComponent {
    sku: string;
    name: string;
    description?: string;
    category: 'profile' | 'base_plate' | 'bolt' | 'limit' | 'clamp' | 'cap' | 'insulation' | 'connector';
    loadCapacity: 'Light' | 'Medium' | 'Heavy';
    weight?: number; // kg/m for profiles, kg/pc for others
    dimensions?: { h?: number; w?: number; t?: number; length?: number; range?: [number, number] }; // mm
    structural?: { Iy?: number; Wy?: number }; // cm4, cm3
    manufacturer?: 'MÜPRO' | 'Hilti' | 'OBO Bettermann';
    material?: 'Galvanized' | 'Hot-Dip Galvanized' | 'Stainless Steel' | 'Sendzimir';
}

export const MUPRO_MASTER_CATALOG: MuproComponent[] = [
    // ==========================================================================
    // MÜPRO - MPR SUPPORT CHANNELS (Verified from muepro.com)
    // ==========================================================================
    {
        sku: '130001',
        name: 'MPR 41/21/2.0 (2m)',
        description: 'Oțel Zincat - Canal Ușor',
        category: 'profile',
        loadCapacity: 'Light',
        weight: 1.45,
        dimensions: { h: 21, w: 41, t: 2.0, length: 2000 },
        structural: { Iy: 0.96, Wy: 0.91 },
        manufacturer: 'MÜPRO',
        material: 'Galvanized'
    },
    {
        sku: '130004',
        name: 'MPR 41/21/2.0 (6m)',
        description: 'Oțel Zincat - Canal Ușor',
        category: 'profile',
        loadCapacity: 'Light',
        weight: 1.45,
        dimensions: { h: 21, w: 41, t: 2.0, length: 6000 },
        structural: { Iy: 0.96, Wy: 0.91 },
        manufacturer: 'MÜPRO',
        material: 'Galvanized'
    },
    {
        sku: '130011',
        name: 'MPR 41/41/2.0 (2m)',
        description: 'Oțel Zincat - Standard',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 2.08,
        dimensions: { h: 41, w: 41, t: 2.0, length: 2000 },
        structural: { Iy: 5.92, Wy: 2.89 },
        manufacturer: 'MÜPRO',
        material: 'Galvanized'
    },
    {
        sku: '130014',
        name: 'MPR 41/41/2.0 (6m)',
        description: 'Oțel Zincat - Standard',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 2.08,
        dimensions: { h: 41, w: 41, t: 2.0, length: 6000 },
        structural: { Iy: 5.92, Wy: 2.89 },
        manufacturer: 'MÜPRO',
        material: 'Galvanized'
    },
    {
        sku: '130020',
        name: 'MPR 41/41/2.5 (6m)',
        description: 'Oțel Zincat - Medium Heavy',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 2.53,
        dimensions: { h: 41, w: 41, t: 2.5, length: 6000 },
        structural: { Iy: 7.10, Wy: 3.46 },
        manufacturer: 'MÜPRO',
        material: 'Galvanized'
    },
    {
        sku: '150979',
        name: 'MPR 41/62/2.5 (6m)',
        description: 'Oțel Zincat - Sarcină Mare',
        category: 'profile',
        loadCapacity: 'Heavy',
        weight: 3.38,
        dimensions: { h: 62, w: 41, t: 2.5, length: 6000 },
        structural: { Iy: 18.5, Wy: 6.0 },
        manufacturer: 'MÜPRO',
        material: 'Galvanized'
    },
    // MÜPRO H-Profiles (Back-to-Back Double Channels)
    {
        sku: '130100',
        name: 'MPR H 41/42/2.0 (6m)',
        description: 'H-Profil Dublu',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 2.90,
        dimensions: { h: 42, w: 41, t: 2.0, length: 6000 },
        manufacturer: 'MÜPRO',
        material: 'Galvanized'
    },
    {
        sku: '130110',
        name: 'MPR H 41/82/2.0 (6m)',
        description: 'H-Profil Dublu Heavy',
        category: 'profile',
        loadCapacity: 'Heavy',
        weight: 4.16,
        dimensions: { h: 82, w: 41, t: 2.0, length: 6000 },
        manufacturer: 'MÜPRO',
        material: 'Galvanized'
    },
    {
        sku: '150570',
        name: 'MPR H 41/124/2.5 D (6m)',
        description: 'H-Profil XL - Sarcini Foarte Mari',
        category: 'profile',
        loadCapacity: 'Heavy',
        weight: 7.00,
        dimensions: { h: 124, w: 41, t: 2.5, length: 6000 },
        structural: { Iy: 95.0, Wy: 30.6 },
        manufacturer: 'MÜPRO',
        material: 'Galvanized'
    },

    // ==========================================================================
    // HILTI - MQ STRUT CHANNELS (Verified from hilti.com)
    // ==========================================================================
    {
        sku: 'MQ-21-2000',
        name: 'MQ-21 (2m)',
        description: 'C-Channel 21mm - Light Duty',
        category: 'profile',
        loadCapacity: 'Light',
        weight: 1.44,
        dimensions: { h: 21, w: 41, t: 2.0, length: 2000 },
        manufacturer: 'Hilti',
        material: 'Sendzimir'
    },
    {
        sku: 'MQ-21-6000',
        name: 'MQ-21 (6m)',
        description: 'C-Channel 21mm - Light Duty',
        category: 'profile',
        loadCapacity: 'Light',
        weight: 1.44,
        dimensions: { h: 21, w: 41, t: 2.0, length: 6000 },
        manufacturer: 'Hilti',
        material: 'Sendzimir'
    },
    {
        sku: 'MQ-41-2000',
        name: 'MQ-41 (2m)',
        description: 'C-Channel 41mm - Standard',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 2.08,
        dimensions: { h: 41, w: 41, t: 2.0, length: 2000 },
        manufacturer: 'Hilti',
        material: 'Sendzimir'
    },
    {
        sku: 'MQ-41-6000',
        name: 'MQ-41 (6m)',
        description: 'C-Channel 41mm - Standard',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 2.08,
        dimensions: { h: 41, w: 41, t: 2.0, length: 6000 },
        manufacturer: 'Hilti',
        material: 'Sendzimir'
    },
    {
        sku: 'MQ-41-HDG-6000',
        name: 'MQ-41 HDG (6m)',
        description: 'C-Channel 41mm - Outdoor',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 2.13,
        dimensions: { h: 41, w: 41, t: 2.0, length: 6000 },
        manufacturer: 'Hilti',
        material: 'Hot-Dip Galvanized'
    },
    {
        sku: 'MQ-41-D-6000',
        name: 'MQ-41 D (6m)',
        description: 'Double C-Channel 82mm - Heavy Duty',
        category: 'profile',
        loadCapacity: 'Heavy',
        weight: 4.29,
        dimensions: { h: 82, w: 41, t: 2.0, length: 6000 },
        manufacturer: 'Hilti',
        material: 'Hot-Dip Galvanized'
    },
    {
        sku: 'MQ-41-D-INOX',
        name: 'MQ-41 D Inox (6m)',
        description: 'Double C-Channel - Stainless Steel',
        category: 'profile',
        loadCapacity: 'Heavy',
        weight: 4.28,
        dimensions: { h: 82, w: 41, t: 2.0, length: 6000 },
        manufacturer: 'Hilti',
        material: 'Stainless Steel'
    },

    // ==========================================================================
    // OBO BETTERMANN - MS/US PROFILE RAILS (Verified from obo.global)
    // ==========================================================================
    {
        sku: 'AMS3518P1000',
        name: 'AMS 35x18 (1m)',
        description: 'C-Profile Rail - Light',
        category: 'profile',
        loadCapacity: 'Light',
        weight: 1.22,
        dimensions: { h: 18, w: 35, t: 2.0, length: 1000 },
        manufacturer: 'OBO Bettermann',
        material: 'Hot-Dip Galvanized'
    },
    {
        sku: 'MS4022-200',
        name: 'MS 22 L (200mm)',
        description: 'Heavy C-Profile Rail',
        category: 'profile',
        loadCapacity: 'Light',
        weight: 0.40,
        dimensions: { h: 22.5, w: 40, t: 2.0, length: 200 },
        manufacturer: 'OBO Bettermann',
        material: 'Hot-Dip Galvanized'
    },
    {
        sku: 'MS4022-300',
        name: 'MS 22 L (300mm)',
        description: 'Heavy C-Profile Rail',
        category: 'profile',
        loadCapacity: 'Light',
        weight: 0.60,
        dimensions: { h: 22.5, w: 40, t: 2.0, length: 300 },
        manufacturer: 'OBO Bettermann',
        material: 'Hot-Dip Galvanized'
    },
    {
        sku: 'MS4022-500',
        name: 'MS 22 L (500mm)',
        description: 'Heavy C-Profile Rail',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 1.00,
        dimensions: { h: 22.5, w: 40, t: 2.0, length: 500 },
        manufacturer: 'OBO Bettermann',
        material: 'Hot-Dip Galvanized'
    },
    {
        sku: 'MS4022-600',
        name: 'MS 22 L (600mm)',
        description: 'Heavy C-Profile Rail',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 1.20,
        dimensions: { h: 22.5, w: 40, t: 2.0, length: 600 },
        manufacturer: 'OBO Bettermann',
        material: 'Hot-Dip Galvanized'
    },
    {
        sku: 'MS5030P0700',
        name: 'MS 50x30 (700mm)',
        description: 'Heavy C-Profile - Support Structure',
        category: 'profile',
        loadCapacity: 'Heavy',
        weight: 2.10,
        dimensions: { h: 30, w: 50, t: 2.5, length: 700 },
        manufacturer: 'OBO Bettermann',
        material: 'Hot-Dip Galvanized'
    },

    // ==========================================================================
    // MÜPRO - BASE PLATES & MOUNTING HARDWARE
    // ==========================================================================
    {
        sku: '131840',
        name: 'Talpă WBD Q100',
        description: 'Pentru MPR 41/41',
        category: 'base_plate',
        loadCapacity: 'Medium',
        manufacturer: 'MÜPRO'
    },
    {
        sku: '131842',
        name: 'Talpă WBD S (Longitudinală)',
        description: 'Pentru MPR 41/21',
        category: 'base_plate',
        loadCapacity: 'Light',
        manufacturer: 'MÜPRO'
    },

    // ==========================================================================
    // SYSTEM HARDWARE (Bolts, Caps)
    // ==========================================================================
    {
        sku: '110419',
        name: 'Șurub cap ciocan M10x30',
        description: 'Oțel Zincat - Standard',
        category: 'bolt',
        loadCapacity: 'Medium',
        manufacturer: 'MÜPRO'
    },
    {
        sku: '110435',
        name: 'Șurub cap ciocan M12x40',
        description: 'Oțel Zincat - Heavy Duty',
        category: 'bolt',
        loadCapacity: 'Heavy',
        manufacturer: 'MÜPRO'
    },
    {
        sku: '105805',
        name: 'Capac protecție 41/41',
        description: 'Plastic Negru',
        category: 'cap',
        loadCapacity: 'Medium',
        manufacturer: 'MÜPRO'
    },
    {
        sku: '105808',
        name: 'Capac protecție 41/62',
        description: 'Plastic Negru',
        category: 'cap',
        loadCapacity: 'Heavy',
        manufacturer: 'MÜPRO'
    },

    // ==========================================================================
    // PIPE CLAMPS
    // ==========================================================================
    {
        sku: '101037',
        name: 'Colier OPTIMAL DN100 (108-115mm)',
        description: 'Cu garnitură DÄMMGULAST',
        category: 'clamp',
        loadCapacity: 'Medium',
        dimensions: { range: [108, 115] },
        manufacturer: 'MÜPRO'
    },
    {
        sku: '101234',
        name: 'Colier Heavy-Duty DN200 (215-225mm)',
        description: 'Sarcini mari',
        category: 'clamp',
        loadCapacity: 'Heavy',
        dimensions: { range: [215, 225] },
        manufacturer: 'MÜPRO'
    },
    {
        sku: '101258',
        name: 'Colier Heavy-Duty DN300 (315-326mm)',
        description: 'Sarcini foarte mari',
        category: 'clamp',
        loadCapacity: 'Heavy',
        dimensions: { range: [315, 326] },
        manufacturer: 'MÜPRO'
    },

    // ==========================================================================
    // INSULATION COMPONENTS
    // ==========================================================================
    {
        sku: '150537',
        name: 'Colier Izolație RTN Tip 2',
        description: 'Pentru instalații răcire',
        category: 'insulation',
        loadCapacity: 'Medium',
        manufacturer: 'MÜPRO'
    },
    {
        sku: '145890',
        name: 'Inserție Izolație SGR',
        description: 'Decuplare termică',
        category: 'insulation',
        loadCapacity: 'Medium',
        manufacturer: 'MÜPRO'
    },

    // ==========================================================================
    // CONNECTORS & FITTINGS
    // ==========================================================================
    {
        sku: '128002',
        name: 'Vinclu 2 găuri 90°',
        description: 'Oțel Zincat, 4mm',
        category: 'connector',
        loadCapacity: 'Medium',
        weight: 0.15,
        manufacturer: 'MÜPRO'
    },
    {
        sku: '128004',
        name: 'Vinclu 4 găuri 90°',
        description: 'Oțel Zincat, 4mm',
        category: 'connector',
        loadCapacity: 'Heavy',
        weight: 0.25,
        manufacturer: 'MÜPRO'
    },
    {
        sku: '128010',
        name: 'Talpă de legătură (Wing Fitting)',
        description: 'Conexiune profil-profil',
        category: 'connector',
        loadCapacity: 'Heavy',
        weight: 0.45,
        manufacturer: 'MÜPRO'
    },
    {
        sku: '144010',
        name: 'Clemă de grindă TCS 1',
        description: 'M10, Prindere pe I-Beam',
        category: 'connector',
        loadCapacity: 'Medium',
        weight: 0.35,
        manufacturer: 'MÜPRO'
    },

    // ==========================================================================
    // MÜPRO PRE-FABRICATED CONSOLES
    // ==========================================================================
    {
        sku: '133330',
        name: 'Consolă 41/41/2.0 - 300mm',
        description: 'Talpă sudată',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 1.20,
        dimensions: { h: 41, w: 41, length: 300 },
        manufacturer: 'MÜPRO'
    },
    {
        sku: '133600',
        name: 'Consolă 41/41/2.0 - 600mm',
        description: 'Talpă sudată',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 2.10,
        dimensions: { h: 41, w: 41, length: 600 },
        manufacturer: 'MÜPRO'
    }
];
