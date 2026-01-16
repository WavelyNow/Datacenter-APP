/**
 * Validation Schemas for Datacenter Engineering Suite
 * Uses Zod for runtime type validation with user-friendly error messages
 */

import { z } from 'zod';

// ============================================================================
// Pipe Segment Validation
// ============================================================================

export const pipeSegmentSchema = z.object({
    id: z.string().min(1),
    name: z.string().optional(),
    material: z.string().min(1, 'Selectați un material'),
    standard: z.string().min(1, 'Selectați un standard'),
    size: z.string().min(1, 'Selectați o dimensiune'),
    length: z.number()
        .positive('Lungimea trebuie să fie mai mare ca 0')
        .max(10000, 'Lungimea maximă este 10,000m'),
    customInnerDiameter: z.number()
        .positive('Diametrul interior trebuie să fie pozitiv')
        .max(2000, 'Diametrul maxim este 2000mm')
        .optional(),
    customWeight: z.number()
        .min(0, 'Greutatea nu poate fi negativă')
        .max(500, 'Greutatea maximă pe metru este 500 kg/m')
        .optional(),
    flowRate: z.number()
        .min(0, 'Debitul nu poate fi negativ')
        .max(10000, 'Debitul maxim este 10,000 m³/h')
        .optional(),
    fluid: z.string().optional(),
    temperature: z.number()
        .min(-50, 'Temperatura minimă este -50°C')
        .max(200, 'Temperatura maximă este 200°C')
        .optional(),
    roughness: z.number()
        .min(0, 'Rugozitatea nu poate fi negativă')
        .max(10, 'Rugozitatea maximă este 10 mm')
        .optional(),
    diameter: z.number().optional(),
    fittings: z.array(z.any()).optional(),
});

export type ValidatedPipeSegment = z.infer<typeof pipeSegmentSchema>;

// ============================================================================
// Equipment Validation
// ============================================================================

export const equipmentSchema = z.object({
    id: z.string().min(1),
    type: z.string().min(1, 'Selectați tipul de echipament'),
    name: z.string().min(1, 'Introduceți un nume'),
    volume: z.number()
        .min(0, 'Volumul nu poate fi negativ')
        .max(100000, 'Volumul maxim este 100,000 L'),
    weight: z.number()
        .min(0, 'Greutatea nu poate fi negativă')
        .max(100000, 'Greutatea maximă este 100,000 kg'),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    price: z.number()
        .min(0, 'Prețul nu poate fi negativ')
        .optional(),
    dimensions: z.object({
        length: z.number().min(0).optional(),
        width: z.number().min(0).optional(),
        height: z.number().min(0).optional(),
    }).optional(),
    power: z.number()
        .min(0, 'Puterea nu poate fi negativă')
        .max(10000, 'Puterea maximă este 10,000 kW')
        .optional(),
    flowRate: z.number()
        .min(0, 'Debitul nu poate fi negativ')
        .max(10000, 'Debitul maxim este 10,000 m³/h')
        .optional(),
    head: z.number()
        .min(0, 'Înălțimea de pompare nu poate fi negativă')
        .max(500, 'Înălțimea maximă este 500 m')
        .optional(),
    glycolRecommendation: z.number()
        .min(0, 'Concentrația minimă este 0%')
        .max(100, 'Concentrația maximă este 100%')
        .optional(),
    glycolProofImage: z.string().optional(),
    options: z.array(z.string()).optional(),
    notes: z.string().optional(),
    proofImage: z.string().optional(),
    photos: z.array(z.string()).optional(),
    technicalSheet: z.string().optional(),
});

export type ValidatedEquipment = z.infer<typeof equipmentSchema>;

// ============================================================================
// Project Details Validation
// ============================================================================

export const projectDetailsSchema = z.object({
    projectName: z.string()
        .min(1, 'Numele proiectului este obligatoriu')
        .max(100, 'Numele este prea lung'),
    projectNumber: z.string()
        .min(1, 'Numărul proiectului este obligatoriu')
        .max(50, 'Numărul este prea lung'),
    designer: z.string()
        .min(1, 'Numele proiectantului este obligatoriu'),
    location: z.string()
        .min(1, 'Locația este obligatorie'),
    date: z.string()
        .min(1, 'Data este obligatorie'),
    beneficiary: z.string().optional(),
    revision: z.string()
        .max(10, 'Revizia este prea lungă')
        .optional(),
    companyLogo: z.string().optional(),
});

export type ValidatedProjectDetails = z.infer<typeof projectDetailsSchema>;

// ============================================================================
// Support Configuration Validation
// ============================================================================

export const supportConfigSchema = z.object({
    spacing: z.number()
        .min(0.5, 'Distanța minimă între suporturi este 0.5m')
        .max(6, 'Distanța maximă între suporturi este 6m'),
    mountingType: z.enum(['concrete', 'suspended']),
    height: z.number()
        .min(0.1, 'Înălțimea minimă este 0.1m')
        .max(10, 'Înălțimea maximă este 10m'),
    pipesPerSupport: z.number()
        .min(1, 'Minim 1 țeavă pe suport')
        .max(5, 'Maxim 5 țevi pe suport'),
    insulationThickness: z.number()
        .min(0, 'Grosimea izolației nu poate fi negativă')
        .max(200, 'Grosimea maximă este 200mm'),
    insulationDensity: z.number()
        .min(10, 'Densitatea minimă este 10 kg/m³')
        .max(500, 'Densitatea maximă este 500 kg/m³'),
    addLeftConsole: z.boolean(),
    addRightConsole: z.boolean(),
    addUpperRail: z.boolean(),
});

export type ValidatedSupportConfig = z.infer<typeof supportConfigSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
}

/**
 * Validate data against a schema and return user-friendly errors
 */
export function validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    // Convert Zod errors to a simple key-value object
    const errors: Record<string, string> = {};
    result.error.issues.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
    });

    return { success: false, errors };
}

/**
 * Validate a single field value
 */
export function validateField<T>(
    schema: z.ZodSchema<T>,
    value: unknown
): { valid: boolean; error?: string } {
    const result = schema.safeParse(value);

    if (result.success) {
        return { valid: true };
    }

    return { valid: false, error: result.error.issues[0]?.message };
}

// ============================================================================
// Common Field Validators (for inline use)
// ============================================================================

export const validators = {
    positiveNumber: z.number().positive('Valoarea trebuie să fie pozitivă'),
    nonNegativeNumber: z.number().min(0, 'Valoarea nu poate fi negativă'),
    percentage: z.number().min(0, 'Min 0%').max(100, 'Max 100%'),
    requiredString: z.string().min(1, 'Acest câmp este obligatoriu'),
    optionalString: z.string().optional(),
    email: z.string().email('Email invalid'),
    url: z.string().url('URL invalid'),
};

// ============================================================================
// Quick Validation Functions for Common Cases
// ============================================================================

export function isValidLength(length: number): boolean {
    return length > 0 && length <= 10000;
}

export function isValidVolume(volume: number): boolean {
    return volume >= 0 && volume <= 100000;
}

export function isValidWeight(weight: number): boolean {
    return weight >= 0 && weight <= 100000;
}

export function isValidPower(power: number): boolean {
    return power >= 0 && power <= 10000;
}

export function isValidPercentage(pct: number): boolean {
    return pct >= 0 && pct <= 100;
}

export function isValidTemperature(temp: number): boolean {
    return temp >= -50 && temp <= 200;
}
