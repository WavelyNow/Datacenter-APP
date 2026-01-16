'use client';

import React, { useMemo, useState } from 'react';
import {
    Plus, Trash2, Info, Settings2, GripVertical, ChevronUp, ChevronDown,
    Copy, Activity, Droplets, ArrowRight, Gauge, LayoutList, Workflow, AlertCircle
} from 'lucide-react';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { PipeSegment, FluidType } from '@/lib/types';
import { calculateHydraulics } from '@/lib/calc/hydraulics';
import { isValidLength } from '@/lib/validation/schemas';

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
        <div className="w-full space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
                        <Workflow className="w-6 h-6 text-primary" />
                        Network Topology
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Configure pipe segments manually or import from hydraulic schema.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-lg border border-border/50 self-start md:self-auto">
                    <button
                        onClick={() => setViewMode('config')}
                        className={`
                            px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2
                            ${viewMode === 'config'
                                ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}
                        `}
                    >
                        <LayoutList className="w-4 h-4" />
                        Configuration
                    </button>
                    <button
                        onClick={() => setViewMode('hydraulics')}
                        className={`
                            px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2
                            ${viewMode === 'hydraulics'
                                ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}
                        `}
                    >
                        <Activity className="w-4 h-4" />
                        Hydraulics
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                {segments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                            <Workflow className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium text-foreground">No Segments Defined</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                Start by adding your first pipe segment to begin the hydraulic calculation.
                            </p>
                        </div>
                        <button
                            onClick={addSegment}
                            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Initialize Network
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-1 text-center">#</div>
                            {viewMode === 'config' ? (
                                <>
                                    <div className="col-span-5">Pipe Specification</div>
                                    <div className="col-span-3">Length (m)</div>
                                    <div className="col-span-2">Dimension</div>
                                    <div className="col-span-1 text-right">Actions</div>
                                </>
                            ) : (
                                <>
                                    <div className="col-span-3">Segment</div>
                                    <div className="col-span-3">Flow Rate (m³/h)</div>
                                    <div className="col-span-3">Velocity (m/s)</div>
                                    <div className="col-span-2 text-right">Pressure (Pa)</div>
                                </>
                            )}
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-border/50">
                            {segments.map((segment, index) => {
                                const isCustom = segment.material === 'custom';
                                const standardData = !isCustom ? PIPE_STANDARDS[segment.material] : null;

                                const id_mm = isCustom ? (segment.customInnerDiameter || 0) : (standardData?.dimensions.find(d => d.dn === segment.size)?.id || 0);

                                // Hydraulics Calc
                                const density = 1000 + (glycolPercentage * 5);
                                const hydraulics = calculateHydraulics(
                                    segment.flowRate || 0,
                                    id_mm,
                                    0.045,
                                    density,
                                    0.000001
                                );
                                const isHighVelocity = hydraulics.velocity > 2.5;

                                return (
                                    <div
                                        key={segment.id}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors group relative"
                                    >
                                        {/* Drag Handle & Index */}
                                        <div className="col-span-1 flex items-center justify-center gap-2 text-muted-foreground">
                                            <div className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-mono text-muted-foreground/50 group-hover:hidden">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                        </div>

                                        {viewMode === 'config' ? (
                                            <>
                                                {/* Material & Size Specs */}
                                                <div className="col-span-5 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            className="w-full bg-transparent border-none p-0 text-sm font-medium text-foreground focus:ring-0 cursor-pointer"
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
                                                                    className="w-24 bg-muted/30 border border-border rounded px-2 py-1 text-xs font-mono"
                                                                    placeholder="ID mm"
                                                                    value={segment.customInnerDiameter || ''}
                                                                    onChange={(e) => updateSegment(segment.id, { customInnerDiameter: parseFloat(e.target.value) || 0 })}
                                                                />
                                                                <span className="text-xs text-muted-foreground">mm ID</span>
                                                            </div>
                                                        ) : (
                                                            <select
                                                                className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-xs text-muted-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
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
                                                    <div className="relative max-w-[120px]">
                                                        <input
                                                            type="number"
                                                            min="0.1"
                                                            max="10000"
                                                            step="0.1"
                                                            className={`w-full bg-transparent text-sm font-medium text-foreground border-b focus:outline-none py-1 pe-6 transition-colors ${!isValidLength(segment.length)
                                                                    ? 'border-red-500 text-red-500'
                                                                    : 'border-border focus:border-primary'
                                                                }`}
                                                            value={segment.length}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value);
                                                                // Allow the change but mark as invalid via styling
                                                                updateSegment(segment.id, { length: isNaN(val) ? 0 : val });
                                                            }}
                                                        />
                                                        {!isValidLength(segment.length) ? (
                                                            <AlertCircle className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                                        ) : (
                                                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">m</span>
                                                        )}
                                                    </div>
                                                    {!isValidLength(segment.length) && (
                                                        <p className="text-[10px] text-red-500 mt-1">Lungime invalidă (0.1 - 10,000m)</p>
                                                    )}
                                                </div>

                                                {/* Details Readout */}
                                                <div className="col-span-2 flex flex-col justify-center text-xs text-muted-foreground">
                                                    <span className="font-mono">
                                                        Vol: {(Math.PI * Math.pow(id_mm / 2000, 2) * segment.length * 1000).toFixed(1)} L
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="col-span-1 flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => duplicateSegment(segment.id)}
                                                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                                        title="Duplicate"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeSegment(segment.id)}
                                                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Hydraulics View Columns */}
                                                <div className="col-span-3">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {segment.size} <span className="text-muted-foreground text-xs font-normal">({segment.length}m)</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground truncate">{standardData?.label || 'Custom'}</div>
                                                </div>

                                                <div className="col-span-3">
                                                    <div className="relative max-w-[120px]">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            className="w-full bg-transparent text-sm font-medium text-foreground border-b border-border focus:border-primary focus:outline-none py-1 pe-8 transition-colors"
                                                            value={segment.flowRate || ''}
                                                            onChange={(e) => updateSegment(segment.id, { flowRate: parseFloat(e.target.value) || 0 })}
                                                            placeholder="0.0"
                                                        />
                                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">m³/h</span>
                                                    </div>
                                                </div>

                                                <div className="col-span-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 space-y-1">
                                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
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
                                                    <div className="text-sm font-mono text-foreground">
                                                        {hydraulics.pressureDropPa} <span className="text-xs text-muted-foreground">Pa/m</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Total: {(hydraulics.pressureDropKpa * segment.length).toFixed(2)} kPa
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer / Add Action */}
                        <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between">
                            <button
                                onClick={addSegment}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-lg text-sm font-medium text-primary transition-colors border border-transparent hover:border-border/50"
                            >
                                <Plus className="w-4 h-4" />
                                Add {viewMode === 'config' ? 'Pipe Segment' : 'Flow Path'}
                            </button>

                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Volume</span>
                                    <span className="font-mono font-medium">{totalVolume.toFixed(2)} L</span>
                                </div>
                                {viewMode === 'hydraulics' && (
                                    <div className="flex flex-col items-end border-l border-border pl-6">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">System Drop</span>
                                        <span className="font-mono font-medium text-primary">{totalPressureDrop.toFixed(3)} kPa</span>
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
