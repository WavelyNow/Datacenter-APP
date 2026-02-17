import { PipeSegment, EquipmentItem } from '../types';

/**
 * Interface representing the data structure for a Revit Sync session.
 */
export interface RevitSyncData {
    version: string;
    timestamp: string;
    sourceModel: string;
    elements: RevitElement[];
}

export interface RevitElement {
    revitId: string;
    category: 'Pipe' | 'Equipment' | 'Fitting';
    name: string;
    parameters: Record<string, string | number>;
    geometry?: {
        length?: number;
        diameter?: number;
        weight?: number;
        volume?: number;
    };
}

/**
 * Maps a Revit element to an internal Application object.
 */
export function mapRevitToAppElement(element: RevitElement): Partial<PipeSegment | EquipmentItem> {
    if (element.category === 'Pipe') {
        return {
            revitId: element.revitId,
            name: element.name,
            length: element.geometry?.length || 0,
            diameter: element.geometry?.diameter,
            syncStatus: 'synced'
        } as Partial<PipeSegment>;
    } else {
        return {
            revitId: element.revitId,
            name: element.name,
            weight: element.geometry?.weight || 0,
            volume: element.geometry?.volume || 0,
            syncStatus: 'synced'
        } as Partial<EquipmentItem>;
    }
}

/**
 * Prepares data for synchronization back to Revit.
 */
export function prepareRevitExport(segments: PipeSegment[], equipment: EquipmentItem[]): RevitSyncData {
    const pipeElements: RevitElement[] = segments
        .filter(s => s.revitId)
        .map(s => ({
            revitId: s.revitId!,
            category: 'Pipe' as const,
            name: s.name || `Pipe ${s.size}`,
            parameters: {
                'Length': s.length,
                'Size': s.size,
                'Material': s.material
            },
            geometry: {
                length: s.length
            }
        }));

    const equipElements: RevitElement[] = equipment
        .filter(e => e.revitId)
        .map(e => ({
            revitId: e.revitId!,
            category: 'Equipment' as const,
            name: e.name,
            parameters: {
                'Weight': e.weight,
                'Volume': e.volume,
                'Power': e.power || 0
            },
            geometry: {
                weight: e.weight,
                volume: e.volume
            }
        }));

    return {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        sourceModel: 'DatacenterEngine',
        elements: [...pipeElements, ...equipElements]
    };
}
