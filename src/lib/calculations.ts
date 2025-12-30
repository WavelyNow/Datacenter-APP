import { PipeSegment, EquipmentItem } from './types';
import { PIPE_STANDARDS } from './pipeStandards';
import { MUPRO_MASTER_CATALOG, MuproComponent } from './muproVerifiedStandards';

// Accessory Weights (Estimated Average)
export const ACCESSORY_WEIGHTS = {
    ANCHOR: 0.15, // kg (M10/M12)
    CLAMP_SMALL: 0.25, // kg (< DN50)
    CLAMP_MEDIUM: 0.55, // kg (DN50 - DN100)
    CLAMP_LARGE: 1.20, // kg (> DN100)
    BOLT_SET: 0.08, // kg (Bolt + Nut + Washer)
    CONEXPAND: 0.12 // kg
};

// Helper to estimate clamp weight based on size
export const getClampWeight = (sizeStr: string): number => {
    const size = parseInt(sizeStr.replace(/\D/g, '')) || 50;
    if (size <= 50) return ACCESSORY_WEIGHTS.CLAMP_SMALL;
    if (size <= 100) return ACCESSORY_WEIGHTS.CLAMP_MEDIUM;
    return ACCESSORY_WEIGHTS.CLAMP_LARGE;
};

// Helper to get pipe data safely
const getPipeData = (material: string, size: string) => {
    if (material === 'custom') return null;
    const standard = PIPE_STANDARDS[material];
    if (!standard) return null;
    return standard.dimensions.find(d => d.dn === size);
};

// Precise density interpolation for Ethylene Glycol at 20°C
export const getFluidDensity = (percentage: number): number => {
    // Data points: [Percentage, Density kg/L]
    const points = [
        [0, 1.000],
        [10, 1.011],
        [20, 1.024],
        [30, 1.038],
        [40, 1.051],
        [50, 1.065],
        [60, 1.077],
        [100, 1.115]
    ];

    // Clamp percentage
    const p = Math.max(0, Math.min(100, percentage));

    // Find the two points surrounding P
    for (let i = 0; i < points.length - 1; i++) {
        const [p1, d1] = points[i];
        const [p2, d2] = points[i + 1];

        if (p >= p1 && p <= p2) {
            // Linear interpolation
            const ratio = (p - p1) / (p2 - p1);
            return d1 + (d2 - d1) * ratio;
        }
    }

    return 1.000; // Fallback
};

export const calculatePipeVolume = (segment: PipeSegment): number => {
    if (!segment) return 0;
    let innerDiameterMm = 0;

    if (segment.material === 'custom') {
        innerDiameterMm = segment.customInnerDiameter || 0;
    } else {
        const pipeData = getPipeData(segment.material, segment.size);
        if (pipeData) {
            innerDiameterMm = pipeData.id;
        }
    }

    if (innerDiameterMm <= 0) return 0;

    const radius = innerDiameterMm / 2 / 1000; // convert mm to meters
    const area = Math.PI * Math.pow(radius, 2);
    const volumeCubicMeters = area * segment.length;

    return volumeCubicMeters * 1000; // convert to Liters
};

export const calculateTotalVolume = (
    segments: PipeSegment[],
    equipmentList: EquipmentItem[],
    safetyMargin: boolean
): number => {
    const pipesVolume = segments.reduce((sum, seg) => sum + (seg ? calculatePipeVolume(seg) : 0), 0);
    const equipmentVolume = equipmentList?.reduce((sum, item) => sum + (item.volume || 0), 0) || 0;

    const baseVolume = pipesVolume + equipmentVolume;

    return safetyMargin ? baseVolume * 1.05 : baseVolume;
};

export const calculateGlycolVolume = (totalVolume: number, percentage: number): number => {
    return totalVolume * (percentage / 100);
};

export const calculateWaterVolume = (totalVolume: number, percentage: number): number => {
    return totalVolume * (1 - percentage / 100);
};

export const calculateSystemWeight = (
    segments: PipeSegment[],
    equipmentList: EquipmentItem[],
    totalVolume: number,
    glycolPercentage: number = 0 // Default to water if not provided
): { emptyWeight: number; fluidWeight: number; totalWeight: number } => {

    // 1. Calculate Total Empty Pipe Weight
    const pipeEmptyWeight = segments.reduce((sum, seg) => {
        if (!seg) return sum;
        let weightPerMeter = 0;

        if (seg.material === 'custom') {
            weightPerMeter = seg.customWeight || 0;
        } else {
            const pipeData = getPipeData(seg.material, seg.size);
            if (pipeData) {
                weightPerMeter = pipeData.weight;
            }
        }
        return sum + (weightPerMeter * seg.length);
    }, 0);

    // 2. Calculate Empty Equipment Weight
    const equipmentEmptyWeight = equipmentList?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;

    // 3. Calculate Fluid Weight
    const fluidDensity = getFluidDensity(glycolPercentage);
    const fluidWeight = totalVolume * fluidDensity;

    const totalEmptyWeight = pipeEmptyWeight + equipmentEmptyWeight;

    return {
        emptyWeight: totalEmptyWeight,
        fluidWeight,
        totalWeight: totalEmptyWeight + fluidWeight
    };
};

export interface BoQItem {
    id: string;
    materialName: string;
    standardName: string;
    size: string;
    totalLength: number;
}

export const generateBoQ = (segments: PipeSegment[]): BoQItem[] => {
    const boqMap = new Map<string, BoQItem>();

    segments.forEach(segment => {
        if (!segment) return;
        let key = '';
        let materialName = '';
        let standardName = '';
        let sizeName = '';

        if (segment.material === 'custom') {
            key = `custom|manual|${segment.customInnerDiameter}`;
            materialName = 'Otel/Custom (Manual)';
            standardName = 'N/A';
            sizeName = `ID: ${segment.customInnerDiameter}mm`;
        } else {
            key = `${segment.material}|${segment.size}`;

            // Get pretty name from standards
            const standard = PIPE_STANDARDS[segment.material];
            materialName = standard ? standard.label : segment.material;
            standardName = 'Standard';
            sizeName = segment.size;
        }

        if (boqMap.has(key)) {
            const item = boqMap.get(key)!;
            item.totalLength += segment.length;
        } else {
            boqMap.set(key, {
                id: key,
                materialName: materialName,
                standardName: standardName,
                size: sizeName,
                totalLength: segment.length
            });
        }
    });

    // Convert map to array and sort by material name then size
    return Array.from(boqMap.values()).sort((a, b) => {
        if (a.materialName !== b.materialName) {
            return a.materialName.localeCompare(b.materialName);
        }
        return a.size.localeCompare(b.size, undefined, { numeric: true, sensitivity: 'base' });
    });
};

export interface DetailedWeightItem {
    id: string;
    description: string;
    quantity: string;
    emptyWeight: number;
    fluidWeight: number;
    totalWeight: number;
    type: 'pipe' | 'equipment';
}

export const getDetailedWeightReport = (
    segments: PipeSegment[],
    equipmentList: EquipmentItem[],
    glycolPercentage: number
): DetailedWeightItem[] => {
    const report: DetailedWeightItem[] = [];
    const fluidDensity = getFluidDensity(glycolPercentage);

    // 1. Process Pipe Segments
    segments.forEach(seg => {
        if (!seg) return;
        let weightPerMeter = 0;
        let innerDiameterMm = 0;
        let description = '';

        if (seg.material === 'custom') {
            weightPerMeter = seg.customWeight || 0;
            innerDiameterMm = seg.customInnerDiameter || 0;
            description = `Teava Custom: ID ${innerDiameterMm}mm`;
        } else {
            const standard = PIPE_STANDARDS[seg.material];
            const pipeData = getPipeData(seg.material, seg.size);

            if (standard && pipeData) {
                weightPerMeter = pipeData.weight;
                innerDiameterMm = pipeData.id;
                description = `Teava ${standard.label} - ${seg.size}`;
            } else {
                description = `Unknown Pipe: ${seg.material} - ${seg.size}`;
            }
        }

        const emptyWeight = weightPerMeter * seg.length;

        const radius = innerDiameterMm / 2 / 1000;
        const area = Math.PI * Math.pow(radius, 2);
        const volLitres = (area * seg.length) * 1000;
        const fluidWeight = volLitres * fluidDensity;

        report.push({
            id: seg.id,
            description,
            quantity: `${seg.length.toFixed(2)} m`,
            emptyWeight,
            fluidWeight,
            totalWeight: emptyWeight + fluidWeight,
            type: 'pipe'
        });
    });

    // 2. Process Equipment
    equipmentList?.forEach(item => {
        const fluidWeight = (item.volume || 0) * fluidDensity;
        const emptyWeight = item.weight || 0;

        report.push({
            id: item.id,
            description: `Echipament: ${item.type} (${item.name || 'Fără Nume'})`,
            quantity: "1 buc",
            emptyWeight: emptyWeight,
            fluidWeight,
            totalWeight: emptyWeight + fluidWeight,
            type: 'equipment'
        });
    });

    return report;
};

// --- SUPPORT CALCULATIONS ---

export interface SupportItem {
    segmentId: string;
    description: string;
    length: number; // m
    spacing: number;
    weightPerMeterEmpty: number;
    fluidWeightPerMeter: number;
    insulationWeightPerMeter: number;
    totalWeightPerMeter: number; // Unfactored
    loadPerPoint: number; // kg (Unfactored service load)
    designLoad: number; // kg (Factored Ultimate Limit State - ULS)
    recommendedProfile: MuproComponent | null;
    quantity: number;
    mountingType: 'concrete' | 'suspended';
    pipesPerSupport: number;
    anchorReaction: number; // kg (ULS)
    height?: number;
    isHeavyDuty?: boolean;

    // Engineering Analysis
    moment: number; // kg*m (Bending Moment)
    stress: number; // MPa (N/mm2)
    deflection: number; // mm
    utilization: number; // %
    status: 'pass' | 'fail' | 'critical' | 'warning';
    mountingNote?: string;
}

// Engineering Constants
const E_STEEL = 210000; // MPa (N/mm2) - Modulus of Elasticity for Steel
const GAMMA_STEEL = 1.35; // Partial Safety Factor for permanent loads (Eurocode) -> Simplified to Load Factor here
const GAMMA_FLUID = 1.0; // Variable load factor
const DYNAMIC_FACTOR = 1.2; // Vibration/Dynamic factor

const ALLOWABLE_DEFLECTION_RATIO = 250; // L/250

// Helper to generate Mounting Note
const generateMountingNote = (profile: { sku: string }, base: { sku: string }, bolt: { sku: string }, cap: { sku: string }): string => {
    return `Fixați Articolul ${base.sku} în pardoseală folosind 4 ancore M12. Introduceți Articolul ${profile.sku} și blocați cu șuruburi cap ciocan Articol ${bolt.sku}. Atașați Capace de protecție ${cap.sku}.`;
};

// Find a suitable profile from our VERIFIED catalog based on load
const findOptimalProfile = (designLoadKg: number, armLengthM: number, isHeavyDuty: boolean = false, model: 'cantilever' | 'beam' = 'cantilever'): any => {
    // 1. Get Channels from Master Catalog
    let candidates = MUPRO_MASTER_CATALOG.filter(c => c.category === 'profile');

    // 2. Filter by Capacity
    if (isHeavyDuty) {
        candidates = candidates.filter(p => p.loadCapacity === 'Heavy');
    }

    // 3. Sort by Weight (Approximate efficiency)
    candidates.sort((a, b) => (a.weight || 0) - (b.weight || 0));

    for (const profile of candidates) {
        if (!profile.structural) continue;

        const { utilization, deflection } = calculateMechanicalStress(designLoadKg, armLengthM, profile, model);
        const deflectionLimit = (armLengthM * 1000) / ALLOWABLE_DEFLECTION_RATIO;

        if (utilization < 100 && deflection < deflectionLimit) {
            return profile;
        }
    }

    // Fallback: Return heaviest
    return candidates[candidates.length - 1];
};

export const calculateMechanicalStress = (
    loadKg: number,
    lengthM: number,
    profile: { structural?: { Iy?: number; Wy?: number };[key: string]: any },
    model: 'cantilever' | 'beam' = 'cantilever'
): { stress: number, deflection: number, moment: number, utilization: number } => {

    const loadN = loadKg * 9.81;
    const lengthMm = lengthM * 1000;

    // 1. Calculate Moment
    // Cantilever: M = F * L
    // Simple Beam (Point Load Middle): M = F * L / 4
    const momentNm = model === 'cantilever' ? (loadN * lengthM) : (loadN * lengthM / 4);
    const momentNmm = momentNm * 1000;

    // 2. Calculate Bending Stress (Sigma = M / W)
    const Wy_mm3 = (profile.structural?.Wy || 10) * 1000;
    const stressMPa = momentNmm / Wy_mm3;

    // 3. Calculate Deflection (Delta)
    // Cantilever: (F * L^3) / (3 * E * I)
    // Simple Beam: (F * L^3) / (48 * E * I)
    const Iy_mm4 = (profile.structural?.Iy || 10) * 10000;
    const divider = model === 'cantilever' ? 3 : 48;

    const deflectionMm = (loadN * Math.pow(lengthMm, 3)) / (divider * E_STEEL * Iy_mm4);

    // 4. Utilization Ratio
    const yieldStrength = 235;
    const utilization = (stressMPa / yieldStrength) * 100;

    return {
        stress: stressMPa,
        deflection: deflectionMm,
        moment: momentNm,
        utilization
    };
};



export const calculateSupportReport = (
    segments: PipeSegment[],
    glycolPercentage: number,
    config: {
        spacing: number;
        mountingType: 'concrete' | 'suspended';
        pipesPerSupport: number;
        insulationThickness: number;
        insulationDensity: number;
        height: number;
    }
): SupportItem[] => {
    const spacing = config.spacing;
    const fluidDensity = getFluidDensity(glycolPercentage);
    const mountingHeight = config.height || 1.5; // Default safe height

    // Use values from config
    const INSULATION_DENSITY = config.insulationDensity;
    const INSULATION_THICKNESS_MM = config.insulationThickness;

    return segments.map(seg => {
        if (!seg) return null;
        let weightPerMeterEmpty = 0;
        let innerDiameterMm = 0;
        let outerDiameterMm = 0; // Needed for insulation calc
        let fluidVolumePerMeter = 0;
        let dn = 0;
        let description = '';

        if (seg.material === 'custom') {
            weightPerMeterEmpty = seg.customWeight || 0;
            innerDiameterMm = seg.customInnerDiameter || 0;
            outerDiameterMm = innerDiameterMm + 4; // Assume 2mm wall
            description = `Custom: ID ${innerDiameterMm}mm`;
            dn = Math.round(innerDiameterMm); // Approximate DN for custom
        } else {
            const standard = PIPE_STANDARDS[seg.material];
            const pipeData = getPipeData(seg.material, seg.size);
            if (standard && pipeData) {
                weightPerMeterEmpty = pipeData.weight;
                innerDiameterMm = pipeData.id;
                outerDiameterMm = pipeData.od || (pipeData.id + 4);
                description = `${standard.label} - ${seg.size}`;
                dn = Number(pipeData.dn);
            } else {
                description = `Unknown ${seg.material}`;
                return null;
            }
        }

        // 1. Fluid Weight
        const radiusIdM = innerDiameterMm / 2 / 1000;
        const areaInner = Math.PI * Math.pow(radiusIdM, 2);
        const fluidWeightPerMeter = (areaInner * 1000) * fluidDensity;

        // 2. Insulation Weight
        // Area of annulus = PI * (Rq^2 - R_pipe^2)
        const radiusOdM = outerDiameterMm / 2 / 1000;
        const radiusInsulationM = radiusOdM + (INSULATION_THICKNESS_MM / 1000);
        const areaInsulation = Math.PI * (Math.pow(radiusInsulationM, 2) - Math.pow(radiusOdM, 2));
        const insulationWeightPerMeter = areaInsulation * INSULATION_DENSITY; // m2 * kg/m3 = kg/m

        const totalWeightPerMeter = weightPerMeterEmpty + fluidWeightPerMeter + insulationWeightPerMeter;

        // 3. Load Calculations
        // Service Load (Characteristic) per support
        // Total Linear Weight * Spacing * NumPipes
        const serviceLoadPerPoint = totalWeightPerMeter * spacing * config.pipesPerSupport;

        // Design Load (ULS) for Strength check
        const designLoad = serviceLoadPerPoint * 1.4;

        // 4. Structural Analysis
        // Assume arm length = width required for pipes + gap
        const requiredArmLengthM = ((outerDiameterMm + (INSULATION_THICKNESS_MM * 2) + 50) * config.pipesPerSupport) / 1000; // approx width

        // --- HEAVY DUTY LOGIC START ---
        // Rule: If DN >= 200 OR Load > 500kg -> Switch to Heavy Duty
        const isHeavyDuty = (dn >= 200) || (designLoad > 500);
        // --- HEAVY DUTY LOGIC END ---

        // --- 4a. Find Beam Profile (Arm Check) ---
        // For Pipes > 1 or Concrete mounting, assume H-Frame (Supported at both ends -> Simple Beam).
        // For 1 pipe Suspended, might be Cantilever (Tija) or Trapeze.
        // Rule: Pipes=1 -> Cantilever (Console). Pipes>1 -> Beam (H-Frame). Concrete -> Always Post+Beam (Beam model for arm).
        const isBeam = config.pipesPerSupport > 1 || config.mountingType === 'concrete';
        const calculationModel = isBeam ? 'beam' : 'cantilever';

        const beamProfile = findOptimalProfile(designLoad, Math.max(requiredArmLengthM, 0.2), isHeavyDuty, calculationModel);

        // --- 4b. Find Post Profile (Height Check) ---
        // Only for Concrete / Floor Stand.
        // Check for Lateral Stability (15% of vertical load) acting at top of post.
        // Post is always a Cantilever for lateral stability check.
        let postProfile = beamProfile;
        if (config.mountingType === 'concrete') {
            const lateralLoad = designLoad * 0.15;
            postProfile = findOptimalProfile(lateralLoad, mountingHeight, isHeavyDuty, 'cantilever');
        }

        // Select the heavier profile to be safe for both
        const recommendedProfile = (postProfile.weight > beamProfile.weight) ? postProfile : beamProfile;

        // Recalculate stress for the chosen one
        const governedByPost = postProfile.weight > beamProfile.weight;
        const analysisLoad = governedByPost ? (designLoad * 0.15) : designLoad;
        const analysisLength = governedByPost ? mountingHeight : Math.max(requiredArmLengthM, 0.2);
        // If post governed, model is cantilever (lateral load). If beam governed, use determined model.
        const analysisModel = governedByPost ? 'cantilever' : calculationModel;

        const analysis = calculateMechanicalStress(analysisLoad, analysisLength, recommendedProfile, analysisModel);

        // 5. Anchors
        const numAnchors = config.mountingType === 'concrete' ? 4 : 2;

        // Add Support Self-Weight
        // H-Frame: Beam + 2 Posts. Trapeze: Beam.
        const beamW = recommendedProfile.weight * Math.max(requiredArmLengthM, 0.4);
        const postW = (config.mountingType === 'concrete') ? (recommendedProfile.weight * mountingHeight * 2) : 0;
        const totalProfileWeight = beamW + postW;

        const clampsWeight = config.pipesPerSupport * getClampWeight(seg.size);
        const assemblyWeight = (config.pipesPerSupport * ACCESSORY_WEIGHTS.BOLT_SET) + (numAnchors * 0.1);

        const totalSupportSelfWeight = totalProfileWeight + clampsWeight + assemblyWeight;

        // Total Load on Anchors
        const totalAnchorLoad = designLoad + (totalSupportSelfWeight * 1.35);
        const anchorReaction = totalAnchorLoad / numAnchors;

        // Quantity (Total supports needed)
        // Logic Update: Calculate effective route length based on piping.
        // Assuming pipesPerSupport implies parallel pipes along the same route.
        // Total Route Length = Total Pipe Segment Length / Pipes Per Support.
        // E.g. 100m of pipe, 4 pipes/support = 25m of route.
        const effectiveRouteLength = seg.length / config.pipesPerSupport;
        const quantity = Math.ceil(effectiveRouteLength / spacing) + 1;

        let status: 'pass' | 'warning' | 'critical' = 'pass';
        if (analysis.utilization > 80) status = 'warning'; // Warning, but acceptable
        if (analysis.utilization > 100) status = 'critical'; // Fail
        if (analysis.deflection > (analysisLength * 1000 / ALLOWABLE_DEFLECTION_RATIO)) status = 'critical';

        // --- Heavy Duty Trigger Check ---
        // If > 2 pipes, we might want to warn or force heavy if close to limit.
        // Current logic handles force via `isHeavyDuty` flag passed to `findOptimalProfile`.

        return {
            segmentId: seg.id,
            description,
            length: seg.length,
            spacing,
            weightPerMeterEmpty,
            fluidWeightPerMeter,
            insulationWeightPerMeter,
            totalWeightPerMeter,
            loadPerPoint: serviceLoadPerPoint,
            designLoad,
            recommendedProfile,
            quantity,
            mountingType: config.mountingType,
            pipesPerSupport: config.pipesPerSupport,
            height: config.height,
            anchorReaction,
            moment: analysis.moment,
            stress: analysis.stress,
            deflection: analysis.deflection,
            utilization: analysis.utilization,
            status,
            isHeavyDuty,
            mountingNote: generateMountingNote(
                { sku: recommendedProfile.sku },
                { sku: isHeavyDuty ? '131842' : '131840' },
                { sku: isHeavyDuty ? '110435' : '110419' },
                { sku: recommendedProfile.sku === '130004' || recommendedProfile.sku === '130014' ? '105805' : '105808' }
            )
        };

    }).filter(item => item !== null) as SupportItem[];
};

export interface BoMItem {
    id: string;
    component: string;
    specs: string;
    quantity: number;
    unit: string;
    category: 'fixings' | 'profile' | 'accessories';
    groupName?: string; // e.g. "Segment DN200"
    sku?: string;
}

export const generateSupportBoM = (supportItems: SupportItem[]): BoMItem[] => {
    const bomList: BoMItem[] = [];

    // Group items by Segment to match "Group by Pipe Segment" requirement
    const segmentGroups = new Map<string, SupportItem[]>();
    supportItems.forEach(item => {
        const key = item.segmentId; // Group by Segment
        if (!segmentGroups.has(key)) {
            segmentGroups.set(key, []);
        }
        segmentGroups.get(key)!.push(item);
    });

    segmentGroups.forEach((items, segmentId) => {
        if (items.length === 0) return;

        const firstItem = items[0];
        const groupLabel = firstItem.description;
        const profile = firstItem.recommendedProfile as any as MuproComponent; // Cast safely
        const isHeavyDuty = firstItem.isHeavyDuty;
        const quantity = items.reduce((sum, i) => sum + i.quantity, 0);

        // --- 1. PROFILES (Piece Counting) ---
        // Rule: If H <= 2.0m: Use 2m SKU (1 piece per post/rail). If H > 2.0m: Use 6m SKU (calculate cuts).
        // Exception: Heavy Duty profiles (41/62 and up) only have 6m SKUs.

        const mountingHeight = firstItem.height || 1.5;
        const isLightProfile = profile.sku === '130004' || profile.sku === '130014'; // 41/21 or 41/41

        const use2mSku = mountingHeight <= 2.0 && isLightProfile;

        // Determine the actual SKU to use
        let finalProfileStub = profile;
        if (use2mSku) {
            const sku2m = profile.sku === '130004' ? '130001' : '130011';
            finalProfileStub = MUPRO_MASTER_CATALOG.find(c => c.sku === sku2m) || profile;
        } else if (isHeavyDuty) {
            // Ensure we use the correct Heavy SKU if not already set (generic fallback might have set 6m, which is correct)
            // 41/62 (150979) or 41/124 (150570). The findOptimalProfile should return these correctly.
            // No strict re-mapping needed unless generic names were used.
        }

        // Calculation of pieces being ordered
        let totalPieces = 0;
        let unitLabel = 'buc';
        let specsLabel = 'Bară 6m';

        if (use2mSku) {
            // 1 piece per element. (2 posts + crossbar ~ 3 pieces if separate, or cuts).
            // Simplified: Total meters needed / 2m per bar.
            // H-Frame: 2 posts (H) + 1 crossbar (W). 
            // Total Length per Support = (H*2) + 1.2.
            const totalMeters = quantity * (mountingHeight * 2 + 1.2);
            totalPieces = Math.ceil(totalMeters / 2);
            unitLabel = 'buc (2m)';
            specsLabel = 'Bară 2m';
        } else {
            // Buying 6m bars.
            // Total Meters Required
            const totalMeters = quantity * (mountingHeight * 2 + 1.2);
            totalPieces = Math.ceil(totalMeters / 6);

            unitLabel = 'buc (6m)';
            if (mountingHeight < 3.0) {
                specsLabel = `Bară 6m (Debit: 2x ${mountingHeight}m + 1.2m)`;
            }
        }

        bomList.push({
            id: `PROF_${segmentId}`,
            groupName: groupLabel,
            component: finalProfileStub.name,
            specs: specsLabel,
            sku: finalProfileStub.sku,
            quantity: totalPieces,
            unit: unitLabel,
            category: 'profile'
        });

        // --- 2. ACCESSORIES (System Hardware) ---
        const numPosts = 2; // Assume H-Frame

        // 2.1 Base Plates
        // Logic Update from User Request:
        // 131842 -> For MPR 41/21
        // 131840 -> For MPR 41/41 (and implicitly 41/62 / Heavy as it's Q100)
        let plateSku = '131840'; // Default Q100
        if (profile.sku.includes('130004') || profile.sku.includes('130001')) { // 41/21 match
            plateSku = '131842';
        }

        const plate = MUPRO_MASTER_CATALOG.find(c => c.sku === plateSku);
        if (plate) {
            bomList.push({
                id: `BASE_${segmentId}`,
                groupName: groupLabel,
                component: plate.name,
                specs: '-',
                sku: plate.sku,
                quantity: quantity * numPosts,
                unit: 'buc',
                category: 'accessories'
            });
        }

        // 2.2 Anchors (Fixed 4 per Plate)
        bomList.push({
            id: `ANCH_${segmentId}`,
            groupName: groupLabel,
            component: 'Ancoră Heavy-Duty M12',
            specs: 'M12x100', // Still technical, acceptable
            sku: 'GENERIC_ANCHOR',
            quantity: quantity * numPosts * 4,
            unit: 'buc',
            category: 'fixings'
        });

        // 2.3 Bolts (M10 vs M12)
        const boltSku = isHeavyDuty ? '110435' : '110419';
        const bolt = MUPRO_MASTER_CATALOG.find(c => c.sku === boltSku);
        if (bolt) {
            bomList.push({
                id: `BOLT_${segmentId}`,
                groupName: groupLabel,
                component: bolt.name,
                specs: isHeavyDuty ? 'M12x40' : 'M10x30',
                sku: bolt.sku,
                quantity: quantity * 6, // 4 for base + 2 for clamps/crossbar
                unit: 'buc',
                category: 'fixings'
            });
        }

        // 2.4 End Caps
        // 105805 (41/41 & 41/21 usually fits or specific. User Request: "End Cap 41/41: 105805")
        // 105808 (41/62)
        const capSku = isHeavyDuty || profile.name.includes('62') ? '105808' : '105805';
        const cap = MUPRO_MASTER_CATALOG.find(c => c.sku === capSku);
        if (cap) {
            bomList.push({
                id: `CAP_${segmentId}`,
                groupName: groupLabel,
                component: cap.name,
                specs: 'Protecție',
                sku: cap.sku,
                quantity: quantity * 4, // 2 per rail end (posts top + crossbar ends)
                unit: 'buc',
                category: 'accessories'
            });
        }

        // --- 3. CLAMPS ---
        // User Request: 
        // 101037 (DN100), 101234 (DN200), 101258 (DN300)
        // Range checking from MASTER CATALOG is best, but simple logic works too.
        const sizeNum = parseInt(firstItem.description.replace(/\D/g, '')) || 50;
        let clampSku = '101037';
        if (sizeNum > 200) clampSku = '101258';
        else if (sizeNum > 100) clampSku = '101234';

        const clamp = MUPRO_MASTER_CATALOG.find(c => c.sku === clampSku);
        if (clamp) {
            bomList.push({
                id: `CLAMP_${segmentId}`,
                groupName: groupLabel,
                component: clamp.name,
                specs: `DN${sizeNum}`,
                sku: clamp.sku,
                quantity: quantity * firstItem.pipesPerSupport,
                unit: 'buc',
                category: 'fixings'
            });
        }
    });

    return bomList;
};
