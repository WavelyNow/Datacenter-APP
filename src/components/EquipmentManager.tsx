'use client';

import React, { useRef } from 'react';
import { Package, ShieldCheck, Plus, Trash2, Upload, FileText, Image as ImageIcon, Scale, Droplet } from 'lucide-react';
import { EquipmentItem } from '@/lib/types';

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
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
        <div className="bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-800 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-4">
                {viewMode === 'volume' && <Droplet className="w-5 h-5 text-sky-500" />}
                {viewMode === 'weights' && <Scale className="w-5 h-5 text-amber-500" />}
                {viewMode === 'photos' && <ImageIcon className="w-5 h-5 text-teal-500" />}

                <h2 className="text-xl font-semibold text-neutral-100">
                    {viewMode === 'volume' && 'Management Echipamente & Volum'}
                    {viewMode === 'weights' && 'Sarcini & Greutăți Echipamente'}
                    {viewMode === 'photos' && 'Documentație Foto / Fișe'}
                    <span className="ml-2 text-xs font-normal text-neutral-400 bg-neutral-800 border border-neutral-700 px-2 py-1 rounded-full">
                        {equipmentList.length} unități
                    </span>
                </h2>
            </div>

            {/* List of Equipment */}
            <div className={`space-y-4 ${viewMode === 'photos' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0' : ''}`}>

                {equipmentList.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-neutral-800 rounded-lg text-neutral-500">
                        Nu există echipamente definite. {viewMode === 'volume' ? 'Adaugă mai jos.' : 'Mergi la tab-ul "Configurare" pentru a adăuga.'}
                    </div>
                )}

                {equipmentList.map((item) => (
                    <div key={item.id} className={`bg-neutral-800 p-4 rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors group relative ${viewMode !== 'photos' ? 'grid grid-cols-1 md:grid-cols-12 gap-4 items-end' : ''}`}>

                        {/* ==================== COMMON FIELDS (Type & Name) ==================== */}
                        <div className={`${viewMode === 'photos' ? 'mb-4' : 'md:col-span-3'}`}>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Tip Echipament</label>
                            <select
                                className="w-full text-sm border-neutral-600 rounded bg-neutral-900 text-neutral-200 p-2 focus:ring-1 focus:ring-sky-500 outline-none"
                                value={item.type}
                                onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                            >
                                {EQUIPMENT_TYPES_RO.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className={`${viewMode === 'photos' ? 'mb-4' : 'md:col-span-4'}`}>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Nume / Tag ID</label>
                            <input
                                type="text"
                                className="w-full text-sm border-neutral-600 rounded bg-neutral-900 text-neutral-200 p-2 placeholder-neutral-600 focus:ring-1 focus:ring-sky-500 outline-none"
                                placeholder="ex. Chiller 01..."
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            />
                        </div>


                        {/* ==================== VOLUME MODE ONLY ==================== */}
                        {viewMode === 'volume' && (
                            <>
                                <div className="md:col-span-3 text-right">
                                    <label className="block text-[10px] font-bold text-sky-500 uppercase mb-1">Volum Intern (L)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full text-sm border-sky-900/50 rounded focus:ring-1 focus:ring-sky-500 bg-neutral-900 text-sky-100 p-2 font-mono"
                                            value={item.volume}
                                            onChange={(e) => updateItem(item.id, 'volume', parseFloat(e.target.value) || 0)}
                                        />
                                        <span className="absolute right-2 top-2 text-sky-500/50 text-xs">L</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex justify-end pb-1">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-neutral-500 hover:text-red-400 p-2 rounded hover:bg-red-900/20 transition-all cursor-pointer"
                                        title="Șterge Echipament"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        )}


                        {/* ==================== WEIGHTS MODE ONLY ==================== */}
                        {viewMode === 'weights' && (
                            <>
                                <div className="md:col-span-3 text-right">
                                    <label className="block text-[10px] font-bold text-amber-500 uppercase mb-1">Greutate Utilaj (kg)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full text-sm border-amber-900/50 rounded focus:ring-1 focus:ring-amber-500 bg-neutral-900 text-amber-100 p-2 font-mono"
                                            value={item.weight || 0}
                                            onChange={(e) => updateItem(item.id, 'weight', parseFloat(e.target.value) || 0)}
                                        />
                                        <span className="absolute right-2 top-2 text-amber-500/50 text-xs">kg</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex justify-end items-end pb-2">
                                    <div className="text-xs text-neutral-500">
                                        +{(item.volume * 1.05).toFixed(1)}kg fluid
                                    </div>
                                </div>
                            </>
                        )}


                        {/* ==================== PHOTOS MODE ONLY ==================== */}
                        {viewMode === 'photos' && (
                            <div className="mt-4">
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-2">Fișă Tehnică / Foto</label>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    ref={el => { fileInputRefs.current[item.id] = el; }}
                                    onChange={(e) => handleImageUpload(item.id, e)}
                                />

                                {item.proofImage ? (
                                    <div className="relative group cursor-pointer w-full h-48" onClick={() => triggerFileInput(item.id)}>
                                        <div className="w-full h-full rounded border border-neutral-600 overflow-hidden bg-neutral-900 flex items-center justify-center relative">
                                            <img
                                                src={item.proofImage}
                                                alt="Proof"
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => triggerFileInput(item.id)}
                                        className="flex flex-col items-center justify-center gap-2 text-xs text-neutral-500 hover:text-teal-400 transition-colors w-full h-48 border border-dashed border-neutral-700 hover:border-teal-500/50 rounded bg-neutral-900"
                                    >
                                        <ImageIcon className="w-8 h-8 opacity-50" />
                                        <span>Încarcă Imagine</span>
                                    </button>
                                )}
                            </div>
                        )}

                    </div>
                ))}

                {/* ADD BUTTON (Only in Volume Mode) */}
                {viewMode === 'volume' && (
                    <button
                        onClick={addEquipment}
                        className="w-full py-4 border border-dashed border-neutral-700 rounded-lg text-neutral-500 hover:border-sky-500 hover:text-sky-400 hover:bg-sky-950/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Adaugă Echipament Nou</span>
                    </button>
                )}
            </div>

            {/* Safety Margin Toggle (Only in Volume Mode) */}
            {viewMode === 'volume' && onSafetyMarginChange && (
                <div className="pt-6 border-t border-neutral-800">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-neutral-400 flex items-center gap-2">
                            <ShieldCheck className={`w-5 h-5 transition-colors ${safetyMargin ? 'text-green-500' : 'text-neutral-600'}`} />
                            <span>Marjă Siguranță (+5% Volum)</span>
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={safetyMargin}
                                onChange={(e) => onSafetyMarginChange(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};
