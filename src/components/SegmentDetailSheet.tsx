import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Scale, Activity, Droplets } from 'lucide-react';
import { PipeSegment, FluidType } from '@/lib/types';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { calculateHydraulics } from '@/lib/calc/hydraulics';
import { getFluidDensity } from '@/lib/calculations/common';
import { getFluidProperties } from '@/lib/calculations/pressureDrop';

interface SegmentDetailSheetProps {
    segment: PipeSegment | null;
    onClose: () => void;
    glycolPercentage: number;
    fluidType?: FluidType;
}

interface CalcSection {
    id_mm: number;
    volume_liters: number;
    totalEmptyWeight: number;
    fluidMass: number;
    totalOperatingWeight: number;
    fluidDensityKgM3: number;
    hydraulics: ReturnType<typeof calculateHydraulics>;
}

export function SegmentDetailSheet({ segment, onClose, glycolPercentage, fluidType = 'ethylene' }: SegmentDetailSheetProps) {
    const standardData = useMemo(() => {
        if (!segment) return null;
        if (segment.material === 'custom') return null;
        return PIPE_STANDARDS[segment.material];
    }, [segment]);

    const dimensionData = useMemo(() => {
        if (!segment || !standardData) return null;
        return standardData.dimensions.find(d => d.dn === segment.size);
    }, [segment, standardData]);

    const calculations = useMemo<CalcSection | null>(() => {
        if (!segment) return null;

        const id_mm = segment.material === 'custom'
            ? (segment.customInnerDiameter || 0)
            : (dimensionData?.id || 0);

        const length_m = segment.length;
        const radius_mm = id_mm / 2;
        const area_mm2 = Math.PI * Math.pow(radius_mm, 2);
        const liters_per_m = (area_mm2 * 1000) / 1000000;
        const volume_liters = liters_per_m * length_m;

        const weightPerMeter = dimensionData?.weight || 0;
        const totalEmptyWeight = weightPerMeter * length_m;

        // Fluid weight — SINGLE source of truth (glycol-type aware)
        const fluidDensity = getFluidDensity(glycolPercentage, fluidType) * 1000; // kg/L → kg/m³
        const fluidMass = (volume_liters / 1000) * fluidDensity;

        // Hydraulics — real fluid properties (density + kinematic viscosity from type/%)
        const fluidProps = getFluidProperties(fluidType, glycolPercentage);
        const hydraulics = calculateHydraulics(
            segment.flowRate || 0,
            id_mm,
            0.045,
            fluidProps.densityKgM3,
            fluidProps.kinematicViscosityM2S
        );

        return {
            id_mm,
            volume_liters,
            totalEmptyWeight,
            fluidMass,
            totalOperatingWeight: totalEmptyWeight + fluidMass,
            fluidDensityKgM3: fluidDensity,
            hydraulics,
        };
    }, [segment, dimensionData, glycolPercentage, fluidType]);

    if (!segment || !calculations) return null;

    const velocity = calculations.hydraulics.velocity;
    const velocityOk = velocity <= 2.5;
    const hasFlow = (segment.flowRate || 0) > 0;

    const infoRow = (label: string, value: string, accent = false) => (
        <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`font-mono text-sm font-medium ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</span>
        </div>
    );

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
                        className="fixed inset-0 bg-background/30 backdrop-blur-sm z-40"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-border">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detalii traseu</span>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                    aria-label="Închide"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-baseline gap-2.5">
                                <h2 className="text-xl font-bold text-foreground">{segment.size}</h2>
                                <span className="text-sm text-muted-foreground">
                                    {standardData?.label ?? 'Custom'} · {segment.length} m
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">

                            {/* Dimensiuni — 3 tile-uri */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Ruler className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-semibold">Dimensiuni</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'Ø exterior', value: dimensionData?.od ?? segment.customInnerDiameter ? `${dimensionData?.od ?? '-'}` : '-', unit: 'mm' },
                                        { label: 'Ø interior', value: calculations.id_mm.toFixed(1).toString(), unit: 'mm' },
                                        { label: 'Volum fluide', value: calculations.volume_liters.toFixed(1).toString(), unit: 'L' },
                                    ].map(t => (
                                        <div key={t.label} className="bg-muted/30 rounded-xl p-3 text-center">
                                            <div className="text-[10px] text-muted-foreground mb-1">{t.label}</div>
                                            <div className="font-mono font-bold text-foreground text-base">{t.value}</div>
                                            <div className="text-[10px] text-muted-foreground">{t.unit}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Greutate */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Scale className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-semibold">Greutate</h3>
                                </div>
                                <div className="bg-card border border-border rounded-xl px-4">
                                    {infoRow('Țeavă (gol)', `${calculations.totalEmptyWeight.toFixed(1)} kg`)}
                                    {infoRow('Fluid (glicol)', `${calculations.fluidMass.toFixed(1)} kg`)}
                                    {infoRow('Total în funcțiune', `${calculations.totalOperatingWeight.toFixed(1)} kg`, true)}
                                </div>
                            </section>

                            {/* Hidraulică */}
                            {hasFlow && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Activity className="w-4 h-4 text-primary" />
                                        <h3 className="text-sm font-semibold">Hidraulică</h3>
                                    </div>
                                    <div className="bg-card border border-border rounded-xl px-4">
                                        {infoRow('Debit', `${segment.flowRate} m³/h`)}
                                        <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                                            <span className="text-sm text-muted-foreground">Viteză</span>
                                            <span className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${velocityOk ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                    {velocityOk ? 'OK' : 'Peste limită'}
                                                </span>
                                                <span className={`font-mono text-sm font-medium ${velocityOk ? 'text-foreground' : 'text-amber-600'}`}>{velocity} m/s</span>
                                            </span>
                                        </div>
                                        {infoRow('Regim de curgere', calculations.hydraulics.flowRegime === 'Laminar' ? 'Laminar' : calculations.hydraulics.flowRegime === 'Transitional' ? 'Tranzitoriu' : 'Turbulent')}
                                        {infoRow('Cădere totală', `${(calculations.hydraulics.pressureDropKpa * segment.length).toFixed(2)} kPa`, true)}
                                    </div>
                                </section>
                            )}

                            {/* Hint fluid */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Droplets className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-semibold">Fluid</h3>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {glycolPercentage}% {fluidType === 'propylene' ? 'propilen-glicol' : fluidType === 'ethylene' ? 'etilen-glicol' : 'apă'} ·
                                    densitate ≈ {calculations.fluidDensityKgM3.toFixed(0)} kg/m³ ·
                                    {hasFlow ? '' : ' setați un debit pentru calcul hidraulic.'}
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
