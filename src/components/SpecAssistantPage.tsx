"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Plus, Check, Loader2, ArrowRight, AlertCircle, Trash2 } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { analyzeSpecifications } from '@/lib/calculations/specAssistant';
import { EquipmentItem, PipeSegment } from '@/lib/types';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';

export const SpecAssistantPage = () => {
    const { projectDetails, setProjectDetails, setEquipmentList, addSegments } = useProject();
    const [specText, setSpecText] = useState(projectDetails.specifications || '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<{
        equipment: Partial<EquipmentItem>[];
        segments: Partial<PipeSegment>[];
        materials: any[];
    } | null>(null);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        // Save text to project context
        setProjectDetails({ ...projectDetails, specifications: specText });
        
        // Rule-based parser (NO fake latency — results are instant, honest labeling)
        try {
            const analysis = analyzeSpecifications(specText);
            setResults(analysis);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddEquipment = (item: Partial<EquipmentItem>) => {
        if (!item.id) return;
        setEquipmentList(prev => [...prev, { ...item, id: `ai-${crypto.randomUUID()}` } as EquipmentItem]);
        setAddedIds(prev => new Set(prev).add(item.id!));
    };

    const handleAddSegment = (seg: Partial<PipeSegment>) => {
        if (!seg.id) return;
        addSegments([{ ...seg, id: `ai-seg-${crypto.randomUUID()}` } as PipeSegment]);
        setAddedIds(prev => new Set(prev).add(seg.id!));
    };

    const clearResults = () => {
        setResults(null);
        setAddedIds(new Set());
    };

    // True when the text contains an actual pipe length in meters (not mm/cm)
    const textDetected = /(?<![\w.,])\d+(?:[.,]\d+)?\s*m(?!\w)/i.test(specText);

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8 pb-32">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold">Asistent Specificații</h1>
                </div>
                <p className="text-muted-foreground">
                    Extrage automat (pe bază de reguli text) echipamente și conducte din Caietul de Sarcini. Valorile sugerate sunt estimări — verificați-le înainte de a le adăuga în proiect.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="glass-panel p-6 rounded-3xl border border-border/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Caiet de Sarcini
                            </h3>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">Sursă Text</span>
                        </div>
                        <textarea
                            value={specText}
                            onChange={(e) => setSpecText(e.target.value)}
                            placeholder="Exemplu: Avem nevoie de un sistem de răcire de 100kW N+1, cu 120m de conductă DN80 oțel și podea supraînălțată de 600mm..."
                            className="w-full h-[400px] bg-background/50 border border-border rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none transition-all font-sans leading-relaxed"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !specText.trim()}
                            className="btn btn-primary w-full mt-6 h-12 gap-2 shadow-lg shadow-primary/20"
                        >
                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {isAnalyzing ? 'Se analizează...' : 'Analizează textul'}
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        {!results ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center p-12 text-center glass-panel rounded-3xl border-dashed border-2 border-border/50"
                            >
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">Gata de analiză</h4>
                                <p className="text-sm text-muted-foreground max-w-[280px]">
                                    Introdu specificațiile proiectului în stânga și apasă butonul de analiză pentru a vedea recomandările.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold">Rezultate Detectate</h3>
                                    <button onClick={clearResults} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                        <Trash2 className="w-3 h-3" /> Șterge
                                    </button>
                                </div>

                                {/* Equipment Suggestions */}
                                {results.equipment.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2">Echipamente</p>
                                        {results.equipment.map((item) => (
                                            <div key={item.id} className="glass-panel p-4 rounded-2xl border border-border/50 flex items-center justify-between group hover:border-primary/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold">{item.name}</h4>
                                                        <p className="text-xs text-muted-foreground italic truncate max-w-[200px]">{item.notes}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddEquipment(item)}
                                                    disabled={addedIds.has(item.id!)}
                                                    className={`btn btn-sm h-8 px-4 rounded-lg gap-1.5 ${addedIds.has(item.id!) ? 'btn-secondary opacity-50' : 'btn-primary'}`}
                                                >
                                                    {addedIds.has(item.id!) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                    {addedIds.has(item.id!) ? 'Adăugat' : 'Adaugă'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Piping Suggestions */}
                                {results.segments.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2">Tubulatură & Trasee</p>
                                        {results.segments.map((seg) => (
                                            <div key={seg.id} className="glass-panel p-4 rounded-2xl border border-border/50 flex items-center justify-between group hover:border-border transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-muted rounded-lg text-primary">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold">{seg.size} - {seg.length}m</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {seg.material === 'custom'
                                                                ? 'Oțel (presupus — confirmați)'
                                                                : (PIPE_STANDARDS[seg.material as keyof typeof PIPE_STANDARDS]?.label ?? seg.material)}
                                                            {seg.length === 10 && !textDetected
                                                                ? ' · LUNGIME IMPLICITĂ — verificați'
                                                                : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddSegment(seg)}
                                                    disabled={addedIds.has(seg.id!)}
                                                    className={`btn btn-sm h-8 px-4 rounded-lg gap-1.5 ${addedIds.has(seg.id!) ? 'btn-secondary opacity-50' : 'btn-primary'}`}
                                                >
                                                    {addedIds.has(seg.id!) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                    {addedIds.has(seg.id!) ? 'Adăugat' : 'Adaugă'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {results.equipment.length === 0 && results.segments.length === 0 && (
                                    <div className="p-12 text-center glass-panel rounded-3xl border border-amber-500/20 bg-amber-500/5">
                                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-amber-600">Nu am putut detecta elemente specifice.</p>
                                        <p className="text-xs text-amber-500/70 mt-1">Încearcă să fii mai specific cu unitățile de măsură (kW, m, DN).</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
