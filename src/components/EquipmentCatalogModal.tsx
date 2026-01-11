
import React, { useState } from 'react';
import { EQUIPMENT_CATALOG, CatalogEquipment } from '@/lib/catalogs/equipmentCatalog';
import { Search, X, Box, Info } from 'lucide-react';

interface EquipmentCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: CatalogEquipment) => void;
}

import { createPortal } from 'react-dom';

export const EquipmentCatalogModal: React.FC<EquipmentCatalogModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    const categories = Array.from(new Set(EQUIPMENT_CATALOG.map(item => item.category)));

    const filteredItems = EQUIPMENT_CATALOG.filter(item => {
        const matchesSearch = item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <Box className="w-6 h-6 text-blue-400" />
                            Catalog Echipamente Standard
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Selectează un model predefinit pentru a popula automat volumul și greutatea.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Sub-header / Filters */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="Caută model (ex. Chiller, CRAH...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${!selectedCategory ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-slate-200'}`}
                        >
                            Toate
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${selectedCategory === cat ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-slate-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-20">
                            <Box className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                            <p className="text-slate-500 font-medium">Nu am găsit echipamente care să corespundă căutării.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                    className="text-left group glass-card p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all flex flex-col gap-3 relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-full">{item.category}</span>
                                            <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.model}</h3>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-xs font-mono relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 uppercase text-[9px]">Volum</span>
                                            <span className="text-slate-300 font-bold">{item.volume} L</span>
                                        </div>
                                        <div className="flex flex-col border-l border-white/10 pl-4">
                                            <span className="text-slate-500 uppercase text-[9px]">Greutate</span>
                                            <span className="text-slate-300 font-bold">{item.weight} kg</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-500 leading-relaxed italic group-hover:text-slate-400 transition-colors relative z-10">
                                        {item.description}
                                    </p>

                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-white/5 border-t border-white/5 flex items-center gap-3 text-slate-500 text-xs italic">
                    <Info className="w-4 h-4 text-blue-500" />
                    Valorile de volum și greutate sunt estimative conform fișelor tehnice standard.
                </div>
            </div>
        </div>,
        document.body
    );
};
