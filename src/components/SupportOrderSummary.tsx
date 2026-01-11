import React from 'react';
import { BoMItem } from '@/lib/calculations';
import { Download, Copy, Package } from 'lucide-react';

interface SupportOrderSummaryProps {
    bom: BoMItem[];
    onExport: () => void;
}

export const SupportOrderSummary: React.FC<SupportOrderSummaryProps> = ({ bom, onExport }) => {
    const copyToClipboard = () => {
        const text = bom.map(i => `${i.component} | ${i.specs} | ${i.quantity} ${i.unit}`).join('\n');
        navigator.clipboard.writeText(text);
        alert('Lista a fost copiată în clipboard!');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-0">
                <h2 className="text-3xl font-bold text-white mb-2">Rezumat Comandă</h2>
                <p className="text-slate-400">Listă de Materiale - Suporți și Fixări</p>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header Actions */}
                <div className="bg-slate-800/50 p-4 border-b border-white/5 flex justify-between items-center sm:flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <Package className="w-5 h-5" />
                        <span>Total Piese: {bom.reduce((acc, i) => acc + i.quantity, 0)}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                            <Copy className="w-4 h-4" /> Copiază Listă
                        </button>
                        <button
                            onClick={onExport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                        >
                            <Download className="w-4 h-4" /> Export PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 text-xs text-slate-500 uppercase tracking-wider font-bold">
                                <th className="p-4 border-b border-white/10">Componentă</th>
                                <th className="p-4 border-b border-white/10 hidden md:table-cell">Cod produs (SKU)</th>
                                <th className="p-4 border-b border-white/10">Specificație Tehnică</th>
                                <th className="p-4 border-b border-white/10 text-right">Cantitate</th>
                                <th className="p-4 border-b border-white/10 text-slate-600">Unitate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {/* Group by Segment (groupName) */}
                            {Array.from(new Set(bom.map(i => i.groupName || 'General'))).map(groupName => {
                                const groupItems = bom.filter(i => (i.groupName || 'General') === groupName);
                                if (groupItems.length === 0) return null;

                                return (
                                    <React.Fragment key={groupName}>
                                        <tr className="bg-slate-800/60 border-l-4 border-blue-500">
                                            <td colSpan={5} className="px-4 py-3 text-sm font-bold text-blue-100 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                                                {groupName}
                                            </td>
                                        </tr>
                                        {groupItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 font-medium text-slate-200 pl-8 border-l border-white/5">
                                                    {item.component}
                                                </td>
                                                <td className="p-4 text-xs text-slate-500 font-mono hidden md:table-cell">
                                                    {item.sku ? <span className="bg-slate-800 px-2 py-1 rounded border border-white/10">{item.sku}</span> : '-'}
                                                </td>
                                                <td className="p-4 text-sm text-slate-400 font-mono">{item.specs}</td>
                                                <td className="p-4 text-right font-bold text-emerald-400 text-lg group-hover:text-emerald-300 transition-colors">
                                                    {item.quantity}
                                                </td>
                                                <td className="p-4 text-sm text-slate-500">{item.unit}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
