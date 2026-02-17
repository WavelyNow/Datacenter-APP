'use client';

import React, { useState, useRef } from 'react';
import { 
    RefreshCw, 
    Upload, 
    FileJson, 
    CheckCircle2, 
    AlertCircle, 
    Link, 
    Database,
    ArrowRight
} from 'lucide-react';
import { useBim } from '@/context/BimContext';
import { useProject } from '@/context/ProjectContext';
import { useTranslation } from '@/context/PreferencesContext';
import { RevitElement, mapRevitToAppElement } from '@/lib/bim/revit';
import { motion, AnimatePresence } from 'framer-motion';

export const RevitSyncPanel = () => {
    const { t } = useTranslation();
    const { revitElements, setRevitElements, isSyncingRevit, setIsSyncingRevit } = useBim();
    const { addSegments, addEquipment, segments, equipmentList } = useProject();
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Simulated parsing
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);
                    if (data.elements) {
                        setRevitElements(data.elements);
                    }
                } catch (err) {
                    console.error("Failed to parse Revit sync file", err);
                }
            };
            reader.readAsText(e.target.files[0]);
        }
    };

    const handleSync = () => {
        setIsSyncingRevit(true);
        
        const newSegments = revitElements
            .filter(el => el.category === 'Pipe')
            .map(el => mapRevitToAppElement(el))
            .filter(s => !segments.some(ps => ps.revitId === s.revitId));
            
        const newEquipment = revitElements
            .filter(el => el.category === 'Equipment')
            .map(el => mapRevitToAppElement(el))
            .filter(e => !equipmentList.some(eq => eq.revitId === e.revitId));

        // @ts-ignore - Partial mapping for prototype
        if (newSegments.length > 0) addSegments(newSegments);
        // @ts-ignore - Partial mapping for prototype
        if (newEquipment.length > 0) addEquipment(newEquipment);

        setTimeout(() => setIsSyncingRevit(false), 800);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <RefreshCw className={`w-5 h-5 text-primary ${isSyncingRevit ? 'animate-spin' : ''}`} />
                        Revit Link & Sync
                    </h3>
                    <p className="text-sm text-muted-foreground">Sincronizează cantitățile și proprietățile direct din modelul 3D.</p>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary gap-2"
                >
                    <Upload className="w-4 h-4" />
                    Încarcă Export Revit
                </button>
                <input 
                    type="file" 
                    accept=".json" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Element List */}
                <div className="lg:col-span-2 space-y-4">
                    {revitElements.length === 0 ? (
                        <div className="h-[400px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <FileJson className="w-12 h-12 mb-4" />
                            <p>Niciun fișier de sincronizare încărcat.</p>
                        </div>
                    ) : (
                        <div className="glass-panel rounded-2xl overflow-hidden border border-border">
                            <div className="bg-muted/30 px-4 py-3 border-b border-border flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Elemente Detectate ({revitElements.length})</span>
                                <div className="flex gap-4 text-[10px] font-bold">
                                    <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> SINCRONIZAT</span>
                                    <span className="flex items-center gap-1 text-amber-500"><AlertCircle className="w-3 h-3" /> PENDING</span>
                                </div>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
                                {revitElements.map((el) => {
                                    const isPipes = segments.some(s => s.revitId === el.revitId);
                                    const isEquip = equipmentList.some(e => e.revitId === el.revitId);
                                    const isLinked = isPipes || isEquip;

                                    return (
                                        <div key={el.revitId} className="p-4 hover:bg-muted/20 transition-colors flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${el.category === 'Pipe' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'}`}>
                                                    <Database className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm flex items-center gap-2">
                                                        {el.name}
                                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase">{el.category}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-mono">ID: {el.revitId}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-xs font-bold">{el.geometry?.length || el.geometry?.weight || 0} {el.category === 'Pipe' ? 'm' : 'kg'}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">Cantitate</div>
                                                </div>
                                                {isLinked ? (
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                                        <Link className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Sync Summary & Actions */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-primary/20 bg-primary/5">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-primary" />
                            Sumar Sincronizare
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-primary/10">
                                <span className="text-sm">Elemente Noi</span>
                                <span className="font-bold">{revitElements.filter(el => !segments.some(s => s.revitId === el.revitId) && !equipmentList.some(e => e.revitId === el.revitId)).length}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-primary/10">
                                <span className="text-sm">Elemente Linkate</span>
                                <span className="font-bold text-emerald-500">{revitElements.filter(el => segments.some(s => s.revitId === el.revitId) || equipmentList.some(e => e.revitId === el.revitId)).length}</span>
                            </div>
                            
                            <button 
                                onClick={handleSync}
                                disabled={revitElements.length === 0 || isSyncingRevit}
                                className="w-full btn btn-primary py-4 gap-2 shadow-lg shadow-primary/20"
                            >
                                {isSyncingRevit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Sincronizează Cantități
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-border">
                        <h4 className="font-bold mb-4">Instrucțiuni</h4>
                        <ul className="text-xs space-y-3 text-muted-foreground">
                            <li className="flex gap-2">
                                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[10px] text-foreground">1</div>
                                Exportă lista de elemente din Revit folosind plugin-ul nostru (format JSON).
                            </li>
                            <li className="flex gap-2">
                                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[10px] text-foreground">2</div>
                                Încarcă fișierul aici pentru a vedea diferențele de cantități.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[10px] text-foreground">3</div>
                                Rezolvă conflictele și apasă "Sincronizează" pentru a actualiza modelul tehnic.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
