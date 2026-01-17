'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
    X, Zap, Droplets, Weight, Box, FileText, Image as ImageIcon,
    Upload, Trash2, Plus, Check, Settings, Download
} from 'lucide-react';
import { EquipmentItem } from '@/lib/types';
import Equipment3DViewer from './Equipment3DViewer';

interface EquipmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipment: EquipmentItem;
    onUpdate: (updates: Partial<EquipmentItem>) => void;
}

const AVAILABLE_OPTIONS = [
    'Free Cooling',
    'Bypass',
    'Pompe Redundante',
    'Variator Frecvență (VFD)',
    'Debitmetru',
    'Supapă Siguranță',
    'Vas Expansiune',
    'Filtru Y',
    'Robinet Golire',
    'Manometru'
];

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
    isOpen, onClose, equipment, onUpdate
}) => {
    const [mounted, setMounted] = useState(false);
    const glycolImageRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleGlycolImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => onUpdate({ glycolProofImage: reader.result as string });
        reader.readAsDataURL(file);
    };

    const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => onUpdate({ technicalSheet: reader.result as string });
        reader.readAsDataURL(file);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const currentPhotos = equipment.photos || [];
                onUpdate({ photos: [...currentPhotos, reader.result as string] });
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        const newPhotos = [...(equipment.photos || [])];
        newPhotos.splice(index, 1);
        onUpdate({ photos: newPhotos });
    };

    const toggleOption = (option: string) => {
        const currentOptions = equipment.options || [];
        if (currentOptions.includes(option)) {
            onUpdate({ options: currentOptions.filter(o => o !== option) });
        } else {
            onUpdate({ options: [...currentOptions, option] });
        }
    };

    const downloadPdf = () => {
        if (!equipment.technicalSheet) return;
        const a = document.createElement('a');
        a.href = equipment.technicalSheet;
        a.download = `${equipment.name || 'equipment'}_datasheet.pdf`;
        a.click();
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">{equipment.name || 'Equipment Details'}</h2>
                        <p className="text-xs text-muted-foreground">{equipment.type}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground"><X className="w-5 h-5" /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/20 p-4 rounded-xl border border-border">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                                <Zap className="w-4 h-4" /> Putere
                            </div>
                            <input
                                type="number"
                                placeholder="0"
                                value={equipment.power || ''}
                                onChange={(e) => onUpdate({ power: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-lg font-bold text-foreground"
                            />
                            <span className="text-xs text-muted-foreground">kW</span>
                        </div>

                        <div className="bg-muted/20 p-4 rounded-xl border border-border">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                                <Droplets className="w-4 h-4" /> Debit
                            </div>
                            <input
                                type="number"
                                placeholder="0"
                                value={equipment.flowRate || ''}
                                onChange={(e) => onUpdate({ flowRate: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-lg font-bold text-foreground"
                            />
                            <span className="text-xs text-muted-foreground">m³/h</span>
                        </div>

                        <div className="bg-muted/20 p-4 rounded-xl border border-border">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                                <Weight className="w-4 h-4" /> Greutate
                            </div>
                            <input
                                type="number"
                                placeholder="0"
                                value={equipment.weight || ''}
                                onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-lg font-bold text-foreground"
                            />
                            <span className="text-xs text-muted-foreground">kg</span>
                        </div>

                        <div className="bg-muted/20 p-4 rounded-xl border border-border">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                                <Box className="w-4 h-4" /> Volum
                            </div>
                            <input
                                type="number"
                                placeholder="0"
                                value={equipment.volume || ''}
                                onChange={(e) => onUpdate({ volume: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-lg font-bold text-foreground"
                            />
                            <span className="text-xs text-muted-foreground">L</span>
                        </div>
                    </div>

                    {/* Glycol Recommendation */}
                    <div className="bg-blue-500/5 p-5 rounded-xl border border-blue-500/20">
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-500" /> Recomandare Glicol
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Concentrație Glicol (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="30"
                                    value={equipment.glycolRecommendation || ''}
                                    onChange={(e) => onUpdate({ glycolRecommendation: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Screenshot din PDF</label>
                                <input type="file" accept="image/*" onChange={handleGlycolImageUpload} className="hidden" ref={glycolImageRef} />
                                {equipment.glycolProofImage ? (
                                    <div className="relative group w-full h-24 rounded-lg overflow-hidden border border-border">
                                        <Image src={equipment.glycolProofImage} alt="Glycol Proof" fill className="object-cover" unoptimized />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                            <button onClick={() => glycolImageRef.current?.click()} className="p-2 rounded-full bg-white/20"><Upload className="w-4 h-4 text-white" /></button>
                                            <button onClick={() => onUpdate({ glycolProofImage: undefined })} className="p-2 rounded-full bg-red-500/50"><Trash2 className="w-4 h-4 text-white" /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => glycolImageRef.current?.click()} className="w-full h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                                        <Upload className="w-4 h-4" /> Upload Screenshot
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div>
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-primary" /> Opțiuni Echipament
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_OPTIONS.map(option => {
                                const isActive = (equipment.options || []).includes(option);
                                return (
                                    <button
                                        key={option}
                                        onClick={() => toggleOption(option)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isActive
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                                            }`}
                                    >
                                        {isActive && <Check className="w-3 h-3 inline mr-1" />}
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3D BIM Model */}
                    <div className="bg-muted/20 p-5 rounded-xl border border-border">
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Box className="w-4 h-4 text-blue-500" /> 3D BIM Model
                        </h3>

                        {!equipment.model3d ? (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-muted-foreground">Paste Local Path (.glb) OR Sketchfab Embed Code</label>
                                <textarea
                                    placeholder='Paste <iframe...> code from Sketchfab OR /models/file.glb'
                                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary h-20 resize-none font-mono text-xs"
                                    onBlur={(e) => {
                                        let val = e.target.value.trim();
                                        if (val.includes('<iframe')) {
                                            const match = val.match(/src="([^"]+)"/);
                                            if (match) val = match[1];
                                        }
                                        if (val) onUpdate({ model3d: val });
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {equipment.model3d.includes('sketchfab.com') ? (
                                    <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-md bg-black relative">
                                        <iframe
                                            src={equipment.model3d}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allowFullScreen
                                            allow="autoplay; fullscreen; xr-spatial-tracking"
                                        />
                                    </div>
                                ) : (
                                    <Equipment3DViewer modelUrl={equipment.model3d} />
                                )}

                                <div className="flex justify-between items-center bg-card p-2 rounded-lg border border-border">
                                    <code className="text-[10px] text-muted-foreground truncate max-w-[200px]">{equipment.model3d}</code>
                                    <button
                                        onClick={() => onUpdate({ model3d: undefined })}
                                        className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" /> Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Technical Sheet */}
                    <div className="bg-muted/20 p-5 rounded-xl border border-border">
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500" /> Technical Data Sheet
                        </h3>
                        <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" ref={pdfInputRef} />
                        {equipment.technicalSheet ? (
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center gap-2 bg-card px-4 py-3 rounded-lg border border-border">
                                    <FileText className="w-5 h-5 text-orange-500" />
                                    <span className="text-sm text-foreground">PDF Attached</span>
                                </div>
                                <button onClick={downloadPdf} className="btn btn-secondary btn-sm"><Download className="w-4 h-4 mr-1" /> Download</button>
                                <button onClick={() => pdfInputRef.current?.click()} className="btn btn-secondary btn-sm"><Upload className="w-4 h-4" /></button>
                                <button onClick={() => onUpdate({ technicalSheet: undefined })} className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <button onClick={() => pdfInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                                <Upload className="w-5 h-5" /> Upload Technical Sheet (PDF)
                            </button>
                        )}
                    </div>

                    {/* Photo Gallery */}
                    <div>
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-emerald-500" /> Galerie Fotografii
                        </h3>
                        <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" ref={photoInputRef} />
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                            {(equipment.photos || []).map((photo, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                                    <Image src={photo} alt={`Photo ${idx + 1}`} fill className="object-cover" unoptimized />
                                    <button onClick={() => removePhoto(idx)} className="absolute top-1 right-1 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => photoInputRef.current?.click()} className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                                <Plus className="w-6 h-6" />
                                <span className="text-[10px]">Add Photo</span>
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-bold text-foreground mb-2 block">Notițe</label>
                        <textarea
                            placeholder="Observații, detalii suplimentare..."
                            value={equipment.notes || ''}
                            onChange={(e) => onUpdate({ notes: e.target.value })}
                            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm text-foreground resize-none h-24"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-secondary/30 flex justify-end shrink-0">
                    <button onClick={onClose} className="btn btn-primary">Salvează & Închide</button>
                </div>
            </div>
        </div>,
        document.body
    );
};
