'use client';

import React, { useMemo } from 'react';
import { Plus, Trash2, Info, Settings2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
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
        <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-sm">
                        <Settings2 className="w-6 h-6 text-teal-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            Pipe Manager
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold border border-teal-500/20">
                                {segments.length}
                            </span>
                        </h2>
                        <p className="text-slate-400 text-sm">Configurează segmentele de țeavă din proiect.</p>
                    </div>
                </div>

                <button
                    onClick={addSegment}
                    className="group relative flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95 overflow-hidden"
                >
                    <Plus className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Add Segment</span>
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {segments.length === 0 && (
                    <div className="text-center py-16 px-4 bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center group cursor-pointer hover:bg-white/10 transition-colors" onClick={addSegment}>
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-slate-500 group-hover:text-teal-400 transition-colors" />
                        </div>
                        <p className="text-slate-400 font-medium">Nu există segmente de țeavă.</p>
                        <p className="text-sm text-slate-600 mt-1">Apasă aici sau pe butonul &quot;Add Segment&quot; pentru a începe.</p>
                    </div>
                )}

                {segments.map((segment) => {
                    const isCustom = segment.material === 'custom';
                    const standardData = !isCustom ? PIPE_STANDARDS[segment.material] : null;
                    const pipeInfo = standardData?.dimensions.find(d => d.dn === segment.size);

                    return (
                        <div key={segment.id} className="glass-card p-4 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-5 items-end relative group">

                            {/* Material Selection */}
                            <div className="md:col-span-4 space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Material Standard</label>
                                <div className="relative">
                                    <select
                                        className="w-full text-sm input-modern appearance-none cursor-pointer"
                                        value={segment.material}
                                        onChange={(e) => updateSegment(segment.id, { material: e.target.value })}
                                    >
                                        {Object.entries(PIPE_STANDARDS).map(([key, std]) => (
                                            <option key={key} value={key} className="bg-slate-900 text-white">{std.label}</option>
                                        ))}
                                        <option value="custom" className="bg-slate-900 text-amber-500 font-bold">★ Custom / Manual</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Size / Custom Logic */}
                            {isCustom ? (
                                <>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-amber-500 tracking-wider ml-1">ID (mm)</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm input-modern !border-amber-500/30 text-amber-400 focus:text-amber-300"
                                            value={segment.customInnerDiameter || ''}
                                            onChange={(e) => updateSegment(segment.id, { customInnerDiameter: parseFloat(e.target.value) || 0 })}
                                            placeholder="mm"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-amber-500 tracking-wider ml-1">kg/m</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm input-modern !border-amber-500/30 text-amber-400 focus:text-amber-300"
                                            value={segment.customWeight || ''}
                                            onChange={(e) => updateSegment(segment.id, { customWeight: parseFloat(e.target.value) || 0 })}
                                            placeholder="kg/m"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="md:col-span-4 space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Pipe Size (DN)</label>
                                    <div className="relative">
                                        <select
                                            className="w-full text-sm input-modern appearance-none font-mono tracking-tight cursor-pointer"
                                            value={segment.size}
                                            onChange={(e) => updateSegment(segment.id, { size: e.target.value })}
                                        >
                                            {standardData?.dimensions.map(d => (
                                                <option key={d.dn} value={d.dn} className="bg-slate-900 text-white">
                                                    {d.dn} ({d.inch !== '-' ? d.inch : ''})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-mono text-slate-500">
                                            ID: <span className="text-teal-400 font-bold">{pipeInfo?.id}mm</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Length */}
                            <div className="md:col-span-3 space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Length (m)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    className="w-full text-sm input-modern font-bold text-white"
                                    value={segment.length}
                                    onChange={(e) => updateSegment(segment.id, { length: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            {/* Reorder & Delete */}
                            <div className="absolute -right-2 -top-2 md:static md:col-span-1 flex md:flex-col gap-1 md:gap-2">
                                <button
                                    onClick={() => moveSegment(segment.id, 'up')}
                                    disabled={segments.indexOf(segment) === 0}
                                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-white/5 disabled:opacity-30 disabled:hover:bg-slate-800"
                                    title="Move Up"
                                >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => moveSegment(segment.id, 'down')}
                                    disabled={segments.indexOf(segment) === segments.length - 1}
                                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-white/5 disabled:opacity-30 disabled:hover:bg-slate-800"
                                    title="Move Down"
                                >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => removeSegment(segment.id)}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all opacity-100 shadow-sm cursor-pointer"
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
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Calculat pe baza diametrului interior (ID)</span>
                </div>
                <div className="flex items-baseline gap-3">
                    <span className="text-sm text-slate-500 uppercase tracking-widest font-bold">Total Volum Țevi</span>
                    <span className="text-3xl font-bold text-teal-400 text-glow">{totalVolume.toFixed(2)} <span className="text-lg text-teal-500/50 ml-1">L</span></span>
                </div>
            </div>
        </div>
    );
};
