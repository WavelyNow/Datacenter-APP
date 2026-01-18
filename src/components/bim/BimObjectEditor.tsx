import React, { useState, useEffect } from 'react';
import { Pencil, Save, Check, Layers, AlertCircle } from 'lucide-react';

import { BimObject } from '@/lib/bim/types';

interface BimObjectEditorProps {
    isOpen: boolean;
    onClose: () => void;
    bimObject: BimObject | null;
    onSave: (updates: { name: string, material?: string, applyToAll: boolean }) => void;
}

const MATERIAL_OPTIONS = [
    { value: 'Steel - Carbon', label: 'Țeavă Oțel (Carbon)' },
    { value: 'Steel - Stainless', label: 'Țeavă Inox (Stainless)' },
    { value: 'Copper', label: 'Țeavă Cupru' },
    { value: 'PPR', label: 'Țeavă PPR / Plastic' },
    { value: 'PVC', label: 'Țeavă PVC' },
    { value: 'PEHD', label: 'Țeavă PEHD' },
];

export const BimObjectEditor = ({ isOpen, onClose, bimObject, onSave }: BimObjectEditorProps) => {
    const [name, setName] = useState(bimObject?.name || '');
    const [material, setMaterial] = useState('Steel - Carbon');
    const [applyToAll, setApplyToAll] = useState(false);

    // Reset state when bimObject changes
    useEffect(() => {
        setName(bimObject?.name || '');
        setMaterial('Steel - Carbon');
        setApplyToAll(false);
    }, [bimObject]);

    if (!isOpen || !bimObject) return null;

    const obj = bimObject;
    const isPipe = obj?.type === 'Pipe';
    const isFitting = ['Elbow', 'Tee', 'Reducer', 'Fitting', 'Cap'].includes(obj?.type || '');

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-primary" />
                        Edit Properties
                    </h3>
                    <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono border border-primary/20">
                        ID: {obj?.globalId?.slice(0, 8)}...
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Object Name</label>
                        <input
                            type="text"
                            className="input-field w-full font-medium"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Tur Centrala 1"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Original BIM Name: <span className="font-mono">{obj?.name}</span>
                        </p>
                    </div>

                    {/* Material Selector (Pipes/Fittings only) */}
                    {(isPipe || isFitting) && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Material / Specification</label>
                            <select
                                className="input-field w-full cursor-pointer"
                                value={material}
                                onChange={e => setMaterial(e.target.value)}
                            >
                                {MATERIAL_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2 items-start p-2 bg-primary/5 border border-primary/10 rounded text-[10px] text-primary">
                                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                Selecting the correct material ensures accurate weight and friction calculations.
                            </div>
                        </div>
                    )}

                    {/* Batch Option */}
                    <div className="pt-4 border-t border-border">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${applyToAll ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 bg-background'}`}>
                                {applyToAll && <Check className="w-3 h-3" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={applyToAll}
                                onChange={e => setApplyToAll(e.target.checked)}
                            />
                            <div className="text-sm">
                                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">Apply to all similar items</span>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                    Update all <strong>{obj?.type}s</strong> in system <strong>{obj?.system}</strong> to use this name format and material.
                                </p>
                            </div>
                        </label>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-2">
                    <button onClick={onClose} className="btn btn-ghost h-9 px-4 text-xs">Cancel</button>
                    <button
                        onClick={() => onSave({ name, material, applyToAll })}
                        className="btn btn-primary h-9 px-4 text-xs gap-2"
                    >
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
