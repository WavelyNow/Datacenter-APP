
import React, { useState, useMemo } from 'react';
import { PipeSegment } from '@/lib/types';
import { calculateSupportReport } from '@/lib/calculations';
import { Ruler, Anchor } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';

interface SupportManagerProps {
    segments: PipeSegment[];
}

export const SupportManager: React.FC<SupportManagerProps> = ({ segments }) => {
    const { glycolPercentage, supportConfig, setSupportConfig } = useProject();

    // Calculate report on fly
    const report = useMemo(() => {
        return calculateSupportReport(segments, glycolPercentage || 0, supportConfig);
    }, [segments, glycolPercentage, supportConfig]);

    // Grouping for Summary if needed? For now just list.

    return (
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Anchor className="w-5 h-5 text-amber-500" />
                            Calculatoare Suporți
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Determinare automată a tipului de suport (US3/US5/US7) în funcție de încărcare.
                        </p>
                    </div>
                </div>

                {/* Advanced Controls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Control: Spacing Slider */}
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-blue-400" />
                                Pas Suporți
                            </label>
                            <span className="text-xl font-bold text-blue-400 font-mono">
                                {supportConfig.spacing.toFixed(1)} m
                            </span>
                        </div>

                        <input
                            type="range"
                            min="1"
                            max="4"
                            step="0.5"
                            value={supportConfig.spacing}
                            onChange={(e) => setSupportConfig({ ...supportConfig, spacing: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                        />
                    </div>

                    {/* Control: Pipes per Support */}
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Țevi per Suport</label>
                        <div className="flex gap-2">
                            {[1, 2, 3].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setSupportConfig({ ...supportConfig, pipesPerSupport: num })}
                                    className={`flex-1 py-2 rounded-lg border transition-all font-bold ${supportConfig.pipesPerSupport === num
                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                        : 'bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/10'
                                        }`}
                                >
                                    {num} {num === 1 ? 'Țeavă' : 'Țevi'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Control: Mounting Type */}
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tip Montaj</label>
                        <div className="flex gap-2">
                            {(['concrete', 'suspended'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSupportConfig({ ...supportConfig, mountingType: type })}
                                    className={`flex-1 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-widest ${supportConfig.mountingType === type
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                        : 'bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/10'
                                        }`}
                                >
                                    {type === 'concrete' ? 'Pe Beton / Pardoseală' : 'Suspendat (Tijă filetată)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Control: Height */}
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Înălțime Montaj</label>
                            <span className="text-lg font-bold text-slate-200 font-mono">{supportConfig.height.toFixed(2)} m</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={supportConfig.height}
                            onChange={(e) => setSupportConfig({ ...supportConfig, height: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
                        />
                    </div>
                </div>

                {/* Results Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                                <th className="p-3">Segment Țeavă</th>
                                <th className="p-3">Încărcare / Suport</th>
                                <th className="p-3">Reacție Anchor (kg)</th>
                                <th className="p-3">Profil Recomandat</th>
                                <th className="p-3 text-right">Cantitate</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-white/5">
                            {report.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                                        Nu există segmente de țeavă definite.
                                    </td>
                                </tr>
                            ) : (
                                report.map((item) => {
                                    // Color coding for recommended support
                                    let badgeColor = "bg-slate-700 text-slate-300";
                                    if (item.recommendedSupport.id.includes('us3')) badgeColor = "bg-green-500/20 text-green-300 border-green-500/30";
                                    if (item.recommendedSupport.id.includes('us5')) badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
                                    if (item.recommendedSupport.id.includes('us7')) badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
                                    if (item.recommendedSupport.id.includes('heavy')) badgeColor = "bg-red-500/20 text-red-300 border-red-500/30";

                                    return (
                                        <tr key={item.segmentId} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-3 font-medium text-slate-300 group-hover:text-white">
                                                {item.description}
                                            </td>
                                            <td className="p-3 font-mono text-slate-300">
                                                <div className="text-blue-400 font-bold">{item.loadPerPoint.toFixed(1)} kg</div>
                                                <div className="text-[10px] text-slate-500">{(item.loadPerPoint / item.pipesPerSupport).toFixed(1)} kg/țeavă</div>
                                            </td>
                                            <td className="p-3 font-mono">
                                                <div className="text-amber-400 font-bold">{item.anchorReaction.toFixed(1)} kg</div>
                                                <div className="text-[10px] text-slate-500 truncate">Forță smulgere / diblu</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-[10px] font-bold ${badgeColor}`}>
                                                    {item.recommendedSupport.name}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-bold text-white font-mono text-lg">
                                                {item.quantity} <span className="text-xs text-slate-500 font-sans font-normal text-[10px] uppercase">buc</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-blue-400 text-xs font-bold">i</span>
                    </div>
                    <p className="text-xs text-blue-200/80 leading-relaxed">
                        Calculul presupune o distribuție uniformă a sarcinii. Profilul recomandat (US3/US5/US7) este selectat automat să reziste la greutatea țevii pline cu lichid (+glicol) pe distanța selectată.
                    </p>
                </div>

            </div>
        </div>
    );
};
