'use client';

import React, { useState, useMemo } from 'react';
import { useProject } from '@/context/ProjectContext';
import { Box, Maximize2, Cuboid, ShieldCheck, Plus, Import } from 'lucide-react';
import Equipment3DViewer from './Equipment3DViewer';
import { EQUIPMENT_CATALOG } from '@/lib/catalogs/equipmentCatalog';
import { EquipmentItem } from '@/lib/types';

export const BimGalleryPage = () => {
    const { equipmentList, setEquipmentList } = useProject();

    // Filter items that have a 3D model
    const bimItems = equipmentList.filter(item => item.model3d && item.model3d.length > 0);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Filter Catalog Items with 3D Models
    const catalogBimItems = useMemo(() =>
        EQUIPMENT_CATALOG.filter(item => item.model3d && item.model3d.length > 0),
        []);

    const addToProject = (catalogItem: any) => {
        const newItem: EquipmentItem = {
            id: `eq-import-${Date.now()}`,
            type: catalogItem.category || 'Altele',
            name: catalogItem.model,
            volume: catalogItem.volume || 0,
            weight: catalogItem.weight || 0,
            model3d: catalogItem.model3d,
            technicalSheet: catalogItem.technicalSheet,
            notes: catalogItem.description
        };
        // Functional update to ensure fresh state
        setEquipmentList((prev: EquipmentItem[]) => [...prev, newItem]);
    };

    // Helper to extract SRC if iframe code is stored (fallback)
    const getModelSrc = (val: string) => {
        if (!val) return '';
        if (val.includes('<iframe')) {
            const match = val.match(/src="([^"]+)"/);
            return match ? match[1] : val;
        }
        return val;
    };

    const renderCard = (item: EquipmentItem | any, isCatalog: boolean = false) => {
        const rawSrc = getModelSrc(item.model3d!);
        const isEmbed = rawSrc.includes('sketchfab.com') || rawSrc.includes('youtube') || rawSrc.includes('vimeo');
        const isExpanded = expandedId === item.id;
        // Catalog items don't expand, they just add
        const interactive = !isCatalog;

        return (
            <div
                key={item.id}
                className={`group bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all hover:border-primary/50 flex flex-col ${isExpanded ? 'md:col-span-2 xl:col-span-2 row-span-2 shadow-2xl z-10' : ''}`}
            >
                {/* Header */}
                <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-border ${isCatalog ? 'bg-green-500/10 border-green-500/20' : 'bg-secondary/50'}`}>
                            {isCatalog ? <Import className="w-4 h-4 text-green-500" /> : <Cuboid className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-sm truncate max-w-[200px]">{item.name || item.model}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{item.type || item.category}</span>
                            </div>
                        </div>
                    </div>

                    {isCatalog ? (
                        <button
                            onClick={() => addToProject(item)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" /> Adaugă
                        </button>
                    ) : (
                        <button
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                            title={isExpanded ? "Collapse View" : "Expand View"}
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Viewer Area */}
                <div className={`relative bg-black ${isExpanded ? 'h-[600px]' : 'h-[350px]'} transition-all duration-300 w-full`}>
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

                    {/* Overlay info */}
                    <div className="absolute bottom-4 left-4 pointer-events-none flex gap-2">
                        <span className={`px-2 py-1 text-white/90 text-[10px] uppercase font-bold rounded-md backdrop-blur-md border border-white/10 flex items-center gap-1 ${isCatalog ? 'bg-green-900/60' : 'bg-black/60'}`}>
                            {isCatalog ? 'Catalog Preview' : (
                                <> <Box className="w-3 h-3" /> 3D Interactive </>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-border pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Box className="w-8 h-8 text-blue-500" />
                    </div>
                    3D Model Gallery
                </h1>
                <p className="text-muted-foreground text-lg">
                    Interactive visualization of your project's BIM Equipment.
                </p>
            </div>

            {/* Empty State + Recommendations */}
            {bimItems.length === 0 && (
                <div className="space-y-8">
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-2xl bg-muted/10">
                        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                            <Cuboid className="w-8 h-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground">Project Gallery Empty</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Added equipment with 3D models will appear here.
                        </p>
                    </div>

                    {catalogBimItems.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                    <span className="w-1.5 h-6 bg-green-500 rounded-full" />
                                    Available 3D Models in Catalog
                                </h2>
                                <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                                    {catalogBimItems.length} found
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                We found these manufacturer items with pre-configured 3D models. Add them to your project to verify the gallery.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {catalogBimItems.map(item => renderCard(item, true))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Project Items Grid */}
            {bimItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {bimItems.map(item => renderCard(item, false))}
                </div>
            )}
        </div>
    );
};
