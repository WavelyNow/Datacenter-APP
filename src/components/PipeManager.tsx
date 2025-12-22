'use client';

import React, { useMemo } from 'react';
import { Plus, Trash2, Info, Settings2 } from 'lucide-react';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { PipeSegment } from '@/lib/types';
import { calculatePipeVolume } from '@/lib/calculations';

interface PipeManagerProps {
    segments: PipeSegment[];
    onSegmentsChange: (segments: PipeSegment[]) => void;
}

export const PipeManager: React.FC<PipeManagerProps> = ({ segments, onSegmentsChange }) => {

    const addSegment = () => {
        // Default to Steel Light DN25
        const defaultStandard = PIPE_STANDARDS['steel_light'];
        const defaultPipe = defaultStandard.dimensions.find(d => d.dn === 'DN25') || defaultStandard.dimensions[0];

        const newSegment: PipeSegment = {
            id: crypto.randomUUID(),
            material: 'steel_light', // Key from PIPE_STANDARDS
            standard: 'Standard', // Not strictly used for lookup now, but kept for compatibility
            size: defaultPipe.dn,
            length: 10,
        };
        onSegmentsChange([...segments, newSegment]);
    };

    const removeSegment = (id: string) => {
        onSegmentsChange(segments.filter(s => s.id !== id));
    };

    const updateSegment = (id: string, updates: Partial<PipeSegment>) => {
        onSegmentsChange(segments.map(s => {
            if (s.id !== id) return s;

            const updated = { ...s, ...updates };

            // Logic to handle dependent fields
            if (updates.material) {
                if (updates.material === 'custom') {
                    // Switch to custom defaults
                    updated.size = 'custom';
                    updated.customInnerDiameter = 0;
                    updated.customWeight = 0;
                } else {
                    // Switch to database defaults
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
        // We need to implement calculatePipeVolume logic here or update the utility.
        // For simplicity, let's just calc it here using the new standards.
        return segments.reduce((acc, s) => {
            let id_mm = 0; // mm

            if (s.material === 'custom') {
                id_mm = s.customInnerDiameter || 0;
            } else {
                const standard = PIPE_STANDARDS[s.material];
                const pipe = standard?.dimensions.find(d => d.dn === s.size);
                if (pipe) id_mm = pipe.id;
            }

            // Volume (L) = Area (m2) * Length (m) * 1000
            // r = id_mm / 2000 m
            // V = pi * r^2 * Length * 1000
            const radius_m = id_mm / 2000;
            const vol = Math.PI * Math.pow(radius_m, 2) * s.length * 1000;
            return acc + vol;
        }, 0);
    }, [segments]);

    return (
        <div className="space-y-6 bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-800 print:bg-white print:border-slate-200 print:shadow-none">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 print:border-slate-100">
                <h2 className="text-xl font-semibold text-neutral-100 flex items-center gap-2 print:text-slate-800">
                    <Settings2 className="w-5 h-5 text-teal-500" />
                    Pipe Manager
                    <span className="text-xs font-normal text-teal-200 bg-teal-900/30 border border-teal-900 px-2 py-1 rounded-full print:bg-slate-100 print:text-slate-500 print:border-none">
                        {segments.length} segments
                    </span>
                </h2>
                <button
                    onClick={addSegment}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-teal-500 print:hidden shadow-lg shadow-teal-900/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Segment
                </button>
            </div>

            <div className="space-y-3">
                {segments.length === 0 && (
                    <div className="text-center py-12 text-neutral-500 bg-neutral-800/50 rounded-lg border border-dashed border-neutral-700 print:bg-slate-50 print:border-slate-200">
                        <p>No pipe segments added yet.</p>
                        <p className="text-sm">Click "Add Segment" to start calculating.</p>
                    </div>
                )}

                {segments.map((segment) => {
                    const isCustom = segment.material === 'custom';

                    // Lookup Standard Data
                    const standardData = !isCustom ? PIPE_STANDARDS[segment.material] : null;
                    const pipeInfo = standardData?.dimensions.find(d => d.dn === segment.size);

                    // Safe values for display
                    const displayId = isCustom ? (segment.customInnerDiameter || 0) : (pipeInfo?.id || 0);

                    return (
                        <div key={segment.id} className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 hover:border-teal-500/50 transition-colors print:bg-slate-50 print:border-slate-100 grid grid-cols-1 gap-4 lg:grid-cols-12 items-end relative group">

                            {/* Material */}
                            <div className="lg:col-span-4">
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1 print:text-slate-500">Material Standard</label>
                                <select
                                    className="w-full text-sm border-neutral-600 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-neutral-900 text-neutral-200 p-2 print:border-slate-200 print:bg-white print:text-black truncate"
                                    value={segment.material}
                                    onChange={(e) => updateSegment(segment.id, { material: e.target.value })}
                                >
                                    {Object.entries(PIPE_STANDARDS).map(([key, std]) => (
                                        <option key={key} value={key}>{std.label}</option>
                                    ))}
                                    <option value="custom" className="text-amber-400 font-bold">★ Custom / Manual</option>
                                </select>
                            </div>

                            {/* Size Selector OR Custom Inputs */}
                            {isCustom ? (
                                <>
                                    <div className="lg:col-span-2">
                                        <label className="block text-[10px] font-bold text-amber-500 uppercase mb-1">ID (mm)</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm border-amber-900/50 rounded bg-neutral-900 text-amber-100 p-2"
                                            value={segment.customInnerDiameter || ''}
                                            onChange={(e) => updateSegment(segment.id, { customInnerDiameter: parseFloat(e.target.value) || 0 })}
                                            placeholder="mm"
                                        />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <label className="block text-[10px] font-bold text-amber-500 uppercase mb-1">Weight (kg/m)</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm border-amber-900/50 rounded bg-neutral-900 text-amber-100 p-2"
                                            value={segment.customWeight || ''}
                                            onChange={(e) => updateSegment(segment.id, { customWeight: parseFloat(e.target.value) || 0 })}
                                            placeholder="kg/m"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="lg:col-span-4">
                                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1 print:text-slate-500">Pipe Size (DN)</label>
                                    <div className="relative">
                                        <select
                                            className="w-full text-sm border-neutral-600 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-neutral-900 text-neutral-200 p-2 pr-12 print:border-slate-200 print:bg-white print:text-black truncate font-mono"
                                            value={segment.size}
                                            onChange={(e) => updateSegment(segment.id, { size: e.target.value })}
                                        >
                                            {standardData?.dimensions.map(d => (
                                                <option key={d.dn} value={d.dn}>
                                                    {d.dn} ({d.inch !== '-' ? d.inch : ''}) - ID: {d.id}mm
                                                </option>
                                            ))}
                                        </select>
                                        {/* Quick Badge */}
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-teal-500 pointer-events-none">
                                            OD: {pipeInfo?.od}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Length & Actions */}
                            <div className="lg:col-span-4 flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1 print:text-slate-500">Length (m)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        className="w-full text-sm border-neutral-600 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-neutral-900 text-neutral-200 p-2 print:border-slate-200 print:bg-white print:text-black"
                                        value={segment.length}
                                        onChange={(e) => updateSegment(segment.id, { length: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex items-end pb-0.5">
                                    <button
                                        onClick={() => removeSegment(segment.id)}
                                        className="text-neutral-500 hover:text-red-400 p-2 rounded hover:bg-red-900/20 transition-all cursor-pointer print:hidden border border-transparent hover:border-red900/30"
                                        title="Remove Segment"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-800 print:border-slate-100">
                <div className="flex items-center text-neutral-500 text-xs gap-2">
                    <Info className="w-4 h-4" />
                    <span>Volume calculated based on internal diameter.</span>
                </div>
                <div className="text-right">
                    <span className="text-sm text-neutral-400 mr-2 print:text-slate-500">Total Pipe Volume:</span>
                    <span className="text-2xl font-bold text-teal-400 print:text-slate-800">{totalVolume.toFixed(2)} L</span>
                </div>
            </div>
        </div>
    );
};
