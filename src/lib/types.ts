import { PIPE_STANDARDS } from './pipeStandards';

export type PipeMaterial = keyof typeof PIPE_STANDARDS;

export interface PipeSegment {
    id: string;
    material: PipeMaterial | 'custom';
    standard: string;
    size: string;
    length: number; // meters
    customInnerDiameter?: number; // mm, used if material === 'custom'
    customWeight?: number; // kg/m, used if material === 'custom'
}

export interface EquipmentItem {
    id: string;
    type: string;
    name: string;
    volume: number;
    weight: number; // kg - Mandatory now
    proofImage?: string; // Base64 string - Legacy, keep for now but prefer photos array
    photos?: string[]; // Array of Base64 strings for the gallery
    technicalSheet?: string; // Base64 string (PDF) or URL
}

export type FluidType = 'ethylene' | 'propylene' | 'water';

export interface ProjectDetails {
    projectName: string;
    projectNumber: string;
    designer: string;
    location: string;
    date: string;
    beneficiary: string;
    revision: string;
    companyLogo?: string; // Base64 string for the report header
}

export type MountingType = 'concrete' | 'suspended';

export interface SupportConfig {
    spacing: number;
    mountingType: MountingType;
    height: number; // meters
    pipesPerSupport: number; // 1, 2, or 3
    insulationThickness: number; // mm
    insulationDensity: number; // kg/m3
    addLeftConsole: boolean;
    addRightConsole: boolean;
    addUpperRail: boolean;
}

export interface BrandingConfig {
    primaryColor: string;
    accentColor: string;
    pdfTheme: 'modern' | 'classic' | 'industrial';
}

export interface AppState {
    segments: PipeSegment[];
    equipmentList: EquipmentItem[];
    safetyMargin: boolean;
    safetyMarginPercentage: number;
    glycolPercentage: number;
    companyLogo?: string | null; // Base64 string
    supportConfig: SupportConfig;
    branding: BrandingConfig;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: unknown;
}

export interface ImageUploadResult {
    success: boolean;
    base64?: string;
    error?: string;
    sizeKb?: number;
}

export interface PdfGenerationProgress {
    stage: 'validating' | 'rendering' | 'compressing' | 'complete';
    progress: number; // 0-100
    message: string;
}

export interface ProjectLoadData {
    segments?: PipeSegment[];
    equipmentList?: EquipmentItem[];
    projectDetails?: ProjectDetails;
    fluidType?: FluidType;
    glycolPercentage?: number;
    safetyMargin?: boolean;
}
