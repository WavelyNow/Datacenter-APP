'use client';

import React, { useMemo } from 'react';
import { Plus, Trash2, Info, Settings2, GripVertical, ChevronUp, ChevronDown, Box } from 'lucide-react';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { PipeSegment } from '@/lib/types';

interface PipeManagerProps {
    segments: PipeSegment[];
    onSegmentsChange: (segments: PipeSegment[]) => void;
}

export const PipeManager: React.FC<PipeManagerProps> = ({ segments, onSegmentsChange }) => {

    const addSegment = () => {
        const defaultStandard = PIPE_STANDARDS['steel_light'];
        const defaultPipe = defaultStandard.dimensions.find(d => d.dn === 'DN25') || defaultStandard.dimensions[0];

        const newSegment: PipeSegment = {
            id: crypto.randomUUID(),
            material: 'steel_light',
            standard: 'Standard',
            size: defaultPipe.dn,
            length: 10,
        };
        onSegmentsChange([...segments, newSegment]);
    };

    const removeSegment = (id: string) => {
        onSegmentsChange(segments.filter(s => s.id !== id));
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
                        <p className="text-muted-foreground text-sm">Configure pipe segments for your project.</p>
                    </div>
                </div>

                <button
                    onClick={addSegment}
                    className="btn btn-primary btn-md spacing-xs group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span>Add Segment</span>
                </button>
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

                    return (
                        <div key={segment.id} className="bg-muted/20 border border-border p-5 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative group transition-all duration-300 hover:border-primary/30 hover:bg-muted/30">

                            {/* Index Number (Subtle) */}
                            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-sm z-10">
                                {index + 1}
                            </div>

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

                            {/* Actions */}
                            <div className="absolute right-2 top-2 md:static md:col-span-1 flex md:flex-col gap-1 md:gap-2 justify-end h-full pb-0.5">
                                <div className="flex md:flex-col gap-1">
                                    <button
                                        onClick={() => moveSegment(segment.id, 'up')}
                                        disabled={index === 0}
                                        className="p-2 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-all disabled:opacity-30 disabled:hover:bg-card"
                                        title="Move Up"
                                    >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => moveSegment(segment.id, 'down')}
                                        disabled={index === segments.length - 1}
                                        className="p-2 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-all disabled:opacity-30 disabled:hover:bg-card"
                                        title="Move Down"
                                    >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeSegment(segment.id)}
                                    className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 transition-all shadow-sm cursor-pointer mt-1"
                                    title="Remove Segment"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs bg-muted/20 px-3 py-1.5 rounded-lg border border-border">
                    <Info className="w-3.5 h-3.5" />
                    <span>Calculated based on inner diameter (ID)</span>
                </div>
                <div className="flex items-baseline gap-3">
                    <span className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Total Volume</span>
                    <span className="text-3xl font-bold text-primary text-glow">{totalVolume.toFixed(2)} <span className="text-lg text-primary/50 ml-1">L</span></span>
                </div>
            </div>
        </div>
    );
};
