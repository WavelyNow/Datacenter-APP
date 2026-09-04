
import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
    Plus, Trash2,
    Copy, Activity, LayoutList, Workflow, ShoppingCart,
    Flame, ArrowLeftRight, AlertTriangle
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ContextMenu, ContextMenuAction } from './ui/ContextMenu';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import type { PipeDimension, PipeStandard } from '@/lib/pipeStandards';
import { PipeSegment, FluidType, EquipmentItem, FittingItem } from '@/lib/types';
import { calculateHydraulics, suggestPipeSize, calculateFlowFromLoad } from '@/lib/calc/hydraulics';
import { calculateFittingsPressureLoss, Fitting } from '@/lib/calculations/fittings';
import { getFluidProperties } from '@/lib/calculations/pressureDrop';
import { calculatePurchaseSummary } from '@/lib/calculations/purchase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { PumpRecommender } from './PumpRecommender';
// Duplicate imports removed
import { ThermalAnalysisSheet } from './ThermalAnalysisSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { NumberInput } from '@/components/ui/ValidatedInput';
import { ManifoldBuilder } from './tools/ManifoldBuilder';

const PressureDropChart = dynamic(() => import('./PressureDropChart').then(mod => mod.PressureDropChart), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted/10 animate-pulse rounded-xl" />
});

interface PipeManagerProps {
    segments: PipeSegment[];
    equipmentList?: EquipmentItem[];
    onSegmentsChange: (segments: PipeSegment[]) => void;
    fluidType?: FluidType;
    glycolPercentage?: number;
    safetyMargin?: boolean;
    safetyMarginPercentage?: number;
    fittingItems?: FittingItem[];
    onFittingItemsChange?: (items: FittingItem[]) => void;
    className?: string;
    isLoading?: boolean;
}

const inferSingleSdr = (standard: PipeStandard): number | undefined => {
    const matches = [...new Set(
        `${standard.label} ${standard.description}`
            .match(/SDR\s*[\d.]+/gi)
            ?.map(value => Number(value.replace(/SDR\s*/i, ''))) ?? []
    )];
    return matches.length === 1 ? matches[0] : undefined;
};

const getDimensionRating = (standard: PipeStandard, dimension: PipeDimension): string => {
    const pressure = dimension.pressureClass;
    const sdr = dimension.sdr ?? inferSingleSdr(standard);
    return [
        pressure === undefined ? '' : `PN${pressure}`,
        sdr === undefined ? '' : `SDR${sdr}`,
    ].filter(Boolean).join(' · ');
};

const getDimensionLabel = (dimension: PipeDimension): string => {
    return dimension.nominalDn ? `${dimension.nominalDn} · ${dimension.dn}` : dimension.dn;
};

// Separate component for row rendering to enable React.memo
const PipeRow = React.memo(({
    segment,
    index,
    viewMode,
    glycolPercentage,
    fluidType,
    updateSegment,
    duplicateSegment,
    removeSegment,
    onAnalyzeThermal,
    onContextMenu, // [NEW] Handler
    fittings,
    onFittingCountChange
}: {
    segment: PipeSegment;
    index: number;
    viewMode: 'config' | 'hydraulics';
    glycolPercentage: number;
    fluidType: FluidType;
    updateSegment: (id: string, updates: Partial<PipeSegment>) => void;
    duplicateSegment: (id: string) => void;
    removeSegment: (id: string) => void;
    onAnalyzeThermal: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, id: string) => void; // [NEW] signature
    fittings?: Record<string, number>;
    onFittingCountChange?: (type: string, size: string, count: number) => void;
}) => {
    const isCustom = segment.material === 'custom';
    const standardData = !isCustom ? PIPE_STANDARDS[segment.material] : null;
    const selectedDimension = standardData?.dimensions.find(d => d.dn === segment.size);
    const id_mm = isCustom ? (segment.customInnerDiameter || 0) : (selectedDimension?.id || 0);
    const pressureOrSdr = standardData && selectedDimension
        ? getDimensionRating(standardData, selectedDimension)
        : '';

    // Hydraulics Calc — REAL fluid properties (density + viscosity per TYPE and %),
    // nu formula liniară veche 1000 + %×5 care dădea valori diferite de restul aplicației
    // Helper „debit din sarcina": kW + dT introduse inline cand debitul nu e cunoscut
    const [loadKwDraft, setLoadKwDraft] = useState<string | number>('');
    const [dT, setDt] = useState(7);

    const hasFlow = (segment.flowRate || 0) > 0;
    const fluidProps = getFluidProperties(fluidType, glycolPercentage);
    const hydraulics = calculateHydraulics(
        segment.flowRate || 0,
        id_mm,
        0.045,
        fluidProps.densityKgM3,
        fluidProps.kinematicViscosityM2S
    );

    const isHighVelocity = hydraulics.velocity > 2.5;

    // Pierderi locale prin coturi/teuri/vane trecute pe aceasta masura (K x rho v^2/2)
    const fitMap = fittings || {};
    const hasAnyFitting = Object.values(fitMap).some(q => (q ?? 0) > 0);
    let fittingLossKPa: ReturnType<typeof calculateFittingsPressureLoss> | null = null;
    if (fitMap && hasAnyFitting && hasFlow && id_mm > 0) {
        const list: Fitting[] = Object.entries(fitMap)
            .filter(([, q]) => (q ?? 0) > 0)
            .map(([type, quantity]) => ({ id: type, type: type as never, size: segment.size, quantity }));
        if (list.length > 0) {
            fittingLossKPa = calculateFittingsPressureLoss(list as Fitting[], segment.flowRate || 0, id_mm, fluidProps.densityKgM3);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15, delay: Math.min(index, 8) * 0.03 }}
            className="relative mx-3 my-2 grid grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-card px-4 py-4 transition-all group hover:bg-muted/40 lg:mx-0 lg:my-0 lg:grid-cols-12 lg:items-center lg:gap-6 lg:rounded-none lg:border-0 lg:border-b lg:border-border/30 lg:px-8 lg:py-5"
            onContextMenu={(e) => onContextMenu(e, segment.id)} // [NEW] Trigger
        >
            {/* Index */}
            <div className="col-span-1 flex items-center justify-between text-muted-foreground/40 font-mono text-xs font-medium lg:justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 lg:hidden">Tronson</span>
                {String(index + 1).padStart(2, '0')}
            </div>

            {viewMode === 'config' ? (
                <>
                    {/* Material & Size Specs */}
                    <div className="col-span-1 min-w-0 space-y-3 lg:col-span-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <select
                                aria-label={`Material țeavă tronson ${index + 1}`}
                                className="w-full bg-transparent border-none p-0 text-sm font-medium text-foreground focus:ring-0 cursor-pointer hover:text-primary transition-colors tracking-tight"
                                value={segment.material}
                                onChange={(e) => {
                                    const nextMaterial = e.target.value;
                                    const nextStandard = PIPE_STANDARDS[nextMaterial];
                                    updateSegment(segment.id, {
                                        material: nextMaterial,
                                        size: nextStandard?.dimensions[0]?.dn ?? '',
                                        customInnerDiameter: nextMaterial === 'custom' ? segment.customInnerDiameter : undefined,
                                    });
                                }}
                            >
                                {Object.entries(PIPE_STANDARDS).map(([key, std]) => (
                                    <option key={key} value={key}>{std.label}</option>
                                ))}
                                <option value="custom">Personalizat / BIM — fără catalog</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            {isCustom ? (
                                <div className="w-full space-y-2">
                                    <div
                                        role="alert"
                                        className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-700 dark:text-amber-300"
                                    >
                                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <span>
                                            <strong>Fără catalog:</strong> folosește Personalizat / BIM doar când nu există o dimensiune oficială. Introdu ID-ul din fișa tehnică sau model și verifică manual segmentul înainte de calcul și export.
                                        </span>
                                    </div>
                                    <NumberInput
                                        value={segment.customInnerDiameter || 0}
                                        onChange={(val) => updateSegment(segment.id, { customInnerDiameter: val })}
                                        label="ID interior din fișă/BIM"
                                        placeholder="ID interior"
                                        endAdornment="mm"
                                        min={0}
                                        className="max-w-[180px]"
                                    />
                                </div>
                            ) : (
                                <div className="w-full space-y-2">
                                    <select
                                        aria-label="Dimensiune comercială"
                                        className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2.5 text-xs text-muted-foreground focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none hover:bg-muted/50 transition-colors"
                                        value={segment.size}
                                        onChange={(e) => updateSegment(segment.id, { size: e.target.value })}
                                    >
                                        {standardData?.dimensions.map(d => (
                                            <option key={d.dn} value={d.dn}>
                                                {getDimensionLabel(d)} {d.inch !== '-' ? `(${d.inch})` : ''} — OD {d.od} mm · grosime {d.thickness} mm · ID {d.id} mm{standardData ? ` · ${getDimensionRating(standardData, d)}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedDimension ? (
                                        <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                                            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                                <span>Dimensiune comercială: <strong className="text-foreground">{getDimensionLabel(selectedDimension)}{selectedDimension.inch !== '-' ? ` (${selectedDimension.inch})` : ''}</strong></span>
                                                {selectedDimension.nominalDn && <span>DN nominal: <strong className="text-foreground">{selectedDimension.nominalDn}</strong></span>}
                                                <span>OD: <strong className="text-foreground">{selectedDimension.od} mm</strong></span>
                                                <span>Grosime: <strong className="text-foreground">{selectedDimension.thickness} mm</strong></span>
                                                <span>ID hidraulic: <strong className="text-foreground">{selectedDimension.id} mm</strong></span>
                                            </div>
                                            {pressureOrSdr && (
                                                <div className="mt-1 border-t border-border/30 pt-1">
                                                    Presiune / SDR: <strong className="text-foreground">{pressureOrSdr}</strong>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-700 dark:text-red-300">
                                            Dimensiunea salvată nu există în catalogul standardului ales. Selectează o dimensiune disponibilă înainte de calcul.
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Helper: nu stii debitul? Calculeaza-l din sarcina (kW / dT) */}
                            {(segment.flowRate ?? 0) <= 0 && standardData && (
                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                                    <span className="text-[10px] text-muted-foreground">Din sarcină:</span>
                                    <input
                                        type="number"
                                        aria-label={`Sarcină termică tronson ${index + 1} în kW`}
                                        min={0}
                                        placeholder="kW"
                                        value={loadKwDraft || ''}
                                        onChange={(e) => setLoadKwDraft(parseFloat(e.target.value) || '')}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-14 bg-background border border-border/50 rounded px-1 py-0.5 text-center font-mono outline-none focus:border-primary"
                                    />
                                    <span className="text-muted-foreground/60">/</span>
                                    <input
                                        type="number"
                                        aria-label={`Diferență de temperatură tronson ${index + 1} în K`}
                                        min={0.5}
                                        max={20}
                                        value={dT}
                                        onChange={(e) => setDt(parseFloat(e.target.value) || 7)}
                                        onClick={(e) => e.stopPropagation()}
                                        title="ΔT tur-retur (K)"
                                        className="w-10 bg-background border border-border/50 rounded px-1 py-0.5 text-center font-mono outline-none focus:border-primary"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const kw = Number(loadKwDraft);
                                            if (kw > 0) {
                                                const r = calculateFlowFromLoad(kw, dT, fluidType, glycolPercentage);
                                                updateSegment(segment.id, { flowRate: Math.round(r.flowM3H * 10) / 10 });
                                            }
                                        }}
                                        disabled={!loadKwDraft}
                                        className="px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 font-medium disabled:opacity-30"
                                        title="kW / ΔT -> m³/h, cu proprietatile reale ale glicolului"
                                        aria-label={`Calculează debitul din sarcină pentru tronsonul ${index + 1}`}
                                    >
                                        → m³/h
                                    </button>
                                </div>
                            )}

                            {/* Sugestie DN din debit — scopul principal al aplicatiei */}
                            {(() => {
                                const flow = segment.flowRate || 0;
                                if (flow <= 0 || !standardData) return null;
                                const dims = standardData.dimensions ?? [];
                                const sugg = suggestPipeSize(flow, dims, 2.5, fluidProps.kinematicViscosityM2S, fluidProps.densityKgM3);
                                if (!sugg) return null;
                                return (
                                    <div className="mt-1 flex items-center gap-2 text-xs">
                                        <span className={`px-2 py-0.5 rounded-full font-medium ${sugg.withinLimit ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                            Recomandat: {sugg.size} · {sugg.velocity.toFixed(1)} m/s {!sugg.withinLimit && '(peste limita — alege mai mare)'}
                                        </span>
                                        {sugg.size !== segment.size && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateSegment(segment.id, { size: sugg.size }); }}
                                                className="text-primary hover:underline font-medium"
                                                aria-label={`Aplică dimensiunea recomandată ${sugg.size} pentru tronsonul ${index + 1}`}
                                            >
                                                Aplica
                                            </button>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Length */}
                    <div className="col-span-1 lg:col-span-3" onClick={(e) => e.stopPropagation()}>
                        <NumberInput
                            value={segment.length}
                            onChange={(val) => updateSegment(segment.id, { length: val })}
                            min={0.1}
                            max={10000}
                            endAdornment="m"
                            className="max-w-[160px]"
                            errorMessage="Lungime invalidă"
                        />
                    </div>

                    {/* Fittinguri pe această mărime (coturi / teuri / vane) */}
                    <div className="col-span-1 flex flex-col gap-1 text-xs lg:col-span-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60" title="Volumul acestui segment">
                            Volum: {(Math.PI * Math.pow(id_mm / 200, 2) * segment.length * 10).toFixed(1)} L
                        </span>
                        <span className="text-[9px] text-muted-foreground/50 -mb-0.5" title="Bucati totale pe aceasta masura (toate segmentele cu acest DN)">
                            Fittinguri ({segment.size} — total pe masura)
                        </span>
                        {[
                            { key: 'elbow_90_std', label: 'Coturi' },
                            { key: 'tee_branch', label: 'Teuri' },
                            { key: 'valve_ball', label: 'Vane' },
                        ].map(f => (
                            <div key={f.key} className="flex items-center gap-2">
                                <span className="w-12 text-[10px] text-muted-foreground">{f.label}</span>
                                <input
                                    type="number"
                                    aria-label={`${f.label} pentru dimensiunea ${segment.size}`}
                                    min={0}
                                    step={1}
                                    value={fittings?.[f.key] ?? 0}
                                    onChange={(e) => onFittingCountChange?.(f.key, segment.size, Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-14 bg-muted/40 border border-border/40 rounded-md px-1.5 py-0.5 text-center font-mono text-[11px] outline-none focus:border-primary/50"
                                    title={`Numar ${f.label.toLowerCase()} pe ${segment.size} — apar in lista de cumparat`}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1 border-t border-border/50 pt-3 lg:col-span-1 lg:border-0 lg:pt-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); duplicateSegment(segment.id); }}
                            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl transition-all hover:scale-105 active:scale-95"
                            title="Duplică"
                            aria-label={`Duplică tronsonul ${index + 1}`}
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAnalyzeThermal(segment.id); }}
                            className="p-2.5 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all hover:scale-105 active:scale-95"
                            title="Analiză termică"
                            aria-label={`Deschide analiza termică pentru tronsonul ${index + 1}`}
                        >
                            <Flame className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeSegment(segment.id); }}
                            className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all hover:scale-105 active:scale-95"
                            title="Șterge"
                            aria-label={`Șterge tronsonul ${index + 1}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Hydraulics View Columns */}
                    <div className="col-span-1 lg:col-span-3">
                        <div className="text-sm font-medium text-foreground flex flex-col gap-1.5">
                            <span>{selectedDimension ? getDimensionLabel(selectedDimension) : segment.size} <span className="text-muted-foreground text-xs font-normal opacity-70">({segment.length}m)</span></span>
                            {selectedDimension && (
                                <span className="text-[10px] text-muted-foreground font-normal">
                                    OD {selectedDimension.od} mm · grosime {selectedDimension.thickness} mm · ID {selectedDimension.id} mm
                                </span>
                            )}
                        </div>
                        <div className="text-[10px] text-muted-foreground bg-muted/40 border border-border/30 px-2.5 py-0.5 rounded-full w-fit">
                            {standardData?.label || 'Personalizat / BIM'}
                        </div>
                    </div>

                    <div className="col-span-1 lg:col-span-3">
                        <NumberInput
                            value={segment.flowRate || 0}
                            onChange={(val) => updateSegment(segment.id, { flowRate: val })}
                            min={0}
                            endAdornment="m³/h"
                            className="max-w-[160px]"
                        />
                    </div>

                    <div className="col-span-1 lg:col-span-3">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${isHighVelocity ? 'bg-red-500' : 'bg-primary'}`}
                                        style={{ width: `${Math.min((hydraulics.velocity / 3) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className={`text-xs font-mono text-right ${isHighVelocity ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                    {hydraulics.velocity} m/s
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 text-left lg:col-span-2 lg:text-right">
                        <div className="text-sm font-mono text-foreground font-semibold">
                            {hydraulics.pressureDropPa} <span className="text-xs text-muted-foreground font-normal">Pa/m</span>
                        </div>
                        {fittingLossKPa && (
                            <div className="text-xs text-muted-foreground mt-1 font-medium opacity-80" title={`K total: ${fittingLossKPa.totalKFactor.toFixed(1)}`}>
                                Fittinguri: +{fittingLossKPa.totalPressureDropKPa.toFixed(2)} kPa
                            </div>
                        )}
                        <div className="text-xs mt-1 font-medium text-primary font-bold">
                            Total{fittingLossKPa ? ' (cu fittinguri)' : ''}: {((hydraulics.pressureDropKpa * segment.length) + (fittingLossKPa?.totalPressureDropKPa ?? 0)).toFixed(2)} kPa
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
});

PipeRow.displayName = 'PipeRow';

export const PipeManager: React.FC<PipeManagerProps> = ({
    segments,
    equipmentList = [],
    onSegmentsChange,
    fluidType = 'ethylene',
    glycolPercentage = 0,
    safetyMargin = false,
    safetyMarginPercentage = 5,
    fittingItems = [],
    onFittingItemsChange,
    className,
    isLoading = false
}) => {
    const [viewMode, setViewMode] = useState<'config' | 'hydraulics' | 'simulator'>('config');
    const [thermalAnalysisId, setThermalAnalysisId] = useState<string | null>(null);
    const parentRef = useRef<HTMLDivElement>(null);

    // Fittinguri agregate pe mărime (pentru inputurile din tabel)
    const fitBySize = React.useMemo(() => {
        const map: Record<string, Record<string, number>> = {};
        for (const f of fittingItems) {
            if (!map[f.size]) map[f.size] = {};
            map[f.size][f.type] = f.quantity;
        }
        return map;
    }, [fittingItems]);

    const handleFittingCount = React.useCallback((type: string, size: string, count: number) => {
        const others = fittingItems.filter(f => !(f.type === type && f.size === size));
        const next = count > 0
            ? [...others, { id: `fit-${type}-${size}`, type, size, quantity: count }]
            : others;
        onFittingItemsChange?.(next);
    }, [fittingItems, onFittingItemsChange]);

    // Virtualizer — chei stabile pe id + estimare corecta pe viewMode + masurare reala
    const rowVirtualizer = useVirtualizer({
        count: segments.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => (viewMode === 'config' ? 150 : 90),
        getItemKey: i => segments[i]?.id ?? i,
        overscan: 6,
    });

    const addSegment = useCallback(() => {
        const defaultStandard = PIPE_STANDARDS['steel_light'];
        const defaultPipe = defaultStandard.dimensions.find(d => d.dn === 'DN25') || defaultStandard.dimensions[0];

        const newSegment: PipeSegment = {
            id: crypto.randomUUID(),
            material: 'steel_light',
            standard: 'Standard',
            size: defaultPipe.dn,
            length: 10,
            flowRate: 0
        };
        onSegmentsChange([...segments, newSegment]);
        toast.success('Segment de țeavă adăugat', { description: 'DN25 - 10m' });
    }, [segments, onSegmentsChange]);

    const removeSegment = useCallback((id: string) => {
        onSegmentsChange(segments.filter(s => s.id !== id));
        toast.error('Segment șters');
    }, [segments, onSegmentsChange]);

    const duplicateSegment = useCallback((id: string) => {
        const original = segments.find(s => s.id === id);
        if (!original) return;
        const duplicate = { ...original, id: crypto.randomUUID() };
        const index = segments.findIndex(s => s.id === id);
        const newSegments = [...segments];
        newSegments.splice(index + 1, 0, duplicate);
        onSegmentsChange(newSegments);
        toast.info('Segment duplicat');
    }, [segments, onSegmentsChange]);

    const updateSegment = useCallback((id: string, updates: Partial<PipeSegment>) => {
        onSegmentsChange(segments.map(s => {
            if (s.id !== id) return s;

            const updated = { ...s, ...updates };

            if (updates.material) {
                if (updates.material === 'custom') {
                    updated.size = 'custom';
                    updated.customInnerDiameter = 0;
                    updated.customWeight = 0;
                } else {
                    const standardData = PIPE_STANDARDS[updated.material];
                    if (standardData) {
                        const defaultPipe = standardData.dimensions[0];
                        updated.size = defaultPipe.dn;
                    }
                }
            }
            return updated;
        }));
    }, [segments, onSegmentsChange]);

    // Calculate totals — with REAL fluid properties (glycol-aware), not water-hardcoded
    const totalPressureDrop = useMemo(() => {
        const props = getFluidProperties(fluidType, glycolPercentage);
        return segments.reduce((sum, s) => {
            const id_mm = s.material === 'custom' ? (s.customInnerDiameter || 0) : (PIPE_STANDARDS[s.material]?.dimensions.find(d => d.dn === s.size)?.id || 0);
            const res = calculateHydraulics(s.flowRate || 0, id_mm, 0.045, props.densityKgM3, props.kinematicViscosityM2S);
            return sum + (res.pressureDropKpa * s.length);
        }, 0);
    }, [segments, glycolPercentage, fluidType]);

    // Sumar de comanda — ACELEAȘI cifre ca Dashboard/PDF (cu volum fittinguri real)
    const purchase = useMemo(() => calculatePurchaseSummary(
        segments, equipmentList, glycolPercentage, fluidType,
        safetyMargin, safetyMarginPercentage, fittingItems
    ), [segments, equipmentList, glycolPercentage, fluidType, safetyMargin, safetyMarginPercentage, fittingItems]);

    // Derived system sizing for pumps
    const maxFlowRate = useMemo(() => {
        if (segments.length === 0) return 0;
        return Math.max(...segments.map(s => s.flowRate || 0));
    }, [segments]);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; segmentId: string } | null>(null);

    const handleContextMenu = useCallback((e: React.MouseEvent, segmentId: string) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            segmentId
        });
    }, []);

    const contextMenuActions: ContextMenuAction[] = useMemo(() => {
        if (!contextMenu) return [];
        return [
            {
                label: 'Duplică țeava',
                icon: Copy,
                onClick: () => duplicateSegment(contextMenu.segmentId)
            },
            {
                label: 'Analiză termică',
                icon: Flame,
                onClick: () => setThermalAnalysisId(contextMenu.segmentId)
            },
            {
                label: 'Șterge țeava',
                icon: Trash2,
                variant: 'danger',
                onClick: () => removeSegment(contextMenu.segmentId)
            }
        ];
    }, [contextMenu, duplicateSegment, removeSegment]);

    return (
        <>
            {/* Context Menu Portal */}
            <ContextMenu
                isOpen={!!contextMenu}
                x={contextMenu?.x || 0}
                y={contextMenu?.y || 0}
                onClose={() => setContextMenu(null)}
                actions={contextMenuActions}
            />

            <div className="w-full space-y-6 sm:space-y-10">
                {/* Header Section */}
                <div className="flex flex-col gap-5 border-b border-border/40 pb-6 sm:gap-8 sm:pb-8 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                        <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:gap-4 sm:text-3xl">
                            <div className="p-2.5 bg-primary/10 rounded-2xl">
                                <Workflow className="w-6 h-6 text-primary" />
                            </div>
                            Topologia rețelei
                        </h2>
                        <p className="ml-0 max-w-2xl text-sm font-light text-muted-foreground sm:ml-16 sm:text-base">
                            Configurează tronsoanele de țeavă sau importă schema hidraulică.
                        </p>
                    </div>

                    <div role="tablist" aria-label="Mod de vizualizare" className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-border/40 bg-muted/30 p-1 backdrop-blur-sm md:w-auto md:self-auto">
                        <button
                            role="tab"
                            aria-selected={viewMode === 'config'}
                            onClick={() => setViewMode('config')}
                            className={`
                            min-w-[92px] flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 sm:min-w-0 sm:flex-none sm:px-4 sm:text-sm
                            ${viewMode === 'config'
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'}
                        `}
                        >
                            <LayoutList className="w-4 h-4" />
                            Configurare
                        </button>
                        <button
                            role="tab"
                            aria-selected={viewMode === 'hydraulics'}
                            onClick={() => setViewMode('hydraulics')}
                            className={`
                            min-w-[92px] flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 sm:min-w-0 sm:flex-none sm:px-4 sm:text-sm
                            ${viewMode === 'hydraulics'
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'}
                        `}
                        >
                            <Activity className="w-4 h-4" />
                            Hidraulică
                        </button>
                        <button
                            role="tab"
                            aria-selected={viewMode === 'simulator'}
                            onClick={() => setViewMode('simulator')}
                            className={`
                            min-w-[92px] flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 sm:min-w-0 sm:flex-none sm:px-4 sm:text-sm
                            ${viewMode === 'simulator'
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'}
                        `}
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                            Simulator
                        </button>
                    </div>
                </div>

                {viewMode === 'simulator' ? (
                    <ManifoldBuilder />
                ) : (
                    <>
                        {/* Main Content Card */}
                        <div className={`card-premium min-w-0 overflow-hidden flex flex-col ${className || 'h-[750px]'}`}>
                    {isLoading ? (
                        <div className="p-8">
                            <TableSkeleton rows={8} />
                        </div>
                    ) : segments.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <EmptyState
                                icon={Workflow}
                                title="Nu există tronsoane definite"
                                description="Adaugă primul tronson de țeavă pentru a începe calculul hidraulic."
                                action={{
                                    label: 'Inițializează rețeaua',
                                    onClick: addSegment,
                                    variant: 'primary'
                                }}
                                steps={[
                                    "Alege materialul și dimensiunea țevii",
                                    "Introdu lungimea și debitele",
                                    "Analizează automat pierderile de presiune"
                                ]}
                                tipsLabel="Proces de proiectare"
                            />
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div role="row" className="z-20 hidden grid-cols-12 gap-6 border-b border-border/40 bg-muted/20 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground backdrop-blur-sm lg:grid">
                                <div className="col-span-1 text-center">#</div>
                                {viewMode === 'config' ? (
                                    <>
                                        <div className="col-span-5">Specificație țeavă</div>
                                        <div className="col-span-3">Lungime (m)</div>
                                        <div className="col-span-2">Fittinguri (buc) · Volum</div>
                                        <div className="col-span-1 text-right">Acțiuni</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-span-3">Tronson</div>
                                        <div className="col-span-3">Debit</div>
                                        <div className="col-span-3">Viteză</div>
                                        <div className="col-span-2 text-right">Pierdere de presiune</div>
                                    </>
                                )}
                            </div>

                            {/* Virtual Scroll Container */}
                            <div
                                ref={parentRef}
                                className="flex-1 overflow-y-auto custom-scrollbar bg-background/30 backdrop-blur-[2px]"
                            >
                                <div
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize()}px`,
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                        const segment = segments[virtualRow.index];
                                        if (!segment) return null;
                                        return (
                                            <div
                                                key={segment.id || virtualRow.index}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: `${virtualRow.size}px`,
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                }}
                                            >
                                                <div ref={rowVirtualizer.measureElement} data-index={virtualRow.index}>
                                                <PipeRow
                                                    segment={segment}
                                                    index={virtualRow.index}
                                                    viewMode={viewMode}
                                                    glycolPercentage={glycolPercentage}
                                                    fluidType={fluidType}
                                                    updateSegment={updateSegment}
                                                    duplicateSegment={duplicateSegment}
                                                    removeSegment={removeSegment}
                                                    onAnalyzeThermal={setThermalAnalysisId}
                                                    onContextMenu={handleContextMenu}
                                                    fittings={fitBySize[segment.size]}
                                                    onFittingCountChange={handleFittingCount}
                                                />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer / Add Action */}
                            <div className="z-20 border-t border-border/30 bg-card/80 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-6">
                                <div className="flex flex-col items-stretch justify-between gap-5 md:flex-row md:items-center md:gap-6">
                                    <button
                                        onClick={addSegment}
                                        className="btn btn-secondary btn-md gap-2 shadow-sm text-foreground/80 hover:text-foreground w-full md:w-auto"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Adaugă {viewMode === 'config' ? 'tronson' : 'traseu de debit'}
                                    </button>

                                    <div className="flex w-full flex-wrap items-center justify-start gap-x-5 gap-y-4 text-sm md:w-auto md:justify-end md:gap-x-8">
                                        {/* Detailed Breakdown - Purchasing Formula (aceleasi cifre ca Dashboard/PDF) */}
                                        <div className="grid grid-cols-2 gap-3 lg:flex lg:items-center lg:gap-6 lg:border-r lg:border-border/30 lg:pr-6">

                                            {/* Components */}
                                            <div className="flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Țevi</span>
                                                <span className="font-mono font-medium text-sm">{purchase.pipeVolumeL.toFixed(0)} <span className="text-[10px]">L</span></span>
                                            </div>

                                            <div className="hidden text-muted-foreground/30 font-light lg:block">+</div>

                                            <div className="flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Fittinguri</span>
                                                <span className="font-mono font-medium text-sm">{purchase.fittingsVolumeL.toFixed(0)} <span className="text-[10px]">L</span></span>
                                            </div>

                                            <div className="hidden text-muted-foreground/30 font-light lg:block">+</div>

                                            <div className="flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Echipamente</span>
                                                <span className="font-mono font-medium text-sm">{purchase.equipmentVolumeL.toFixed(0)} <span className="text-[10px]">L</span></span>
                                            </div>

                                            <div className="hidden text-muted-foreground/30 font-light lg:block">+</div>

                                            <div className="flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Marja {safetyMargin ? `(${purchase.marginPercent}%)` : ''}</span>
                                                <span className="font-mono font-medium text-sm">{purchase.marginL.toFixed(0)} <span className="text-[10px]">L</span></span>
                                            </div>

                                            <div className="hidden text-muted-foreground/30 font-light lg:block">=</div>

                                            {/* Total to Buy */}
                                            <div className="flex flex-col items-end">
                                                <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
                                                    <ShoppingCart className="w-3 h-3" />
                                                    Total De Cumpărat
                                                </span>
                                                <span className="font-mono font-black text-xl text-indigo-500 bg-indigo-500/10 px-2 rounded-md border border-indigo-500/20">
                                                    {purchase.totalGlycolL.toFixed(0)} <span className="text-sm font-normal text-indigo-400">L</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* System Stats */}
                                        {viewMode === 'hydraulics' && (
                                        <div className="flex flex-col items-start md:items-end md:pl-6">
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1 opacity-70">Pierdere sistem</span>
                                                <span className="font-mono font-bold text-xl text-primary">{totalPressureDrop.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">kPa</span></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Visual Analysis Section (Hydraulics Mode) */}
                <AnimatePresence>
                    {viewMode === 'hydraulics' && segments.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[400px]"
                        >
                            {/* Chart */}
                            <div className="lg:col-span-2 h-full">
                                <PressureDropChart
                                    segments={segments}
                                    glycolPercentage={glycolPercentage}
                                    fluidType={fluidType}
                                />
                            </div>

                            {/* Pump Match */}
                            <div className="lg:col-span-1 h-full">
                                <PumpRecommender
                                    requiredFlow={maxFlowRate}
                                    requiredHead={totalPressureDrop}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                <ThermalAnalysisSheet
                    segment={segments.find(s => s.id === thermalAnalysisId) || null}
                    onClose={() => setThermalAnalysisId(null)}
                />
            </>
        )}
            </div>
        </>
    );
};
