
import { ProjectDetails, PipeSegment, EquipmentItem, FluidType } from '@/lib/types';

export interface PdfData {
    projectDetails: ProjectDetails;
    segments: PipeSegment[];
    equipmentList: EquipmentItem[];
    fluidType: FluidType;
    glycolPercentage: number;
    safetyMargin: boolean;
}

export interface ReportSummary {
    totalVolumeLitres: number;
    totalWeightKg: number;
    glycolVol: number;
    waterVol: number;
    mixDensity: number;
}
