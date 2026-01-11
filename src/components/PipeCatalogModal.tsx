
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Book, Info } from 'lucide-react';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';

interface PipeCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PipeCatalogModal = ({ isOpen, onClose }: PipeCatalogModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-500" onClick={onClose} />

            <div className="relative bg-card w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-border animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-8 py-6 border-b border-border bg-muted/30 flex items-center justify-between shrink-0 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Book className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground leading-none">Catalog Tehnic - Dimensiuni Țevi</h2>
                            <p className="text-xs text-muted-foreground mt-1">Specificații standardizate pentru țevi din oțel</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-card">
                    {Object.entries(PIPE_STANDARDS).map(([key, standard]) => (
                        <div key={key} className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-1 h-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{standard.label}</h3>
                                    <p className="text-sm text-muted-foreground max-w-2xl">{standard.description}</p>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-border bg-muted/10">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">DN (Nominal)</th>
                                            <th className="px-6 py-4 font-bold">Inch</th>
                                            <th className="px-6 py-4 font-bold">Diametru Ext. (mm)</th>
                                            <th className="px-6 py-4 font-bold">Grosime (mm)</th>
                                            <th className="px-6 py-4 font-bold text-primary bg-primary/5">Diametru Int. (mm)</th>
                                            <th className="px-6 py-4 font-bold">Greutate (kg/m)</th>
                                            <th className="px-6 py-4 font-bold">Volum (l/m)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {standard.dimensions.map((pipe, idx) => {
                                            const vol = (Math.PI * Math.pow(pipe.id / 20, 2) * 100) / 1000;

                                            return (
                                                <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="px-6 py-3 font-bold text-foreground">{pipe.dn}</td>
                                                    <td className="px-6 py-3 text-muted-foreground">{pipe.inch}</td>
                                                    <td className="px-6 py-3 text-muted-foreground font-mono">{pipe.od}</td>
                                                    <td className="px-6 py-3 text-muted-foreground font-mono">{pipe.thickness}</td>
                                                    <td className="px-6 py-3 font-bold text-primary bg-primary/5 font-mono group-hover:bg-primary/10 transition-colors">{pipe.id}</td>
                                                    <td className="px-6 py-3 text-muted-foreground font-mono">{pipe.weight}</td>
                                                    <td className="px-6 py-3 font-mono text-emerald-500">{vol.toFixed(3)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-border bg-muted/30 flex justify-between items-center shrink-0 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Info className="w-4 h-4" />
                        <span>Toate dimensiunile sunt în milimetri (mm) dacă nu este specificat altfel.</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                    >
                        Închide Catalogul
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
