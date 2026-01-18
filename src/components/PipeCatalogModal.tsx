'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Book, Search, Scale, Ruler, Cloud, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { PIPE_STANDARDS, PipeStandard, PipeDimension } from '@/lib/pipeStandards';
import { useLibrary } from '@/hooks/useLibrary';

// Extend PipeStandard type to include optional properties for Cloud items
interface CloudPipeStandard extends PipeStandard {
    isCustom?: boolean;
    id?: string;
}

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
    const [view, setView] = useState<'list' | 'create'>('list');

    // Cloud Library
    const { items: cloudItems, loading: cloudLoading, addItem, deleteItem } = useLibrary<PipeStandard>('pipe');
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<{
        label: string;
        category: 'metal' | 'plastic' | 'special';
        description: string;
        dimensions: PipeDimension[];
    }>({
        label: '',
        category: 'metal',
        description: '',
        dimensions: [] // Start empty
    });

    // Helper for adding a dimension line to form
    const [newDim, setNewDim] = useState<PipeDimension>({ dn: 'DN', inch: '', od: 0, thickness: 0, weight: 0, id: 0 });

    const addDimensionToForm = () => {
        if (!newDim.od || !newDim.thickness) return;
        setFormData(prev => ({
            ...prev,
            dimensions: [...prev.dimensions, { ...newDim, id: newDim.od }] // Use OD as ID for sorting/key
        }));
        setNewDim({ dn: 'DN', inch: '', od: 0, thickness: 0, weight: 0, id: 0 });
    };

    const removeDimensionFromForm = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            dimensions: prev.dimensions.filter((_, i) => i !== idx)
        }));
    };

    const handleSaveCustom = async () => {
        if (!formData.label || formData.dimensions.length === 0) {
            alert('Please add a Name and at least one Dimension.');
            return;
        }
        setIsSaving(true);
        try {
            await addItem(formData.label, {
                label: formData.label,
                category: formData.category,
                description: formData.description,
                dimensions: formData.dimensions
            });
            // Reset
            setFormData({ label: '', category: 'metal', description: '', dimensions: [] });
            setView('list');
        } catch (e) {
            alert('Failed to save pipe standard.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this Pipe Standard from the Cloud Library?')) {
            try {
                await deleteItem(id);
            } catch {
                alert('Failed to delete.');
            }
        }
    };

    // Filter standards
    const filteredStandards = useMemo(() => {
        // Convert PIPE_STANDARDS object to array format compatible with list
        const standardList: { key: string; data: CloudPipeStandard }[] = Object.entries(PIPE_STANDARDS).map(([k, v]) => ({
            key: k,
            data: v
        }));

        // Map Cloud Items
        const cloudList: { key: string; data: CloudPipeStandard }[] = cloudItems.map(item => ({
            key: item.id,
            data: {
                ...item.data,
                isCustom: true,
                id: item.id
            }
        }));

        const merged = [...cloudList, ...standardList];

        return merged.filter(({ data }) => {
            // Category filter
            if (selectedCategory !== 'all' && data.category !== selectedCategory) {
                return false;
            }
            // Search filter
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesLabel = data.label.toLowerCase().includes(q);
                const matchesDesc = data.description.toLowerCase().includes(q);
                const matchesDimension = data.dimensions.some(d =>
                    d.dn.toLowerCase().includes(q) || d.inch?.toLowerCase().includes(q)
                );
                return matchesLabel || matchesDesc || matchesDimension;
            }
            return true;
        });
    }, [searchQuery, selectedCategory, cloudItems]);

    // Count by category
    // Note: Re-calculating counts based on merged list would be better but keeping simple for now
    const categoryCounts = useMemo(() => {
        const counts = { all: 0, metal: 0, plastic: 0, special: 0 };
        // Count Standards
        Object.values(PIPE_STANDARDS).forEach(s => {
            counts.all++;
            counts[s.category]++;
        });
        // Count Cloud
        cloudItems.forEach(i => {
            counts.all++;
            if (i.data.category in counts) counts[i.data.category as keyof typeof counts]++;
        });
        return counts;
    }, [cloudItems]);

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
                            <h2 className="text-lg font-bold text-foreground leading-none">Catalog Tehnic - Țevi (Global Library)</h2>
                            <p className="text-xs text-muted-foreground mt-1">{filteredStandards.length} standarde disponibile</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {view === 'list' && (
                            <button onClick={() => setView('create')} className="btn btn-primary btn-sm gap-2">
                                <Plus className="w-4 h-4" /> Add Custom Standard
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {view === 'list' ? (
                    <>
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
                            {cloudLoading ? (
                                <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
                            ) : filteredStandards.map(({ key, data: standard }) => (
                                <div key={key} className="bg-secondary/20 border border-border rounded-xl overflow-hidden relative group/card">
                                    {/* Cloud Delete Button */}
                                    {standard.isCustom && (
                                        <div className="absolute top-4 right-16 flex gap-2">
                                            <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] uppercase font-bold px-2 py-1 rounded">Cloud Custom</span>
                                            <button
                                                onClick={() => standard.id && handleDelete(standard.id)}
                                                className="bg-destructive/10 text-destructive border border-destructive/20 p-1.5 rounded hover:bg-destructive hover:text-white transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Standard Header */}
                                    <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-10 rounded-full ${standard.category === 'metal' ? 'bg-indigo-500' :
                                                standard.category === 'plastic' ? 'bg-slate-400' : 'bg-slate-500'
                                                }`} />
                                            <div>
                                                <h3 className="text-base font-bold text-foreground">{standard.label}</h3>
                                                <p className="text-xs text-muted-foreground">{standard.description}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase ${standard.category === 'metal' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                                            standard.category === 'plastic' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20' :
                                                'bg-slate-500/10 text-slate-500 border border-slate-500/20'
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
                                                    const area_mm2 = Math.PI * Math.pow(pipe.id / 2, 2);
                                                    const vol = (area_mm2 * 1000) / 1000000; // Liter per meter

                                                    return (
                                                        <tr key={idx} className="hover:bg-muted/20 transition-colors group">
                                                            <td className="px-4 py-2.5 font-bold text-foreground">{pipe.dn}</td>
                                                            <td className="px-4 py-2.5 text-muted-foreground">{pipe.inch || '-'}</td>
                                                            <td className="px-4 py-2.5 text-muted-foreground font-mono">{pipe.od}</td>
                                                            <td className="px-4 py-2.5 text-muted-foreground font-mono">{pipe.thickness}</td>
                                                            <td className="px-4 py-2.5 font-bold text-indigo-600 dark:text-emerald-400 bg-indigo-500/5 font-mono group-hover:bg-indigo-500/10 transition-colors">{pipe.id}</td>
                                                            <td className="px-4 py-2.5 text-muted-foreground font-mono">{pipe.weight.toFixed(2)}</td>
                                                            <td className="px-4 py-2.5 font-mono text-indigo-500/80">{vol.toFixed(3)}</td>
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
                    </>
                ) : (
                    /* CREATE VIEW */
                    <div className="flex-1 overflow-y-auto p-8 bg-muted/10">
                        <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-8 shadow-sm">
                            <h4 className="text-lg font-bold mb-6 text-foreground flex items-center gap-2">
                                <Cloud className="w-5 h-5 text-indigo-500" /> Create Custom Pipe Standard
                            </h4>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Standard Name</label>
                                    <input
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                        placeholder="e.g. My Special Pipes"
                                        value={formData.label}
                                        onChange={e => setFormData({ ...formData, label: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                                        <select
                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                        >
                                            <option value="metal">Metal</option>
                                            <option value="plastic">Plastic</option>
                                            <option value="special">Special</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                                        <input
                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                            placeholder="Short description..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dimensions Editor */}
                            <div className="border-t border-border pt-4">
                                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Dimensions</label>

                                <div className="flex gap-2 mb-4 items-end bg-secondary/30 p-3 rounded-lg">
                                    <div className="w-20">
                                        <span className="text-[10px]">DN</span>
                                        <input className="w-full text-xs p-1 rounded border" value={newDim.dn} onChange={e => setNewDim({ ...newDim, dn: e.target.value })} />
                                    </div>
                                    <div className="w-20">
                                        <span className="text-[10px]">Inch</span>
                                        <input className="w-full text-xs p-1 rounded border" value={newDim.inch} onChange={e => setNewDim({ ...newDim, inch: e.target.value })} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px]">OD (mm)</span>
                                        <input type="number" className="w-full text-xs p-1 rounded border" value={newDim.od || ''} onChange={e => setNewDim({ ...newDim, od: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px]">Thk (mm)</span>
                                        <input type="number" className="w-full text-xs p-1 rounded border" value={newDim.thickness || ''} onChange={e => setNewDim({ ...newDim, thickness: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px]">Kg/m</span>
                                        <input type="number" className="w-full text-xs p-1 rounded border" value={newDim.weight || ''} onChange={e => setNewDim({ ...newDim, weight: parseFloat(e.target.value) })} />
                                    </div>
                                    <button onClick={addDimensionToForm} className="btn btn-primary btn-sm h-8 w-8 p-0 flex items-center justify-center">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-1 max-h-40 overflow-auto border border-border rounded-lg">
                                    {formData.dimensions.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">No dimensions added yet.</p>}
                                    {formData.dimensions.map((dim, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 text-xs bg-card border-b border-border last:border-0 hover:bg-muted/50">
                                            <span className="font-mono w-16">{dim.dn}</span>
                                            <span className="text-muted-foreground w-16">{dim.inch}</span>
                                            <span className="text-muted-foreground">OD: {dim.od}mm</span>
                                            <span className="text-muted-foreground">Thk: {dim.thickness}mm</span>
                                            <span className="text-muted-foreground">{dim.weight}kg/m</span>
                                            <button onClick={() => removeDimensionFromForm(idx)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={() => setView('list')} className="flex-1 btn btn-secondary h-10">Cancel</button>
                                <button onClick={handleSaveCustom} disabled={isSaving} className="flex-1 btn btn-primary h-10 gap-2">
                                    {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    Save Standard
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
