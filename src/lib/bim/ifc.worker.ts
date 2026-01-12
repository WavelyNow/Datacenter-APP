import * as WEBIFC from 'web-ifc';

// Reuse types from your project (assuming they are isolatable)
// If imports fail in worker due to bundling, we might need to inline or adjust.
// For now, let's try importing. If Next.js complains, we'll inline types.
// import { PipeSegment } from '../types'; 

// Redefine basic types locally in worker to avoid complex dependency trees
interface PipeSegment {
    id: string;
    name: string;
    fluid: string;
    temperature: number;
    flowRate: number;
    length: number;
    diameter: string;
    material: string;
    roughness: number;
    standard: string;
    size: string;
    fittings: any[];
    type?: string;     // Added for categorization
    system?: string;   // Added
    connectedTo?: number[]; // Added
    globalId?: string; // Added
    rawData?: any;     // Added
}

const ifcApi = new WEBIFC.IfcAPI();
let modelId: number | null = null;
let wasmPathSet = false;

// Handle messages from Main Thread
self.onmessage = async (e: MessageEvent) => {
    const { action, payload, id } = e.data;

    try {
        switch (action) {
            case 'INIT':
                // Check if WASM path is provided
                const wasmPath = payload.wasmPath || '/wasm/';
                if (!wasmPathSet) {
                    ifcApi.SetWasmPath(wasmPath);
                    wasmPathSet = true;
                }
                await ifcApi.Init();
                self.postMessage({ type: 'response', id, data: 'WASM Initialized' });
                break;

            case 'LOAD_AND_EXTRACT':
                if (modelId !== null) {
                    ifcApi.CloseModel(modelId);
                    modelId = null;
                }

                // Loading
                const buffer = new Uint8Array(payload.buffer);
                modelId = ifcApi.OpenModel(buffer);

                // Extraction
                const result = await extractBimObjects();

                self.postMessage({ type: 'response', id, data: result });
                break;

            case 'DISPOSE':
                if (modelId !== null) {
                    ifcApi.CloseModel(modelId);
                    modelId = null;
                }
                ifcApi = null as any; // forceful cleanup
                break;
        }
    } catch (error: any) {
        self.postMessage({ type: 'error', id, error: error.message });
    }
};

// --- Extraction Logic (Copied and Adapted from IfcService) ---

async function extractBimObjects(): Promise<any[]> {
    if (!ifcApi || modelId === null) throw new Error('Worker: Model not loaded');

    // We want to extract: Pumps, Valves, Chillers (UnitaryEquipment), etc.
    const typesToScan = [
        WEBIFC.IFCPUMP,
        WEBIFC.IFCVALVE,
        WEBIFC.IFCFLOWCONTROLLER,
        WEBIFC.IFCFLOWMOVINGDEVICE,
        WEBIFC.IFCFLOWTERMINAL,
        WEBIFC.IFCUNITARYEQUIPMENT,
        WEBIFC.IFCFLOWSEGMENT,
        WEBIFC.IFCFLOWFITTING
    ];

    const allObjects: any[] = [];
    const systemMap = await buildSystemMap();
    const connectionMap = await buildConnectionMap();

    // Calculate total for progress
    let totalItemsToProcess = 0;
    for (const type of typesToScan) {
        totalItemsToProcess += ifcApi.GetLineIDsWithType(modelId, type).size();
    }

    let processedCount = 0;

    for (const type of typesToScan) {
        const items = ifcApi.GetLineIDsWithType(modelId, type);
        for (let i = 0; i < items.size(); i++) {

            // Progress Update every 50 items
            if (i % 50 === 0) {
                const progress = Math.round((processedCount / totalItemsToProcess) * 100);
                self.postMessage({
                    type: 'progress',
                    message: `Processing item ${processedCount}/${totalItemsToProcess}`,
                    progress
                });
            }

            const id = items.get(i);
            processedCount++;

            // Get properties
            // web-ifc in worker is synchronous mostly, but GetLine works fine
            const props = ifcApi.GetLine(modelId, id);
            if (!props) continue;

            const globalId = props.GlobalId.value;
            const name = props.Name ? props.Name.value : 'Unknown';

            let category = 'Generic';

            // Basic Categorization
            if (type === WEBIFC.IFCFLOWSEGMENT) category = 'Pipe';
            if (type === WEBIFC.IFCUNITARYEQUIPMENT) category = 'Equipment';
            if (type === WEBIFC.IFCPUMP) category = 'Pump';
            if (type === WEBIFC.IFCFLOWCONTROLLER) category = 'Valve';

            // Detailed Filling Logic
            if (type === WEBIFC.IFCFLOWFITTING) {
                category = 'Fitting';
                if (props.ObjectType && props.ObjectType.value) {
                    const objType = props.ObjectType.value.toLowerCase();
                    if (objType.includes('elbow') || objType.includes('bend') || objType.includes('cot')) category = 'Elbow';
                    else if (objType.includes('tee') || objType.includes('teu')) category = 'Tee';
                    else if (objType.includes('reduc') || objType.includes('red')) category = 'Reducer';
                }

                // Fallback to name if ObjectType isn't clear
                if (category === 'Fitting') {
                    const n = name.toLowerCase();
                    if (n.includes('elbow') || n.includes('ben') || n.includes('winkel') || n.includes('cot')) category = 'Elbow';
                    if (n.includes('tee') || n.includes('t-stuck') || n.includes('teu')) category = 'Tee';
                    if (n.includes('reduc') || n.includes('transition')) category = 'Reducer';
                    if (n.includes('cap') || n.includes('plug')) category = 'Cap';
                }
            }

            // Explicitly check for Cable Trays
            if (name.toLowerCase().includes('cable tray') || name.toLowerCase().includes('pat cablu')) {
                category = 'Cable Tray';
            }

            // Get System from map
            const systemName = systemMap.get(id) || 'Unassigned';

            // Get Connected items
            const connectedIds = connectionMap.get(id) || [];

            // Get properties (Length, Diameter, Psets)
            const properties = getProperties(id);

            // Use refined name from properties if available, or clean up existing name
            const refinedName = properties.name !== 'Unknown Pipe' ? properties.name : (name.startsWith('Current_direction') ? 'Pipe Segment' : name);

            // Guess material/diameter if missing
            const materialGuess = guessMaterial(refinedName);
            const diameterGuess = properties.diameter || guessDiameter(refinedName);

            allObjects.push({
                id: id,
                globalId: globalId,
                name: refinedName,
                type: category,
                ifcType: type,
                system: systemName,
                connectedTo: connectedIds,
                // Engineering Data
                length: properties.length || 0,
                diameter: diameterGuess,
                material: materialGuess,
                rawData: props // Note: rawData might be large to pass back, maybe strip?
            });
        }
    }

    self.postMessage({ type: 'progress', message: 'Finalizing...', progress: 100 });
    return allObjects;
}

// Helper Functions
function buildSystemMap(): Map<number, string> {
    const map = new Map<number, string>();
    if (modelId === null) return map;

    try {
        const lines = ifcApi.GetLineIDsWithType(modelId, WEBIFC.IFCRELASSIGNSTOGROUP);
        for (let i = 0; i < lines.size(); i++) {
            const relId = lines.get(i);
            const rel = ifcApi.GetLine(modelId, relId);
            const groupRef = rel.RelatingGroup;
            if (!groupRef) continue;

            const group = ifcApi.GetLine(modelId, groupRef.value);
            const systemName = group.Name ? group.Name.value : 'Unnamed System';

            if (rel.RelatedObjects && Array.isArray(rel.RelatedObjects)) {
                rel.RelatedObjects.forEach((r: any) => {
                    map.set(r.value, systemName);
                });
            }
        }
    } catch (e) {
        console.warn('Worker: Failed to extract systems:', e);
    }
    return map;
}

function buildConnectionMap(): Map<number, number[]> {
    const map = new Map<number, number[]>();
    if (modelId === null) return map;

    const addConn = (a: number, b: number) => {
        if (!map.has(a)) map.set(a, []);
        if (!map.has(b)) map.set(b, []);
        if (!map.get(a)?.includes(b)) map.get(a)?.push(b);
        if (!map.get(b)?.includes(a)) map.get(b)?.push(a);
    };

    try {
        const connects = ifcApi.GetLineIDsWithType(modelId, WEBIFC.IFCRELCONNECTSELEMENTS);
        for (let i = 0; i < connects.size(); i++) {
            const rel = ifcApi.GetLine(modelId, connects.get(i));
            if (rel.RelatingElement && rel.RelatedElement) {
                addConn(rel.RelatingElement.value, rel.RelatedElement.value);
            }
        }
    } catch (e) {
        console.warn('Worker: Failed to extract connections:', e);
    }

    return map;
}

function getProperties(expressID: number): { name: string, length?: number, diameter?: string } {
    if (modelId === null) return { name: 'Unknown' };

    const lines = ifcApi.GetLineIDsWithType(modelId, WEBIFC.IFCRELDEFINESBYPROPERTIES);
    let length: number | undefined;
    let diameter: string | undefined;
    let name = 'Unknown Pipe';

    const entity = ifcApi.GetLine(modelId, expressID);
    if (entity.Name && entity.Name.value) {
        name = entity.Name.value;
    }

    for (let i = 0; i < lines.size(); i++) {
        const relID = lines.get(i);
        const rel = ifcApi.GetLine(modelId, relID);

        if (rel.RelatedObjects && Array.isArray(rel.RelatedObjects)) {
            const relatedIds = rel.RelatedObjects.map((r: any) => r.value);
            if (relatedIds.includes(expressID)) {
                if (!rel.RelatingPropertyDefinition) continue;

                const psetRef = rel.RelatingPropertyDefinition;
                const psetId = psetRef.value;
                const pset = ifcApi.GetLine(modelId, psetId);

                if (pset && pset.HasProperties) {
                    for (const propRef of pset.HasProperties) {
                        const prop = ifcApi.GetLine(modelId, propRef.value);

                        if (prop.Name && prop.NominalValue) {
                            const key = prop.Name.value;
                            const val = prop.NominalValue.value;

                            if (['Length', 'Nennlänge', 'OverallLength', 'CutLength'].includes(key)) {
                                const num = parseFloat(val);
                                if (!isNaN(num)) length = num > 100 ? num / 1000 : num;
                            }

                            if (['Diameter', 'NominalDiameter', 'Overall Size', 'OverallSize', 'DN', 'Size', 'OuterDiameter'].includes(key)) {
                                let cleanVal = val.toString().replace(/[^\d.]/g, '');
                                const num = parseFloat(cleanVal);

                                if (!isNaN(num)) {
                                    diameter = `DN${num}`;
                                } else if (typeof val === 'string' && val.length < 10 && /\d/.test(val)) {
                                    diameter = val;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return { name, length, diameter };
}

function guessMaterial(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('steel') || lower.includes('otel')) return 'Steel - Carbon';
    if (lower.includes('ppr')) return 'PPR';
    if (lower.includes('copper') || lower.includes('cupru')) return 'Copper';
    return 'Steel - Carbon';
}

function guessDiameter(val?: string): string {
    if (!val) return '-';
    if (!/\d/.test(val)) return '-';
    if (val.length > 20) return '-';

    let clean = val.replace(/DN/i, '').trim();
    if (clean.includes('.')) clean = clean.split('.')[0];

    const num = parseFloat(clean);
    if (isNaN(num)) return '-';

    return `DN${num}`;
}
