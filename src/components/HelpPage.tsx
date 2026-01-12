'use client';

import React, { useState } from 'react';
import { Search, Book, FileText, Zap, Box, Anchor, ChevronRight, Info } from 'lucide-react';
import { helpRegistry } from '@/lib/helpContent';

type Category = 'general' | 'bim' | 'engineering' | 'export';

const categories: { id: Category; label: string; icon: any }[] = [
    { id: 'general', label: 'General & Dashboard', icon: Info },
    { id: 'bim', label: 'BIM & Import', icon: Box },
    { id: 'engineering', label: 'Inginerie & Calcul', icon: Zap },
    { id: 'export', label: 'Export & Rapoarte', icon: FileText },
];

export const HelpPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<Category>('general');

    // Filter content based on search or category
    const filteredContent = Object.values(helpRegistry).filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (searchQuery) return matchesSearch;
        return item.category === activeCategory;
    });

    const QuickStart = () => (
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8">
            <h4 className="text-primary font-bold flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" />
                Quick Guide: Cum încep un proiect?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { step: '1', text: 'Importă fișierul IFC în tab-ul BIM' },
                    { step: '2', text: 'Configurează fluidul și traseele' },
                    { step: '3', text: 'Exportă raportul tehnic PDF' }
                ].map(s => (
                    <div key={s.step} className="flex items-center gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">{s.step}</span>
                        <span className="text-muted-foreground">{s.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 h-[calc(100vh-2rem)] flex gap-8">

            {/* Sidebar Navigation */}
            <div className="w-64 shrink-0 hidden md:flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                        <Book className="w-6 h-6 text-primary" />
                        Help Center
                    </h2>
                    <p className="text-sm text-muted-foreground">Manual de utilizare & Documentație</p>
                </div>

                <div className="space-y-1">
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat.id as Category); setSearchQuery(''); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.id
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.label}
                                {activeCategory === cat.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-auto bg-muted/30 p-4 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground mb-2">Ai nevoie de suport tehnic?</p>
                    <a href="mailto:support@engsuite.com" className="text-sm font-bold text-primary hover:underline">
                        support@engsuite.com
                    </a>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-card rounded-3xl border border-border shadow-sm overflow-hidden">

                {/* Header / Search */}
                <div className="p-6 border-b border-border bg-muted/10">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Caută în documentație (ex: cum export pdf, calcul pue...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {!searchQuery && <QuickStart />}

                    <div className="space-y-6">
                        {filteredContent.length > 0 ? (
                            filteredContent.map(item => (
                                <div key={item.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                                        <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                                            {item.title}
                                            {/* Optional: Add badge based on ID/Category if feasible */}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            {item.description}
                                        </p>

                                        {item.tips && item.tips.length > 0 && (
                                            <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                                    Key Information
                                                </p>
                                                <ul className="space-y-2">
                                                    {item.tips.map((tip, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 opacity-50" />
                                                            <span>{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <Info className="w-12 h-12 text-muted-foreground/20 mb-4" />
                                <h3 className="text-lg font-medium text-foreground">Nu am găsit rezultate</h3>
                                <p className="text-muted-foreground">Încearcă alți termeni de căutare sau navighează prin categorii.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Technical Reference (Rich Content) */}
            <div className="w-80 shrink-0 hidden xl:flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <h4 className="text-sm font-bold flex items-center gap-2 mb-4 text-primary">
                        <Anchor className="w-4 h-4" />
                        Referințe Tehnice
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Viteze Recomandate (m/s)</p>
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-1 font-medium">Tip</th>
                                        <th className="text-right py-1 font-medium">Viteză</th>
                                    </tr>
                                </thead>
                                <tbody className="text-muted-foreground">
                                    <tr className="border-b border-border/50">
                                        <td className="py-1">Aspirație pompă</td>
                                        <td className="text-right py-1">0.5 - 1.2</td>
                                    </tr>
                                    <tr className="border-b border-border/50">
                                        <td className="py-1">Conductă refulare</td>
                                        <td className="text-right py-1">1.0 - 2.0</td>
                                    </tr>
                                    <tr className="border-b border-border/50">
                                        <td className="py-1">Preluare aer</td>
                                        <td className="text-right py-1">0.1 - 0.3</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Pierderi de Sarcină (Pa/m)</p>
                            <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
                                <p className="text-[10px] leading-relaxed italic">
                                    "Dimensionarea optimă țintește o pierdere liniară de **150 - 250 Pa/m** pentru eficiență energetică maximă."
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Proprietăți Fluid</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                                    <p className="text-[9px] font-bold text-indigo-600">Apă</p>
                                    <p className="text-[10px]">998 kg/m³</p>
                                </div>
                                <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                    <p className="text-[9px] font-bold text-emerald-600">Glicol 30%</p>
                                    <p className="text-[10px]">1045 kg/m³</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                    <p className="text-xs font-medium text-foreground mb-2">Ai un calcul complex?</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                        Folosește modulul de <strong>Inginerie Avansată</strong> pentru dimensionări precise în medii critice.
                    </p>
                    <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:brightness-110 transition-all">
                        Solicită Demo
                    </button>
                </div>
            </div>
        </div>
    );
};
