'use client';

import React, { useMemo } from 'react';
import { Plus, Trash2, Info, Settings2 } from 'lucide-react';
import { PIPE_DATABASE, PipeMaterial } from '@/lib/constants';
import { PipeSegment } from '@/lib/types';
import { calculatePipeVolume } from '@/lib/calculations';

interface PipeManagerProps {
    segments: PipeSegment[];
    onSegmentsChange: (segments: PipeSegment[]) => void;
}

export const PipeManager: React.FC<PipeManagerProps> = ({ segments, onSegmentsChange }) => {

    const addSegment = () => {
        const newSegment: PipeSegment = {
            id: crypto.randomUUID(),
            material: 'Otel Carbon (Teava Neagra)',
            standard: 'SCH40 / Standard',
            size: 'DN25 (1)',
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
                    updated.standard = 'N/A';
                    updated.size = 'N/A';
                    updated.customInnerDiameter = 0;
                    updated.customWeight = 0;
                } else {
                    // Switch to database defaults
                    const matData = PIPE_DATABASE[updated.material as PipeMaterial];
                    if (matData) {
                        const standards = Object.keys(matData);
                        updated.standard = standards[0] || '';
                        // @ts-ignore
                        const sizes = Object.keys(matData[updated.standard] || {});
                        updated.size = sizes[0] || '';
                    }
                }
            }

            // Standard change handling (only if not custom)
            if (updates.standard && updated.material !== 'custom') {
                const matData = PIPE_DATABASE[updated.material as PipeMaterial];
                if (matData) {
                    // @ts-ignore
                    const sizes = Object.keys(matData[updated.standard] || {});
                    updated.size = sizes[0] || '';
                }
            }

            return updated;
        }));
    };

    const totalVolume = useMemo(() => {
        return segments.reduce((acc, s) => acc + calculatePipeVolume(s), 0);
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

                    // Determine Dropdown Data
                    const matData = !isCustom ? PIPE_DATABASE[segment.material as PipeMaterial] : null;
                    // @ts-ignore
                    const standardData = matData ? matData[segment.standard] : null;
                    const standards = matData ? Object.keys(matData) : [];
                    const sizes = standardData ? Object.keys(standardData) : [];

                    // Preview Calculations
                    const pipeInfo = standardData ? standardData[segment.size] : null;
                    const displayId = isCustom ? (segment.customInnerDiameter || 0) : (pipeInfo?.id_mm || 0);
                    const vol = calculatePipeVolume(segment);

                    return (
                        <div key={segment.id} className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 hover:border-teal-500/50 transition-colors print:bg-slate-50 print:border-slate-100 grid grid-cols-1 gap-4 lg:grid-cols-12 items-end relative group">

                            {/* Material */}
                            <div className="lg:col-span-3">
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1 print:text-slate-500">Material</label>
                                <select
                                    className="w-full text-sm border-neutral-600 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-neutral-900 text-neutral-200 p-2 print:border-slate-200 print:bg-white print:text-black truncate"
                                    value={segment.material}
                                    onChange={(e) => updateSegment(segment.id, { material: e.target.value })}
                                >
                                    {Object.keys(PIPE_DATABASE).map((key) => (
                                        <option key={key} value={key}>{key}</option>
                                    ))}
                                    <option value="custom" className="text-amber-400 font-bold">★ Custom / Manual</option>
                                </select>
                            </div>

                            {/* Standard OR Custom Weight */}
                            <div className="lg:col-span-2">
                                {isCustom ? (
                                    // Custom Weight Input
                                    <div>
                                        <label className="block text-[10px] font-bold text-amber-500 uppercase mb-1">Weight (kg/m)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-full text-sm border-amber-900/50 rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-neutral-900 text-amber-100 p-2"
                                            value={segment.customWeight || ''}
                                            onChange={(e) => updateSegment(segment.id, { customWeight: parseFloat(e.target.value) || 0 })}
                                            placeholder="kg/m"
                                        />
                                    </div>
                                ) : (
                                    // Standard Dropdown
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1 print:text-slate-500">Standard</label>
                                        <select
                                            className="w-full text-sm border-neutral-600 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-neutral-900 text-neutral-200 p-2 print:border-slate-200 print:bg-white print:text-black truncate"
                                            value={segment.standard}
                                            onChange={(e) => updateSegment(segment.id, { standard: e.target.value })}
                                        >
                                            {standards.map(st => (
                                                <option key={st} value={st}>{st}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Size OR Custom ID */}
                            <div className="lg:col-span-4">
                                {isCustom ? (
                                    // Custom ID Input
                                    <div>
                                        <label className="block text-[10px] font-bold text-amber-500 uppercase mb-1">Inner Dia (mm)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            className="w-full text-sm border-amber-900/50 rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-neutral-900 text-amber-100 p-2"
                                            value={segment.customInnerDiameter || ''}
                                            onChange={(e) => updateSegment(segment.id, { customInnerDiameter: parseFloat(e.target.value) || 0 })}
                                            placeholder="ID (mm)"
                                        />
                                    </div>
                                ) : (
                                    // Size Dropdown
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1 print:text-slate-500">Diameter</label>
                                        <div className="relative">
                                            <select
                                                className="w-full text-sm border-neutral-600 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-neutral-900 text-neutral-200 p-2 pr-12 print:border-slate-200 print:bg-white print:text-black truncate"
                                                value={segment.size}
                                                onChange={(e) => updateSegment(segment.id, { size: e.target.value })}
                                            >
                                                {sizes.map(sz => (
                                                    <option key={sz} value={sz}>{sz}</option>
                                                ))}
                                            </select>
                                            {displayId > 0 && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-teal-500 pointer-events-none print:text-slate-500 bg-teal-900/10 px-1.5 py-0.5 rounded border border-teal-500/20 print:border-none print:bg-transparent">
                                                    ID:{displayId}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Length & Actions */}
                            <div className="lg:col-span-3 flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1 print:text-slate-500">Len (m)</label>
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
                                        className="text-neutral-500 hover:text-red-400 p-2 rounded hover:bg-red-900/20 transition-all cursor-pointer print:hidden border border-transparent hover:border-red-900/30"
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
