
export interface PipeDimension {
    dn: string;      // "DN15" or "20mm"
    inch: string;    // "1/2\""
    od: number;      // Outer Diameter (mm)
    thickness: number; // Wall Thickness (mm)
    id: number;      // Internal Diameter (mm)
    weight: number;  // Weight (kg/m) empty
}

export interface PipeStandard {
    label: string;
    description: string;
    dimensions: PipeDimension[];
}

export const PIPE_STANDARDS: Record<string, PipeStandard> = {
    steel_light: {
        label: "Oțel - Ușoară (Light II)",
        description: "EN 10255 - Seria Ușoară",
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
        label: "Oțel - Medie (Medium)",
        description: "EN 10255 - Seria Medie",
        dimensions: [
            { dn: "DN10", inch: "3/8\"", od: 17.2, thickness: 2.3, id: 12.6, weight: 0.85 },
            { dn: "DN15", inch: "1/2\"", od: 21.3, thickness: 2.6, id: 16.1, weight: 1.22 },
            { dn: "DN20", inch: "3/4\"", od: 26.9, thickness: 2.6, id: 21.7, weight: 1.58 },
            { dn: "DN25", inch: "1\"", od: 33.7, thickness: 3.2, id: 27.3, weight: 2.44 },
            { dn: "DN32", inch: "1 1/4\"", od: 42.4, thickness: 3.2, id: 36.0, weight: 3.14 },
            { dn: "DN40", inch: "1 1/2\"", od: 48.3, thickness: 3.2, id: 41.9, weight: 3.61 },
            { dn: "DN50", inch: "2\"", od: 60.3, thickness: 3.6, id: 53.1, weight: 5.10 },
            { dn: "DN65", inch: "2 1/2\"", od: 76.1, thickness: 3.6, id: 68.9, weight: 6.51 },
            { dn: "DN80", inch: "3\"", od: 88.9, thickness: 4.0, id: 80.9, weight: 8.47 },
            { dn: "DN100", inch: "4\"", od: 114.3, thickness: 4.5, id: 105.3, weight: 12.10 },
        ]
    },
    copper: {
        label: "Cupru (EN 1057)",
        description: "Țeavă Cupru Semidur/Dur",
        dimensions: [
            { dn: "15mm", inch: "-", od: 15, thickness: 0.7, id: 13.6, weight: 0.28 },
            { dn: "18mm", inch: "-", od: 18, thickness: 0.7, id: 16.6, weight: 0.34 },
            { dn: "22mm", inch: "-", od: 22, thickness: 0.7, id: 20.6, weight: 0.42 }, // Updated thickness for common use
            { dn: "28mm", inch: "-", od: 28, thickness: 1.0, id: 26.0, weight: 0.75 },
            { dn: "35mm", inch: "-", od: 35, thickness: 1.0, id: 33.0, weight: 0.95 },   // Updated common
            { dn: "42mm", inch: "-", od: 42, thickness: 1.0, id: 40.0, weight: 1.15 },
            { dn: "54mm", inch: "-", od: 54, thickness: 1.2, id: 51.6, weight: 1.77 },
        ]
    },
    ppr_pn20: {
        label: "PPR - PN20 (SDR 6)",
        description: "Polipropilenă pentru Apă Caldă/Încălzire",
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
        dimensions: [
            { dn: "32mm", inch: "1\"", od: 32, thickness: 2.0, id: 28.0, weight: 0.20 },
            { dn: "40mm", inch: "1 1/4\"", od: 40, thickness: 2.4, id: 35.2, weight: 0.30 },
            { dn: "50mm", inch: "1 1/2\"", od: 50, thickness: 3.0, id: 44.0, weight: 0.46 },
            { dn: "63mm", inch: "2\"", od: 63, thickness: 3.8, id: 55.4, weight: 0.72 },
            { dn: "75mm", inch: "2 1/2\"", od: 75, thickness: 4.5, id: 66.0, weight: 1.02 },
            { dn: "90mm", inch: "3\"", od: 90, thickness: 5.4, id: 79.2, weight: 1.46 },
            { dn: "110mm", inch: "4\"", od: 110, thickness: 6.6, id: 96.8, weight: 2.18 },
        ]
    }
};
