'use client';

import React, { useRef, useMemo } from 'react';
import { Package, ShieldCheck, Plus, Trash2, Upload, GripVertical, Image as ImageIcon, Scale, Droplet, Box, BookOpen, Info, Copy } from 'lucide-react';
import { EquipmentItem } from '@/lib/types';
import { EquipmentCatalogModal } from './EquipmentCatalogModal';
import { CatalogEquipment } from '@/lib/catalogs/equipmentCatalog';

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
    const [isCatalogOpen, setIsCatalogOpen] = React.useState(false);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const totalVolume = useMemo(() => {
        return equipmentList.reduce((acc, item) => acc + (item.volume || 0), 0);
    }, [equipmentList]);

    const addEquipment = () => {
        const newItem: EquipmentItem = {
            id: crypto.randomUUID(),
            type: 'Chiller',
            name: '',
            volume: 0,
            weight: 0,
        };
        onEquipmentChange([...equipmentList, newItem]);
    };

    const addFromCatalog = (catalogItem: CatalogEquipment) => {
        const newItem: EquipmentItem = {
            id: crypto.randomUUID(),
            type: catalogItem.category,
            name: catalogItem.model,
            volume: catalogItem.volume,
            weight: catalogItem.weight,
        };
        onEquipmentChange([...equipmentList, newItem]);
    };

    const updateItem = (id: string, field: keyof EquipmentItem, value: any) => {
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

    const triggerFileInput = (id: string) => {
        fileInputRefs.current[id]?.click();
    };

    return (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${viewMode === 'volume' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' :
                        viewMode === 'weights' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-teal-500/10 border-teal-500/20 text-teal-400'
                        }`}>
                        {viewMode === 'volume' && <Box className="w-6 h-6" />}
                        {viewMode === 'weights' && <Scale className="w-6 h-6" />}
                        {viewMode === 'photos' && <ImageIcon className="w-6 h-6" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            {viewMode === 'volume' && 'Equipment & Volumes'}
                            {viewMode === 'weights' && 'Static Loads'}
                            {viewMode === 'photos' && 'Documentation'}
                            <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs font-bold border border-white/10">
                                {equipmentList.length} items
                            </span>
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {viewMode === 'volume' && 'Manage equipment list and internal glycol volume.'}
                            {viewMode === 'weights' && 'Define empty weights for structural calculations.'}
                            {viewMode === 'photos' && 'Upload data sheets or installation photos.'}
                        </p>
                    </div>
                </div>

                {viewMode === 'volume' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsCatalogOpen(true)}
                            className="group flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/5 active:scale-95"
                        >
                            <BookOpen className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                            <span>Catalog</span>
                        </button>
                        <button
                            onClick={addEquipment}
                            className="group relative flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-500/20 active:scale-95 overflow-hidden"
                        >
                            <Plus className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">Manual</span>
                        </button>
                    </div>
                )}
            </div>

            <EquipmentCatalogModal
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                onSelect={addFromCatalog}
            />

            {/* List */}
            <div className={`space-y-4 ${viewMode === 'photos' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 space-y-0' : ''}`}>
                {equipmentList.length === 0 && (
                    <div className="text-center py-16 px-4 bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center">
                        <p className="text-slate-400 font-medium">No equipment added.</p>
                        {viewMode === 'volume' && <p className="text-sm text-slate-500 mt-1">Use "Add Equipment" to start.</p>}
                    </div>
                )}

                {equipmentList.map((item) => (
                    <div key={item.id} className={`glass-card p-5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group relative ${viewMode !== 'photos' ? 'grid grid-cols-1 md:grid-cols-12 gap-5 items-end' : 'flex flex-col'}`}>

                        {/* Common Fields */}
                        <div className={`${viewMode === 'photos' ? 'mb-4 w-full' : 'md:col-span-3'}`}>
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1 mb-1 block">Type</label>
                            <div className="relative">
                                <select
                                    className="w-full text-sm input-modern appearance-none cursor-pointer"
                                    value={item.type}
                                    onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                                >
                                    {EQUIPMENT_TYPES_RO.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <GripVertical className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className={`${viewMode === 'photos' ? 'mb-4 w-full' : 'md:col-span-4'}`}>
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1 mb-1 block">Name / Tag ID</label>
                            <input
                                type="text"
                                className="w-full text-sm input-modern font-medium text-white placeholder-slate-600"
                                placeholder="e.g. Chiller 01"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            />
                        </div>

                        {/* Volume Mode */}
                        {viewMode === 'volume' && (
                            <>
                                <div className="md:col-span-3">
                                    <label className="text-[10px] uppercase font-bold text-sky-500 tracking-wider ml-1 mb-1 block">Internal Volume</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full text-sm input-modern !border-sky-500/30 text-sky-400 font-mono font-bold focus:text-sky-300"
                                            value={item.volume}
                                            onChange={(e) => updateItem(item.id, 'volume', parseFloat(e.target.value) || 0)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500/50 text-xs">L</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            const newItem = { ...item, id: crypto.randomUUID(), name: `${item.name} (Copy)` };
                                            onEquipmentChange([...equipmentList, newItem]);
                                        }}
                                        className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm cursor-pointer"
                                        title="Duplicate"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Weights Mode */}
                        {viewMode === 'weights' && (
                            <>
                                <div className="md:col-span-3">
                                    <label className="text-[10px] uppercase font-bold text-amber-500 tracking-wider ml-1 mb-1 block">Empty Weight</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full text-sm input-modern !border-amber-500/30 text-amber-400 font-mono font-bold focus:text-amber-300"
                                            value={item.weight || 0}
                                            onChange={(e) => updateItem(item.id, 'weight', parseFloat(e.target.value) || 0)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/50 text-xs">kg</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 text-right pb-2">
                                    <div className="text-[10px] text-slate-500 font-mono">
                                        +{(item.volume * 1.05).toFixed(1)}kg fluid
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Photos Mode */}
                        {viewMode === 'photos' && (
                            <div className="mt-2 flex-grow flex flex-col">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1 mb-2 block">Data Sheet / Photo</label>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    ref={el => { fileInputRefs.current[item.id] = el; }}
                                    onChange={(e) => handleImageUpload(item.id, e)}
                                />

                                {item.proofImage ? (
                                    <div className="relative group/img cursor-pointer w-full h-40 rounded-xl overflow-hidden border border-white/5" onClick={() => triggerFileInput(item.id)}>
                                        <img
                                            src={item.proofImage}
                                            alt="Proof"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => triggerFileInput(item.id)}
                                        className="flex-grow flex flex-col items-center justify-center gap-3 w-full h-40 border-2 border-dashed border-white/10 hover:border-teal-500/50 rounded-xl bg-white/5 hover:bg-white/10 transition-all group/btn"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                            <ImageIcon className="w-5 h-5 text-slate-500 group-hover/btn:text-teal-400" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 group-hover/btn:text-slate-300">Upload Image</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Total Volume Footer */}
            {viewMode === 'volume' && (
                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <Info className="w-3.5 h-3.5" />
                        <span>Calculat pe baza specificațiilor furnizorului</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <span className="text-sm text-slate-500 uppercase tracking-widest font-bold">Total Volum Echipamente</span>
                        <span className="text-3xl font-bold text-sky-400 text-glow">{totalVolume.toFixed(2)} <span className="text-lg text-sky-500/50 ml-1">L</span></span>
                    </div>
                </div>
            )}

            {/* Safety Margin */}
            {viewMode === 'volume' && onSafetyMarginChange && (
                <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-sky-500/5 border border-sky-500/10">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${safetyMargin ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Safety Margin Buffer</h3>
                                <p className="text-xs text-slate-400">Adds an automatic 5% buffer to total volume.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={safetyMargin}
                                onChange={(e) => onSafetyMarginChange(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};
