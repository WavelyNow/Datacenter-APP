// Room Preparation Types and Interfaces

// Fire Rating Options
export type FireRating = 'REI30' | 'REI60' | 'REI90' | 'REI120';
export type FireDoorRating = 'EI30' | 'EI60' | 'EI90' | 'EI120';
export type TierLevel = 'I' | 'II' | 'III' | 'IV';

// Phase Status
export type PhaseStatus = 'not-started' | 'in-progress' | 'completed';
export type ItemStatus = 'pending' | 'completed' | 'skipped' | 'not-applicable';

// Checklist Item
export interface ChecklistItem {
    id: string;
    label: string;
    description?: string;
    status: ItemStatus;
    notes?: string;
    selectedOption?: string;
    value?: string | number;
    required: boolean;
}

// Phase 1: Structure
export interface StructurePhase {
    status: PhaseStatus;
    dimensions: {
        length: number;  // meters
        width: number;   // meters
        height: number;  // meters
    };
    floorLoadCapacity: number;  // kg/m²
    clearHeightAboveFloor: number;  // meters
    clearHeightBelowCeiling: number;  // meters
    structureType: 'concrete' | 'steel' | 'mixed' | 'other';
    notes: string;
}

// Phase 2: Flooring
export interface FlooringPhase {
    status: PhaseStatus;
    items: {
        selfLevelingScreed: ChecklistItem & {
            thickness?: number;  // cm
            strength?: 'C20' | 'C25' | 'C30';
        };
        waterproofing: ChecklistItem & {
            type?: 'pvc-membrane' | 'epoxy-resin' | 'bitumen' | 'other';
        };
        raisedFloor: ChecklistItem & {
            height?: number;  // cm
            loadCapacity?: number;  // kg/m²
            panelType?: 'hpl' | 'steel' | 'calcium-sulfate' | 'wood-core';
        };
        antiStaticFinish: ChecklistItem & {
            type?: 'hpl-tiles' | 'conductive-vinyl' | 'esd-linoleum' | 'epoxy-esd';
        };
        accessRamps: ChecklistItem;
        ventGrilles: ChecklistItem & {
            percentage?: number;  // 15-25%
            type?: 'perforated' | 'directional' | 'dampered';
        };
        cableCutouts: ChecklistItem;
    };
    notes: string;
}

// Phase 3: Walls
export interface WallsPhase {
    status: PhaseStatus;
    items: {
        plasterFinish: ChecklistItem & {
            type?: 'gypsum' | 'cement' | 'lime';
        };
        fireRatedCladding: ChecklistItem & {
            rating?: FireRating;
            material?: 'gypsum-board' | 'calcium-silicate' | 'cement-board';
        };
        vaporBarrier: ChecklistItem & {
            type?: 'pe-foil' | 'aluminum-membrane' | 'smart-membrane';
        };
        thermalInsulation: ChecklistItem & {
            type?: 'mineral-wool' | 'xps' | 'pir' | 'glass-wool';
            thickness?: number;  // mm
        };
        fireRetardantPaint: ChecklistItem & {
            fireClass?: 'A1' | 'A2' | 'B' | 'C';
        };
        modularPanels: ChecklistItem & {
            type?: 'sandwich-panel' | 'metal-panel' | 'glass-partition';
            coreType?: 'mineral-wool' | 'pir' | 'honeycomb';
        };
        sealingPenetrations: ChecklistItem;
    };
    notes: string;
}

// Phase 4: Fire Protection
export interface FireProtectionPhase {
    status: PhaseStatus;
    items: {
        fireCompartments: ChecklistItem & {
            rating?: FireRating;
        };
        fireDoors: ChecklistItem & {
            rating?: FireDoorRating;
            autoClose?: boolean;
            quantity?: number;
        };
        penetrationSealing: ChecklistItem & {
            type?: 'intumescent-mastic' | 'fire-collar' | 'fire-pillow' | 'expanding-tape';
        };
        smokeDetection: ChecklistItem & {
            type?: 'vesda' | 'point-detectors' | 'beam-detectors' | 'aspirating';
        };
        suppressionSystem: ChecklistItem & {
            type?: 'sprinkler' | 'fm200' | 'novec1230' | 'inert-gas' | 'water-mist';
        };
        emergencyLighting: ChecklistItem;
        evacuationSigns: ChecklistItem & {
            type?: 'luminous' | 'photoluminescent';
        };
        manualCallPoints: ChecklistItem;
    };
    notes: string;
}

// Phase 5: Electrical Infrastructure
export interface ElectricalPhase {
    status: PhaseStatus;
    items: {
        groundingSystem: ChecklistItem & {
            resistance?: number;  // Ohm, should be < 1
            type?: 'mesh' | 'rod' | 'plate';
        };
        mainDistribution: ChecklistItem & {
            type?: 'mlvdb' | 'switchboard';
            capacity?: number;  // kVA
        };
        pduProvisions: ChecklistItem & {
            quantity?: number;
            type?: 'basic' | 'metered' | 'switched' | 'monitored';
        };
        cableTrayRoutes: ChecklistItem & {
            type?: 'ladder' | 'perforated' | 'wire-mesh';
            separation?: boolean;  // power/data separation
        };
        upsProvisions: ChecklistItem & {
            capacity?: number;  // kVA
            runtime?: number;  // minutes
            location?: 'in-room' | 'separate-room';
        };
        generatorProvisions: ChecklistItem & {
            connection?: boolean;
            fuelType?: 'diesel' | 'gas' | 'dual-fuel';
        };
        lighting: ChecklistItem & {
            type?: 'led' | 'fluorescent';
            luxLevel?: number;
        };
        emergencyPower: ChecklistItem;
    };
    notes: string;
}

// Phase 6: HVAC
export interface HVACPhase {
    status: PhaseStatus;
    items: {
        coolingUnits: ChecklistItem & {
            type?: 'crac' | 'crah' | 'in-row' | 'rear-door';
            capacity?: number;  // kW
            quantity?: number;
        };
        containment: ChecklistItem & {
            type?: 'hot-aisle' | 'cold-aisle' | 'chimney' | 'none';
        };
        ductwork: ChecklistItem & {
            type?: 'underfloor' | 'overhead' | 'both';
            insulated?: boolean;
        };
        temperatureSensors: ChecklistItem & {
            quantity?: number;
            type?: 'wired' | 'wireless';
        };
        humiditySensors: ChecklistItem;
        bmsIntegration: ChecklistItem;
        condensateDrains: ChecklistItem;
        freshAirIntake: ChecklistItem;
    };
    notes: string;
}

// Phase 7: Security
export interface SecurityPhase {
    status: PhaseStatus;
    items: {
        accessControl: ChecklistItem & {
            type?: 'card' | 'pin' | 'biometric' | 'multi-factor';
        };
        cctvSystem: ChecklistItem & {
            cameraCount?: number;
            recordingDays?: number;
            type?: 'ip' | 'analog';
        };
        intrusionDetection: ChecklistItem & {
            type?: 'pir' | 'magnetic-contact' | 'glass-break' | 'vibration';
        };
        mantrap: ChecklistItem & {
            type?: 'double-door' | 'turnstile' | 'portal';
        };
        visitorManagement: ChecklistItem;
        cabinetLocks: ChecklistItem & {
            type?: 'key' | 'electronic' | 'biometric';
        };
    };
    notes: string;
}

// Phase 8: Compliance
export interface CompliancePhase {
    status: PhaseStatus;
    items: {
        tierCertification: ChecklistItem & {
            targetTier?: TierLevel;
        };
        tia942Compliance: ChecklistItem;
        en50600Compliance: ChecklistItem;
        bicsiCompliance: ChecklistItem;
        localBuildingCode: ChecklistItem;
        fireCodeCompliance: ChecklistItem;
        asBuiltDocumentation: ChecklistItem;
        materialCertificates: ChecklistItem;
        testReports: ChecklistItem;
    };
    notes: string;
}

// Complete Room Preparation
export interface RoomPreparation {
    id: string;
    projectId?: string;
    roomName: string;
    roomCode?: string;
    createdAt: string;
    updatedAt: string;
    status: 'draft' | 'in-progress' | 'completed';
    completionPercentage: number;

    // All phases
    structure: StructurePhase;
    flooring: FlooringPhase;
    walls: WallsPhase;
    fireProtection: FireProtectionPhase;
    electrical: ElectricalPhase;
    hvac: HVACPhase;
    security: SecurityPhase;
    compliance: CompliancePhase;
}

// Phase metadata for wizard
export interface PhaseConfig {
    id: string;
    key: keyof Omit<RoomPreparation, 'id' | 'projectId' | 'roomName' | 'roomCode' | 'createdAt' | 'updatedAt' | 'status' | 'completionPercentage'>;
    title: string;
    titleRo: string;
    icon: string;  // Lucide icon name
    description: string;
    descriptionRo: string;
}

export const PHASE_CONFIG: PhaseConfig[] = [
    {
        id: 'structure',
        key: 'structure',
        title: 'Structure & Dimensions',
        titleRo: 'Structură & Dimensiuni',
        icon: 'Ruler',
        description: 'Room dimensions, floor capacity, and structure type',
        descriptionRo: 'Dimensiuni cameră, capacitate planșeu și tip structură'
    },
    {
        id: 'flooring',
        key: 'flooring',
        title: 'Flooring',
        titleRo: 'Pardoseală',
        icon: 'Layers',
        description: 'Screed, raised floor, and anti-static finish',
        descriptionRo: 'Șapă, pardoseală tehnică și finisaj anti-static'
    },
    {
        id: 'walls',
        key: 'walls',
        title: 'Walls & Finishes',
        titleRo: 'Pereți & Finisaje',
        icon: 'LayoutGrid',
        description: 'Fire-rated cladding, insulation, and vapor barriers',
        descriptionRo: 'Placare rezistentă la foc, izolație și bariere vapori'
    },
    {
        id: 'fireProtection',
        key: 'fireProtection',
        title: 'Fire Protection',
        titleRo: 'Protecție la Foc',
        icon: 'Flame',
        description: 'Detection, suppression, and compartmentation',
        descriptionRo: 'Detecție, stingere și compartimentare'
    },
    {
        id: 'electrical',
        key: 'electrical',
        title: 'Electrical Infrastructure',
        titleRo: 'Infrastructură Electrică',
        icon: 'Zap',
        description: 'Grounding, distribution, and UPS provisions',
        descriptionRo: 'Împământare, distribuție și pregătire UPS'
    },
    {
        id: 'hvac',
        key: 'hvac',
        title: 'HVAC & Cooling',
        titleRo: 'HVAC & Răcire',
        icon: 'Wind',
        description: 'Cooling units, containment, and airflow',
        descriptionRo: 'Unități răcire, containment și flux aer'
    },
    {
        id: 'security',
        key: 'security',
        title: 'Security & Access',
        titleRo: 'Securitate & Acces',
        icon: 'Shield',
        description: 'Access control, CCTV, and intrusion detection',
        descriptionRo: 'Control acces, CCTV și detecție intruziune'
    },
    {
        id: 'compliance',
        key: 'compliance',
        title: 'Standards & Compliance',
        titleRo: 'Standarde & Conformitate',
        icon: 'ClipboardCheck',
        description: 'Tier certification and documentation',
        descriptionRo: 'Certificare Tier și documentație'
    }
];

// Default values
export const createDefaultChecklistItem = (
    id: string,
    label: string,
    description?: string,
    required: boolean = false
): ChecklistItem => ({
    id,
    label,
    description,
    status: 'pending',
    required
});

export const createDefaultRoomPreparation = (roomName: string = 'New Room'): RoomPreparation => ({
    id: crypto.randomUUID(),
    roomName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    completionPercentage: 0,

    structure: {
        status: 'not-started',
        dimensions: { length: 0, width: 0, height: 0 },
        floorLoadCapacity: 1000,
        clearHeightAboveFloor: 2.5,
        clearHeightBelowCeiling: 0.5,
        structureType: 'concrete',
        notes: ''
    },

    flooring: {
        status: 'not-started',
        items: {
            selfLevelingScreed: { ...createDefaultChecklistItem('screed', 'Șapă autonivelantă', 'Self-leveling screed 3-10cm'), thickness: 5, strength: 'C25' },
            waterproofing: { ...createDefaultChecklistItem('waterproof', 'Hidroizolație', 'Waterproofing membrane'), type: 'pvc-membrane' },
            raisedFloor: { ...createDefaultChecklistItem('raised-floor', 'Pardoseală tehnică', 'Raised access floor', true), height: 45, loadCapacity: 1000, panelType: 'hpl' },
            antiStaticFinish: { ...createDefaultChecklistItem('antistatic', 'Finisaj anti-static', 'ESD flooring finish', true), type: 'hpl-tiles' },
            accessRamps: createDefaultChecklistItem('ramps', 'Rampe de acces', 'Access ramps for heavy equipment'),
            ventGrilles: { ...createDefaultChecklistItem('grilles', 'Grile ventilație', 'Floor vent grilles 15-25% open area'), percentage: 20, type: 'perforated' },
            cableCutouts: createDefaultChecklistItem('cutouts', 'Decupări cabluri', 'Cable entry cutouts')
        },
        notes: ''
    },

    walls: {
        status: 'not-started',
        items: {
            plasterFinish: { ...createDefaultChecklistItem('plaster', 'Glet de finisare', 'Wall plaster finish'), type: 'gypsum' },
            fireRatedCladding: { ...createDefaultChecklistItem('fire-cladding', 'Placare rezistentă la foc', 'Fire-rated wall cladding', true), rating: 'REI60', material: 'gypsum-board' },
            vaporBarrier: { ...createDefaultChecklistItem('vapor', 'Barieră vapori', 'Vapor barrier membrane'), type: 'pe-foil' },
            thermalInsulation: { ...createDefaultChecklistItem('insulation', 'Izolație termică', 'Thermal insulation'), type: 'mineral-wool', thickness: 100 },
            fireRetardantPaint: { ...createDefaultChecklistItem('fire-paint', 'Vopsea ignifugă', 'Fire retardant paint'), fireClass: 'A2' },
            modularPanels: { ...createDefaultChecklistItem('panels', 'Panouri modulare', 'Modular wall panels'), type: 'sandwich-panel', coreType: 'mineral-wool' },
            sealingPenetrations: createDefaultChecklistItem('sealing', 'Etanșare goluri', 'Seal all penetrations')
        },
        notes: ''
    },

    fireProtection: {
        status: 'not-started',
        items: {
            fireCompartments: { ...createDefaultChecklistItem('compartments', 'Compartimentare foc', 'Fire compartmentation', true), rating: 'REI60' },
            fireDoors: { ...createDefaultChecklistItem('doors', 'Uși antifoc', 'Fire-rated doors', true), rating: 'EI60', autoClose: true, quantity: 2 },
            penetrationSealing: { ...createDefaultChecklistItem('pen-seal', 'Etanșare penetrații', 'Fire stop penetrations', true), type: 'intumescent-mastic' },
            smokeDetection: { ...createDefaultChecklistItem('smoke', 'Detecție fum', 'Smoke detection system', true), type: 'vesda' },
            suppressionSystem: { ...createDefaultChecklistItem('suppression', 'Sistem stingere', 'Fire suppression system', true), type: 'novec1230' },
            emergencyLighting: createDefaultChecklistItem('emergency-light', 'Iluminat de urgență', 'Emergency lighting', true),
            evacuationSigns: { ...createDefaultChecklistItem('evac-signs', 'Marcaje evacuare', 'Evacuation signage', true), type: 'photoluminescent' },
            manualCallPoints: createDefaultChecklistItem('call-points', 'Butoane alarmare', 'Manual call points', true)
        },
        notes: ''
    },

    electrical: {
        status: 'not-started',
        items: {
            groundingSystem: { ...createDefaultChecklistItem('grounding', 'Priză de pământ', 'Grounding system < 1Ω', true), resistance: 0.5, type: 'mesh' },
            mainDistribution: { ...createDefaultChecklistItem('distribution', 'Tablou principal', 'Main distribution board', true), type: 'mlvdb', capacity: 400 },
            pduProvisions: { ...createDefaultChecklistItem('pdu', 'Pregătire PDU', 'PDU provisions'), quantity: 4, type: 'monitored' },
            cableTrayRoutes: { ...createDefaultChecklistItem('trays', 'Trasee cabluri', 'Cable tray routes', true), type: 'ladder', separation: true },
            upsProvisions: { ...createDefaultChecklistItem('ups', 'Pregătire UPS', 'UPS provisions', true), capacity: 100, runtime: 15, location: 'separate-room' },
            generatorProvisions: { ...createDefaultChecklistItem('generator', 'Pregătire Generator', 'Generator provisions'), connection: true, fuelType: 'diesel' },
            lighting: { ...createDefaultChecklistItem('lighting', 'Iluminat', 'Room lighting', true), type: 'led', luxLevel: 500 },
            emergencyPower: createDefaultChecklistItem('emergency-power', 'Alimentare urgență', 'Emergency power circuits', true)
        },
        notes: ''
    },

    hvac: {
        status: 'not-started',
        items: {
            coolingUnits: { ...createDefaultChecklistItem('cooling', 'Unități răcire', 'Cooling units', true), type: 'in-row', capacity: 50, quantity: 4 },
            containment: { ...createDefaultChecklistItem('containment', 'Containment', 'Aisle containment', true), type: 'hot-aisle' },
            ductwork: { ...createDefaultChecklistItem('ducts', 'Conducte aer', 'Air ductwork'), type: 'underfloor', insulated: true },
            temperatureSensors: { ...createDefaultChecklistItem('temp-sensors', 'Senzori temperatură', 'Temperature sensors', true), quantity: 12, type: 'wireless' },
            humiditySensors: createDefaultChecklistItem('humidity', 'Senzori umiditate', 'Humidity sensors', true),
            bmsIntegration: createDefaultChecklistItem('bms', 'Integrare BMS', 'BMS integration'),
            condensateDrains: createDefaultChecklistItem('drains', 'Drenaj condens', 'Condensate drains'),
            freshAirIntake: createDefaultChecklistItem('fresh-air', 'Aer proaspăt', 'Fresh air intake')
        },
        notes: ''
    },

    security: {
        status: 'not-started',
        items: {
            accessControl: { ...createDefaultChecklistItem('access', 'Control acces', 'Access control system', true), type: 'multi-factor' },
            cctvSystem: { ...createDefaultChecklistItem('cctv', 'Sistem CCTV', 'CCTV surveillance', true), cameraCount: 8, recordingDays: 30, type: 'ip' },
            intrusionDetection: { ...createDefaultChecklistItem('intrusion', 'Detecție intruziune', 'Intrusion detection'), type: 'pir' },
            mantrap: { ...createDefaultChecklistItem('mantrap', 'Sas acces', 'Access mantrap'), type: 'double-door' },
            visitorManagement: createDefaultChecklistItem('visitors', 'Gestionare vizitatori', 'Visitor management'),
            cabinetLocks: { ...createDefaultChecklistItem('locks', 'Încuietori rack', 'Cabinet locks', true), type: 'electronic' }
        },
        notes: ''
    },

    compliance: {
        status: 'not-started',
        items: {
            tierCertification: { ...createDefaultChecklistItem('tier', 'Certificare Tier', 'Tier certification target'), targetTier: 'III' },
            tia942Compliance: createDefaultChecklistItem('tia942', 'Conformitate TIA-942', 'TIA-942 compliance'),
            en50600Compliance: createDefaultChecklistItem('en50600', 'Conformitate EN 50600', 'EN 50600 compliance'),
            bicsiCompliance: createDefaultChecklistItem('bicsi', 'Conformitate BICSI', 'BICSI compliance'),
            localBuildingCode: createDefaultChecklistItem('building-code', 'Cod construcții local', 'Local building code compliance', true),
            fireCodeCompliance: createDefaultChecklistItem('fire-code', 'Normativ PSI', 'Fire code compliance', true),
            asBuiltDocumentation: createDefaultChecklistItem('as-built', 'Documentație As-Built', 'As-built documentation', true),
            materialCertificates: createDefaultChecklistItem('certificates', 'Certificate materiale', 'Material certificates', true),
            testReports: createDefaultChecklistItem('test-reports', 'Rapoarte teste', 'Test reports', true)
        },
        notes: ''
    }
});

// Helper to calculate completion percentage
export function calculateCompletionPercentage(room: RoomPreparation): number {
    let totalItems = 0;
    let completedItems = 0;

    const phases = ['flooring', 'walls', 'fireProtection', 'electrical', 'hvac', 'security', 'compliance'] as const;

    for (const phase of phases) {
        const phaseData = room[phase];
        if ('items' in phaseData) {
            const items = Object.values(phaseData.items) as ChecklistItem[];
            totalItems += items.length;
            completedItems += items.filter(item => item.status === 'completed' || item.status === 'not-applicable').length;
        }
    }

    // Add structure phase (counts as 1 item)
    totalItems += 1;
    if (room.structure.status === 'completed') {
        completedItems += 1;
    }

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}
