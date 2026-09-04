import { ProjectDetails, PipeSegment, EquipmentItem } from '@/lib/types';

/** Raportul de comandă conține doar: Site → Țeavă → Cumpărare. */
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
}
