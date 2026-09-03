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
                <h2 className="text-3xl font-bold text-foreground mb-2">Rezumat Comandă</h2>
                <p className="text-muted-foreground">Listă de Materiale - Suporți și Fixări</p>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                {/* Header Actions */}
                <div className="bg-secondary/50 p-4 border-b border-border flex justify-between items-center sm:flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Package className="w-5 h-5" />
                        <span>Total Piese: {bom.reduce((acc, i) => acc + i.quantity, 0)}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-muted text-foreground rounded-lg text-sm font-bold transition-colors border border-border"
                        >
                            <Copy className="w-4 h-4" /> Copiază Listă
                        </button>
                        <button
                            onClick={onExport}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:brightness-110 text-primary-foreground rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
                        >
                            <Download className="w-4 h-4" /> Exportă PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                <th className="p-4 border-b border-border">Componentă</th>
                                <th className="p-4 border-b border-border hidden md:table-cell">Cod produs (SKU)</th>
                                <th className="p-4 border-b border-border">Specificație Tehnică</th>
                                <th className="p-4 border-b border-border text-right">Cantitate</th>
                                <th className="p-4 border-b border-border text-muted-foreground/60">Unitate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {/* Group by Segment (groupName) */}
                            {Array.from(new Set(bom.map(i => i.groupName || 'General'))).map(groupName => {
                                const groupItems = bom.filter(i => (i.groupName || 'General') === groupName);
                                if (groupItems.length === 0) return null;

                                return (
                                    <React.Fragment key={groupName}>
                                        <tr className="bg-secondary/30 border-l-4 border-primary">
                                            <td colSpan={5} className="px-4 py-3 text-sm font-bold text-foreground flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"></span>
                                                {groupName}
                                            </td>
                                        </tr>
                                        {groupItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-secondary/40 transition-colors group">
                                                <td className="p-4 font-medium text-foreground pl-8 border-l border-border/10">
                                                    {item.component}
                                                </td>
                                                <td className="p-4 text-xs text-muted-foreground font-mono hidden md:table-cell">
                                                    {item.sku ? <span className="bg-secondary px-2 py-1 rounded border border-border/50">{item.sku}</span> : '-'}
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground/80 font-mono">{item.specs}</td>
                                                <td className="p-4 text-right font-bold text-primary text-lg transition-colors">
                                                    {item.quantity}
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground/60">{item.unit}</td>
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
