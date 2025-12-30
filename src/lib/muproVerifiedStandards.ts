
export interface MuproComponent {
    sku: string;
    name: string;
    description?: string;
    category: 'profile' | 'base_plate' | 'bolt' | 'limit' | 'clamp' | 'cap' | 'insulation';
    loadCapacity: 'Light' | 'Medium' | 'Heavy';
    weight?: number; // kg/m for profiles, kg/pc for others
    dimensions?: { h?: number; w?: number; length?: number; range?: [number, number] }; // mm
    structural?: { Iy?: number; Wy?: number }; // cm4, cm3
}

export const MUPRO_MASTER_CATALOG: MuproComponent[] = [
    // --- CHANNELS (2m Lengths) ---
    {
        sku: '130001',
        name: 'Profil MPR 41/21/2.0 (2m)',
        description: 'Oțel Zincat',
        category: 'profile',
        loadCapacity: 'Light',
        weight: 1.44,
        dimensions: { h: 21, w: 41, length: 2000 },
        structural: { Iy: 0.96, Wy: 0.91 }
    },
    {
        sku: '130011',
        name: 'Profil MPR 41/41/2.0 (2m)',
        description: 'Oțel Zincat',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 2.10,
        dimensions: { h: 41, w: 41, length: 2000 },
        structural: { Iy: 5.92, Wy: 2.89 }
    },

    // --- CHANNELS (6m Lengths) ---
    {
        sku: '130004',
        name: 'Profil MPR 41/21/2.0 (6m)',
        description: 'Oțel Zincat',
        category: 'profile',
        loadCapacity: 'Light',
        weight: 1.44,
        dimensions: { h: 21, w: 41, length: 6000 },
        structural: { Iy: 0.96, Wy: 0.91 }
    },
    {
        sku: '130014',
        name: 'Profil MPR 41/41/2.0 (6m)',
        description: 'Oțel Zincat',
        category: 'profile',
        loadCapacity: 'Medium',
        weight: 2.10,
        dimensions: { h: 41, w: 41, length: 6000 },
        structural: { Iy: 5.92, Wy: 2.89 }
    },
    {
        sku: '150979',
        name: 'Profil MPR 41/62/2.5 (6m)',
        description: 'Oțel Zincat',
        category: 'profile',
        loadCapacity: 'Heavy',
        weight: 3.50,
        dimensions: { h: 62, w: 41, length: 6000 },
        structural: { Iy: 18.5, Wy: 6.0 }
    },
    {
        sku: '150570',
        name: 'Profil MPR 41/124/2.5 D (6m)',
        description: 'Profil Dublu',
        category: 'profile',
        loadCapacity: 'Heavy',
        weight: 7.00,
        dimensions: { h: 124, w: 41, length: 6000 },
        structural: { Iy: 95.0, Wy: 30.6 }
    },

    // --- BASE PLATES & MOUNTING ---
    {
        sku: '131840',
        name: 'Talpă WBD Q100',
        description: 'Pentru MPR 41/41',
        category: 'base_plate',
        loadCapacity: 'Medium'
    },
    {
        sku: '131842',
        name: 'Talpă WBD S (Longitudinală)',
        description: 'Pentru MPR 41/21',
        category: 'base_plate',
        loadCapacity: 'Light'
    },

    // --- SYSTEM HARDWARE ---
    {
        sku: '110419',
        name: 'Șurub cap ciocan M10x30',
        description: 'Oțel Zincat',
        category: 'bolt',
        loadCapacity: 'Medium'
    },
    {
        sku: '110435',
        name: 'Șurub cap ciocan M12x40',
        description: 'Oțel Zincat',
        category: 'bolt',
        loadCapacity: 'Heavy'
    },
    {
        sku: '105805',
        name: 'Capac protecție 41/41',
        description: 'Plastic Negru',
        category: 'cap',
        loadCapacity: 'Medium'
    },
    {
        sku: '105808',
        name: 'Capac protecție 41/62',
        description: 'Plastic Negru',
        category: 'cap',
        loadCapacity: 'Heavy'
    },

    // --- PIPE CLAMPS ---
    {
        sku: '101037',
        name: 'Colier OPTIMAL (108-115mm) DN100',
        description: 'Cu garnitură DÄMMGULAST',
        category: 'clamp',
        loadCapacity: 'Medium',
        dimensions: { range: [100, 115] }
    },
    {
        sku: '101234',
        name: 'Colier Heavy-Duty (215-225mm) DN200',
        description: 'Sarcini mari',
        category: 'clamp',
        loadCapacity: 'Heavy',
        dimensions: { range: [200, 225] }
    },
    {
        sku: '101258',
        name: 'Colier Heavy-Duty (315-326mm) DN300',
        description: 'Sarcini mari',
        category: 'clamp',
        loadCapacity: 'Heavy',
        dimensions: { range: [300, 326] }
    },

    // --- INSULATION ---
    {
        sku: '150537',
        name: 'Colier Izolație RTN Tip 2',
        description: 'Răcire/Izolație',
        category: 'insulation',
        loadCapacity: 'Medium'
    },
    {
        sku: '145890',
        name: 'Inserție Izolație SGR',
        description: 'Decuplare termică',
        category: 'insulation',
        loadCapacity: 'Medium'
    }
];
