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
    options?: PdfOptions;
}
