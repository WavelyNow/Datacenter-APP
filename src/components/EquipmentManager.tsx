'use client';

import React, { useRef, useMemo, useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, Plus, Trash2, Upload, GripVertical, Image as ImageIcon, Box, BookOpen, Info, Copy, FileText, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { EquipmentItem } from '@/lib/types';
import { EquipmentCatalogModal } from './EquipmentCatalogModal';
import { EquipmentDetailModal } from './EquipmentDetailModal';
import { CatalogEquipment } from '@/lib/catalogs/equipmentCatalog';
import { isValidVolume, isValidWeight } from '@/lib/validation/schemas';

interface EquipmentManagerProps {
    equipmentList: EquipmentItem[];
    onEquipmentChange: (list: EquipmentItem[]) => void;
    safetyMargin?: boolean;
    onSafetyMarginChange?: (val: boolean) => void;
    viewMode: 'volume' | 'weights' | 'photos';
}

const EQUIPMENT_TYPES_RO = [
    'Chiller',
    'CRAH / CCU',
    'Dry Cooler / Turn Răcire',
    'Puffer / Rezervor Tampon',
    'Schimbător Căldură (Plaques)',
    'Grup Pompare',
    'Unitate internă (CDU)',
    'Altele'
];

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({
    equipmentList,
    onEquipmentChange,
    safetyMargin = false,
    onSafetyMarginChange,
    viewMode
}) => {
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const pdfInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const totalVolume = useMemo(() => {
        return equipmentList.reduce((acc, item) => acc + (item.volume || 0), 0);
    }, [equipmentList]);

    const openDetailModal = (item: EquipmentItem) => {
        setSelectedEquipment(item);
    };

    const handleDetailUpdate = (updates: Partial<EquipmentItem>) => {
        if (!selectedEquipment) return;
        onEquipmentChange(equipmentList.map(item =>
            item.id === selectedEquipment.id ? { ...item, ...updates } : item
        ));
        setSelectedEquipment(prev => prev ? { ...prev, ...updates } : null);
    };

    const addEquipment = () => {
        const newItem: EquipmentItem = {
            id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'Chiller',
            name: '',
            volume: 0,
            weight: 0,
        };
        onEquipmentChange([...equipmentList, newItem]);
    };

    const addFromCatalog = (catalogItem: CatalogEquipment) => {
        const newItem: EquipmentItem = {
            id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: catalogItem.category,
            name: catalogItem.model,
            volume: catalogItem.volume,
            weight: catalogItem.weight,
            technicalSheet: catalogItem.technicalSheet
        };
        onEquipmentChange([...equipmentList, newItem]);
    };

    const updateItem = (id: string, field: keyof EquipmentItem, value: EquipmentItem[keyof EquipmentItem]) => {
        const updated = equipmentList.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        onEquipmentChange(updated);
    };

    const removeItem = (id: string) => {
        onEquipmentChange(equipmentList.filter(item => item.id !== id));
    };

    const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateItem(id, 'proofImage', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePdfUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateItem(id, 'technicalSheet', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = (id: string) => {
        fileInputRefs.current[id]?.click();
    };

    const triggerPdfInput = (id: string) => {
        pdfInputRefs.current[id]?.click();
    };

    const downloadPdf = (base64: string, filename: string) => {
        const link = document.createElement('a');
        link.href = base64;
        link.download = `${filename}_Datasheet.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Header / Actions */}
            {viewMode === 'volume' && (
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border">
                            <Box className="w-4 h-4 text-foreground" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Inventory</h3>
                            <p className="text-[10px] text-muted-foreground">Manage equipment list</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsCatalogOpen(true)}
                            className="btn btn-secondary btn-sm gap-2 text-xs"
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            Catalog
                        </button>
                        <button
                            onClick={addEquipment}
                            className="btn btn-primary btn-sm gap-2 text-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Item
                        </button>
                    </div>
                </div>
            )}

            <EquipmentCatalogModal
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                onSelect={addFromCatalog}
            />

            {/* List Content */}
            <div className="p-4">
                {equipmentList.length === 0 && (
                    <div
                        onClick={viewMode === 'volume' ? addEquipment : undefined}
                        className={`group flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-border bg-muted/20 transition-all ${viewMode === 'volume' ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/50' : ''}`}
                    >
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                            <Box className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">No equipment added</p>
                        {viewMode === 'volume' && <p className="text-xs text-muted-foreground">Tap to create your first item</p>}
                    </div>
                )}

                <div className={`space-y-3 ${viewMode === 'photos' ? '!space-y-0 !grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}`}>
                    {equipmentList.map((item) => (
                        <div key={item.id} className={`group relative bg-muted/10 border border-border rounded-lg p-4 transition-all hover:border-primary/30 hover:shadow-sm ${viewMode !== 'photos' ? 'grid grid-cols-1 md:grid-cols-12 gap-4 items-end' : 'flex flex-col'}`}>

                            {/* Number Indicator */}
                            {viewMode !== 'photos' && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary group-hover:bg-primary rounded-l-lg transition-colors" />
                            )}

                            {/* Top Action Bar - Always Visible */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={() => openDetailModal(item)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] font-medium transition-colors"
                                    title="View Details"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="hidden sm:inline">Details</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const newItem = { ...item, id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: `${item.name} (Copy)` };
                                        onEquipmentChange([...equipmentList, newItem]);
                                    }}
                                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    title="Duplicate"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Type Selection */}
                            <div className={`${viewMode === 'photos' ? 'mb-3 w-full' : 'md:col-span-3 space-y-1.5'}`}>
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Type</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-card border border-border text-foreground text-sm rounded-md py-1.5 pl-3 pr-8 appearance-none focus:ring-1 focus:ring-primary/20 focus:border-primary/20"
                                        value={item.type}
                                        onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                                    >
                                        {EQUIPMENT_TYPES_RO.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <GripVertical className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Name Input & Tech Sheet */}
                            <div className={`${viewMode === 'photos' ? 'mb-3 w-full' : 'md:col-span-4 space-y-1.5'}`}>
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1 flex justify-between">
                                    Name / Tag
                                    {item.technicalSheet ? (
                                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> Tech Sheet Added
                                        </span>
                                    ) : null}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="w-full bg-card border border-border text-foreground text-sm rounded-md py-1.5 px-3 focus:ring-1 focus:ring-primary/20 focus:border-primary/20 placeholder:text-muted-foreground/50"
                                        placeholder="e.g. Chiller 01"
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                    />
                                    {/* Tech Sheet Button */}
                                    <div className="relative shrink-0">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="application/pdf"
                                            ref={el => { pdfInputRefs.current[item.id] = el; }}
                                            onChange={(e) => handlePdfUpload(item.id, e)}
                                        />
                                        {item.technicalSheet ? (
                                            <button
                                                onClick={() => downloadPdf(item.technicalSheet!, item.name || 'Equipment')}
                                                className="h-full aspect-square rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors flex items-center justify-center"
                                                title="Download Technical Sheet"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => triggerPdfInput(item.id)}
                                                className="h-full aspect-square rounded-md bg-secondary text-muted-foreground border border-border hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center"
                                                title="Upload Technical Sheet (PDF)"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Volume Mode Inputs */}
                            {viewMode === 'volume' && (
                                <>
                                    <div className="md:col-span-3 space-y-1.5">
                                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Volume (L)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100000"
                                                className={`w-full bg-card border text-foreground text-center font-mono text-sm rounded-md py-1.5 px-3 focus:ring-1 font-bold ${!isValidVolume(item.volume)
                                                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                                                    : 'border-border focus:ring-primary/20 focus:border-primary/20'
                                                    }`}
                                                value={item.volume}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    updateItem(item.id, 'volume', isNaN(val) ? 0 : val);
                                                }}
                                            />
                                            {!isValidVolume(item.volume) && (
                                                <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                            )}
                                        </div>
                                        {!isValidVolume(item.volume) && (
                                            <p className="text-[10px] text-red-500">0 - 100,000 L</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Weights Mode Inputs */}
                            {viewMode === 'weights' && (
                                <>
                                    <div className="md:col-span-3 space-y-1.5">
                                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Empty Weight (kg)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100000"
                                                className={`w-full bg-card border text-foreground text-center font-mono text-sm rounded-md py-1.5 px-3 focus:ring-1 font-bold ${!isValidWeight(item.weight || 0)
                                                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                                                    : 'border-border focus:ring-primary/20 focus:border-primary/20'
                                                    }`}
                                                value={item.weight || 0}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    updateItem(item.id, 'weight', isNaN(val) ? 0 : val);
                                                }}
                                            />
                                            {!isValidWeight(item.weight || 0) && (
                                                <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                            )}
                                        </div>
                                        {!isValidWeight(item.weight || 0) && (
                                            <p className="text-[10px] text-red-500">0 - 100,000 kg</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2 text-right pb-2">
                                        <div className="text-[10px] text-muted-foreground font-mono">
                                            +{(item.volume * 1.05).toFixed(1)}kg fluid
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Photos Mode Inputs */}
                            {viewMode === 'photos' && (
                                <div className="mt-2 flex-grow flex flex-col">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        ref={el => { fileInputRefs.current[item.id] = el; }}
                                        onChange={(e) => handleImageUpload(item.id, e)}
                                    />

                                    {item.proofImage ? (
                                        <div className="relative group/img cursor-pointer w-full h-40 rounded-lg overflow-hidden border border-border" onClick={() => triggerFileInput(item.id)}>
                                            <Image
                                                src={item.proofImage}
                                                alt="Proof"
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                                                <Upload className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => triggerFileInput(item.id)}
                                            className="flex-grow flex flex-col items-center justify-center gap-2 w-full h-40 border border-dashed border-border hover:border-muted-foreground rounded-lg bg-muted/20 hover:bg-muted/40 transition-all group/btn"
                                        >
                                            <ImageIcon className="w-5 h-5 text-muted-foreground group-hover/btn:text-foreground" />
                                            <span className="text-[10px] font-bold text-muted-foreground group-hover/btn:text-foreground uppercase tracking-wider">Upload Image</span>
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>
                    ))}
                </div>

                {/* Footer Totals */}
                {viewMode === 'volume' && (
                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Info className="w-3.5 h-3.5" />
                            <span>Calculated Volume</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total</span>
                            <span className="text-2xl font-bold text-foreground font-mono">{totalVolume.toFixed(2)} <span className="text-base text-muted-foreground">L</span></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Safety Margin Alert */}
            {
                viewMode === 'volume' && onSafetyMarginChange && (
                    <div className="bg-muted/30 border-t border-border p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${safetyMargin ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-foreground">Safety Buffer</h4>
                                <p className="text-[10px] text-muted-foreground">Adds 5% to volume calculations</p>
                            </div>
                        </div>

                        <button
                            onClick={() => onSafetyMarginChange(!safetyMargin)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${safetyMargin
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                                }`}
                        >
                            {safetyMargin ? 'ENABLED' : 'DISABLED'}
                        </button>
                    </div>
                )
            }

            {/* Modals */}
            <EquipmentCatalogModal
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                onSelect={addFromCatalog}
            />

            {
                selectedEquipment && (
                    <EquipmentDetailModal
                        isOpen={!!selectedEquipment}
                        onClose={() => setSelectedEquipment(null)}
                        equipment={selectedEquipment}
                        onUpdate={handleDetailUpdate}
                    />
                )
            }
        </div >
    );
};
