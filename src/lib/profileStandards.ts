export interface ProfileAccessory {
    name: string;
    type: 'cap' | 'base_plate' | 'bolt' | 'conn';
    sku?: string;
    image?: string; // placeholder for icon name
}

export interface StructuralProfile {
    name: string;
    // Dimensions
    h: number; // Height in mm
    w: number; // Width in mm
    tw?: number; // Web thickness (optional for simple lists)
    tf?: number; // Flange thickness

    // Physical Properties
    weight: number; // kg/m
    surface?: number; // m²/m

    // Engineering Properties (Eurocode)
    Iy: number; // Moment of Inertia y-axis (cm4) - Strong Axis
    Iz: number; // Moment of Inertia z-axis (cm4) - Weak Axis
    Wy: number; // Section Modulus y-axis (cm3)
    Wz: number; // Section Modulus z-axis (cm3)

    // Metadata
    vendor: 'Generic' | 'Hilti' | 'Fischer' | 'Walraven' | 'OBO' | 'Müpro';
    material: 'S235' | 'S275' | 'S355' | 'SS304' | 'SS316' | 'Galvanized';
    sku?: string;
    url?: string;
    standardLengths?: number[]; // e.g. [2, 3, 6] meters - Optional for now to avoid breaking build

    // System View Properties
    loadCapacity?: 'Light' | 'Medium' | 'Heavy';
    accessories?: ProfileAccessory[];
    image?: string; // placeholder
}

export const UNP_PROFILES: StructuralProfile[] = [
    { name: "UNP 80", h: 80, w: 45, tw: 6, tf: 8, weight: 8.82, surface: 0.313, Iy: 106, Iz: 19.4, Wy: 26.5, Wz: 6.36, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 100", h: 100, w: 50, tw: 6, tf: 8.5, weight: 10.8, surface: 0.372, Iy: 206, Iz: 29.3, Wy: 41.2, Wz: 8.49, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 120", h: 120, w: 55, tw: 7, tf: 9, weight: 13.6, surface: 0.429, Iy: 364, Iz: 43.2, Wy: 60.7, Wz: 11.1, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 140", h: 140, w: 60, tw: 7, tf: 10, weight: 16.3, surface: 0.487, Iy: 605, Iz: 62.7, Wy: 86.4, Wz: 14.8, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 160", h: 160, w: 65, tw: 7.5, tf: 10.5, weight: 19.2, surface: 0.545, Iy: 925, Iz: 85.3, Wy: 116, Wz: 18.3, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 180", h: 180, w: 70, tw: 8, tf: 11, weight: 22.4, surface: 0.603, Iy: 1350, Iz: 114, Wy: 150, Wz: 22.4, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 200", h: 200, w: 75, tw: 8.5, tf: 11.5, weight: 25.7, surface: 0.660, Iy: 1910, Iz: 148, Wy: 191, Wz: 26.0, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 220", h: 220, w: 80, tw: 9, tf: 12.5, weight: 30.0, surface: 0.718, Iy: 2690, Iz: 197, Wy: 245, Wz: 33.6, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 240", h: 240, w: 85, tw: 9.5, tf: 13, weight: 33.8, surface: 0.776, Iy: 3600, Iz: 248, Wy: 300, Wz: 39.6, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 260", h: 260, w: 90, tw: 10, tf: 14, weight: 38.6, surface: 0.833, Iy: 4820, Iz: 317, Wy: 371, Wz: 47.7, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 280", h: 280, w: 95, tw: 10, tf: 15, weight: 42.7, surface: 0.891, Iy: 6280, Iz: 399, Wy: 448, Wz: 57.2, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 300", h: 300, w: 100, tw: 10, tf: 16, weight: 47.0, surface: 0.949, Iy: 8030, Iz: 495, Wy: 535, Wz: 67.8, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 320", h: 320, w: 100, tw: 14, tf: 17.5, weight: 60.6, surface: 0.984, Iy: 10870, Iz: 597, Wy: 679, Wz: 80.6, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 350", h: 350, w: 100, tw: 14, tf: 16, weight: 61.8, surface: 1.05, Iy: 12840, Iz: 570, Wy: 734, Wz: 75, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 380", h: 380, w: 102, tw: 13.5, tf: 16, weight: 64.3, surface: 1.11, Iy: 15760, Iz: 615, Wy: 829, Wz: 78, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "UNP 400", h: 400, w: 110, tw: 14, tf: 18, weight: 73.2, surface: 1.18, Iy: 20350, Iz: 846, Wy: 1020, Wz: 102, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' }
];

export const MUPRO_PROFILES: StructuralProfile[] = [
    // Müpro MPR Series (Galvanized)
    {
        name: "MPR 41/21/2.0", h: 21, w: 41, tw: 2.0, tf: 2.0, weight: 1.44, Iy: 0.96, Iz: 5.75, Wy: 0.91, Wz: 2.80, vendor: 'Müpro', material: 'Galvanized', sku: '130004', standardLengths: [2, 6], loadCapacity: 'Light',
        accessories: [
            { name: "End Cap MPR 41/21", type: "cap", sku: "105804" },
            { name: "Hammer-Head Bolt M10x30", type: "bolt", sku: "110419" },
            { name: "Slide Nut M10", type: "conn", sku: "110444" }
        ]
    },
    {
        name: "MPR 41/41/2.0", h: 41, w: 41, tw: 2.0, tf: 2.0, weight: 2.10, Iy: 5.92, Iz: 9.22, Wy: 2.89, Wz: 4.56, vendor: 'Müpro', material: 'Galvanized', sku: '130014', standardLengths: [2, 6], loadCapacity: 'Medium',
        accessories: [
            { name: "End Cap MPR 41/41", type: "cap", sku: "105805" },
            { name: "Base Plate WBD Q100", type: "base_plate", sku: "131840" },
            { name: "Hammer-Head Bolt M10x30", type: "bolt", sku: "110419" },
            { name: "Slide Nut M10", type: "conn", sku: "110444" }
        ]
    },
    // Double Profile 41/41
    {
        name: "MPR 41/41/2.0 D (Double)", h: 41, w: 82, tw: 2.0, tf: 2.0, weight: 4.20, Iy: 30.2, Iz: 18.4, Wy: 14.8, Wz: 9.1, vendor: 'Müpro', material: 'Galvanized', sku: '130114', standardLengths: [6], loadCapacity: 'Heavy',
        accessories: [
            { name: "End Cap MPR 41/41 D", type: "cap", sku: "105815" },
            { name: "Base Plate WBD Double", type: "base_plate", sku: "131850" },
            { name: "Hammer-Head Bolt M12x40", type: "bolt", sku: "110435" }
        ]
    },
    {
        name: "MPR 41/62/2.5", h: 62, w: 41, tw: 2.5, tf: 2.5, weight: 3.50, Iy: 18.5, Iz: 13.5, Wy: 6.0, Wz: 6.5, vendor: 'Müpro', material: 'Galvanized', sku: '150537', standardLengths: [6], loadCapacity: 'Heavy',
        accessories: [
            { name: "End Cap MPR 41/62", type: "cap", sku: "105806" }, // Assumption based on pattern, or Generic if unknown
            { name: "Base Plate WBD Q", type: "base_plate", sku: "131842" },
            { name: "Hammer-Head Bolt M12x40", type: "bolt", sku: "110435" }
        ]
    },
    // Double Profile 41/62
    {
        name: "MPR 41/62/2.5 D (Double)", h: 62, w: 82, tw: 2.5, tf: 2.5, weight: 7.00, Iy: 95.0, Iz: 27.0, Wy: 30.6, Wz: 13.0, vendor: 'Müpro', material: 'Galvanized', sku: '150637', standardLengths: [6], loadCapacity: 'Heavy',
        accessories: [
            { name: "End Cap MPR 41/62 D", type: "cap", sku: "105816" },
            { name: "Base Plate WBD Double Heavy", type: "base_plate", sku: "131852" },
            { name: "Hammer-Head Bolt M16x50", type: "bolt", sku: "110450" }
        ]
    },
    {
        name: "MPR 82/82/3.0", h: 82, w: 82, tw: 3.0, tf: 3.0, weight: 10.5, Iy: 140.0, Iz: 140.0, Wy: 34.0, Wz: 34.0, vendor: 'Müpro', material: 'Galvanized', sku: '118390', standardLengths: [6], loadCapacity: 'Heavy',
        accessories: [
            { name: "End Cap MPR 82/82", type: "cap", sku: "118288" }, // Generic placeholder updated
            { name: "Base Plate Heavy", type: "base_plate", sku: "118700" }
        ]
    }
];

export const HEA_PROFILES: StructuralProfile[] = [
    { name: "HEA 100", h: 96, w: 100, tw: 5, tf: 8, weight: 17.0, surface: 0.561, Iy: 349, Iz: 134, Wy: 72.8, Wz: 26.8, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 120", h: 114, w: 120, tw: 5, tf: 8, weight: 20.3, surface: 0.677, Iy: 606, Iz: 231, Wy: 106, Wz: 38.5, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 140", h: 133, w: 140, tw: 5.5, tf: 8.5, weight: 25.1, surface: 0.794, Iy: 1030, Iz: 389, Wy: 155, Wz: 55.6, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 160", h: 152, w: 160, tw: 6, tf: 9, weight: 31.0, surface: 0.906, Iy: 1670, Iz: 616, Wy: 220, Wz: 76.9, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 180", h: 171, w: 180, tw: 6, tf: 9.5, weight: 36.2, surface: 1.02, Iy: 2510, Iz: 925, Wy: 294, Wz: 103, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 200", h: 190, w: 200, tw: 6.5, tf: 10, weight: 43.1, surface: 1.14, Iy: 3690, Iz: 1340, Wy: 389, Wz: 134, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 220", h: 210, w: 220, tw: 7, tf: 11, weight: 51.5, surface: 1.26, Iy: 5410, Iz: 1950, Wy: 515, Wz: 178, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 240", h: 230, w: 240, tw: 7.5, tf: 12, weight: 61.5, surface: 1.37, Iy: 7760, Iz: 2770, Wy: 675, Wz: 231, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 260", h: 250, w: 260, tw: 7.5, tf: 12.5, weight: 69.5, surface: 1.48, Iy: 10450, Iz: 3670, Wy: 836, Wz: 282, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 280", h: 270, w: 280, tw: 8, tf: 13, weight: 77.8, surface: 1.60, Iy: 13670, Iz: 4760, Wy: 1010, Wz: 340, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 300", h: 290, w: 300, tw: 8.5, tf: 14, weight: 90.0, surface: 1.72, Iy: 18260, Iz: 6310, Wy: 1260, Wz: 421, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEA 320", h: 310, w: 300, tw: 9, tf: 15.5, weight: 99.5, surface: 1.76, Iy: 22930, Iz: 6990, Wy: 1480, Wz: 466, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' }
];

export const HEB_PROFILES: StructuralProfile[] = [
    { name: "HEB 100", h: 100, w: 100, tw: 6, tf: 10, weight: 20.8, surface: 0.567, Iy: 450, Iz: 167, Wy: 90, Wz: 33.5, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEB 120", h: 120, w: 120, tw: 6.5, tf: 11, weight: 27.2, surface: 0.686, Iy: 864, Iz: 318, Wy: 144, Wz: 52.9, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEB 140", h: 140, w: 140, tw: 7, tf: 12, weight: 34.4, surface: 0.805, Iy: 1510, Iz: 550, Wy: 216, Wz: 78.5, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEB 160", h: 160, w: 160, tw: 8, tf: 13, weight: 43.4, surface: 0.918, Iy: 2490, Iz: 889, Wy: 311, Wz: 111, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEB 180", h: 180, w: 180, tw: 8.5, tf: 14, weight: 52.2, surface: 1.04, Iy: 3830, Iz: 1360, Wy: 426, Wz: 151, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEB 200", h: 200, w: 200, tw: 9, tf: 15, weight: 62.5, surface: 1.15, Iy: 5700, Iz: 2000, Wy: 570, Wz: 200, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEB 220", h: 220, w: 220, tw: 9.5, tf: 16, weight: 72.8, surface: 1.27, Iy: 8090, Iz: 2840, Wy: 736, Wz: 258, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEB 240", h: 240, w: 240, tw: 10, tf: 17, weight: 84.8, surface: 1.38, Iy: 11260, Iz: 3920, Wy: 938, Wz: 327, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEB 260", h: 260, w: 260, tw: 10, tf: 17.5, weight: 94.8, surface: 1.50, Iy: 14920, Iz: 5130, Wy: 1150, Wz: 395, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEB 280", h: 280, w: 280, tw: 10.5, tf: 18, weight: 105, surface: 1.62, Iy: 19270, Iz: 6590, Wy: 1380, Wz: 471, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "HEB 300", h: 300, w: 300, tw: 11, tf: 19, weight: 119, surface: 1.73, Iy: 25170, Iz: 8560, Wy: 1680, Wz: 571, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' }
];

export const IPE_PROFILES: StructuralProfile[] = [
    { name: "IPE 80", h: 80, w: 46, tw: 3.8, tf: 5.2, weight: 6.11, surface: 0.328, Iy: 80.1, Iz: 8.49, Wy: 20.0, Wz: 3.69, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 100", h: 100, w: 55, tw: 4.1, tf: 5.7, weight: 8.26, surface: 0.400, Iy: 171, Iz: 15.9, Wy: 34.2, Wz: 5.79, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 120", h: 120, w: 64, tw: 4.4, tf: 6.3, weight: 10.6, surface: 0.475, Iy: 318, Iz: 27.7, Wy: 53.0, Wz: 8.65, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 140", h: 140, w: 73, tw: 4.7, tf: 6.9, weight: 13.1, surface: 0.551, Iy: 541, Iz: 44.9, Wy: 77.3, Wz: 12.3, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 160", h: 160, w: 82, tw: 5, tf: 7.4, weight: 16.1, surface: 0.623, Iy: 869, Iz: 68.3, Wy: 109, Wz: 16.7, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 180", h: 180, w: 91, tw: 5.3, tf: 8, weight: 19.2, surface: 0.698, Iy: 1317, Iz: 101, Wy: 146, Wz: 22.2, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 200", h: 200, w: 100, tw: 5.6, tf: 8.5, weight: 22.8, surface: 0.768, Iy: 1943, Iz: 142, Wy: 194, Wz: 28.5, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 220", h: 220, w: 110, tw: 5.9, tf: 9.2, weight: 26.7, surface: 0.848, Iy: 2772, Iz: 205, Wy: 252, Wz: 37.3, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 240", h: 240, w: 120, tw: 6.2, tf: 9.8, weight: 31.3, surface: 0.922, Iy: 3892, Iz: 284, Wy: 324, Wz: 47.3, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 270", h: 270, w: 135, tw: 6.6, tf: 10.2, weight: 36.8, surface: 1.04, Iy: 5790, Iz: 420, Wy: 429, Wz: 62.2, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 300", h: 300, w: 150, tw: 7.1, tf: 10.7, weight: 43.0, surface: 1.16, Iy: 8356, Iz: 604, Wy: 557, Wz: 80.5, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 330", h: 330, w: 160, tw: 7.5, tf: 11.5, weight: 50.1, surface: 1.25, Iy: 11770, Iz: 788, Wy: 713, Wz: 98.5, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' },
    { name: "IPE 360", h: 360, w: 170, tw: 8, tf: 12.7, weight: 58.2, surface: 1.35, Iy: 16270, Iz: 1040, Wy: 904, Wz: 123, vendor: 'Generic', material: 'S235', loadCapacity: 'Heavy' }
];

export const STRUT_PROFILES: StructuralProfile[] = [
    // OBO US Series (U-Stiel) Standards
    {
        name: "US 3 (50x30)", h: 30, w: 50, tw: 2.0, tf: 2.0, weight: 1.83, surface: 0.22, Iy: 6.2, Iz: 8.5, Wy: 2.9, Wz: 4.1, vendor: 'OBO', material: 'Galvanized', loadCapacity: 'Medium',
        accessories: [
            { name: "Head Plate KU 3", type: "base_plate", sku: "6348874", image: "base" },
            { name: "Protective Cap US 3", type: "cap", sku: "6338458" },
            { name: "Wall Bracket AW 15", type: "conn", sku: "6420680" } // Compatible light bracket
        ]
    },
    {
        name: "US 5 (50x50)", h: 50, w: 50, tw: 2.5, tf: 2.5, weight: 2.65, surface: 0.30, Iy: 13.5, Iz: 13.5, Wy: 5.4, Wz: 5.4, vendor: 'OBO', material: 'Galvanized', loadCapacity: 'Medium',
        accessories: [
            { name: "Head Plate KUS 5", type: "base_plate", sku: "6348904", image: "base" },
            { name: "Protective Cap US 5", type: "cap", sku: "6338462" },
            { name: "Wall Bracket AW 30", type: "conn", sku: "6419704" }
        ]
    },
    {
        name: "US 7 (50x70)", h: 70, w: 50, tw: 4.0, tf: 4.0, weight: 5.20, surface: 0.38, Iy: 25.1, Iz: 16.8, Wy: 7.2, Wz: 6.7, vendor: 'OBO', material: 'Galvanized', loadCapacity: 'Heavy',
        accessories: [
            { name: "Head Plate KU 7", type: "base_plate", sku: "6349102", image: "base" },
            { name: "Protective Cap US 7", type: "cap", sku: "6338466" },
            { name: "Heavy Wall Bracket AW 55", type: "conn", sku: "6418554" }
        ]
    },

    // Niedax U-Profiles (Romania/EU Market)
    {
        name: "Niedax U 50 (50x22)", h: 22, w: 50, tw: 2.0, tf: 2.0, weight: 1.25, surface: 0.18, Iy: 2.5, Iz: 6.0, Wy: 2.0, Wz: 3.5, vendor: 'Generic', material: 'Galvanized', loadCapacity: 'Light',
        accessories: [
            { name: "Console KTA 100", type: "conn", sku: "KTA 100" },
            { name: "Console KTA 200", type: "conn", sku: "KTA 200" }
        ]
    },
    {
        name: "Niedax U 50/50", h: 50, w: 50, tw: 2.5, tf: 2.5, weight: 2.43, surface: 0.30, Iy: 12.0, Iz: 15.0, Wy: 5.2, Wz: 5.5, vendor: 'Generic', material: 'Galvanized', loadCapacity: 'Medium',
        accessories: [
            { name: "Console KTA 300", type: "conn", sku: "KTA 300" },
            { name: "Console KTA 400", type: "conn", sku: "KTA 400" },
            { name: "Protective Cap K 50", type: "cap", sku: "K 50" }
        ]
    },
    {
        name: "Niedax U 60/40", h: 60, w: 40, tw: 4.0, tf: 4.0, weight: 3.40, surface: 0.25, Iy: 18.0, Iz: 10.0, Wy: 6.5, Wz: 4.5, vendor: 'Generic', material: 'Galvanized', loadCapacity: 'Heavy',
        accessories: [
            { name: "Console KTA 500", type: "conn", sku: "KTA 500" },
            { name: "Console KTA 600", type: "conn", sku: "KTA 600" }
        ]
    },

    // Hilti MQ System Equivalents (Reference)
    { name: "MQ-21 (41x21)", h: 21, w: 41, tw: 2.0, tf: 2.0, weight: 1.50, surface: 0.12, Iy: 1.83, Iz: 6.42, Wy: 1.48, Wz: 3.13, vendor: 'Hilti', material: 'Galvanized', loadCapacity: 'Medium' },
    { name: "MQ-41 (41x41)", h: 41, w: 41, tw: 2.0, tf: 2.0, weight: 2.10, surface: 0.16, Iy: 6.34, Iz: 9.32, Wy: 2.97, Wz: 4.54, vendor: 'Hilti', material: 'Galvanized', loadCapacity: 'Medium' },
    { name: "MQ-52 (41x52)", h: 52, w: 41, tw: 2.5, tf: 2.5, weight: 3.20, surface: 0.18, Iy: 12.5, Iz: 14.1, Wy: 4.8, Wz: 6.8, vendor: 'Hilti', material: 'Galvanized', loadCapacity: 'Medium' },
    { name: "MQ-72 (41x72)", h: 72, w: 41, tw: 2.75, tf: 2.75, weight: 4.80, surface: 0.23, Iy: 28.3, Iz: 18.2, Wy: 7.8, Wz: 8.9, vendor: 'Hilti', material: 'Galvanized', loadCapacity: 'Medium' },

    // Double / Special
    {
        name: "US 7D (Double 50x140)", h: 140, w: 50, tw: 4.0, tf: 4.0, weight: 10.4, surface: 0.70, Iy: 200, Iz: 33.6, Wy: 35, Wz: 13.4, vendor: 'OBO', material: 'Galvanized', loadCapacity: 'Heavy',
        accessories: [
            { name: "Head Plate KU 7 D", type: "base_plate", sku: "6349152", image: "base" }
        ]
    },
];
