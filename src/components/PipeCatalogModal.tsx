'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Book, Search, Scale, Ruler } from 'lucide-react';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';

interface PipeCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type PipeCategory = 'all' | 'metal' | 'plastic' | 'special';

export const PipeCatalogModal = ({ isOpen, onClose }: PipeCatalogModalProps) => {
    // Client-side check
    const mounted = typeof window !== 'undefined';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PipeCategory>('all');

    // Filter standards
    const filteredStandards = useMemo(() => {
        return Object.entries(PIPE_STANDARDS).filter(([, standard]) => {
            // Category filter
            if (selectedCategory !== 'all' && standard.category !== selectedCategory) {
                return false;
            }
            // Search filter
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesLabel = standard.label.toLowerCase().includes(q);
                const matchesDesc = standard.description.toLowerCase().includes(q);
                const matchesDimension = standard.dimensions.some(d =>
                    d.dn.toLowerCase().includes(q) || d.inch?.toLowerCase().includes(q)
                );
                return matchesLabel || matchesDesc || matchesDimension;
            }
            return true;
        });
    }, [searchQuery, selectedCategory]);

    // Count by category
    const categoryCounts = useMemo(() => {
        const counts = { all: 0, metal: 0, plastic: 0, special: 0 };
        Object.values(PIPE_STANDARDS).forEach(s => {
            counts.all++;
            counts[s.category]++;
        });
        return counts;
    }, []);

    if (!isOpen || !mounted) return null;

    const categories: { id: PipeCategory; label: string }[] = [
        { id: 'all', label: 'Toate' },
        { id: 'metal', label: 'Metal' },
        { id: 'plastic', label: 'Plastic' },
        { id: 'special', label: 'Speciale' }
    ];

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-500" onClick={onClose} />

            <div className="relative bg-card w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-6 py-5 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Book className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground leading-none">Catalog Tehnic - Țevi</h2>
                            <p className="text-xs text-muted-foreground mt-1">{filteredStandards.length} standarde disponibile</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Caută după DN, inch, sau standard..."
                            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/20 text-foreground"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-1.5">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedCategory === cat.id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background border-border text-muted-foreground hover:border-foreground/30'
                                    }`}
                            >
                                {cat.label} ({categoryCounts[cat.id]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6 bg-card">
                    {filteredStandards.map(([key, standard]) => (
                        <div key={key} className="bg-secondary/20 border border-border rounded-xl overflow-hidden">
                            {/* Standard Header */}
                            <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-10 rounded-full ${standard.category === 'metal' ? 'bg-blue-500' :
                                        standard.category === 'plastic' ? 'bg-green-500' : 'bg-purple-500'
                                        }`} />
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">{standard.label}</h3>
                                        <p className="text-xs text-muted-foreground">{standard.description}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase ${standard.category === 'metal' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                    standard.category === 'plastic' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                        'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                                    }`}>
                                    {standard.category}
                                </span>
                            </div>

                            {/* Dimensions Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30 border-b border-border">
                                        <tr>
                                            <th className="px-4 py-3 font-bold">DN</th>
                                            <th className="px-4 py-3 font-bold">Inch</th>
                                            <th className="px-4 py-3 font-bold">Ø Ext (mm)</th>
                                            <th className="px-4 py-3 font-bold">Grosime (mm)</th>
                                            <th className="px-4 py-3 font-bold text-primary bg-primary/5">Ø Int (mm)</th>
                                            <th className="px-4 py-3 font-bold">
                                                <div className="flex items-center gap-1">
                                                    <Scale className="w-3 h-3" /> kg/m
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-bold">
                                                <div className="flex items-center gap-1">
                                                    <Ruler className="w-3 h-3" /> L/m
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {standard.dimensions.map((pipe, idx) => {
                                            const vol = (Math.PI * Math.pow(pipe.id / 20, 2) * 100) / 1000;

                                            return (
                                                <tr key={idx} className="hover:bg-muted/20 transition-colors group">
                                                    <td className="px-4 py-2.5 font-bold text-foreground">{pipe.dn}</td>
                                                    <td className="px-4 py-2.5 text-muted-foreground">{pipe.inch || '-'}</td>
                                                    <td className="px-4 py-2.5 text-muted-foreground font-mono">{pipe.od}</td>
                                                    <td className="px-4 py-2.5 text-muted-foreground font-mono">{pipe.thickness}</td>
                                                    <td className="px-4 py-2.5 font-bold text-primary bg-primary/5 font-mono group-hover:bg-primary/10 transition-colors">{pipe.id}</td>
                                                    <td className="px-4 py-2.5 text-muted-foreground font-mono">{pipe.weight.toFixed(2)}</td>
                                                    <td className="px-4 py-2.5 font-mono text-emerald-500">{vol.toFixed(3)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {filteredStandards.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Book className="w-12 h-12 mb-4 opacity-30" />
                            <p className="text-sm">Nu s-au găsit standarde</p>
                            <p className="text-xs mt-1">Încearcă să modifici filtrele</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-secondary/30 flex justify-between items-center shrink-0">
                    <p className="text-xs text-muted-foreground">
                        Toate dimensiunile sunt în milimetri (mm)
                    </p>
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
