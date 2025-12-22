import React from 'react';
import { Scale, ClipboardList } from 'lucide-react';
import { calculateTotalVolume, generateBoQ, getDetailedWeightReport } from '@/lib/calculations';
import { useProject } from '@/context/ProjectContext';

export const ResultsDisplay: React.FC = () => {
    const {
        segments,
        equipmentList,
        glycolPercentage,
    } = useProject();

    const totalSystemVolume = calculateTotalVolume(segments, equipmentList, false);
    const boqItems = generateBoQ(segments);

    const detailedWeights = getDetailedWeightReport(segments, equipmentList, glycolPercentage);
    const totalWeight = detailedWeights.reduce((sum, item) => sum + item.totalWeight, 0);

    return (
        <div className="space-y-6 print:break-before-auto">

            {/* Main Stats Card - STICKY PRIMARY */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg shadow-black/20">
                <div className="p-4 bg-neutral-800/50 border-b border-neutral-700 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-neutral-200">System Totals</h3>
                </div>

                <div className="p-6 space-y-6">
                    {/* Weight (Hero Metric) */}
                    <div className="text-center p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                        <div className="text-sm text-emerald-500 font-medium uppercase tracking-wide mb-1">Estimated Operating Weight</div>
                        <div className="text-4xl font-black text-white tracking-tight">
                            {totalWeight.toFixed(1)} <span className="text-lg text-emerald-500/50 font-normal">kg</span>
                        </div>
                        <div className="text-[10px] text-emerald-600/70 mt-1">Pipe + Fluid Weight</div>
                    </div>

                    {/* Volume Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-neutral-800 rounded border border-neutral-700 text-center">
                            <div className="text-xs text-neutral-500 mb-1">Total Volume</div>
                            <div className="text-xl font-bold text-white">{totalSystemVolume.toFixed(2)} <span className="text-xs font-normal text-neutral-600">L</span></div>
                        </div>
                        <div className="p-3 bg-neutral-800 rounded border border-neutral-700 text-center">
                            <div className="text-xs text-neutral-500 mb-1">Glycol Ratio</div>
                            <div className="text-xl font-bold text-white">{glycolPercentage}%</div>
                        </div>
                    </div>

                    {/* Mix Breakdown - PREMIX LOGIC */}
                    <div className="space-y-3 pt-2 border-t border-neutral-800">
                        <div className="flex items-center justify-between p-3 bg-purple-500/10 border-l-4 border-purple-500 rounded-r">
                            <div className="flex items-center gap-3">
                                <Scale className="w-5 h-5 text-purple-400" />
                                <div>
                                    <div className="text-sm font-bold text-purple-100">FLUID DE COMANDAT</div>
                                    <div className="text-[10px] text-purple-300/70 uppercase tracking-wider">Antigel Premix {glycolPercentage}%</div>
                                </div>
                            </div>
                            <span className="font-mono font-black text-xl text-white">{totalSystemVolume.toFixed(2)} <span className="text-sm font-normal text-purple-400">L</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BoQ Summary (Collapsed / Condensed) */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-neutral-500" />
                        <h3 className="font-semibold text-neutral-300 text-sm">Quantities (BoQ)</h3>
                    </div>
                    <span className="text-[10px] text-neutral-600 bg-neutral-800 px-2 py-0.5 rounded-full">{boqItems.length} Items</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-xs text-left">
                        <tbody className="divide-y divide-neutral-800">
                            {boqItems.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-center text-neutral-600">
                                        No segments added.
                                    </td>
                                </tr>
                            ) : (
                                boqItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-4 py-2">
                                            <div className="font-medium text-neutral-300">{item.materialName}</div>
                                            <div className="text-[10px] text-neutral-500">{item.size}</div>
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-emerald-500/80">
                                            {item.totalLength.toFixed(1)}m
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};
