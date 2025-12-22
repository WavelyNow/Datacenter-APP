// Pipe data structure with Engineering estimates for ID (mm)

// Pipe data structure with Engineering estimates for ID (mm)

export const PIPE_DATABASE = {
    "Otel Carbon (Teava Neagra)": {
        "SCH40 / Standard": {
            "DN15 (1/2)": { id_mm: 15.8, weight_kg_m: 1.27 },
            "DN20 (3/4)": { id_mm: 20.9, weight_kg_m: 1.69 },
            "DN25 (1)": { id_mm: 26.6, weight_kg_m: 2.50 },
            "DN32 (1 1/4)": { id_mm: 35.1, weight_kg_m: 3.39 },
            "DN40 (1 1/2)": { id_mm: 40.9, weight_kg_m: 4.05 },
            "DN50 (2)": { id_mm: 52.5, weight_kg_m: 5.44 },
            "DN65 (2 1/2)": { id_mm: 62.7, weight_kg_m: 8.63 },
            "DN80 (3)": { id_mm: 77.9, weight_kg_m: 11.29 },
            "DN100 (4)": { id_mm: 102.3, weight_kg_m: 16.07 },
            "DN125 (5)": { id_mm: 128.2, weight_kg_m: 21.77 },
            "DN150 (6)": { id_mm: 154.1, weight_kg_m: 28.26 },
            "DN200 (8)": { id_mm: 202.7, weight_kg_m: 42.55 },
            "DN250 (10)": { id_mm: 254.5, weight_kg_m: 60.30 },
            "DN300 (12)": { id_mm: 303.2, weight_kg_m: 73.80 }
        }
    },
    "PPR (Polipropilena)": {
        "PN20 (Apa Calda/Incalzire)": {
            "20mm": { id_mm: 13.2, weight_kg_m: 0.17 },
            "25mm": { id_mm: 16.6, weight_kg_m: 0.26 },
            "32mm": { id_mm: 21.2, weight_kg_m: 0.41 },
            "40mm": { id_mm: 26.6, weight_kg_m: 0.65 },
            "50mm": { id_mm: 33.2, weight_kg_m: 1.00 },
            "63mm": { id_mm: 42.0, weight_kg_m: 1.60 },
            "75mm": { id_mm: 50.0, weight_kg_m: 2.20 },
            "90mm": { id_mm: 60.0, weight_kg_m: 3.10 },
            "110mm": { id_mm: 73.2, weight_kg_m: 4.50 }
        },
        "PN16 (Apa Rece)": {
            "20mm": { id_mm: 14.4, weight_kg_m: 0.15 },
            "25mm": { id_mm: 18.0, weight_kg_m: 0.23 },
            "32mm": { id_mm: 23.2, weight_kg_m: 0.37 },
            "40mm": { id_mm: 29.0, weight_kg_m: 0.58 },
            "50mm": { id_mm: 36.2, weight_kg_m: 0.90 },
            "63mm": { id_mm: 45.8, weight_kg_m: 1.40 },
            "75mm": { id_mm: 54.4, weight_kg_m: 2.00 },
            "90mm": { id_mm: 65.4, weight_kg_m: 2.80 },
            "110mm": { id_mm: 79.8, weight_kg_m: 4.10 }
        }
    },
    "PEHD (Polietilena)": {
        "SDR17 (Apa)": {
            "32mm": { id_mm: 28.0, weight_kg_m: 0.20 },
            "40mm": { id_mm: 35.2, weight_kg_m: 0.30 },
            "50mm": { id_mm: 44.0, weight_kg_m: 0.45 },
            "63mm": { id_mm: 55.4, weight_kg_m: 0.70 },
            "75mm": { id_mm: 66.0, weight_kg_m: 1.00 },
            "90mm": { id_mm: 79.2, weight_kg_m: 1.40 },
            "110mm": { id_mm: 96.8, weight_kg_m: 2.10 },
            "125mm": { id_mm: 110.2, weight_kg_m: 2.70 },
            "160mm": { id_mm: 141.0, weight_kg_m: 4.40 }
        },
        "SDR11 (Gaz/Presiune)": {
            "32mm": { id_mm: 26.0, weight_kg_m: 0.28 },
            "40mm": { id_mm: 32.6, weight_kg_m: 0.43 },
            "50mm": { id_mm: 40.8, weight_kg_m: 0.67 },
            "63mm": { id_mm: 51.4, weight_kg_m: 1.05 },
            "75mm": { id_mm: 61.4, weight_kg_m: 1.48 },
            "90mm": { id_mm: 73.6, weight_kg_m: 2.12 },
            "110mm": { id_mm: 90.0, weight_kg_m: 3.15 },
            "160mm": { id_mm: 130.8, weight_kg_m: 6.60 }
        }
    }
};

export type PipeMaterial = keyof typeof PIPE_DATABASE;
