
export interface BimObject {
    id: number;
    globalId: string;
    name: string;
    type: string;
    ifcType: number;
    system: string;
    connectedTo: number[];
    length?: number;
    diameter?: string;
    material?: string;
    rawData?: unknown;
}

export interface GroupedBimObject {
    id: string;
    type: string;
    name: string;
    diameter?: string;
    material?: string;
    system: string;
    count: number;
    totalLength: number;
    items: BimObject[];
}
