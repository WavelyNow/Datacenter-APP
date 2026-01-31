'use client';

import React, { useState, useMemo } from 'react';
import { useProject } from '@/context/ProjectContext';
import { Box, Maximize2, Cuboid, Plus, Import, Filter, Search, Trash2, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import Equipment3DViewer from './Equipment3DViewer';
import { EQUIPMENT_CATALOG } from '@/lib/catalogs/equipmentCatalog';
import { EquipmentItem, CatalogEquipment } from '@/lib/types';
import { BimModelDetailView } from './BimModelDetailView';
import { AnimatePresence } from 'framer-motion';

export const BimGalleryPage = () => {
    const { equipmentList, setEquipmentList } = useProject();

    // Project Items
    const bimItems = equipmentList.filter(item => item.model3d && item.model3d.length > 0);
    const [selectedDetail, setSelectedDetail] = useState<{ item: EquipmentItem | CatalogEquipment; isCatalog: boolean } | null>(null);

    // View State
    const [activeView, setActiveView] = useState<'project' | 'catalog'>(bimItems.length > 0 ? 'project' : 'catalog');

    // Filters
    const [filterManufacturer, setFilterManufacturer] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Catalog Data Processing
    // Extract unique manufacturers and categories from Catalog items that have 3D models
    const catalog3DItems = useMemo(() =>
        EQUIPMENT_CATALOG.filter(item => item.model3d && item.model3d.length > 0),
        []);

    const manufacturers = useMemo(() => {
        const m = new Set(catalog3DItems.map(i => i.manufacturer || 'Generic'));
        return ['All', ...Array.from(m)].sort();
    }, [catalog3DItems]);

    const categories = useMemo(() => {
        const c = new Set(catalog3DItems.map(i => i.category || 'Other'));
        return ['All', ...Array.from(c)].sort();
    }, [catalog3DItems]);

    // Filtered Catalog Items
    const filteredCatalogItems = useMemo(() => {
        return catalog3DItems.filter(item => {
            if (filterManufacturer !== 'All' && (item.manufacturer || 'Generic') !== filterManufacturer) return false;
            if (filterCategory !== 'All' && (item.category || 'Other') !== filterCategory) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    item.model.toLowerCase().includes(term) ||
                    item.description?.toLowerCase().includes(term) ||
                    item.manufacturer.toLowerCase().includes(term)
                );
            }
            return true;
        });
    }, [catalog3DItems, filterManufacturer, filterCategory, searchTerm]);

    const addToProject = (catalogItem: CatalogEquipment) => {
        const newItem: EquipmentItem = {
            id: `eq-import-${crypto.randomUUID()}`,
            type: catalogItem.category || 'Altele',
            name: catalogItem.model,
            manufacturer: catalogItem.manufacturer,
            volume: catalogItem.volume || 0,
            weight: catalogItem.weight || 0,
            model3d: catalogItem.model3d,
            technicalSheet: catalogItem.technicalSheet,
            notes: catalogItem.description,
            // Keep specs if compatible
            specifications: catalogItem.specifications
        };
        setEquipmentList((prev: EquipmentItem[]) => [...prev, newItem]);
        toast.success(`Adăugat ${newItem.name} în proiect`, {
            description: 'Puteți vizualiza echipamentul în tab-ul "Galeria Mea".',
            icon: <CheckCircle className="w-4 h-4 text-primary" />,
        });
    };

    const getModelSrc = (val: string) => {
        if (!val) return '';
        if (val.includes('<iframe')) {
            const match = val.match(/src="([^"]+)"/);
            return match ? match[1] : val;
        }
        return val;
    };

    // Card Renderer (Shared)
    const renderCard = (item: EquipmentItem | CatalogEquipment, isCatalog: boolean = false) => {
        const rawSrc = getModelSrc(item.model3d!);
        const isEmbed = rawSrc.includes('sketchfab.com') || rawSrc.includes('youtube') || rawSrc.includes('vimeo');

        // Resolve names/types based on the source (Project vs Catalog)
        const displayName = isCatalog ? (item as CatalogEquipment).model : (item as EquipmentItem).name;
        const displayType = isCatalog ? (item as CatalogEquipment).category : (item as EquipmentItem).type;

        return (
            <div
                key={item.id}
                onClick={() => setSelectedDetail({ item, isCatalog })}
                className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all hover:border-primary/50 cursor-pointer flex flex-col hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
            >
                {/* Header */}
                <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border border-border ${isCatalog ? 'bg-primary/10 border-primary/20' : 'bg-secondary/50'}`}>
                            {isCatalog ? <Import className="w-4 h-4 text-primary" /> : <Cuboid className="w-4 h-4 text-primary/70" />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-foreground text-sm truncate">{displayName}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider truncate">
                                    {item.manufacturer ? `${item.manufacturer} • ` : ''}{displayType}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isCatalog ? (
                        <button
                            onClick={() => addToProject(item as CatalogEquipment)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shrink-0 flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" /> Adaugă
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const confirm = window.confirm('Are you sure you want to remove this model from your project?');
                                    if (confirm) {
                                        setEquipmentList((prev: EquipmentItem[]) => prev.filter(i => i.id !== item.id));
                                    }
                                }}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-destructive transition-colors shrink-0"
                                title="Remove Model"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDetail({ item, isCatalog });
                                }}
                                className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors shrink-0"
                                title="Inspect Model"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Viewer */}
                <div className="relative bg-black h-[300px] w-full">
                    {item.model3d && (
                        isEmbed ? (
                            <iframe
                                src={rawSrc}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                allow="autoplay; fullscreen; xr-spatial-tracking"
                            />
                        ) : (
                            <Equipment3DViewer modelUrl={rawSrc} className="!h-full rounded-none border-0" />
                        )
                    )}
                    <div className="absolute bottom-4 left-4 pointer-events-none flex gap-2">
                        <span className={`px-2 py-1 text-white/90 text-[10px] uppercase font-bold rounded-md backdrop-blur-md border border-white/10 flex items-center gap-1 ${isCatalog ? 'bg-primary/60' : 'bg-black/60'}`}>
                            {isCatalog ? 'Catalog Preview' : <><Box className="w-3 h-3" /> 3D Interactive</>}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header & Tabs */}
            <div className="flex flex-col gap-6 border-b border-border pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                <Box className="w-8 h-8 text-primary" />
                            </div>
                            3D Model Gallery
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Visualize project equipment and explore BIM library.
                        </p>
                    </div>
                    {/* View Switcher */}
                    <div className="flex bg-secondary/50 p-1 rounded-lg border border-border">
                        <button
                            onClick={() => setActiveView('project')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'project' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            My Gallery ({bimItems.length})
                        </button>
                        <button
                            onClick={() => setActiveView('catalog')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'catalog' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Explore Library
                        </button>
                    </div>
                </div>
            </div>

            {/* View Content */}
            {activeView === 'project' && (
                <div className="space-y-6">
                    {bimItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/10 text-center">
                            <Cuboid className="w-12 h-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium">Gallery Empty</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                You haven&apos;t added any 3D models to your project yet.
                            </p>
                            <button onClick={() => setActiveView('catalog')} className="btn btn-primary gap-2">
                                <Search className="w-4 h-4" /> Browse Catalog
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {bimItems.map(item => renderCard(item, false))}
                        </div>
                    )}
                </div>
            )}

            {activeView === 'catalog' && (
                <div className="space-y-6">
                    {/* Filters Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/20 rounded-xl border border-border items-center">
                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mr-auto">
                            <Filter className="w-4 h-4" /> Filters:
                            {(filterManufacturer !== 'All' || filterCategory !== 'All' || searchTerm) && (
                                <button
                                    onClick={() => {
                                        setFilterManufacturer('All');
                                        setFilterCategory('All');
                                        setSearchTerm('');
                                    }}
                                    className="ml-2 px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            )}
                        </div>

                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                            {/* Category Filter */}
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none min-w-[150px]"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            {/* Manufacturer Filter */}
                            <select
                                value={filterManufacturer}
                                onChange={(e) => setFilterManufacturer(e.target.value)}
                                className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none min-w-[150px]"
                            >
                                {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>

                            {/* Search */}
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search models..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none w-full md:w-[200px]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs text-muted-foreground font-mono">
                            Showing {filteredCatalogItems.length} available models
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCatalogItems.map(item => renderCard(item, true))}
                    </div>
                </div>
            )}

            {/* Model Detail View Modal */}
            <AnimatePresence>
                {selectedDetail && (
                    <BimModelDetailView
                        item={selectedDetail.item}
                        isCatalog={selectedDetail.isCatalog}
                        onClose={() => setSelectedDetail(null)}
                        onAddToProject={addToProject}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
