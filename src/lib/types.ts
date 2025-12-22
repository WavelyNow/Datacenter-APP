import { PipeMaterial } from './constants';

export interface PipeSegment {
    id: string;
    material: string;
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
    proofImage?: string; // Base64 string
}

export interface AppState {
    segments: PipeSegment[];
    equipmentList: EquipmentItem[];
    safetyMargin: boolean;
    glycolPercentage: number;
    companyLogo?: string | null; // Base64 string
}
