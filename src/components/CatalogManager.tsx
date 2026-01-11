'use client';

import React, { useState, useEffect } from 'react';
import { CatalogEquipment, EQUIPMENT_CATALOG } from '@/lib/catalogs/equipmentCatalog';
import { Search, Plus, Trash2, FileText, Download, Save, Box, Book, Layers, Edit2, Check, X } from 'lucide-react';
import { PipeCatalogModal } from './PipeCatalogModal';
import { ProfileCatalogModal } from './ProfileCatalogModal';

export const CatalogManager: React.FC = () => {
    // Equipment Database State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [customCatalog, setCustomCatalog] = useState<CatalogEquipment[]>([]);
    const [isCreateMode, setIsCreateMode] = useState(false);

    // Other Modals State
    const [isPipeModalOpen, setIsPipeModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<CatalogEquipment>>({
        category: 'Chiller',
        model: '',
        volume: 0,
        weight: 0,
        description: '',
        technicalSheet: undefined
    });

    useEffect(() => {
        const saved = localStorage.getItem('custom_equipment_catalog');
        if (saved) {
            try {
                setCustomCatalog(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse custom catalog", e);
            }
        }
    }, []);

    const handleSaveCustom = () => {
        if (!formData.model || !formData.category) return;

        const newItem: CatalogEquipment = {
            id: `custom-${Date.now()}`,
            category: formData.category || 'Other',
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
                        Master Catalogs
                    </h2>
                    <p className="text-muted-foreground mt-1">Manage global databases for Equipment, Pipes, and Profiles.</p>
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
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
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
                                    {formData.technicalSheet && <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> PDF Attached</span>}
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

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 bg-muted/5 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredItems.map(item => (
                                    <div key={item.id} className="relative group bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all hover:border-primary/30">

                                        {/* Status Tag for Custom */}
                                        {item.id.startsWith('custom-') && (
                                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                                <span className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">CUSTOM</span>
                                                <button onClick={(e) => handleDelete(item.id, e)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-1 rounded-md">{item.category}</span>
                                            <h3 className="text-base font-bold text-foreground mt-2 group-hover:text-primary transition-colors">{item.model}</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-muted/30 p-2 rounded-lg">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold">Volume</div>
                                                <div className="text-sm font-mono font-bold">{item.volume} L</div>
                                            </div>
                                            <div className="bg-muted/30 p-2 rounded-lg">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold">Weight</div>
                                                <div className="text-sm font-mono font-bold">{item.weight} kg</div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground line-clamp-2 h-8 mb-4">{item.description}</p>

                                        {item.technicalSheet ? (
                                            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/10 px-3 py-2 rounded-lg border border-green-100 dark:border-green-900/30">
                                                <FileText className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold">Tech Sheet Available</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-muted-foreground bg-muted/20 px-3 py-2 rounded-lg border border-transparent">
                                                <FileText className="w-3.5 h-3.5 opacity-50" />
                                                <span className="text-[10px] font-medium opacity-70">No Sheet</span>
                                            </div>
                                        )}
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

        </div>
    );
};
