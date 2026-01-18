'use client';

import React, { useState } from 'react';
import { EQUIPMENT_CATALOG } from '@/lib/catalogs/equipmentCatalog';
import { CatalogEquipment } from '@/lib/types';
import { Search, Plus, Trash2, FileText, Download, Box, Book, Layers, Edit2, Check, X, Weight } from 'lucide-react';
import { PipeCatalogModal } from './PipeCatalogModal';
import { ProfileCatalogModal } from './ProfileCatalogModal';

export const CatalogManager: React.FC = () => {
    // Equipment Database State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [customCatalog, setCustomCatalog] = useState<CatalogEquipment[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('custom_equipment_catalog');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse custom catalog", e);
                return [];
            }
        }
        return [];
    });
    const [isCreateMode, setIsCreateMode] = useState(false);

    // Other Modals State
    const [isPipeModalOpen, setIsPipeModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CatalogEquipment | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<CatalogEquipment>>({
        category: 'Chiller',
        model: '',
        volume: 0,
        weight: 0,
        description: '',
        technicalSheet: undefined
    });

    const handleSaveCustom = () => {
        if (!formData.model || !formData.category) return;

        const newItem: CatalogEquipment = {
            id: `custom-${Date.now()}`,
            category: formData.category || 'Other',
            manufacturer: 'Generic',
            model: formData.model,
            volume: formData.volume || 0,
            weight: formData.weight || 0,
            description: formData.description || '',
            technicalSheet: formData.technicalSheet
        };

        const updated = [...customCatalog, newItem];
        setCustomCatalog(updated);
        localStorage.setItem('custom_equipment_catalog', JSON.stringify(updated));

        // Reset
        setFormData({ category: 'Chiller', model: '', volume: 0, weight: 0, description: '' });
        setIsCreateMode(false);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this specific model from your database?')) {
            const updated = customCatalog.filter(i => i.id !== id);
            setCustomCatalog(updated);
            localStorage.setItem('custom_equipment_catalog', JSON.stringify(updated));
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Please upload PDF files only.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, technicalSheet: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Merged View
    const mergedCatalog = [...customCatalog, ...EQUIPMENT_CATALOG];
    const categories = Array.from(new Set(mergedCatalog.map(item => item.category)));

    const filteredItems = mergedCatalog.filter(item => {
        const matchesSearch = item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Book className="w-6 h-6 text-primary" />
                        Tech Library
                    </h2>
                    <p className="text-muted-foreground mt-1">Librăria tehnică centralizată pentru echipamente, țevi și profile.</p>
                </div>

                {/* Secondary Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsPipeModalOpen(true)}
                        className="btn btn-secondary gap-2"
                    >
                        <Box className="w-4 h-4" />
                        Teavă & Izolație
                    </button>
                    <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="btn btn-secondary gap-2"
                    >
                        <Layers className="w-4 h-4" />
                        Profile Metalice
                    </button>
                </div>
            </div>

            {/* Main Content Card: Equipment Database */}
            <div className="card-premium flex flex-col h-[75vh]">
                {/* Card Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-emerald-400 flex items-center justify-center border border-indigo-500/20">
                            <Box className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Equipment Database</h3>
                            <p className="text-xs text-muted-foreground">Manage models and technical sheets.</p>
                        </div>
                    </div>

                    {!isCreateMode ? (
                        <button onClick={() => setIsCreateMode(true)} className="btn btn-primary gap-2">
                            <Plus className="w-4 h-4" />
                            Add New Model
                        </button>
                    ) : (
                        <button onClick={() => setIsCreateMode(false)} className="btn btn-secondary gap-2">
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    )}
                </div>

                {isCreateMode ? (
                    /* CREATE FORM */
                    <div className="flex-1 overflow-y-auto p-8 bg-muted/10">
                        <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-8 shadow-sm">
                            <h4 className="text-lg font-bold mb-6">Create New Model</h4>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                                    <select
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Model Name</label>
                                    <input
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm"
                                        placeholder="e.g. ChillMaster 3000"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Volume (L)</label>
                                    <input type="number" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm" value={formData.volume} onChange={e => setFormData({ ...formData, volume: parseFloat(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Weight (kg)</label>
                                    <input type="number" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm" value={formData.weight} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })} />
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                                <textarea
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm h-24 resize-none"
                                    placeholder="Technical specifications..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 mb-8">
                                <label className="text-xs font-semibold text-muted-foreground uppercase flex justify-between">
                                    Technical Sheet (PDF)
                                    {formData.technicalSheet && <span className="text-indigo-600 dark:text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> PDF Atasat</span>}
                                </label>
                                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/40 cursor-pointer transition-all">
                                    <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                                    <span className="text-xs text-muted-foreground">Click to upload PDF manual</span>
                                    <span className="text-[10px] text-muted-foreground/50 mt-1">Max 5MB</span>
                                    <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setIsCreateMode(false)} className="flex-1 btn btn-secondary h-11">Cancel</button>
                                <button onClick={handleSaveCustom} className="flex-1 btn btn-primary h-11 font-bold">Save to Database</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* LIST VIEW */
                    <>
                        {/* Filters */}
                        <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/20"
                                    placeholder="Search database..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                                <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${!selectedCategory ? 'bg-foreground text-background border-foreground' : 'bg-background border-border hover:border-foreground/50'}`}>All</button>
                                {categories.map(c => (
                                    <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${selectedCategory === c ? 'bg-foreground text-background border-foreground' : 'bg-background border-border hover:border-foreground/50'}`}>{c}</button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-muted/5 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="relative group bg-card border border-border/60 hover:border-primary/50 text-foreground rounded-2xl p-7 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-3xl -mr-8 -mt-8 pointer-events-none transition-opacity group-hover:opacity-100" />

                                        {/* Status Tag for Custom */}
                                        {item.id.startsWith('custom-') && (
                                            <div className="absolute top-5 right-5 z-10">
                                                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm">
                                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Custom</span>
                                                    <button onClick={(e) => handleDelete(item.id, e)} className="text-muted-foreground hover:text-destructive transition-colors p-0.5"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-secondary text-[10px] font-bold text-muted-foreground uppercase tracking-wider border border-border/50">
                                                    {item.category}
                                                </span>
                                                {item.technicalSheet && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                                        <FileText className="w-3 h-3" />
                                                        PDF
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
                                                {item.model}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-6 font-medium leading-relaxed opacity-80">
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-5 border-t border-border/40">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Volume</span>
                                                    <span className="text-sm font-bold font-mono text-foreground flex items-baseline gap-0.5">
                                                        {item.volume}
                                                        <span className="text-[10px] text-muted-foreground font-medium">L</span>
                                                    </span>
                                                </div>
                                                <div className="w-px h-8 bg-border/60 mx-1" />
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Weight</span>
                                                    <span className="text-sm font-bold font-mono text-foreground flex items-baseline gap-0.5">
                                                        {item.weight}
                                                        <span className="text-[10px] text-muted-foreground font-medium">kg</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:rotate-[-15deg]">
                                                <Download className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Hidden Modals (Triggered by Header Buttons) */}
            <PipeCatalogModal isOpen={isPipeModalOpen} onClose={() => setIsPipeModalOpen(false)} />
            <ProfileCatalogModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

            {/* Equipment Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    <div className="relative bg-card w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                {/* Manufacturer Badge */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs ${selectedItem.manufacturer === 'Schneider Electric' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' :
                                    selectedItem.manufacturer === 'Vertiv' ? 'bg-slate-700' :
                                        selectedItem.manufacturer === 'Grundfos' ? 'bg-slate-800' : 'bg-slate-600'
                                    }`}>
                                    {selectedItem.manufacturer === 'Schneider Electric' ? 'SE' :
                                        selectedItem.manufacturer === 'Vertiv' ? 'V' :
                                            selectedItem.manufacturer === 'Grundfos' ? 'G' : 'OEM'}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{selectedItem.category}</span>
                                    <h2 className="text-lg font-bold text-foreground">{selectedItem.model}</h2>
                                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${selectedItem.manufacturer === 'Schneider Electric' ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' :
                                        selectedItem.manufacturer === 'Vertiv' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20' :
                                            selectedItem.manufacturer === 'Grundfos' ? 'bg-slate-600/10 text-slate-700 dark:text-slate-500 border border-slate-600/20' :
                                                'bg-gray-500/10 text-gray-600 border border-gray-500/20'
                                        }`}>{selectedItem.manufacturer}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-muted/20 p-4 rounded-xl border border-border">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                        <Box className="w-4 h-4" /> Volume
                                    </div>
                                    <div className="text-xl font-bold text-foreground font-mono">{selectedItem.volume} <span className="text-sm text-muted-foreground">L</span></div>
                                </div>
                                <div className="bg-muted/20 p-4 rounded-xl border border-border">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                        <Weight className="w-4 h-4" /> Weight
                                    </div>
                                    <div className="text-xl font-bold text-foreground font-mono">{selectedItem.weight} <span className="text-sm text-muted-foreground">kg</span></div>
                                </div>
                                <div className="bg-muted/20 p-4 rounded-xl border border-border">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                        <Layers className="w-4 h-4" /> Category
                                    </div>
                                    <div className="text-sm font-bold text-foreground truncate">{selectedItem.category}</div>
                                </div>
                                <div className="bg-muted/20 p-4 rounded-xl border border-border">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                        <Book className="w-4 h-4" /> Catalog ID
                                    </div>
                                    <div className="text-xs font-mono text-muted-foreground">{selectedItem.id}</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-muted/10 p-5 rounded-xl border border-border">
                                <h4 className="text-sm font-bold text-foreground mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{selectedItem.description || 'No description available.'}</p>
                            </div>

                            {/* Technical Sheet */}
                            {selectedItem.technicalSheet ? (
                                <div className="bg-indigo-500/10 p-5 rounded-xl border border-indigo-500/20">
                                    <h4 className="text-sm font-bold text-indigo-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Fisa Tehnica Disponibila
                                    </h4>
                                    <a
                                        href={selectedItem.technicalSheet}
                                        download={`${selectedItem.model}_datasheet.pdf`}
                                        className="btn btn-primary gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Download PDF
                                    </a>
                                </div>
                            ) : (
                                <div className="bg-muted/20 p-5 rounded-xl border border-border flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-muted-foreground/50" />
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">No Technical Sheet</h4>
                                        <p className="text-xs text-muted-foreground/70">This model doesn&apos;t have an attached datasheet.</p>
                                    </div>
                                </div>
                            )}

                            {/* Custom Model Notice */}
                            {selectedItem.id.startsWith('custom-') && (
                                <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 flex items-center gap-3">
                                    <Edit2 className="w-5 h-5 text-indigo-500" />
                                    <div>
                                        <h4 className="text-sm font-medium text-indigo-600 dark:text-emerald-400">Custom Model</h4>
                                        <p className="text-xs text-indigo-600/70 dark:text-emerald-400/70">This model was added manually to your database.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex justify-end shrink-0">
                            <button onClick={() => setSelectedItem(null)} className="btn btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
