import { PIPE_STANDARDS } from './pipeStandards';

export type PipeMaterial = keyof typeof PIPE_STANDARDS;

export interface PipeSegment {
    id: string;
    name?: string; // Optional name for identification (e.g. from BIM)
    material: PipeMaterial | 'custom';
    standard: string;
    size: string;
    length: number; // meters
    customInnerDiameter?: number; // mm, used if material === 'custom'
    customWeight?: number; // kg/m, used if material === 'custom'
    flowRate?: number; // m³/h
    fluid?: string;
    temperature?: number;
    roughness?: number;
    diameter?: number; // Added to support BIM extraction (numeric DN or inner diameter)
    fittings?: unknown[]; // Placeholder for future fitting logic
}

export interface EquipmentItem {
    id: string;
    type: string;
    name: string;
    volume: number;
    weight: number; // kg - Mandatory now
    // Extended fields
    manufacturer?: string;
    model?: string;
    price?: number;
    dimensions?: { length: number; width: number; height: number };
    power?: number; // kW
    flowRate?: number; // m³/h
    head?: number; // m (pressure head)
    glycolRecommendation?: number; // %
    glycolProofImage?: string; // Base64 - screenshot from manufacturer PDF
    options?: string[]; // e.g. ['Free Cooling', 'Bypass', 'Redundant Pumps']
    notes?: string; // Additional notes
    // Media
    proofImage?: string; // Base64 string - Legacy, keep for now but prefer photos array
    photos?: string[]; // Array of Base64 strings for the gallery
    technicalSheet?: string; // Base64 string (PDF) or URL
    model3d?: string; // URL to .glb/.gltf (BIM Model)
    specifications?: Record<string, string | number>;
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

export type PDFSectionId = 'header' | 'volume' | 'boq' | 'weights' | 'supports' | 'photos';
export type PDFAlignment = 'left' | 'center' | 'right';

export interface PDFSection {
    id: PDFSectionId;
    label: string;
    enabled: boolean;
    alignment: PDFAlignment;
    order: number;
}

export interface PDFLayoutConfig {
    sections: PDFSection[];
    showPageNumbers: boolean;
    compactMode: boolean;
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
    ifcModelUrl?: string | null;
}

export interface CloudProject {
    id: string;
    name: string;
    description?: string;
    data: ProjectLoadData;
    updated_at: string;
}

export interface CatalogEquipment {
    id: string;
    category: string;
    manufacturer: string;
    model: string;
    volume: number; // L (water content)
    weight: number; // kg (empty/dry weight)
    description: string;
    technicalSheet?: string; // Base64 or URL
    model3d?: string; // URL to .glb/.gltf (BIM Model)
    // Extended properties for detailed catalogs
    power?: number;
    flowRate?: number;
    specifications?: Record<string, string | number>;
    options?: string[];
    type?: string; // Specific type if different from category
}
