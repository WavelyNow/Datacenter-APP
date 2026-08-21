'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Box, Settings, CheckCircle, Plus, FileText } from 'lucide-react';
import Equipment3DViewer from './Equipment3DViewer';
import { EquipmentItem, CatalogEquipment } from '@/lib/types';

interface BimModelDetailViewProps {
    item: EquipmentItem | CatalogEquipment;
    isCatalog: boolean;
    onClose: () => void;
    onAddToProject?: (item: CatalogEquipment) => void;
}

export const BimModelDetailView: React.FC<BimModelDetailViewProps> = ({ item, isCatalog, onClose, onAddToProject }) => {
    // Resolve display names/types based on source
    const displayName = isCatalog ? (item as CatalogEquipment).model : (item as EquipmentItem).name;
    const displayType = isCatalog ? (item as CatalogEquipment).category : (item as EquipmentItem).type;
    const manufacturer = item.manufacturer || 'Generic';
    const description = isCatalog ? (item as CatalogEquipment).description : (item as EquipmentItem).notes;

    // Model URL parsing (reuse logic from gallery)
    const getModelSrc = (val: string) => {
        if (!val) return '';
        if (val.includes('<iframe')) {
            const match = val.match(/src="([^"]+)"/);
            return match ? match[1] : val;
        }
        return val;
    };

    const rawSrc = getModelSrc(item.model3d!);
    const isEmbed = rawSrc.includes('sketchfab.com') || rawSrc.includes('youtube') || rawSrc.includes('vimeo');

    // Specifications Aggregation
    const specs = {
        Volume: `${item.volume || 0} L`,
        Weight: `${item.weight || 0} kg`,
        ...(item.power && { Power: `${item.power} kW` }),
        ...(item.flowRate && { 'Flow Rate': `${item.flowRate} m³/h` }),
        ...(item.specifications && item.specifications)
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-xl"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative w-full max-w-6xl h-full max-h-[90vh] bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-primary/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-2 bg-secondary/80 hover:bg-secondary rounded-full border border-border transition-all text-muted-foreground hover:text-foreground shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left: 3D Viewer Section */}
                <div className="flex-[1.5] bg-black/40 relative group">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

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
                            <Equipment3DViewer
                                modelUrl={rawSrc}
                                className="!h-full rounded-none border-0"
                            />
                        )
                    )}

                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <span className="px-3 py-1.5 bg-primary/20 backdrop-blur-md rounded-full text-primary border border-primary/30 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                            <Box className="w-3 h-3" /> {isCatalog ? 'Catalog Library' : 'Project Gallery'}
                        </span>
                    </div>

                    <div className="absolute bottom-6 left-6 text-white/40 text-[10px] font-mono select-none">
                        INTERACTIVE PREVIEW MODE [60 FPS]
                    </div>
                </div>

                {/* Right: Info Section */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col space-y-8 bg-card scrollbar-thin">
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
                                {manufacturer} • {displayType}
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">{displayName}</h2>
                        </div>

                        {description && (
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Specs Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
                            <Settings className="w-3.5 h-3.5" /> Technical Specifications
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(specs).map(([key, value]) => (
                                <div key={key} className="p-3 bg-secondary/30 rounded-xl border border-border">
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-1">{key}</div>
                                    <div className="text-sm font-semibold text-foreground">{value as string}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex flex-col gap-3">
                        {isCatalog ? (
                            <button
                                onClick={() => {
                                    onAddToProject?.(item as CatalogEquipment);
                                    onClose();
                                }}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                            >
                                <Plus className="w-5 h-5" /> Import to Project
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-600 dark:text-primary text-sm font-bold uppercase tracking-wider">
                                <CheckCircle className="w-5 h-5 text-indigo-500" />
                                Model is part of active project
                            </div>
                        )}

                        {item.technicalSheet && (
                            <a
                                href={item.technicalSheet}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl font-bold flex items-center justify-center gap-2 border border-border transition-all"
                            >
                                <FileText className="w-4 h-4" /> Technical Documentation
                            </a>
                        )}
                    </div>

                    <div className="mt-auto pt-8 border-t border-border">
                        <div className="flex items-center gap-3 opacity-40">
                            <Box className="w-8 h-8 text-muted-foreground" />
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Powered by</div>
                                <div className="text-xs font-bold text-foreground">BIM ENGINE v2.6</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
