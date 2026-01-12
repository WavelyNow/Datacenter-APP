
import * as WEBIFC from 'web-ifc';
import { PipeSegment, PipeMaterial } from '../types';

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
    async extractPipes(): Promise<PipeSegment[]> {
        if (this.modelId === null) throw new Error('No model loaded');

        // 1. Get all IfcPipeSegment entities
        const pipeEntities = this.ifcApi.GetLineIDsWithType(this.modelId, WEBIFC.IFCPIPESEGMENT);
        const segments: PipeSegment[] = [];

        for (let i = 0; i < pipeEntities.size(); i++) {
            const expressID = pipeEntities.get(i);
            const props = this.ifcApi.GetLine(this.modelId, expressID);

            // 2. Get Property Sets to find dimensions
            // This is a simplification. In real IFC, we need to traverse IsDefinedBy -> RelDefinesByProperties -> PropertySet
            const extractedData = await this.getProperties(expressID);

            // 3. Map to our PipeSegment type
            const segment: PipeSegment = {
                id: crypto.randomUUID(), // Internal ID
                material: this.guessMaterial(extractedData.name),
                standard: 'EN 10255', // Default
                size: this.guessDiameter(extractedData.diameter),
                length: extractedData.length || 1, // Default to 1m if missing
                flowRate: 0 // To be calculated later
            };

            segments.push(segment);
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
