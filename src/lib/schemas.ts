import { z } from 'zod';

export const pipeSegmentSchema = z.object({
    material: z.string().min(1, "Selectați un material"),
    size: z.string().min(1, "Selectați o dimensiune"),
    length: z.number().positive("Lungimea trebuie să fie pozitivă"),
    // Optional custom fields if material is custom
    customInnerDiameter: z.number().optional(),
    customWeight: z.number().optional(),
});

export const equipmentSchema = z.object({
    name: z.string().min(1, "Numele echipamentului este obligatoriu"),
    type: z.string().min(1, "Tipul este obligatoriu"),
    volume: z.number().min(0, "Volumul nu poate fi negativ"),
    weight: z.number().min(0, "Greutatea nu poate fi negativă"),
    power: z.number().min(0).optional(),
    flowRate: z.number().min(0).optional(),
    pressureDrop: z.number().min(0).optional(),
    glycolCompat: z.number().min(0).max(100).optional(),
});

export const projectSettingsSchema = z.object({
    projectName: z.string().min(1, "Numele proiectului este obligatoriu"),
    projectNumber: z.string().min(1, "Numărul proiectului este obligatoriu"),
    designer: z.string().optional(),
    location: z.string().optional(),
    beneficiary: z.string().optional(),
    revision: z.string().optional(),
});
