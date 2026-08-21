import { ProjectDetails, PipeSegment, EquipmentItem } from '@/lib/types';

export interface PdfOptions {
    includeVolume: boolean;
    includeBoQ: boolean;
    includeSupports: boolean;
    includeWeights: boolean;
    includePhotos: boolean;
    includeEnergy: boolean; // New Sustainability Report
    supportSpacing: number; // e.g. 2.0
    supportConfig?: {
        spacing: number;
        mountingType: 'concrete' | 'suspended';
        height: number;
        pipesPerSupport: number;
    };
}

/**
 * Opțiuni simplificate (raport comandă): anexele suporturi/foto/energie
 * au fost eliminate complet — raportul conține doar: Site → Țeavă → Cumpărare.
 */
export type PdfReportMode = 'order';

export interface PdfData {
    projectDetails: ProjectDetails;
    segments: PipeSegment[];
    equipmentList: EquipmentItem[];
    fluidType: string;
    glycolPercentage: number;
    safetyMargin: boolean;
    safetyMarginPercentage?: number;
    supportConfig: {
        spacing: number;
        mountingType: 'concrete' | 'suspended';
        height: number;
        pipesPerSupport: number;
        insulationThickness: number;
        insulationDensity: number;
        addLeftConsole?: boolean;
        addRightConsole?: boolean;
        addUpperRail?: boolean;
    };
    branding: {
        primaryColor: string;
        accentColor: string;
        pdfTheme: 'modern' | 'classic' | 'industrial';
    };
    fittingItems?: { id: string; type: string; size: string; quantity: number; description?: string }[];
    options?: PdfOptions;
}
