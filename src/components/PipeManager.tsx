'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Info, Settings2, GripVertical, ChevronUp, ChevronDown, Box, Copy, Activity, Sparkles, Droplets, ArrowRight } from 'lucide-react';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { PipeSegment, FluidType } from '@/lib/types';
import { calculateHydraulics } from '@/lib/calc/hydraulics';

interface PipeManagerProps {
    segments: PipeSegment[];
    onSegmentsChange: (segments: PipeSegment[]) => void;
    fluidType?: FluidType;
    glycolPercentage?: number;
}

export const PipeManager: React.FC<PipeManagerProps> = ({
    segments,
    onSegmentsChange,
    fluidType = 'water',
    glycolPercentage = 0
}) => {
    const [viewMode, setViewMode] = useState<'config' | 'hydraulics'>('config');

    const addSegment = () => {
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
    };

    const removeSegment = (id: string) => {
        onSegmentsChange(segments.filter(s => s.id !== id));
    };

    const duplicateSegment = (id: string) => {
        const original = segments.find(s => s.id === id);
        if (!original) return;
        const duplicate = { ...original, id: crypto.randomUUID() };
        const index = segments.findIndex(s => s.id === id);
        const newSegments = [...segments];
        newSegments.splice(index + 1, 0, duplicate);
        onSegmentsChange(newSegments);
    };

    const moveSegment = (id: string, direction: 'up' | 'down') => {
        const index = segments.findIndex(s => s.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === segments.length - 1) return;

        const newSegments = [...segments];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSegments[index], newSegments[targetIndex]] = [newSegments[targetIndex], newSegments[index]];
        onSegmentsChange(newSegments);
    };

    const updateSegment = (id: string, updates: Partial<PipeSegment>) => {
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
    };

    const autoSizeSegment = (id: string) => {
        const segment = segments.find(s => s.id === id);
        if (!segment || !segment.flowRate || segment.material === 'custom') return;

        const standard = PIPE_STANDARDS[segment.material];
        if (!standard) return;

        // Sort dimensions by ID ascending
        const sortedDimensions = [...standard.dimensions].sort((a, b) => a.id - b.id);

        // Find smallest pipe where velocity < 2.5 m/s
        let optimalSize = segment.size;

        // Fluid props approximation (ideal would be real lookup)
        const density = 1000 + (glycolPercentage * 5); // Rough approx
        const viscosity = 0.000001; // Water approx

        for (const dim of sortedDimensions) {
            const res = calculateHydraulics(segment.flowRate, dim.id, 0.045, density, viscosity);
            if (res.velocity <= 2.5) {
                optimalSize = dim.dn;
                break; // Found it
            }
        }

        updateSegment(id, { size: optimalSize });
    };

    const totalVolume = useMemo(() => {
        return segments.reduce((acc, s) => {
            let id_mm = 0;

            if (s.material === 'custom') {
                id_mm = s.customInnerDiameter || 0;
            } else {
                const standard = PIPE_STANDARDS[s.material];
                const pipe = standard?.dimensions.find(d => d.dn === s.size);
                if (pipe) id_mm = pipe.id;
            }

            const radius_m = id_mm / 2000;
            const vol = Math.PI * Math.pow(radius_m, 2) * s.length * 1000;
            return acc + vol;
        }, 0);
    }, [segments]);

    return (
        <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between spacing-lg mb-8">
                <div className="flex items-center spacing-md">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                        <Settings2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground flex items-center spacing-sm">
                            Pipe Manager
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                {segments.length}
                            </span>
                        </h2>
                        <p className="text-muted-foreground text-sm">Configure pipe segments and calculate hydraulics.</p>
                    </div>
                </div>

                <div className="flex bg-muted rounded-lg p-1 border border-border">
                    <button
                        onClick={() => setViewMode('config')}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'config' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Configuration
                    </button>
                    <button
                        onClick={() => setViewMode('hydraulics')}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'hydraulics' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Activity className="w-3.5 h-3.5" /> Hydraulics
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {segments.length === 0 && (
                    <div
                        onClick={addSegment}
                        className="group flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                            <Box className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-1">No Pipe Segments</h3>
                        <p className="text-muted-foreground text-sm">Add a new segment to start configuring your pipeline.</p>
                    </div>
                )}

                {segments.map((segment, index) => {
                    const isCustom = segment.material === 'custom';
                    const standardData = !isCustom ? PIPE_STANDARDS[segment.material] : null;
                    const pipeInfo = standardData?.dimensions.find(d => d.dn === segment.size);

                    // Hydraulic Calc
                    const id_mm = isCustom ? (segment.customInnerDiameter || 0) : (pipeInfo?.id || 0);
                    // Approximation for fluid props
                    const density = 1000 + (glycolPercentage * 5);
                    const viscosity = 0.000001;

                    const hydraulics = calculateHydraulics(
                        segment.flowRate || 0,
                        id_mm,
                        0.045, // roughness
                        density,
                        viscosity
                    );

                    const isHighVelocity = hydraulics.velocity > 2.5;

                    return (
                        <div key={segment.id} className="bg-muted/20 border border-border p-5 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative group transition-all duration-300 hover:border-primary/30 hover:bg-muted/30">
                            {/* Index Number */}
                            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-sm z-10">
                                {index + 1}
                            </div>

                            {viewMode === 'config' ? (
                                <>
                                    {/* Material Selection */}
                                    <div className="md:col-span-4 space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Material Standard</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-card border border-border rounded-lg py-2 pl-4 pr-10 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none appearance-none cursor-pointer"
                                                value={segment.material}
                                                onChange={(e) => updateSegment(segment.id, { material: e.target.value })}
                                            >
                                                {Object.entries(PIPE_STANDARDS).map(([key, std]) => (
                                                    <option key={key} value={key} className="bg-card text-foreground">{std.label}</option>
                                                ))}
                                                <option value="custom" className="bg-card text-amber-500 font-bold">★ Custom / Manual</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Size / Custom Logic */}
                                    {isCustom ? (
                                        <>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-xs font-medium text-amber-500/80 uppercase tracking-wider ml-1">ID (mm)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-card border border-amber-500/30 rounded-lg py-2 px-3 text-sm text-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none"
                                                    value={segment.customInnerDiameter || ''}
                                                    onChange={(e) => updateSegment(segment.id, { customInnerDiameter: parseFloat(e.target.value) || 0 })}
                                                    placeholder="mm"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-xs font-medium text-amber-500/80 uppercase tracking-wider ml-1">kg/m</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-card border border-amber-500/30 rounded-lg py-2 px-3 text-sm text-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none"
                                                    value={segment.customWeight || ''}
                                                    onChange={(e) => updateSegment(segment.id, { customWeight: parseFloat(e.target.value) || 0 })}
                                                    placeholder="kg/m"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="md:col-span-4 space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Pipe Size (DN)</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-card border border-border rounded-lg py-2 pl-4 pr-10 text-sm font-mono tracking-tight text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none appearance-none cursor-pointer"
                                                    value={segment.size}
                                                    onChange={(e) => updateSegment(segment.id, { size: e.target.value })}
                                                >
                                                    {standardData?.dimensions.map(d => (
                                                        <option key={d.dn} value={d.dn} className="bg-card text-foreground">
                                                            {d.dn} ({d.inch !== '-' ? d.inch : ''})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-mono text-muted-foreground">
                                                    ID: <span className="text-primary font-bold">{pipeInfo?.id}mm</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Length */}
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Length (m)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            className="w-full bg-card border border-border rounded-lg py-2 px-3 text-sm font-bold text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                            value={segment.length}
                                            onChange={(e) => updateSegment(segment.id, { length: parseFloat(e.target.value) || 0 })}
                                            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
                                        />
                                    </div>

                                    {/* Actions Config Mode */}
                                    <div className="md:col-span-1 border-l border-border/50 pl-4 h-full flex flex-col justify-end pb-2">
                                        <button
                                            onClick={() => removeSegment(segment.id)}
                                            className="text-destructive/50 hover:text-destructive transition-colors p-1"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // HYDRAULICS VIEW
                                <>
                                    {/* Static Info */}
                                    <div className="md:col-span-3 space-y-1">
                                        <p className="text-xs text-muted-foreground">Pipe Segment</p>
                                        <div className="font-bold text-sm">{segment.size} <span className="text-muted-foreground font-normal">({standardData?.label || 'Custom'})</span></div>
                                        <div className="text-xs font-mono text-primary">ID: {id_mm}mm</div>
                                    </div>

                                    {/* Flow Input */}
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-1">
                                            Flow Rate <span className="text-[10px] normal-case opacity-70">(m³/h)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                className="w-full bg-card border border-border rounded-lg py-2 px-3 text-sm font-bold text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                value={segment.flowRate || ''}
                                                onChange={(e) => updateSegment(segment.id, { flowRate: parseFloat(e.target.value) || 0 })}
                                                placeholder="0.0"
                                            />
                                            {/* Auto Size Button */}
                                            {(segment.flowRate || 0) > 0 && isHighVelocity && (
                                                <button
                                                    onClick={() => autoSizeSegment(segment.id)}
                                                    className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 bg-purple-500/10 text-purple-500 rounded-full hover:bg-purple-500/20 hover:scale-110 transition-all"
                                                    title="Auto-Size (Reduce Velocity)"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Calculated Results */}
                                    <div className="md:col-span-3 flex flex-col gap-1 justify-center h-full pb-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs text-muted-foreground">Velocity</span>
                                            <span className={`font-mono font-bold text-lg ${isHighVelocity ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {hydraulics.velocity} m/s
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${isHighVelocity ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min((hydraulics.velocity / 3) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-3 flex flex-col gap-1 justify-center h-full pb-2 border-l border-border/50 pl-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Pressure Drop</span>
                                            <span className="font-mono font-bold text-sm text-foreground">
                                                {hydraulics.pressureDropPa} Pa/m
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-muted-foreground">Total Drop ({segment.length}m)</span>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {(hydraulics.pressureDropKpa * segment.length).toFixed(4)} kPa
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Actions ROW for Config Mode Only (Bottom) */}
                            {viewMode === 'config' && (
                                <div className="md:col-span-12 flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => moveSegment(segment.id, 'up')}
                                            disabled={index === 0}
                                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-20"
                                            title="Move Up"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveSegment(segment.id, 'down')}
                                            disabled={index === segments.length - 1}
                                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-20"
                                            title="Move Down"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <span className="text-[10px] text-muted-foreground ml-2 hidden sm:inline">Reorder</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => duplicateSegment(segment.id)}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-all"
                                            title="Duplicate"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Duplicate</span>
                                        </button>
                                        <button
                                            onClick={() => removeSegment(segment.id)}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs bg-muted/20 px-3 py-1.5 rounded-lg border border-border">
                    {viewMode === 'config' ? (
                        <>
                            <Info className="w-3.5 h-3.5" />
                            <span>Calculated based on inner diameter (ID)</span>
                        </>
                    ) : (
                        <>
                            <Droplets className="w-3.5 h-3.5 text-blue-500" />
                            <span>Fluid: <span className="font-bold text-foreground capitalize">{fluidType}</span> ({glycolPercentage}%)</span>
                        </>
                    )}
                </div>

                {viewMode === 'config' ? (
                    <div className="flex items-baseline gap-3">
                        <span className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Total Volume</span>
                        <span className="text-3xl font-bold text-primary text-glow">{totalVolume.toFixed(2)} <span className="text-lg text-primary/50 ml-1">L</span></span>
                    </div>
                ) : (
                    <button
                        onClick={() => setViewMode('config')}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <span>Change Configuration</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* FAB for Add Segment */}
            <button
                onClick={addSegment}
                className="btn btn-primary btn-md spacing-xs group absolute top-8 right-8"
                style={{ display: viewMode === 'config' ? 'flex' : 'none' }}
            >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                <span>Add Segment</span>
            </button>
        </div>
    );
};
