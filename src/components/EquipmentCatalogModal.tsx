import React, { useState } from 'react';
import { EQUIPMENT_CATALOG, CatalogEquipment } from '@/lib/catalogs/equipmentCatalog';
import { Search, X, Box, Plus, FileText, Trash2, Save, Cloud, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLibrary } from '@/hooks/useLibrary';

interface EquipmentCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: CatalogEquipment) => void;
}

export const EquipmentCatalogModal: React.FC<EquipmentCatalogModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [view, setView] = useState<'list' | 'create'>('list');

    // Use useMemo for mounted check instead of useState+useEffect pattern
    const mounted = typeof window !== 'undefined';

    // Hook for Cloud Library
    const { items: cloudItems, loading: cloudLoading, addItem, deleteItem } = useLibrary<CatalogEquipment>('equipment');

    // Form State
    const [formData, setFormData] = useState<Partial<CatalogEquipment>>({
        category: 'Chiller',
        model: '',
        volume: 0,
        weight: 0,
        description: '',
        technicalSheet: undefined
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveCustom = async () => {
        if (!formData.model || !formData.category) return;
        setIsSaving(true);

        const newItemData: CatalogEquipment = {
            id: `cloud-${Date.now()}`, // ID will be replaced/ignored by DB but useful for structure
            category: formData.category || 'Other',
            manufacturer: 'Custom (Cloud)',
            model: formData.model,
            volume: formData.volume || 0,
            weight: formData.weight || 0,
            description: formData.description || '',
            technicalSheet: formData.technicalSheet
        };

        try {
            await addItem(formData.model, newItemData);

            // Reset and go back
            setFormData({ category: 'Chiller', model: '', volume: 0, weight: 0, description: '' });
            setView('list');
        } catch (e) {
            alert('Failed to save to cloud library');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCustom = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this specific item from the GLOBAL Cloud Library? This affects everyone.')) {
            try {
                await deleteItem(id);
            } catch {
                alert('Failed to delete item');
            }
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

    if (!isOpen || !mounted) return null;

    // Merge Catalogs: Hardcoded + Cloud
    // Cloud items have structure { id, type, name, data, ... }. We map checks to CatalogEquipment.
    const mappedCloudItems: CatalogEquipment[] = cloudItems.map(i => ({
        ...i.data,
        id: i.id, // Use DB UUID
        manufacturer: i.data.manufacturer || 'Custom (Cloud)'
    }));

    const mergedCatalog = [...mappedCloudItems, ...EQUIPMENT_CATALOG];
    const categories = Array.from(new Set(mergedCatalog.map(item => item.category)));

    const filteredItems = mergedCatalog.filter(item => {
        const matchesSearch = item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Box className="w-4 h-4 text-foreground" />
                            {view === 'list' ? 'Global Equipment Library' : 'Add New Equipment'}
                        </h2>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            {view === 'list' ? 'Standard & Cloud items available to all users.' : 'Create a new item visible to everyone.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {view === 'list' && (
                            <button
                                onClick={() => setView('create')}
                                className="btn btn-primary btn-sm gap-2 text-xs"
                            >
                                <Cloud className="w-3.5 h-3.5" />
                                <Plus className="w-3 h-3" />
                                Add Cloud Item
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {view === 'list' ? (
                    <>
                        {/* Filters */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border bg-muted/30">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    className="w-full bg-card border border-border rounded-xl py-2 pl-9 pr-4 text-xs text-foreground focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground shadow-sm"
                                    placeholder="Search model, specs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                                <button onClick={() => setSelectedCategory(null)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shrink-0 ${!selectedCategory ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-secondary text-muted-foreground'}`}>All</button>
                                {categories.map(cat => (
                                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shrink-0 ${selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-secondary text-muted-foreground'}`}>{cat}</button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-muted/10">
                            {cloudLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <Box className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">No items found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredItems.map(item => {
                                        // Identify cloud items by checking ID in cloud map or simple UUID check (if standard are string ids)
                                        // Standard catalog IDs are string "1", "2"... or similar. Cloud are UUIDs.
                                        // A safer way is checking if it's NOT in local standard catalog by ID.
                                        const isCloud = mappedCloudItems.some(c => c.id === item.id);

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => { onSelect(item); onClose(); }}
                                                className="text-left group bg-card p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col gap-3 relative overflow-hidden"
                                            >
                                                {isCloud && (
                                                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                                                        <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-sky-500/20 flex items-center gap-1">
                                                            <Cloud className="w-3 h-3" /> CLOUD
                                                        </span>
                                                        <div
                                                            onClick={(e) => handleDeleteCustom(item.id, e)}
                                                            className="h-5 w-5 bg-destructive/10 text-destructive flex items-center justify-center rounded hover:bg-destructive hover:text-white transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider border border-border px-1.5 py-0.5 rounded mb-2 inline-block">{item.category}</span>
                                                    <h3 className="text-foreground text-sm font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                                                        {item.model}
                                                        {item.technicalSheet && <FileText className="w-3 h-3 text-blue-500" />}
                                                    </h3>
                                                </div>

                                                <div className="flex gap-4 text-xs">
                                                    <div className="bg-secondary/50 px-2 py-1 rounded">
                                                        <span className="text-muted-foreground text-[10px] uppercase font-bold mr-1">Vol:</span>
                                                        <span className="font-mono font-bold">{item.volume} L</span>
                                                    </div>
                                                    <div className="bg-secondary/50 px-2 py-1 rounded">
                                                        <span className="text-muted-foreground text-[10px] uppercase font-bold mr-1">Weight:</span>
                                                        <span className="font-mono font-bold">{item.weight} kg</span>
                                                    </div>
                                                </div>

                                                <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* CREATE VIEW */
                    <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
                        <div className="max-w-lg mx-auto space-y-4">
                            <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-600 mb-4 flex items-center gap-2">
                                <Cloud className="w-4 h-4" />
                                This item will be saved to the Global Library and visible to all users.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">Category</label>
                                    <select
                                        className="w-full bg-card border border-border rounded-lg text-sm px-3 py-2"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">Model Name</label>
                                    <input
                                        className="w-full bg-card border border-border rounded-lg text-sm px-3 py-2"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                        placeholder="e.g. SuperChiller 5000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">Volume (L)</label>
                                    <input type="number" className="w-full bg-card border border-border rounded-lg text-sm px-3 py-2" value={formData.volume} onChange={e => setFormData({ ...formData, volume: parseFloat(e.target.value) })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">Weight (kg)</label>
                                    <input type="number" className="w-full bg-card border border-border rounded-lg text-sm px-3 py-2" value={formData.weight} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                                <textarea
                                    className="w-full bg-card border border-border rounded-lg text-sm px-3 py-2 h-20 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Technical specs..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                                    Technical Sheet (PDF)
                                    {formData.technicalSheet && <span className="text-green-500 flex items-center gap-1 text-[10px]"><FileText className="w-3 h-3" /> Attached</span>}
                                </label>
                                <div className="border border-dashed border-border rounded-xl p-4 bg-muted/20 hover:bg-muted/40 transition-colors text-center cursor-pointer relative">
                                    <input type="file" accept="application/pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="w-6 h-6 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Click to upload PDF manual</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setView('list')} className="flex-1 btn btn-secondary h-10">Cancel</button>
                                <button onClick={handleSaveCustom} disabled={isSaving} className="flex-1 btn btn-primary h-10 gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save to Global DB
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
