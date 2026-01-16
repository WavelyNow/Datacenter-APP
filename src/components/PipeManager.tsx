'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
    Plus, Trash2, Info, Settings2, GripVertical, ChevronUp, ChevronDown,
    Copy, Activity, Droplets, ArrowRight, Gauge, LayoutList, Workflow, AlertCircle
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { PipeSegment, FluidType } from '@/lib/types';
import { calculateHydraulics } from '@/lib/calc/hydraulics';
import { isValidLength } from '@/lib/validation/schemas';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PipeManagerProps {
    segments: PipeSegment[];
    onSegmentsChange: (segments: PipeSegment[]) => void;
    fluidType?: FluidType;
    glycolPercentage?: number;
}

// Separate component for row rendering to enable React.memo
const PipeRow = React.memo(({
    segment,
    index,
    viewMode,
    glycolPercentage,
    updateSegment,
    duplicateSegment,
    removeSegment,
    isFirst,
    isLast
}: {
    segment: PipeSegment;
    index: number;
    viewMode: 'config' | 'hydraulics';
    glycolPercentage: number;
    updateSegment: (id: string, updates: Partial<PipeSegment>) => void;
    duplicateSegment: (id: string) => void;
    removeSegment: (id: string) => void;
    isFirst: boolean;
    isLast: boolean;
}) => {
    const isCustom = segment.material === 'custom';
    const standardData = !isCustom ? PIPE_STANDARDS[segment.material] : null;
    const id_mm = isCustom ? (segment.customInnerDiameter || 0) : (standardData?.dimensions.find(d => d.dn === segment.size)?.id || 0);

    // Hydraulics Calc
    const density = 1000 + (glycolPercentage * 5);
    const hydraulics = useMemo(() => calculateHydraulics(
        segment.flowRate || 0,
        id_mm,
        0.045,
        density,
        0.000001
    ), [segment.flowRate, id_mm, density]);

    const isHighVelocity = hydraulics.velocity > 2.5;
    const isInvalidLen = !isValidLength(segment.length);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="grid grid-cols-12 gap-6 px-8 py-5 items-center hover:bg-muted/40 transition-colors group relative border-b border-border/30 last:border-0"
        >
            {/* Index */}
            <div className="col-span-1 flex items-center justify-center text-muted-foreground/40 font-mono text-xs font-medium">
                {String(index + 1).padStart(2, '0')}
            </div>

            {viewMode === 'config' ? (
                <>
                    {/* Material & Size Specs */}
                    <div className="col-span-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <select
                                className="w-full bg-transparent border-none p-0 text-sm font-medium text-foreground focus:ring-0 cursor-pointer hover:text-primary transition-colors tracking-tight"
                                value={segment.material}
                                onChange={(e) => updateSegment(segment.id, { material: e.target.value })}
                            >
                                {Object.entries(PIPE_STANDARDS).map(([key, std]) => (
                                    <option key={key} value={key}>{std.label}</option>
                                ))}
                                <option value="custom">Custom Configuration</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            {isCustom ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        type="number"
                                        className="w-24 bg-muted/40 border border-border/50 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/50 outline-none"
                                        placeholder="ID mm"
                                        value={segment.customInnerDiameter || ''}
                                        onChange={(e) => updateSegment(segment.id, { customInnerDiameter: parseFloat(e.target.value) || 0 })}
                                    />
                                    <span className="text-xs text-muted-foreground">mm ID</span>
                                </div>
                            ) : (
                                <select
                                    className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2.5 text-xs text-muted-foreground focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none hover:bg-muted/50 transition-colors"
                                    value={segment.size}
                                    onChange={(e) => updateSegment(segment.id, { size: e.target.value })}
                                >
                                    {standardData?.dimensions.map(d => (
                                        <option key={d.dn} value={d.dn}>
                                            {d.dn} {d.inch !== '-' ? `(${d.inch})` : ''} - ID: {d.id}mm
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Length */}
                    <div className="col-span-3">
                        <div className="relative max-w-[160px]">
                            <input
                                type="number"
                                min="0.1"
                                max="10000"
                                step="0.1"
                                className={`w-full bg-transparent text-sm font-medium text-foreground border-b focus:outline-none py-2 pe-8 transition-colors ${isInvalidLen ? 'border-red-500 text-red-500' : 'border-border/50 focus:border-primary'
                                    }`}
                                value={segment.length}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    updateSegment(segment.id, { length: isNaN(val) ? 0 : val });
                                }}
                            />
                            {isInvalidLen ? (
                                <AlertCircle className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                            ) : (
                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">m</span>
                            )}
                        </div>
                        {isInvalidLen && (
                            <p className="text-[10px] text-red-500 mt-1.5 font-medium">Lungime invalidă</p>
                        )}
                    </div>

                    {/* Details Readout */}
                    <div className="col-span-2 flex flex-col justify-center text-xs text-muted-foreground">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Volum</span>
                            <span className="font-mono text-foreground font-medium">
                                {(Math.PI * Math.pow(id_mm / 2000, 2) * segment.length * 1000).toFixed(1)} <span className="text-muted-foreground font-normal">L</span>
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                        <button
                            onClick={() => duplicateSegment(segment.id)}
                            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl transition-all hover:scale-105 active:scale-95"
                            title="Duplicate"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => removeSegment(segment.id)}
                            className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all hover:scale-105 active:scale-95"
                            title="Remove"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Hydraulics View Columns */}
                    <div className="col-span-3">
                        <div className="text-sm font-medium text-foreground flex flex-col gap-1.5">
                            <span>{segment.size} <span className="text-muted-foreground text-xs font-normal opacity-70">({segment.length}m)</span></span>
                        </div>
                        <div className="text-[10px] text-muted-foreground bg-muted/40 border border-border/30 px-2.5 py-0.5 rounded-full w-fit">
                            {standardData?.label || 'Custom'}
                        </div>
                    </div>

                    <div className="col-span-3">
                        <div className="relative max-w-[160px]">
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                className="w-full bg-transparent text-sm font-medium text-foreground border-b border-border/50 focus:border-primary focus:outline-none py-2 pe-8 transition-colors"
                                value={segment.flowRate || ''}
                                onChange={(e) => updateSegment(segment.id, { flowRate: parseFloat(e.target.value) || 0 })}
                                placeholder="0.0"
                            />
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">m³/h</span>
                        </div>
                    </div>

                    <div className="col-span-3">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${isHighVelocity ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min((hydraulics.velocity / 3) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className={`text-xs font-mono text-right ${isHighVelocity ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                    {hydraulics.velocity} m/s
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 text-right">
                        <div className="text-sm font-mono text-foreground font-semibold">
                            {hydraulics.pressureDropPa} <span className="text-xs text-muted-foreground font-normal">Pa/m</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-medium opacity-70">
                            Total: {(hydraulics.pressureDropKpa * segment.length).toFixed(2)} kPa
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
    onSegmentsChange,
    fluidType = 'water',
    glycolPercentage = 0
}) => {
    const [viewMode, setViewMode] = useState<'config' | 'hydraulics'>('config');
    const parentRef = useRef<HTMLDivElement>(null);

    // Virtualizer with slightly larger estimate for "airy" rows
    const rowVirtualizer = useVirtualizer({
        count: segments.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100, // Increased for spacing
        overscan: 5,
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

    // Calculate totals
    const { totalVolume, totalPressureDrop } = useMemo(() => {
        return segments.reduce((acc, s) => {
            let id_mm = 0;
            if (s.material === 'custom') {
                id_mm = s.customInnerDiameter || 0;
            } else {
                const standard = PIPE_STANDARDS[s.material];
                const pipe = standard?.dimensions.find(d => d.dn === s.size);
                if (pipe) id_mm = pipe.id;
            }

            // Volume
            const radius_m = id_mm / 2000;
            const vol = Math.PI * Math.pow(radius_m, 2) * s.length * 1000;

            // Pressure Drop
            const density = 1000 + (glycolPercentage * 5); // Approx
            const hydraulics = calculateHydraulics(s.flowRate || 0, id_mm, 0.045, density, 0.000001);

            return {
                totalVolume: acc.totalVolume + vol,
                totalPressureDrop: acc.totalPressureDrop + (hydraulics.pressureDropKpa * s.length)
            };
        }, { totalVolume: 0, totalPressureDrop: 0 });
    }, [segments, glycolPercentage]);

    return (
        <div className="w-full space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-border/40">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-4">
                        <div className="p-2.5 bg-primary/10 rounded-2xl">
                            <Workflow className="w-6 h-6 text-primary" />
                        </div>
                        Network Topology
                    </h2>
                    <p className="text-base text-muted-foreground ml-16 max-w-2xl font-light">
                        Configure pipe segments manually or import from hydraulic schema.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border/40 self-start md:self-auto backdrop-blur-sm">
                    <button
                        onClick={() => setViewMode('config')}
                        className={`
                            px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2.5
                            ${viewMode === 'config'
                                ? 'bg-background text-foreground shadow-sm ring-1 ring-border/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'}
                        `}
                    >
                        <LayoutList className="w-4 h-4" />
                        Configuration
                    </button>
                    <button
                        onClick={() => setViewMode('hydraulics')}
                        className={`
                            px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2.5
                            ${viewMode === 'hydraulics'
                                ? 'bg-background text-foreground shadow-sm ring-1 ring-border/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'}
                        `}
                    >
                        <Activity className="w-4 h-4" />
                        Hydraulics
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card-premium overflow-hidden flex flex-col h-[750px]">
                {segments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                        <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center border border-border/30">
                            <Workflow className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground text-xl tracking-tight">No Segments Defined</h3>
                            <p className="text-base text-muted-foreground/80 max-w-md mx-auto font-light">
                                Start by adding your first pipe segment to begin the hydraulic calculation.
                            </p>
                        </div>
                        <button
                            onClick={addSegment}
                            className="btn btn-primary btn-md gap-3 shadow-xl shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Initialize Network
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-8 px-8 py-5 bg-muted/20 border-b border-border/40 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] backdrop-blur-sm z-20">
                            <div className="col-span-1 text-center">#</div>
                            {viewMode === 'config' ? (
                                <>
                                    <div className="col-span-5">Pipe Specification</div>
                                    <div className="col-span-3">Length (m)</div>
                                    <div className="col-span-2">Details</div>
                                    <div className="col-span-1 text-right">Actions</div>
                                </>
                            ) : (
                                <>
                                    <div className="col-span-3">Segment</div>
                                    <div className="col-span-3">Flow Rate</div>
                                    <div className="col-span-3">Velocity</div>
                                    <div className="col-span-2 text-right">Pressure Drop</div>
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
                                    return (
                                        <div
                                            key={segment.id}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                        >
                                            <PipeRow
                                                segment={segment}
                                                index={virtualRow.index}
                                                viewMode={viewMode}
                                                glycolPercentage={glycolPercentage}
                                                updateSegment={updateSegment}
                                                duplicateSegment={duplicateSegment}
                                                removeSegment={removeSegment}
                                                isFirst={virtualRow.index === 0}
                                                isLast={virtualRow.index === segments.length - 1}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer / Add Action */}
                        <div className="p-6 bg-card/80 backdrop-blur-md border-t border-border/30 flex items-center justify-between z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                            <button
                                onClick={addSegment}
                                className="btn btn-secondary btn-md gap-2 shadow-sm text-foreground/80 hover:text-foreground"
                            >
                                <Plus className="w-4 h-4" />
                                Add {viewMode === 'config' ? 'Pipe Segment' : 'Flow Path'}
                            </button>

                            <div className="flex items-center gap-10 text-sm">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1 opacity-70">Total Volume</span>
                                    <span className="font-mono font-bold text-xl">{totalVolume.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">L</span></span>
                                </div>
                                {viewMode === 'hydraulics' && (
                                    <div className="flex flex-col items-end border-l border-border/40 pl-10">
                                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1 opacity-70">System Drop</span>
                                        <span className="font-mono font-bold text-xl text-primary">{totalPressureDrop.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">kPa</span></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
