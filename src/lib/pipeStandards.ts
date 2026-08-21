
export interface PipeDimension {
    dn: string;      // "DN15" or "20mm"
    inch: string;    // "1/2\""
    od: number;      // Outer Diameter (mm)
    thickness: number; // Wall Thickness (mm)
    id: number;      // Internal Diameter (mm)
    weight: number;  // Weight (kg/m) empty
    insulatedOd?: number; // Outer Diameter with Insulation (mm)
    supportSpacing?: {
        water: number; // max span in meters (fluid filled)
        gas?: number;  // max span in meters (gas/air)
    };
}

export interface PipeStandard {
    label: string;
    description: string;
    category: 'metal' | 'plastic' | 'special'; // Added for grouping
    material?: string;
    maxPressure?: number; // bar
    tempRange?: { min: number; max: number }; // Celsius
    insulationType?: string;
    thermalExpansion?: number; // mm / (m * K)
    roughness?: number; // mm (absolute roughness)
    dimensions: PipeDimension[];
}

const BASE_PIPE_STANDARDS: Record<string, PipeStandard> = {
    // --- METALS ---
    steel_light: {
        label: "Oțel - Ușoară (Light II)",
        description: "EN 10255 - Seria Ușoară",
        category: 'metal',
        material: "Carbon Steel",
        maxPressure: 16,
        tempRange: { min: -20, max: 300 },
        dimensions: [
            { dn: "DN10", inch: "3/8\"", od: 17.2, thickness: 1.8, id: 13.6, weight: 0.67 },
            { dn: "DN15", inch: "1/2\"", od: 21.3, thickness: 2.0, id: 17.3, weight: 0.95 },
            { dn: "DN20", inch: "3/4\"", od: 26.9, thickness: 2.3, id: 22.3, weight: 1.38 },
            { dn: "DN25", inch: "1\"", od: 33.7, thickness: 2.6, id: 28.5, weight: 1.98 },
            { dn: "DN32", inch: "1 1/4\"", od: 42.4, thickness: 2.6, id: 37.2, weight: 2.54 },
            { dn: "DN40", inch: "1 1/2\"", od: 48.3, thickness: 2.9, id: 42.5, weight: 3.23 },
            { dn: "DN50", inch: "2\"", od: 60.3, thickness: 2.9, id: 54.5, weight: 4.08 },
            { dn: "DN65", inch: "2 1/2\"", od: 76.1, thickness: 3.2, id: 69.7, weight: 5.71 },
            { dn: "DN80", inch: "3\"", od: 88.9, thickness: 3.2, id: 82.5, weight: 6.72 },
            { dn: "DN100", inch: "4\"", od: 114.3, thickness: 3.6, id: 107.1, weight: 9.75 },
        ]
    },
    steel_medium: {
        label: "Oțel - Medie (+Brezner)",
        description: "EN 10255 Medie / EN 10216 (DN125+)",
        category: 'metal',
        material: "Carbon Steel",
        maxPressure: 25,
        tempRange: { min: -20, max: 300 },
        dimensions: [
            { dn: "DN15", inch: "1/2\"", od: 21.3, thickness: 2.6, id: 16.1, weight: 1.22 },
            { dn: "DN20", inch: "3/4\"", od: 26.9, thickness: 2.6, id: 21.7, weight: 1.58 },
            { dn: "DN25", inch: "1\"", od: 33.7, thickness: 3.2, id: 27.3, weight: 2.44 },
            { dn: "DN32", inch: "1 1/4\"", od: 42.4, thickness: 3.2, id: 36.0, weight: 3.14 },
            { dn: "DN40", inch: "1 1/2\"", od: 48.3, thickness: 3.2, id: 41.9, weight: 3.61 },
            { dn: "DN50", inch: "2\"", od: 60.3, thickness: 3.6, id: 53.1, weight: 5.10 },
            { dn: "DN65", inch: "2 1/2\"", od: 76.1, thickness: 3.6, id: 68.9, weight: 6.51 },
            { dn: "DN80", inch: "3\"", od: 88.9, thickness: 4.0, id: 80.9, weight: 8.47 },
            { dn: "DN100", inch: "4\"", od: 114.3, thickness: 4.5, id: 105.3, weight: 12.10 },
            { dn: "DN125", inch: "5\"", od: 139.7, thickness: 4.0, id: 131.7, weight: 13.5 },
            { dn: "DN150", inch: "6\"", od: 168.3, thickness: 4.5, id: 159.3, weight: 18.2 },
            { dn: "DN200", inch: "8\"", od: 219.1, thickness: 6.3, id: 206.5, weight: 33.0 },
            { dn: "DN250", inch: "10\"", od: 273.0, thickness: 6.3, id: 260.4, weight: 41.4 },
            { dn: "DN300", inch: "12\"", od: 323.9, thickness: 7.1, id: 309.7, weight: 55.4 },
            { dn: "DN350", inch: "14\"", od: 355.6, thickness: 8.0, id: 339.6, weight: 68.6 },
            { dn: "DN400", inch: "16\"", od: 406.4, thickness: 8.8, id: 388.8, weight: 86.2 },
        ]
    },
    steel_heavy: {
        label: "Oțel - Grea (Heavy)",
        description: "EN 10255 Grea / SCH40/80",
        category: 'metal',
        material: "Carbon Steel / Seamless",
        maxPressure: 40,
        tempRange: { min: -20, max: 400 },
        thermalExpansion: 0.012, // mm/mK
        roughness: 0.045, // mm
        dimensions: [
            { dn: "DN15", inch: "1/2\"", od: 21.3, thickness: 2.77, id: 15.8, weight: 1.27, supportSpacing: { water: 1.5 } },
            { dn: "DN20", inch: "3/4\"", od: 26.7, thickness: 2.87, id: 21.0, weight: 1.69, supportSpacing: { water: 2.0 } },
            { dn: "DN25", inch: "1\"", od: 33.4, thickness: 3.38, id: 26.6, weight: 2.50, supportSpacing: { water: 2.5 } },
            { dn: "DN32", inch: "1-1/4\"", od: 42.2, thickness: 3.56, id: 35.1, weight: 3.39, supportSpacing: { water: 2.5 } },
            { dn: "DN40", inch: "1-1/2\"", od: 48.3, thickness: 3.68, id: 40.9, weight: 4.05, supportSpacing: { water: 3.0 } },
            { dn: "DN50", inch: "2\"", od: 60.3, thickness: 3.91, id: 52.5, weight: 5.44, supportSpacing: { water: 3.0 } },
            { dn: "DN65", inch: "2-1/2\"", od: 73.0, thickness: 5.16, id: 62.7, weight: 8.63, supportSpacing: { water: 4.0 } },
            { dn: "DN80", inch: "3\"", od: 88.9, thickness: 5.49, id: 77.9, weight: 11.29, supportSpacing: { water: 4.0 } },
            { dn: "DN100", inch: "4\"", od: 114.3, thickness: 6.02, id: 102.3, weight: 16.07, supportSpacing: { water: 4.5 } },
            { dn: "DN125", inch: "5\"", od: 141.3, thickness: 6.55, id: 128.2, weight: 21.77, supportSpacing: { water: 5.0 } },
            { dn: "DN150", inch: "6\"", od: 168.3, thickness: 7.11, id: 154.1, weight: 28.26, supportSpacing: { water: 6.0 } },
            { dn: "DN200", inch: "8\"", od: 219.1, thickness: 8.18, id: 202.7, weight: 42.55, supportSpacing: { water: 7.0 } },
            { dn: "DN250", inch: "10\"", od: 273.0, thickness: 9.27, id: 254.5, weight: 60.31, supportSpacing: { water: 8.0 } },
            { dn: "DN300", inch: "12\"", od: 323.9, thickness: 10.31, id: 303.2, weight: 79.73, supportSpacing: { water: 9.0 } },
            // Extended dimensions up to DN600
            { dn: "DN350", inch: "14\"", od: 355.6, thickness: 11.1, id: 333.4, weight: 94.5, supportSpacing: { water: 9.0 } },
            { dn: "DN400", inch: "16\"", od: 406.4, thickness: 12.7, id: 381.0, weight: 123.0, supportSpacing: { water: 10.0 } },
            { dn: "DN450", inch: "18\"", od: 457.2, thickness: 14.3, id: 428.6, weight: 156.0, supportSpacing: { water: 10.0 } },
            { dn: "DN500", inch: "20\"", od: 508.0, thickness: 15.1, id: 477.8, weight: 184.0, supportSpacing: { water: 10.0 } },
            { dn: "DN600", inch: "24\"", od: 609.6, thickness: 17.5, id: 574.6, weight: 257.0, supportSpacing: { water: 12.0 } },
        ]
    },
    inox_press: {
        label: "Inox Press / Mapress (EN 10312)",
        description: "Oțel Inoxidabil (AISI 316/304) Subțire",
        category: 'metal',
        material: "Stainless Steel 304/316",
        maxPressure: 16,
        tempRange: { min: -20, max: 120 },
        thermalExpansion: 0.016, // mm/mK
        roughness: 0.015,
        dimensions: [
            { dn: "DN15", inch: "1/2\"", od: 15, thickness: 1.0, id: 13.0, weight: 0.35, supportSpacing: { water: 1.5 } },
            { dn: "DN18", inch: "3/4\"", od: 18, thickness: 1.0, id: 16.0, weight: 0.45, supportSpacing: { water: 1.5 } },
            { dn: "DN22", inch: "7/8\"", od: 22, thickness: 1.2, id: 19.6, weight: 0.65, supportSpacing: { water: 2.0 } },
            { dn: "DN28", inch: "1\"", od: 28, thickness: 1.2, id: 25.6, weight: 0.85, supportSpacing: { water: 2.0 } },
            { dn: "DN35", inch: "1-1/4\"", od: 35, thickness: 1.5, id: 32.0, weight: 1.30, supportSpacing: { water: 2.5 } },
            { dn: "DN42", inch: "1-1/2\"", od: 42, thickness: 1.5, id: 39.0, weight: 1.60, supportSpacing: { water: 2.5 } },
            { dn: "DN54", inch: "2\"", od: 54, thickness: 1.5, id: 51.0, weight: 2.10, supportSpacing: { water: 3.0 } },
            { dn: "DN76.1", inch: "2-1/2\"", od: 76.1, thickness: 2.0, id: 72.1, weight: 3.80, supportSpacing: { water: 3.5 } },
            { dn: "DN88.9", inch: "3\"", od: 88.9, thickness: 2.0, id: 84.9, weight: 4.50, supportSpacing: { water: 4.0 } },
            { dn: "DN108", inch: "4\"", od: 108.0, thickness: 2.0, id: 104.0, weight: 5.50, supportSpacing: { water: 4.5 } },
        ]
    },
    copper: {
        label: "Cupru (EN 1057)",
        description: "Țeavă Cupru Semidur/Dur",
        category: 'metal',
        material: "Copper EN 1057",
        maxPressure: 25,
        tempRange: { min: -40, max: 150 },
        dimensions: [
            { dn: "15mm", inch: "1/2\"", od: 15, thickness: 0.7, id: 13.6, weight: 0.28 },
            { dn: "18mm", inch: "5/8\"", od: 18, thickness: 0.7, id: 16.6, weight: 0.34 },
            { dn: "22mm", inch: "3/4\"", od: 22, thickness: 0.7, id: 20.6, weight: 0.42 },
            { dn: "28mm", inch: "1\"", od: 28, thickness: 1.0, id: 26.0, weight: 0.75 },
            { dn: "35mm", inch: "1 1/4\"", od: 35, thickness: 1.0, id: 33.0, weight: 0.95 },
            { dn: "42mm", inch: "1 1/2\"", od: 42, thickness: 1.0, id: 40.0, weight: 1.15 },
            { dn: "54mm", inch: "2\"", od: 54, thickness: 1.2, id: 51.6, weight: 1.77 },
        ]
    },

    // --- PLASTICS ---
    ppr_pn20: {
        label: "PPR - PN20 (SDR 6)",
        description: "Polipropilenă pentru Apă Caldă/Încălzire",
        category: 'plastic',
        material: "Polypropylene Random Copolymer",
        maxPressure: 20,
        tempRange: { min: 0, max: 80 },
        dimensions: [
            { dn: "20mm", inch: "1/2\"", od: 20, thickness: 3.4, id: 13.2, weight: 0.17 },
            { dn: "25mm", inch: "3/4\"", od: 25, thickness: 4.2, id: 16.6, weight: 0.27 },
            { dn: "32mm", inch: "1\"", od: 32, thickness: 5.4, id: 21.2, weight: 0.43 },
            { dn: "40mm", inch: "1 1/4\"", od: 40, thickness: 6.7, id: 26.6, weight: 0.67 },
            { dn: "50mm", inch: "1 1/2\"", od: 50, thickness: 8.3, id: 33.4, weight: 1.05 },
            { dn: "63mm", inch: "2\"", od: 63, thickness: 10.5, id: 42.0, weight: 1.65 },
            { dn: "75mm", inch: "2 1/2\"", od: 75, thickness: 12.5, id: 50.0, weight: 2.35 },
            { dn: "90mm", inch: "3\"", od: 90, thickness: 15.0, id: 60.0, weight: 3.35 },
            { dn: "110mm", inch: "4\"", od: 110, thickness: 18.3, id: 73.4, weight: 5.00 },
        ]
    },
    pehd_sdr17: {
        label: "PEHD - PE100 SDR 17",
        description: "Polietilenă Apă Rece / Infrastructură",
        category: 'plastic',
        material: "PE100 High Density",
        maxPressure: 10,
        tempRange: { min: -40, max: 40 },
        dimensions: [
            { dn: "32mm", inch: "1\"", od: 32, thickness: 2.0, id: 28.0, weight: 0.20 },
            { dn: "40mm", inch: "1 1/4\"", od: 40, thickness: 2.4, id: 35.2, weight: 0.30 },
            { dn: "50mm", inch: "1 1/2\"", od: 50, thickness: 3.0, id: 44.0, weight: 0.46 },
            { dn: "63mm", inch: "2\"", od: 63, thickness: 3.7, id: 55.6, weight: 0.66 },
            { dn: "75mm", inch: "2 1/2\"", od: 75, thickness: 4.5, id: 66.0, weight: 1.02 },
            { dn: "90mm", inch: "3\"", od: 90, thickness: 5.4, id: 79.2, weight: 1.46 },
            { dn: "110mm", inch: "4\"", od: 110, thickness: 6.6, id: 96.8, weight: 2.18 },
        ]
    },
    pvc_u_pn16: {
        label: "PVC-U (GF/Georg Fischer) PN16",
        description: "Industrial PVC Metric, PN16",
        category: 'plastic',
        material: "PVC-U Rigid",
        maxPressure: 16,
        tempRange: { min: 0, max: 60 },
        dimensions: [
            { dn: "d16", inch: "-", od: 16, thickness: 1.5, id: 13.0, weight: 0.11 },
            { dn: "d20", inch: "-", od: 20, thickness: 1.5, id: 17.0, weight: 0.14 },
            { dn: "d25", inch: "-", od: 25, thickness: 1.9, id: 21.2, weight: 0.22 },
            { dn: "d32", inch: "-", od: 32, thickness: 2.4, id: 27.2, weight: 0.35 },
            { dn: "d40", inch: "-", od: 40, thickness: 3.0, id: 34.0, weight: 0.55 },
            { dn: "d50", inch: "-", od: 50, thickness: 3.7, id: 42.6, weight: 0.84 },
            { dn: "d63", inch: "-", od: 63, thickness: 4.7, id: 53.6, weight: 1.35 },
            { dn: "d75", inch: "-", od: 75, thickness: 5.6, id: 63.8, weight: 1.93 },
            { dn: "d90", inch: "-", od: 90, thickness: 6.7, id: 76.6, weight: 2.75 },
            { dn: "d110", inch: "-", od: 110, thickness: 8.1, id: 93.8, weight: 4.09 },
            { dn: "d160", inch: "-", od: 160, thickness: 11.8, id: 136.4, weight: 8.60 },
        ]
    },

    // --- GEORGE FISCHER SPECIALS ---
    gf_coolfit_2_0: {
        label: "GF COOL-FIT 2.0 (PE100 SDR11)",
        description: "Pre-izolat pentru răcire / apă gheață / glicol — d32–d140 (DN25–DN125), PN16",
        category: 'special',
        material: "PE100 (EN ISO 15494)",
        maxPressure: 16, // bar, SDR11
        tempRange: { min: 0, max: 60 },
        thermalExpansion: 0.18, // PE (mm/m·K)
        roughness: 0.007,
        insulationType: "GF HE Foam (λ 0.022 W/mK)",
        dimensions: [
            // Sursă: broșura oficială GF COOL-FIT 2.0 2026 (d, D, di, greutate completă kg/m cu manta)
            { dn: "d32", inch: "1\"", od: 32, thickness: 2.9, id: 26.2, weight: 1.140, insulatedOd: 75, supportSpacing: { water: 1.2 } },
            { dn: "d40", inch: "1 1/4\"", od: 40, thickness: 3.7, id: 32.6, weight: 1.534, insulatedOd: 90, supportSpacing: { water: 1.3 } },
            { dn: "d50", inch: "1 1/2\"", od: 50, thickness: 4.6, id: 40.8, weight: 1.722, insulatedOd: 90, supportSpacing: { water: 1.5 } },
            { dn: "d63", inch: "2\"", od: 63, thickness: 5.8, id: 51.4, weight: 2.711, insulatedOd: 110, supportSpacing: { water: 1.6 } },
            { dn: "d75", inch: "2 1/2\"", od: 75, thickness: 6.8, id: 61.4, weight: 3.405, insulatedOd: 125, supportSpacing: { water: 1.75 } },
            { dn: "d90", inch: "3\"", od: 90, thickness: 8.2, id: 73.6, weight: 4.320, insulatedOd: 140, supportSpacing: { water: 1.85 } },
            { dn: "d110", inch: "4\"", od: 110, thickness: 10.0, id: 90.0, weight: 5.692, insulatedOd: 160, supportSpacing: { water: 2.0 } },
            { dn: "d140", inch: "5\"", od: 140, thickness: 12.7, id: 114.6, weight: 9.021, insulatedOd: 200, supportSpacing: { water: 2.2 } },
        ]
    },
    gf_coolfit_4_0: {
        label: "GF COOL-FIT 4.0 (PE100 SDR11/SDR17)",
        description: "Industrial Cooling pre-izolat — d32–d450 (DN25–DN450). SDR11 PN16 (d32–d140), SDR17 PN10 (d160–d450)",
        category: 'special',
        material: "PE100 (EN ISO 15494)",
        maxPressure: 16, // bar (SDR11); SDR17 → PN10
        tempRange: { min: -50, max: 60 },
        thermalExpansion: 0.18, // PE (mm/m·K)
        roughness: 0.007,
        insulationType: "GF HE Foam (λ 0.022–0.026 W/mK)",
        dimensions: [
            // Sursă: fișa tehnică oficială GF COOL-FIT 4.0 2026 (d32–d450, greutăți complete kg/m)
            { dn: "d32", inch: "1\"", od: 32, thickness: 2.9, id: 26.2, weight: 1.40, insulatedOd: 90, supportSpacing: { water: 1.2 } },
            { dn: "d40", inch: "1 1/4\"", od: 40, thickness: 3.7, id: 32.6, weight: 2.02, insulatedOd: 110, supportSpacing: { water: 1.3 } },
            { dn: "d50", inch: "1 1/2\"", od: 50, thickness: 4.6, id: 40.8, weight: 2.19, insulatedOd: 110, supportSpacing: { water: 1.5 } },
            { dn: "d63", inch: "2\"", od: 63, thickness: 5.8, id: 51.4, weight: 2.94, insulatedOd: 125, supportSpacing: { water: 1.6 } },
            { dn: "d75", inch: "2 1/2\"", od: 75, thickness: 6.8, id: 61.4, weight: 3.70, insulatedOd: 140, supportSpacing: { water: 1.75 } },
            { dn: "d90", inch: "3\"", od: 90, thickness: 8.2, id: 73.6, weight: 4.75, insulatedOd: 160, supportSpacing: { water: 1.85 } },
            { dn: "d110", inch: "4\"", od: 110, thickness: 10.0, id: 90.0, weight: 6.12, insulatedOd: 180, supportSpacing: { water: 2.0 } },
            { dn: "d140", inch: "5\"", od: 140, thickness: 12.7, id: 114.6, weight: 9.68, insulatedOd: 225, supportSpacing: { water: 2.2 } },
            // SDR17 (PN10) — gama mare
            { dn: "d160", inch: "6\"", od: 160, thickness: 9.5, id: 141.0, weight: 9.921, insulatedOd: 250, supportSpacing: { water: 2.3 } },
            { dn: "d225", inch: "8\"", od: 225, thickness: 13.4, id: 198.2, weight: 16.620, insulatedOd: 315, supportSpacing: { water: 2.6 } },
            { dn: "d250", inch: "10\"", od: 250, thickness: 14.8, id: 220.4, weight: 18.180, insulatedOd: 355, supportSpacing: { water: 2.7 } },
            { dn: "d280", inch: "10\"", od: 280, thickness: 16.6, id: 246.8, weight: 22.640, insulatedOd: 400, supportSpacing: { water: 2.8 } },
            { dn: "d315", inch: "12\"", od: 315, thickness: 18.7, id: 277.6, weight: 28.510, insulatedOd: 450, supportSpacing: { water: 2.9 } },
            { dn: "d355", inch: "14\"", od: 355, thickness: 21.1, id: 312.8, weight: 35.350, insulatedOd: 500, supportSpacing: { water: 3.0 } },
            { dn: "d400", inch: "16\"", od: 400, thickness: 23.7, id: 352.6, weight: 44.070, insulatedOd: 560, supportSpacing: { water: 3.1 } },
            { dn: "d450", inch: "18\"", od: 450, thickness: 26.7, id: 396.6, weight: 55.490, insulatedOd: 630, supportSpacing: { water: 3.2 } },
        ]

    },

    // --- PRODUCĂTORI EUROPA (verificate EN ISO 15875 / KIWA) ---
    uponor_pexa_sdr73: {
        label: "Uponor PE-Xa (SDR 7.3)",
        description: "Combi Pipe PE-Xa cu barieră EVOH — apă caldă/răcire, dimensiuni conform certificat KIWA / EN ISO 15875",
        category: 'plastic',
        material: "PE-Xa (DIN 16892 / EN ISO 15875)",
        maxPressure: 6, // bar (Clasa 2/4/5 conform marcaj Uponor)
        tempRange: { min: 0, max: 80 },
        thermalExpansion: 0.14, // mm/m·K (PE-Xa)
        roughness: 0.007,
        dimensions: [
            { dn: "16mm", inch: "1/2\"", od: 16, thickness: 2.2, id: 11.6, weight: 0.093 },
            { dn: "20mm", inch: "3/4\"", od: 20, thickness: 2.8, id: 14.4, weight: 0.148 },
            { dn: "25mm", inch: "1\"", od: 25, thickness: 3.5, id: 18.0, weight: 0.233 },
            { dn: "32mm", inch: "1 1/4\"", od: 32, thickness: 4.4, id: 23.2, weight: 0.381 },
            { dn: "40mm", inch: "1 1/2\"", od: 40, thickness: 5.5, id: 29.0, weight: 0.595 },
            { dn: "50mm", inch: "2\"", od: 50, thickness: 6.9, id: 36.2, weight: 0.934 },
            { dn: "63mm", inch: "2 1/2\"", od: 63, thickness: 8.6, id: 45.8, weight: 1.481 },
            { dn: "75mm", inch: "3\"", od: 75, thickness: 10.3, id: 54.4, weight: 2.120 },
            { dn: "90mm", inch: "3 1/2\"", od: 90, thickness: 12.3, id: 65.4, weight: 3.038 },
            { dn: "110mm", inch: "4\"", od: 110, thickness: 15.1, id: 79.8, weight: 4.601 },
        ]
    },

    // --- PRODUCĂTORI ROMÂNIA ---
    pipelife_pe100_sdr11: {
        label: "Pipelife România — PE100 SDR11 (PN16)",
        description: "Țeavă PE100 pentru apă/rețele industriale, EN ISO 15494 — produs în România",
        category: 'plastic',
        material: "PE100 (EN ISO 15494)",
        maxPressure: 16,
        tempRange: { min: -40, max: 40 },
        thermalExpansion: 0.18,
        roughness: 0.007,
        dimensions: [
            { dn: "32mm", inch: "1\"", od: 32, thickness: 3.0, id: 26.0, weight: 0.261 },
            { dn: "40mm", inch: "1 1/4\"", od: 40, thickness: 3.7, id: 32.6, weight: 0.403 },
            { dn: "50mm", inch: "1 1/2\"", od: 50, thickness: 4.6, id: 40.8, weight: 0.627 },
            { dn: "63mm", inch: "2\"", od: 63, thickness: 5.8, id: 51.4, weight: 0.995 },
            { dn: "75mm", inch: "2 1/2\"", od: 75, thickness: 6.8, id: 61.4, weight: 1.393 },
            { dn: "90mm", inch: "3\"", od: 90, thickness: 8.2, id: 73.6, weight: 2.013 },
            { dn: "110mm", inch: "4\"", od: 110, thickness: 10.0, id: 90.0, weight: 3.001 },
            { dn: "125mm", inch: "5\"", od: 125, thickness: 11.4, id: 102.2, weight: 3.888 },
            { dn: "140mm", inch: "5 1/2\"", od: 140, thickness: 12.7, id: 114.6, weight: 4.855 },
            { dn: "160mm", inch: "6\"", od: 160, thickness: 14.6, id: 130.8, weight: 6.373 },
            { dn: "180mm", inch: "7\"", od: 180, thickness: 16.4, id: 147.2, weight: 8.052 },
            { dn: "200mm", inch: "8\"", od: 200, thickness: 18.2, id: 163.6, weight: 9.940 },
        ]
    },
    valrom_ppr_pn20: {
        label: "Valrom România — PPR PN20 (SDR 6)",
        description: "Țeavă polipropilenă PPR pentru apă caldă/încălzire, EN ISO 15874 — produs în România",
        category: 'plastic',
        material: "PPR (EN ISO 15874)",
        maxPressure: 20,
        tempRange: { min: 0, max: 80 },
        thermalExpansion: 0.15,
        roughness: 0.007,
        dimensions: [
            { dn: "20mm", inch: "1/2\"", od: 20, thickness: 3.4, id: 13.2, weight: 0.161 },
            { dn: "25mm", inch: "3/4\"", od: 25, thickness: 4.2, id: 16.6, weight: 0.250 },
            { dn: "32mm", inch: "1\"", od: 32, thickness: 5.4, id: 21.2, weight: 0.411 },
            { dn: "40mm", inch: "1 1/4\"", od: 40, thickness: 6.7, id: 26.6, weight: 0.637 },
            { dn: "50mm", inch: "1 1/2\"", od: 50, thickness: 8.3, id: 33.4, weight: 0.989 },
            { dn: "63mm", inch: "2\"", od: 63, thickness: 10.5, id: 42.0, weight: 1.575 },
            { dn: "75mm", inch: "2 1/2\"", od: 75, thickness: 12.5, id: 50.0, weight: 2.234 },
            { dn: "90mm", inch: "3\"", od: 90, thickness: 15.0, id: 60.0, weight: 3.214 },
            { dn: "110mm", inch: "4\"", od: 110, thickness: 18.3, id: 73.4, weight: 4.794 },
            { dn: "125mm", inch: "5\"", od: 125, thickness: 20.8, id: 83.4, weight: 6.196 },
            { dn: "140mm", inch: "5 1/2\"", od: 140, thickness: 23.3, id: 93.4, weight: 7.772 },
            { dn: "160mm", inch: "6\"", od: 160, thickness: 26.6, id: 106.8, weight: 10.140 },
        ]
    },
};

// ============================================================================
// Override local (pentru pagina „Standarde Țevi”):
// utilizatorul poate corecta datele din interfață; override-ul e aplicat
// peste valorile implicite (care sunt cele verificate/oficiale).
// ============================================================================

const OVERRIDE_KEY = 'pipe_standards_user_override_v1';

// Cache pentru override (citit o singură dată din localStorage, invalidat la save/reset)
let overrideCache: Record<string, PipeStandard> | null = null;

function readOverride(): Record<string, PipeStandard> | null {
    if (typeof window === 'undefined') return null;
    if (overrideCache !== null) return overrideCache;
    try {
        const raw = window.localStorage.getItem(OVERRIDE_KEY);
        if (!raw) { overrideCache = null; return null; }
        const parsed = JSON.parse(raw);
        overrideCache = parsed && typeof parsed === 'object' ? parsed : null;
        return overrideCache;
    } catch {
        return null;
    }
}

function writeOverride(data: Record<string, PipeStandard>): void {
    overrideCache = data;
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(OVERRIDE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Nu s-a putut salva override-ul de țevi:', e);
    }
}

/** Standardele efective = implicite + override local (dacă există). */
export function getPipeStandards(): Record<string, PipeStandard> {
    const override = readOverride();
    if (!override) return { ...BASE_PIPE_STANDARDS };
    return { ...BASE_PIPE_STANDARDS, ...override };
}

/**
 * PIPE_STANDARDS — vedere UNIFICATĂ (implicite + override local).
 * Este un Proxy dinamic: orice citire (indexare, Object.entries, Object.values)
 * reflectă modificările salvate din pagina „Standarde Țevi" — fără a modifica
 * niciun consumator. Calculele folosesc deci întotdeauna datele curente.
 */
export const PIPE_STANDARDS: Record<string, PipeStandard> = new Proxy(BASE_PIPE_STANDARDS, {
    get(target, prop) {
        if (typeof prop === 'string') {
            const merged = getPipeStandards();
            if (prop in merged) return merged[prop];
        }
        return Reflect.get(target, prop);
    },
    has(target, prop) {
        return prop in getPipeStandards();
    },
    ownKeys() {
        return Reflect.ownKeys(getPipeStandards());
    },
    getOwnPropertyDescriptor(target, prop) {
        return Reflect.getOwnPropertyDescriptor(getPipeStandards(), prop);
    },
}) as Record<string, PipeStandard>;

/** Salvează un set complet de standarde ca override local (aplicat instant în toate calculele). */
export function saveUserPipeStandards(data: Record<string, PipeStandard>): void {
    writeOverride(data);
}

/** Șterge override-ul și revine la datele oficiale. */
export function resetUserPipeStandards(): void {
    overrideCache = null;
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(OVERRIDE_KEY);
    } catch {
        // ignore
    }
}

/** True dacă există un override local activ. */
export function hasUserPipeStandardsOverride(): boolean {
    return readOverride() !== null;
}
