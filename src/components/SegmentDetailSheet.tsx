import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, Ruler, Scale, Activity, Box } from 'lucide-react';
import { PipeSegment, FluidType } from '@/lib/types';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { calculateHydraulics } from '@/lib/calc/hydraulics';

interface SegmentDetailSheetProps {
    segment: PipeSegment | null;
    onClose: () => void;
    glycolPercentage: number;
}

export function SegmentDetailSheet({ segment, onClose, glycolPercentage }: SegmentDetailSheetProps) {
    const standardData = useMemo(() => {
        if (!segment) return null;
        if (segment.material === 'custom') return null;
        return PIPE_STANDARDS[segment.material];
    }, [segment]);

    const dimensionData = useMemo(() => {
        if (!segment || !standardData) return null;
        return standardData.dimensions.find(d => d.dn === segment.size);
    }, [segment, standardData]);

    const calculations = useMemo(() => {
        if (!segment) return null;

        const id_mm = segment.material === 'custom'
            ? (segment.customInnerDiameter || 0)
            : (dimensionData?.id || 0);

        // Inputs
        const length_m = segment.length;
        const radius_mm = id_mm / 2;

        // Area in mm²
        const area_mm2 = Math.PI * Math.pow(radius_mm, 2);

        // Volume per meter (L/m)
        // 1 Liter = 1,000,000 mm³
        const volume_mm3_per_m = area_mm2 * 1000;
        const liters_per_m = volume_mm3_per_m / 1000000;
        const volume_liters = liters_per_m * length_m;

        // Weight
        // Empty pipe weight
        const weightPerMeter = dimensionData?.weight || 0;
        const totalEmptyWeight = weightPerMeter * length_m;

        // Fluid weight
        const fluidDensity = 1000 + (glycolPercentage * 5); // kg/m³ approximation
        // 1 m³ = 1000 L
        const volume_m3 = volume_liters / 1000;
        const fluidMass = volume_m3 * fluidDensity;

        // Hydraulics
        const hydraulics = calculateHydraulics(
            segment.flowRate || 0,
            id_mm,
            0.045, // roughness
            fluidDensity,
            0.000001
        );

        return {
            id_mm,
            radius_mm,
            area_mm2,
            length_m,
            liters_per_m,
            volume_liters,
            weightPerMeter,
            totalEmptyWeight,
            fluidDensity,
            fluidMass,
            totalOperatingWeight: totalEmptyWeight + fluidMass,
            hydraulics
        };
    }, [segment, dimensionData, glycolPercentage]);

    if (!segment) return null;

    return (
        <AnimatePresence>
            {segment && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border bg-muted/10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-primary">
                                    <Calculator className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Calculation Trace</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {segment.material === 'custom' ? 'Custom Pipe' : standardData?.label}
                            </h2>
                            <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                                <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{segment.size}</span>
                                <span>•</span>
                                <span>{segment.length}m Length</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Volume Calculation */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-foreground font-semibold pb-2 border-b border-border/50">
                                    <Box className="w-4 h-4 text-primary" />
                                    <h3>Fluid Volume Calculation</h3>
                                </div>

                                <div className="bg-muted/30 p-4 rounded-xl space-y-4 font-mono text-sm leading-relaxed">
                                    {/* Step 1: Geometry */}
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">1</span>
                                            Pipe Geometry
                                        </div>
                                        <div className="pl-5 grid grid-cols-2 gap-2 text-xs">
                                            <span className="text-muted-foreground">Inner Diameter (ID)</span>
                                            <span className="text-right">{calculations?.id_mm.toFixed(2)} mm</span>
                                            <span className="text-muted-foreground">Area (A)</span>
                                            <span className="text-right">{Math.round(calculations?.area_mm2 || 0).toLocaleString()} mm²</span>
                                        </div>
                                    </div>

                                    {/* Step 2: Capacity */}
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">2</span>
                                            Linear Capacity
                                        </div>
                                        <div className="pl-5 flex justify-between items-center bg-primary/5 p-2 rounded border border-primary/10">
                                            <span className="text-muted-foreground text-xs">Volume / Linear Meter</span>
                                            <span className="text-right text-primary font-bold">{calculations?.liters_per_m.toFixed(3)} L/m</span>
                                        </div>
                                    </div>

                                    {/* Step 3: Total */}
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">3</span>
                                            Total System Content
                                        </div>
                                        <div className="pl-5 grid grid-cols-2 gap-2 text-xs">
                                            <span className="text-muted-foreground">Pipe Length</span>
                                            <span className="text-right">{calculations?.length_m} m</span>
                                            <span className="text-muted-foreground">Calculation</span>
                                            <span className="text-right italic">{calculations?.liters_per_m.toFixed(3)} L/m × {calculations?.length_m} m</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-border/50" />

                                    {/* Final Calc Box */}
                                    <div className="bg-background border border-border rounded-xl p-4 shadow-inner">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 text-center font-bold">Total Volume</div>
                                        <div className="text-2xl font-black text-primary text-center">
                                            {calculations?.volume_liters.toFixed(2)} Liters
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Weight Analysis */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-foreground font-semibold pb-2 border-b border-border/50">
                                    <Scale className="w-4 h-4 text-primary" />
                                    <h3>Weight Analysis</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                                        <div className="text-xs text-muted-foreground mb-1">Empty Weight</div>
                                        <div className="font-mono font-medium text-lg">
                                            {calculations?.totalEmptyWeight.toFixed(2)} <span className="text-xs text-muted-foreground">kg</span>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                                        <div className="text-xs text-muted-foreground mb-1">Fluid Weight ({Math.round(calculations?.fluidDensity || 0)} kg/m³)</div>
                                        <div className="font-mono font-medium text-lg">
                                            {calculations?.fluidMass.toFixed(2)} <span className="text-xs text-muted-foreground">kg</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex justify-between items-center">
                                    <span className="text-sm font-medium text-primary">Total Operating Weight</span>
                                    <span className="text-xl font-bold text-primary font-mono">
                                        {calculations?.totalOperatingWeight.toFixed(2)} kg
                                    </span>
                                </div>
                            </section>

                            {/* Specs */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-foreground font-semibold pb-2 border-b border-border/50">
                                    <Ruler className="w-4 h-4 text-primary" />
                                    <h3>Pipe Specifications</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Outer Diameter (OD)</span>
                                        <span className="font-mono">{dimensionData?.od || '-'} mm</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Wall Thickness</span>
                                        <span className="font-mono">{dimensionData?.thickness || '-'} mm</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Inner Diameter (ID)</span>
                                        <span className="font-mono">{dimensionData?.id || calculations?.id_mm} mm</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Material Category</span>
                                        <span className="capitalize">{standardData?.category || 'Custom'}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Hydraulics (if flow rate > 0) */}
                            {(segment.flowRate || 0) > 0 && (
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-foreground font-semibold pb-2 border-b border-border/50">
                                        <Activity className="w-4 h-4 text-primary" />
                                        <h3>Hydraulics</h3>
                                    </div>
                                    <div className="bg-muted/20 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Flow Rate</span>
                                            <span className="font-mono font-medium">{segment.flowRate} m³/h</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Velocity</span>
                                            <span className={`font-mono font-bold ${(calculations?.hydraulics.velocity || 0) > 2.5 ? 'text-destructive' : 'text-primary'}`}>
                                                {calculations?.hydraulics.velocity} m/s
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Pressure Drop</span>
                                            <span className="font-mono font-medium">{calculations?.hydraulics.pressureDropPa} Pa/m</span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-border/30 flex justify-between items-center font-bold">
                                            <span className="text-sm">Total Drop</span>
                                            <span className="font-mono text-primary">
                                                {(calculations?.hydraulics.pressureDropKpa || 0) * calculations!.length_m} kPa
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            )}

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
