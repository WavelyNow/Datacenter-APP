import React from 'react';
import { Scale, ClipboardList, Droplet, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { generateBoQ, getDetailedWeightReport, calculatePipeVolume } from '@/lib/calculations';
import { useProject } from '@/context/ProjectContext';

export const ResultsDisplay: React.FC = () => {
    const {
        segments,
        equipmentList,
        glycolPercentage,
        safetyMargin,
        safetyMarginPercentage
    } = useProject();

    const pipesVolume = segments.reduce((sum, seg) => sum + (seg ? calculatePipeVolume(seg) : 0), 0);
    const equipmentVolume = equipmentList?.reduce((sum, item) => sum + (item.volume || 0), 0) || 0;
    const totalSystemVolume = pipesVolume + equipmentVolume;

    const boqItems = generateBoQ(segments);

    const detailedWeights = getDetailedWeightReport(segments, equipmentList, glycolPercentage);
    const totalWeight = detailedWeights.reduce((sum, item) => sum + item.totalWeight, 0);

    const marginMultiplier = safetyMargin ? (1 + (safetyMarginPercentage / 100)) : 1;
    const bufferedVolume = totalSystemVolume * marginMultiplier;
    const toOrderVolume = Math.ceil(bufferedVolume / 50) * 50;

    const exportToCSV = () => {
        if (boqItems.length === 0) return;

        const headers = ['Material', 'Dimensiune (DN)', 'Lungime Totala (m)'];
        const rows = boqItems.map(item => [
            item.materialName,
            item.size,
            item.totalLength.toFixed(1)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `BoQ_Proiect_${toOrderVolume}L.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">

            {/* Main Stats Card */}
            <div className="glass-panel p-1 rounded-2xl relative group overflow-hidden">
                {/* Animated Border Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl overflow-hidden p-6 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Scale className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white leading-tight">System Totals</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Real-time Calculation</p>
                            </div>
                        </div>
                    </div>

                    {/* Hero Metric: Weight */}
                    <div className="text-center py-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-full blur-xl -z-10"></div>
                        <div className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-2 opacity-80">Estimated Operating Weight</div>
                        <div className="flex items-baseline justify-center gap-1.5">
                            <span className="text-5xl font-black text-white tracking-tighter text-glow drop-shadow-2xl">
                                {totalWeight.toFixed(1)}
                            </span>
                            <span className="text-lg font-bold text-amber-500/60">kg</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-2">Pipe Network + Fluid + Equipment</div>
                    </div>

                    {/* Secondary Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3 mt-8">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Volum Țevi</div>
                            <div className="text-lg font-bold text-white font-mono">{pipesVolume.toFixed(0)} <span className="text-[10px] font-normal text-slate-500">L</span></div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Volum Utilaje</div>
                            <div className="text-lg font-bold text-teal-400 font-mono">{equipmentVolume.toFixed(0)} <span className="text-[10px] font-normal text-slate-500">L</span></div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Brut</div>
                            <div className="text-lg font-bold text-white font-mono">{totalSystemVolume.toFixed(0)} <span className="text-[10px] font-normal text-slate-500">L</span></div>
                        </div>
                    </div>

                    {/* Order Suggestion */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl p-4 relative overflow-hidden group/order cursor-default">
                            <div className="absolute right-0 top-0 p-3 opacity-20 group-hover/order:opacity-40 transition-opacity">
                                <Droplet className="w-12 h-12 rotate-[-15deg] text-purple-400" />
                            </div>

                            <div className="relative z-10">
                                <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                    To Order {safetyMargin ? `(Incl. +${safetyMarginPercentage}% & Rounding)` : '(Incl. Rounding)'} <ArrowRight className="w-3 h-3" />
                                </div>
                                <div className="text-2xl font-black text-white tracking-tight">
                                    {toOrderVolume.toLocaleString('ro-RO')} L
                                </div>
                                <div className="text-[10px] text-purple-200/60 font-medium mt-1">
                                    Antigel Premix {glycolPercentage}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BoQ Summary */}
            <div className="glass-panel p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <ClipboardList className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-200">Bill of Quantities</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportToCSV}
                            title="Export CSV pentru Excel"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{boqItems.length} Items</span>
                    </div>
                </div>

                <div className="max-h-[250px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                    {boqItems.length === 0 ? (
                        <div className="text-center py-8 text-slate-600 text-xs italic">
                            No items calculated yet.
                        </div>
                    ) : (
                        boqItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group/item">
                                <div>
                                    <div className="text-xs font-medium text-slate-300 group-hover/item:text-white transition-colors">{item.materialName}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">{item.size}</div>
                                </div>
                                <div className="text-sm font-bold text-teal-500 font-mono">
                                    {item.totalLength.toFixed(1)}m
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
