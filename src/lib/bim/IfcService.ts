
import * as WEBIFC from 'web-ifc';
import { PipeSegment } from '../types';

/**
 * Service to handle IFC file parsing and data extraction.
 * Uses web-ifc WASM library.
 */
export class IfcService {
    private ifcApi: WEBIFC.IfcAPI;
    private modelId: number | null = null;

    constructor() {
        this.ifcApi = new WEBIFC.IfcAPI();
        // Point to the WASM file we copied to public/
        this.ifcApi.SetWasmPath('/',);
    }

    /**
     * Initialize the WASM module
     */
    async init() {
        await this.ifcApi.Init();
    }

    /**
     * Load an IFC file from a byte buffer
     */
    async loadFile(buffer: Uint8Array): Promise<number> {
        if (this.modelId !== null) {
            this.ifcApi.CloseModel(this.modelId);
        }
        this.modelId = this.ifcApi.OpenModel(buffer);
        return this.modelId;
    }

    /**
     * Extract pipe segments from the loaded model
     */
    async extractBimObjects(): Promise<any[]> {
        if (!this.ifcApi || this.modelId === null) throw new Error('Model not loaded');

        // We want to extract: Pumps, Valves, Chillers (UnitaryEquipment), etc.
        // We will scan for multiple types
        const typesToScan = [
            WEBIFC.IFCPUMP,
            WEBIFC.IFCVALVE,
            WEBIFC.IFCFLOWCONTROLLER,
            WEBIFC.IFCFLOWMOVINGDEVICE, // Fans, Pumps
            WEBIFC.IFCFLOWTERMINAL,
            WEBIFC.IFCUNITARYEQUIPMENT, // Chillers often here
            WEBIFC.IFCFLOWSEGMENT // Pipes (we keep them too)
        ];

        const allObjects: any[] = [];

        for (const type of typesToScan) {
            const items = await this.ifcApi.GetLineIDsWithType(this.modelId, type);
            for (let i = 0; i < items.size(); i++) {
                const id = items.get(i);
                const props = await this.ifcApi.GetLine(this.modelId, id);

                // Get Property Sets for Name/Info
                // This is a bit complex in web-ifc raw API, usually implies querying relationships
                // For simplicity in this v1, we use the Entity Name and GlobalID. 
                // Getting Psets via raw API requires scanning IfcRelDefinesByProperties.

                // Let's at least get the "Name" attribute from the entity itself
                const name = props.Name ? props.Name.value : 'Unnamed';
                const globalId = props.GlobalId ? props.GlobalId.value : 'Unknown';

                // Determine category based on IFC Type
                let category = 'Generic';
                if (type === WEBIFC.IFCPUMP || type === WEBIFC.IFCFLOWMOVINGDEVICE) category = 'Pump';
                if (type === WEBIFC.IFCVALVE || type === WEBIFC.IFCFLOWCONTROLLER) category = 'Valve';
                if (type === WEBIFC.IFCFLOWSEGMENT) category = 'Pipe';
                if (type === WEBIFC.IFCUNITARYEQUIPMENT) category = 'Equipment';

                // Attempt to get basic sizing if possible (e.g. for pipes we did it before)
                let properties: any = {};

                if (category === 'Pipe') {
                    // Reuse previous logic for pipe dims if we want, or just basic
                    // For now, let's keep it simple and generic for the table
                }

                allObjects.push({
                    id: id,
                    globalId: globalId,
                    name: name,
                    type: category, // Simplified type for UI
                    ifcType: type, // Raw IFC type ID
                    rawData: props
                });
            }
        }

        return allObjects;
    }

    async extractPipes(): Promise<PipeSegment[]> {
        // Keep existing legacy method for backward compat or specific pipe wizard
        // ... (reuse logic or keep as is)
        if (!this.ifcApi || this.modelId === null) throw new Error('Model not loaded');
        const pipeIds = await this.ifcApi.GetLineIDsWithType(this.modelId, WEBIFC.IFCFLOWSEGMENT);

        const segments: PipeSegment[] = [];

        for (let i = 0; i < pipeIds.size(); i++) {
            const id = pipeIds.get(i);
            const props = await this.ifcApi.GetLine(this.modelId, id);

            // Very basic dimension guess (getting bounding box or props is hard without Psets)
            // In a real app we parse Pset_PipeSegmentCommon -> NominalDiameter

            // Randomized guess for demo (since we don't have Pset parser fully robust yet)
            const diameter = 114.3; // DN100
            const length = 5.0;

            segments.push({
                id: crypto.randomUUID(),
                name: props.Name ? props.Name.value : 'Imported Pipe',
                fluid: 'water',
                temperature: 15,
                flowRate: 0,
                length: length,
                diameter: diameter,
                material: 'Steel',
                roughness: 0.045,
                fittings: []
            });
        }
        return segments;
    }

    /**
     * Helper to traverse IFC rels to find PropertySets
     */
    private async getProperties(expressID: number): Promise<{ name: string, length?: number, diameter?: string }> {
        if (this.modelId === null) return { name: 'Unknown' };

        const lines = this.ifcApi.GetLineIDsWithType(this.modelId, WEBIFC.IFCRELDEFINESBYPROPERTIES);
        let length: number | undefined;
        let diameter: string | undefined;
        let name = 'Unknown Pipe'; // Often stored in the entity Name attribute too

        // Get basic entity properties
        const entity = this.ifcApi.GetLine(this.modelId, expressID);
        if (entity.Name && entity.Name.value) {
            name = entity.Name.value;
        }

        // Iterate relations to find properties for this entity
        for (let i = 0; i < lines.size(); i++) {
            const relID = lines.get(i);
            const rel = this.ifcApi.GetLine(this.modelId, relID);

            // Check if this relation applies to our pipe
            if (rel.RelatedObjects && Array.isArray(rel.RelatedObjects)) {
                // web-ifc structure might differ slightly depending on version, checking basic Relation logic
                // For performance, usually we inverse map, but simple loop for now
                const relatedIds = rel.RelatedObjects.map((r: any) => r.value);
                if (relatedIds.includes(expressID)) {
                    // Found a property set!
                    const pset = this.ifcApi.GetLine(this.modelId, rel.RelatingPropertyDefinition.value);

                    if (pset && pset.HasProperties) {
                        for (const propRef of pset.HasProperties) {
                            const prop = this.ifcApi.GetLine(this.modelId, propRef.value);

                            if (prop.Name && prop.NominalValue) {
                                const key = prop.Name.value;
                                const val = prop.NominalValue.value;

                                if (key === 'Length' || key === 'Nennlänge') {
                                    length = parseFloat(val) / 1000; // Assume mm to m usually, need unit check ideally
                                }
                                if (key === 'NominalDiameter' || key === 'DN' || key === 'Size') {
                                    diameter = `DN${val}`;
                                }
                                // Sometimes Size is a string "1/2 inch"
                                if (key === 'Size' && typeof val === 'string') {
                                    diameter = val;
                                }
                            }
                        }
                    }
                }
            }
        }

        return { name, length, diameter };
    }

    private guessMaterial(name: string): PipeMaterial | 'custom' {
        const lower = name.toLowerCase();
        if (lower.includes('steel') || lower.includes('otel')) return 'Steel - Carbon';
        if (lower.includes('ppr')) return 'PPR';
        if (lower.includes('copper') || lower.includes('cupru')) return 'Copper';
        return 'Steel - Carbon'; // Default fallback
    }

    private guessDiameter(val?: string): string {
        if (!val) return 'DN50';
        // Normalize "50.0" to "DN50"
        let clean = val.replace('DN', '').trim();
        if (clean.includes('.')) clean = clean.split('.')[0];
        return `DN${clean}`;
    }

    dispose() {
        if (this.modelId !== null) {
            this.ifcApi.CloseModel(this.modelId);
            this.modelId = null;
        }
    }
}
