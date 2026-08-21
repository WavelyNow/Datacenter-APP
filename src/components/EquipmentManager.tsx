'use client';

import React, { useRef, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { ShieldCheck, Plus, Trash2, Upload, GripVertical, Image as ImageIcon, Box, BookOpen, Info, Copy, FileText, Download, ExternalLink } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { EquipmentItem, CatalogEquipment } from '@/lib/types';
import { EquipmentCatalogModal } from './EquipmentCatalogModal';
import { EquipmentDetailModal } from './EquipmentDetailModal';
import { useTranslation } from '@/context/PreferencesContext';
import { useProject } from '@/context/ProjectContext';
import { getFluidDensity } from '@/lib/calculations/common';
import { validateUploadFile } from '@/lib/validation';
import { toast } from 'sonner';
import { ValidatedInput, NumberInput } from '@/components/ui/ValidatedInput';
import { motion } from 'framer-motion';
import { itemVariants } from '@/lib/animations';
import { ListSkeleton } from '@/components/ui/Skeleton';


interface EquipmentManagerProps {
    equipmentList: EquipmentItem[];
    onEquipmentChange: (list: EquipmentItem[]) => void;
    safetyMargin?: boolean;
    onSafetyMarginChange?: (val: boolean) => void;
    viewMode: 'volume' | 'weights' | 'photos';
    isLoading?: boolean;
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

interface EquipmentRowProps {
    item: EquipmentItem;
    viewMode: 'volume' | 'weights' | 'photos';
    onUpdate: (id: string, field: keyof EquipmentItem, value: EquipmentItem[keyof EquipmentItem]) => void;
    onRemove: (id: string) => void;
    onCopy: (item: EquipmentItem) => void;
    onOpenDetails: (item: EquipmentItem) => void;
    t: (key: string) => string;
    fluidDensityKgL?: number; // actual fluid density for weight display (kg/L)
}

// Catalog categories → canonical EQUIPMENT_TYPES_RO values.
// Keeps the type dropdown working and PUE/energy classification correct.
const CATEGORY_TO_TYPE: Record<string, string> = {
    'Cooling': 'Chiller',
    'Racks': 'Altele', // racks hold no liquid
    'Power': 'Altele',
    'Power Distribution': 'Altele',
    'Integrated Solutions': 'Altele',
    'Cooling Accessories': 'Grup Pompare',
    'Safety': 'Altele',
    'Security': 'Altele',
    'Infrastructure': 'Altele',
    'IT Systems': 'Altele',
    'Vane & Robineți': 'Altele',
    'Fitinguri': 'Altele',
    'Filtre & Separatoare': 'Altele',
    'Cuplaje': 'Altele',
    'Vane de Reglaj': 'Altele',
    'Clapete Sens': 'Altele',
    'Vane Echilibrare': 'Altele',
};

const EquipmentRow = React.memo(({ item, viewMode, onUpdate, onRemove, onCopy, onOpenDetails, t, fluidDensityKgL = 1.05 }: EquipmentRowProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const err = validateUploadFile(file, 2);
            if (err) { toast.error(err); return; }
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate(item.id, 'proofImage', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size > 5 * 1024 * 1024) { toast.error('PDF-ul depășește 5 MB'); e.target.value = ''; return; }
        if (file && file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate(item.id, 'technicalSheet', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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
        <motion.div 
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            className={`group relative bg-card/40 backdrop-blur-md border border-border rounded-xl p-4 transition-all hover:border-primary/40 hover:shadow-lg ${viewMode !== 'photos' ? 'grid grid-cols-1 md:grid-cols-12 gap-4 items-end' : 'flex flex-col'}`}
        >

            {/* Number Indicator */}
            {viewMode !== 'photos' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary group-hover:bg-primary rounded-l-lg transition-colors" />
            )}

            {/* Top Action Bar */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={() => onOpenDetails(item)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] font-medium transition-colors"
                    title="View Details"
                >
                    <ExternalLink className="w-3 h-3" />
                    <span className="hidden sm:inline">{t('equipmentManager.details')}</span>
                </button>
                <button
                    onClick={() => onCopy(item)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={t('equipmentManager.copy')}
                >
                    <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onRemove(item.id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title={t('equipmentManager.remove')}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Type Selection */}
            <div className={`${viewMode === 'photos' ? 'mb-3 w-full' : 'md:col-span-3 space-y-1.5'}`}>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">{t('equipmentManager.type')}</label>
                <div className="relative">
                    <select
                        className="w-full bg-card border border-border text-foreground text-sm rounded-md py-1.5 pl-3 pr-8 appearance-none focus:ring-1 focus:ring-primary/20 focus:border-primary/20"
                        value={item.type}
                        onChange={(e) => onUpdate(item.id, 'type', e.target.value)}
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
                <ValidatedInput
                    label={t('equipmentManager.nameTag')}
                    value={item.name}
                    onChange={(val) => onUpdate(item.id, 'name', String(val))}
                    placeholder="e.g. Pump P-01"
                    required
                    className="w-full"
                />
                {item.technicalSheet && (
                    <div className="absolute top-0 right-0">
                        <span className="text-primary text-[10px] font-bold flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                            <FileText className="w-3 h-3" /> {t('equipmentManager.techSheetAdded')}
                        </span>
                    </div>
                )}
                <div className="relative shrink-0">
                    <input
                        type="file"
                        className="hidden"
                        accept="application/pdf"
                        ref={pdfInputRef}
                        onChange={handlePdfUpload}
                    />
                    {item.technicalSheet ? (
                        <button
                            onClick={() => downloadPdf(item.technicalSheet!, item.name || 'Equipment')}
                            className="h-full aspect-square rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex items-center justify-center"
                            title={t('equipmentManager.downloadPdf')}
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => pdfInputRef.current?.click()}
                            className="h-full aspect-square rounded-md bg-secondary text-muted-foreground border border-border hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center"
                            title={t('equipmentManager.uploadPdf')}
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Volume Mode Inputs */}
            {viewMode === 'volume' && (
                <div className="md:col-span-3">
                    <NumberInput
                        label={`${t('equipmentManager.volumeL')} (Internal)`}
                        value={item.volume}
                        onChange={(val) => onUpdate(item.id, 'volume', val)}
                        min={0}
                        max={100000}
                        errorMessage={t('equipmentManager.rangeVolume')}
                    />
                </div>
            )}

            {/* Weights Mode Inputs */}
            {viewMode === 'weights' && (
                <>
                    <div className="md:col-span-3">
                        <NumberInput
                            label={t('equipmentManager.weightKg')}
                            value={item.weight || 0}
                            onChange={(val) => onUpdate(item.id, 'weight', val)}
                            min={0}
                            max={100000}
                            errorMessage={t('equipmentManager.rangeWeight')}
                        />
                    </div>
                    <div className="md:col-span-2 text-right pb-2 flex flex-col justify-end h-full">
                        <div className="text-[10px] text-muted-foreground font-mono">
                            +{(item.volume * fluidDensityKgL).toFixed(1)}kg {t('equipmentManager.fluid')}
                        </div>
                    </div>
                </>
            )}

            {/* Photos Mode Inputs */}
            {viewMode === 'photos' && (
                <div className="mt-2 grow flex flex-col">
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />

                    {item.proofImage ? (
                        <div className="relative group/img cursor-pointer w-full h-40 rounded-lg overflow-hidden border border-border" onClick={() => fileInputRef.current?.click()}>
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
                            onClick={() => fileInputRef.current?.click()}
                            className="grow flex flex-col items-center justify-center gap-2 w-full h-40 border border-dashed border-border hover:border-muted-foreground rounded-lg bg-muted/20 hover:bg-muted/40 transition-all group/btn"
                        >
                            <ImageIcon className="w-5 h-5 text-muted-foreground group-hover/btn:text-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground group-hover/btn:text-foreground uppercase tracking-wider">{t('equipmentManager.uploadImage')}</span>
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
});
EquipmentRow.displayName = 'EquipmentRow';

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({
    equipmentList,
    onEquipmentChange,
    safetyMargin = false,
    onSafetyMarginChange,
    viewMode,
    isLoading = false
}) => {
    const { t } = useTranslation();
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);

    // Real fluid density for the "fluid weight" readouts (was hardcoded 1.05 kg/L)
    const { glycolPercentage: projectGlycol, fluidType: projectFluidType } = useProject();
    const fluidDensityKgL = useMemo(
        () => getFluidDensity(projectGlycol ?? 0, projectFluidType ?? 'ethylene'),
        [projectGlycol, projectFluidType]
    );

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
        // Normalize into a canonical EQUIPMENT_TYPES_RO value.
        // Catalog categories like 'Cooling'/'Power'/'Racks' are NOT valid type
        // values — they made the dropdown render blank and skewed PUE
        // classification in energy.ts. Prefer the item's own type when valid.
        const validTypes = [
            'Chiller', 'CRAH / CCU', 'Dry Cooler / Turn Răcire', 'Puffer / Rezervor Tampon',
            'Schimbător Căldură (Plaques)', 'Grup Pompare', 'Unitate internă (CDU)', 'Altele'
        ];
        const normalizedType = catalogItem.type && validTypes.includes(catalogItem.type)
            ? catalogItem.type
            : (CATEGORY_TO_TYPE[catalogItem.category] ?? 'Altele');
        const newItem: EquipmentItem = {
            id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: normalizedType,
            name: catalogItem.model,
            volume: catalogItem.volume,
            weight: catalogItem.weight,
            technicalSheet: catalogItem.technicalSheet,
            manufacturer: catalogItem.manufacturer,
            model: catalogItem.model,
            power: catalogItem.power,
            flowRate: catalogItem.flowRate,
        };
        onEquipmentChange([...equipmentList, newItem]);
    };

    const updateItem = useCallback((id: string, field: keyof EquipmentItem, value: EquipmentItem[keyof EquipmentItem]) => {
        onEquipmentChange(equipmentList.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    }, [equipmentList, onEquipmentChange]);

    const removeItem = useCallback((id: string) => {
        onEquipmentChange(equipmentList.filter(item => item.id !== id));
    }, [equipmentList, onEquipmentChange]);

    const copyItem = useCallback((item: EquipmentItem) => {
        const newItem = { ...item, id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: `${item.name} (Copy)` };
        onEquipmentChange([...equipmentList, newItem]);
    }, [equipmentList, onEquipmentChange]);

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Header / Actions — actions available on ALL view modes (volume/weights/photos),
                otherwise there is no way to add equipment from Weights/Photos tabs */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border">
                        <Box className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{t('equipmentManager.inventory')}</h3>
                        <p className="text-[10px] text-muted-foreground">{t('equipmentManager.manageList')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCatalogOpen(true)}
                        className="btn btn-secondary btn-sm gap-2 text-xs"
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        {t('equipmentManager.catalog')}
                    </button>
                    <button
                        onClick={addEquipment}
                        className="btn btn-primary btn-sm gap-2 text-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {t('equipmentManager.addItem')}
                    </button>
                </div>
            </div>

            <EquipmentCatalogModal
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                onSelect={addFromCatalog}
            />

            {/* List Content */}
            <div className="p-4">
                {isLoading ? (
                    <ListSkeleton count={4} />
                ) : equipmentList.length === 0 ? (
                    <EmptyState
                        icon={Box}
                        title={t('equipmentManager.noEquipment')}
                        description={t('equipmentManager.startAdding')}
                        action={{
                            label: t('equipmentManager.addItem'),
                            onClick: addEquipment,
                            variant: 'primary'
                        }}
                        steps={[
                            t('equipmentManager.steps.1') || "Browse global catalog",
                            t('equipmentManager.steps.2') || "Add custom equipment",
                            t('equipmentManager.steps.3') || "Attach technical sheets"
                        ]}
                        tipsLabel="Inventory Guide"
                        className="my-8 border-dashed"
                    />
                ) : null}

                {!isLoading && equipmentList.length > 0 && (
                    <div className={`space-y-3 ${viewMode === 'photos' ? 'space-y-0! grid! grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}`}>
                        {equipmentList.map((item) => (
                            <EquipmentRow
                                key={item.id}
                                item={item}
                                viewMode={viewMode}
                                onUpdate={updateItem}
                                onRemove={removeItem}
                                onCopy={copyItem}
                                onOpenDetails={openDetailModal}
                                t={t}
                                fluidDensityKgL={fluidDensityKgL}
                            />
                        ))}
                    </div>
                )}

                {/* Footer Totals */}
                {viewMode === 'volume' && (
                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Info className="w-3.5 h-3.5" />
                            <span>{t('equipmentManager.calculatedVolume')}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{t('equipmentManager.total')}</span>
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
                                <h4 className="text-sm font-medium text-foreground">{t('equipmentManager.safetyBuffer')}</h4>
                                <p className="text-[10px] text-muted-foreground">{t('equipmentManager.bufferDesc')}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => onSafetyMarginChange(!safetyMargin)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${safetyMargin
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                                }`}
                        >
                            {safetyMargin ? t('equipmentManager.enabled') : t('equipmentManager.disabled')}
                        </button>
                    </div>
                )
            }

            {/* Modals — EquipmentCatalogModal rendered ONCE (was duplicated twice,
                causing stacked portals, double ESC handlers, broken body scroll) */}
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

