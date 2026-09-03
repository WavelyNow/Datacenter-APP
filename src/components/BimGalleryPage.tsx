'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import { Box, Maximize2, Cuboid, Plus, Import, Filter, Search, Trash2, CheckCircle, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Equipment3DViewer from './Equipment3DViewer';
import { EQUIPMENT_CATALOG } from '@/lib/catalogs/equipmentCatalog';
import { EquipmentItem, CatalogEquipment } from '@/lib/types';
import { BimModelDetailView } from './BimModelDetailView';
import { AnimatePresence } from 'framer-motion';

const FILTER_LABELS: Record<string, string> = {
    All: 'Toate',
    Generic: 'Generic',
    Other: 'Altele',
    Cooling: 'Răcire',
    Racks: 'Rack-uri',
    Power: 'Alimentare',
    'Power Distribution': 'Distribuție energie',
    'Integrated Solutions': 'Soluții integrate',
    'Cooling Accessories': 'Accesorii răcire',
    Safety: 'Siguranță',
    Security: 'Securitate',
    Infrastructure: 'Infrastructură',
    'IT Systems': 'Sisteme IT',
    Generator: 'Generator',
    Container: 'Container',
    Piping: 'Țevi',
    Switchgear: 'Aparataj electric',
    AHU: 'UTA',
    'Cooling Tower': 'Turn de răcire',
    'In-Row Cooling': 'Răcire in-row',
};

const filterLabel = (value: string) => FILTER_LABELS[value] ?? value;

export const BimGalleryPage = () => {
    const { equipmentList, setEquipmentList } = useProject();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Project Items
    const bimItems = equipmentList.filter(item => item.model3d && item.model3d.length > 0);
    const [selectedDetail, setSelectedDetail] = useState<{ item: EquipmentItem | CatalogEquipment; isCatalog: boolean } | null>(null);

    // View State
    const [activeView, setActiveView] = useState<'project' | 'catalog'>(bimItems.length > 0 ? 'project' : 'catalog');

    // Filters
    const [filterManufacturer, setFilterManufacturer] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    /**
     * Import GLB/GLTF LOCAL (propriile fișiere descărcate, ex. de pe
     * cad.georgfischer.com / TraceParts / BIMobject). Fișierul e încărcat
     * ca blob URL și intrat direct în galeria proiectului.
     */
    const handleImportLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const isGlb = file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf');
        if (!isGlb) {
            toast.error('Doar fișiere .glb sau .gltf');
            return;
        }
        if (file.size > 200 * 1024 * 1024) {
            toast.error('Modelul depășește 200 MB');
            return;
        }
        const url = URL.createObjectURL(file);
        const name = file.name.replace(/\.(glb|gltf)$/i, '');
        const newItem: EquipmentItem = {
            id: `eq-glb-${crypto.randomUUID()}`,
            type: 'Altele',
            name,
            volume: 0,
            weight: 0,
            model3d: url,
            notes: `Import local GLB: ${file.name} — verificați dimensiunile/datele înainte de folosire`,
        };
        setEquipmentList((prev: EquipmentItem[]) => [...prev, newItem]);
        setActiveView('project');
        toast.success(`Model importat: ${name}`, {
            description: 'Disponibil în Galeria Mea. Modelele GF COOL-FIT se descarcă de pe cad.georgfischer.com.',
        });
        // reset input so same file can be re-imported
        e.target.value = '';
    };

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
                    (item.manufacturer || 'Generic').toLowerCase().includes(term)
                );
            }
            return true;
        });
    }, [catalog3DItems, filterManufacturer, filterCategory, searchTerm]);

    const VALID_TYPES = ['Chiller', 'CRAH / CCU', 'Dry Cooler / Turn Răcire', 'Puffer / Rezervor Tampon', 'Schimbător Căldură (Plaques)', 'Grup Pompare', 'Unitate internă (CDU)', 'Altele'];
    const CATEGORY_MAP: Record<string, string> = {
        Cooling: 'Chiller', Racks: 'Altele', Power: 'Altele', 'Power Distribution': 'Altele',
        'Integrated Solutions': 'Altele', 'Cooling Accessories': 'Grup Pompare', Safety: 'Altele',
        Security: 'Altele', Infrastructure: 'Altele', 'IT Systems': 'Altele', Generator: 'Altele',
        Container: 'Altele', Piping: 'Altele', Switchgear: 'Altele', AHU: 'Altele',
        'Cooling Tower': 'Altele', 'In-Row Cooling': 'CRAH / CCU', 'Vane & Robineți': 'Altele',
        Fitinguri: 'Altele', 'Filtre & Separatoare': 'Altele', Cuplaje: 'Altele',
        'Vane de Reglaj': 'Altele', 'Clapete Sens': 'Altele', 'Vane Echilibrare': 'Altele',
    };

    const addToProject = (catalogItem: CatalogEquipment) => {
        const normalizedType = catalogItem.type && VALID_TYPES.includes(catalogItem.type)
            ? catalogItem.type
            : (CATEGORY_MAP[catalogItem.category] ?? 'Altele');
        const newItem: EquipmentItem = {
            id: `eq-import-${crypto.randomUUID()}`,
            type: normalizedType,
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
                            onClick={(e) => { e.stopPropagation(); addToProject(item as CatalogEquipment); }}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shrink-0 flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" /> Adaugă
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const confirm = window.confirm('Sigur vrei să elimini acest model din proiect?');
                                    if (confirm) {
                                        if (item.model3d?.startsWith('blob:')) URL.revokeObjectURL(item.model3d);
                                        setEquipmentList((prev: EquipmentItem[]) => prev.filter(i => i.id !== item.id));
                                    }
                                }}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-destructive transition-colors shrink-0"
                                title="Elimină modelul"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDetail({ item, isCatalog });
                                }}
                                className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors shrink-0"
                                title="Inspectează modelul"
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
                            {isCatalog ? 'Previzualizare catalog' : <><Box className="w-3 h-3" /> 3D interactiv</>}
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
                            Galerie 3D și modele
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Vizualizează echipamentele proiectului și explorează biblioteca BIM.
                        </p>
                    </div>
                    {/* View Switcher */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-secondary btn-sm gap-2"
                            title="Importă fișiere .glb/.gltf descărcate de la producători (ex. cad.georgfischer.com, TraceParts, BIMobject)"
                        >
                            <Upload className="w-4 h-4" /> Importă GLB
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".glb,.gltf"
                            onChange={handleImportLocal}
                            className="hidden"
                        />
                        <div className="flex bg-secondary/50 p-1 rounded-lg border border-border">
                            <button
                                onClick={() => setActiveView('project')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'project' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Galeria mea ({bimItems.length})
                            </button>
                            <button
                                onClick={() => setActiveView('catalog')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'catalog' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Explorează biblioteca
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Content */}
            {activeView === 'project' && (
                <div className="space-y-6">
                    {bimItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/10 text-center">
                            <Cuboid className="w-12 h-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium">Galeria este goală</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Nu ai adăugat încă modele 3D în proiect.
                            </p>
                            <button onClick={() => setActiveView('catalog')} className="btn btn-primary gap-2">
                                <Search className="w-4 h-4" /> Răsfoiește catalogul
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
                            <Filter className="w-4 h-4" /> Filtre:
                            {(filterManufacturer !== 'All' || filterCategory !== 'All' || searchTerm) && (
                                <button
                                    onClick={() => {
                                        setFilterManufacturer('All');
                                        setFilterCategory('All');
                                        setSearchTerm('');
                                    }}
                                    className="ml-2 px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> Șterge
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
                                {categories.map(c => <option key={c} value={c}>{filterLabel(c)}</option>)}
                            </select>

                            {/* Manufacturer Filter */}
                            <select
                                value={filterManufacturer}
                                onChange={(e) => setFilterManufacturer(e.target.value)}
                                className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none min-w-[150px]"
                            >
                                {manufacturers.map(m => <option key={m} value={m}>{filterLabel(m)}</option>)}
                            </select>

                            {/* Search */}
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Caută modele..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none w-full md:w-[200px]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs text-muted-foreground font-mono">
                            Se afișează {filteredCatalogItems.length} modele disponibile
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
