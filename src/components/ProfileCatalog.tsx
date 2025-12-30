
import React, { useState, useMemo } from 'react';
import { Search, Info, Box, Layers, ArrowRight, CheckCircle, ChevronDown, ChevronUp, Filter, X, Grid, List } from 'lucide-react';
import { MUPRO_MASTER_CATALOG, MuproComponent } from '@/lib/muproVerifiedStandards';

// --- Types ---
type Manufacturer = 'MÜPRO' | 'OBO Bettermann' | 'Hilti' | 'Fischer' | 'Generic';
type LoadCapacity = 'Light' | 'Medium' | 'Heavy';
type Material = 'Galvanized' | 'Stainless' | 'Black Steel';

interface CatalogComponent extends MuproComponent {
    manufacturer: Manufacturer;
    material: Material;
}

// --- Mock Data Extension ---
// Wrapping MÜPRO data and adding placeholders for others
const EXTENDED_CATALOG: CatalogComponent[] = [
    // Proven MÜPRO Items
    ...MUPRO_MASTER_CATALOG.filter(c => c.category === 'profile').map(c => ({
        ...c,
        manufacturer: 'MÜPRO' as Manufacturer,
        material: 'Galvanized' as Material
    })),
    // Mock OBO Items (For Demo)
    {
        sku: 'OBO_US3', name: 'US 3 (50x30)', category: 'profile', manufacturer: 'OBO Bettermann',
        material: 'Galvanized', loadCapacity: 'Light', weight: 1.83, structural: { Iy: 6.2, Wy: 2.5 },
        description: 'U-Support Profile'
    },
    {
        sku: 'OBO_US5', name: 'US 5 (50x50)', category: 'profile', manufacturer: 'OBO Bettermann',
        material: 'Galvanized', loadCapacity: 'Medium', weight: 2.65, structural: { Iy: 13.5, Wy: 5.2 },
        description: 'U-Support Profile'
    },
    // Mock Hilti Items
    {
        sku: 'MQ_21', name: 'MQ-21 (41x21)', category: 'profile', manufacturer: 'Hilti',
        material: 'Galvanized', loadCapacity: 'Light', weight: 1.50, structural: { Iy: 1.8, Wy: 0.9 },
        description: 'Installation Channel'
    },
    {
        sku: 'MQ_41', name: 'MQ-41 (41x41)', category: 'profile', manufacturer: 'Hilti',
        material: 'Galvanized', loadCapacity: 'Medium', weight: 2.10, structural: { Iy: 6.3, Wy: 2.8 },
        description: 'Installation Channel'
    }
];

export const ProfileCatalog: React.FC = () => {
    // --- State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedManufacturers, setSelectedManufacturers] = useState<Manufacturer[]>(['MÜPRO']);
    const [selectedLoad, setSelectedLoad] = useState<LoadCapacity[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | 'All'>('All');
    const [expandedProfile, setExpandedProfile] = useState<string | null>(null);

    // --- Filters ---
    const filteredProfiles = useMemo(() => {
        return EXTENDED_CATALOG.filter(p => {
            // Search
            const q = searchQuery.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);

            // Manufacturer
            const matchesMan = selectedManufacturers.length === 0 || selectedManufacturers.includes(p.manufacturer);

            // Load
            const matchesLoad = selectedLoad.length === 0 || (p.loadCapacity && selectedLoad.includes(p.loadCapacity as LoadCapacity));

            // Material
            const matchesMat = selectedMaterial === 'All' || p.material === selectedMaterial;

            return matchesSearch && matchesMan && matchesLoad && matchesMat;
        });
    }, [searchQuery, selectedManufacturers, selectedLoad, selectedMaterial]);

    // --- Handlers ---
    const toggleManufacturer = (m: Manufacturer) => {
        setSelectedManufacturers(prev =>
            prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
        );
    };

    const toggleLoad = (l: LoadCapacity) => {
        setSelectedLoad(prev =>
            prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
        );
    };

    // --- Compatible System Logic (Preserved/Adapted) ---
    const getSystemComponents = (profile: CatalogComponent) => {
        if (profile.manufacturer !== 'MÜPRO') return null; // Only MÜPRO has full logic implemented

        const isHeavy = profile.loadCapacity === 'Heavy';
        let baseSku = '131840';
        if (profile.name.includes('41/21')) baseSku = '131842';
        let capSku = '105805';
        if (profile.name.includes('41/62') || profile.name.includes('124')) capSku = '105808';
        const boltSku = isHeavy ? '110435' : '110419';

        return {
            base: MUPRO_MASTER_CATALOG.find(c => c.sku === baseSku),
            cap: MUPRO_MASTER_CATALOG.find(c => c.sku === capSku),
            bolt: MUPRO_MASTER_CATALOG.find(c => c.sku === boltSku),
        };
    };

    return (
        <div className="flex flex-col md:flex-row h-[800px] bg-slate-950 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">

            {/* --- SIDEBAR FILTERS --- */}
            <div className="w-full md:w-80 bg-slate-900/80 border-r border-white/5 p-6 flex flex-col gap-8 overflow-y-auto backdrop-blur-md">

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                        <Box className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-lg leading-tight">System Catalog</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Modular Support</p>
                    </div>
                </div>

                {/* Manufacturers */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Manufacturers
                    </h3>
                    <div className="space-y-2">
                        {(['MÜPRO', 'OBO Bettermann', 'Hilti', 'Fischer', 'Generic'] as Manufacturer[]).map(m => (
                            <button
                                key={m}
                                onClick={() => toggleManufacturer(m)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${selectedManufacturers.includes(m)
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/5'
                                    }`}
                            >
                                {m}
                                {selectedManufacturers.includes(m) && <CheckCircle className="w-4 h-4 text-blue-200" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Load Capacity */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Load Capacity</h3>
                    <div className="flex flex-col gap-2">
                        {[
                            { id: 'Light', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
                            { id: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                            { id: 'Heavy', color: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse-slow' }
                        ].map(l => (
                            <button
                                key={l.id}
                                onClick={() => toggleLoad(l.id as LoadCapacity)}
                                className={`px-4 py-2.5 rounded-lg text-xs font-bold border flex items-center gap-3 transition-all ${selectedLoad.includes(l.id as LoadCapacity)
                                        ? l.color
                                        : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${l.id === 'Light' ? 'bg-green-500' : l.id === 'Medium' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                {l.id} Load
                            </button>
                        ))}
                    </div>
                </div>

                {/* Material */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Material</h3>
                    <select
                        value={selectedMaterial}
                        onChange={(e) => setSelectedMaterial(e.target.value as Material | 'All')}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-blue-500/50 focus:outline-none appearance-none"
                    >
                        <option value="All">All Materials</option>
                        <option value="Galvanized">Galvanized Steel</option>
                        <option value="Stainless">Stainless Steel</option>
                        <option value="Black Steel">Black Steel</option>
                    </select>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 bg-slate-950 p-6 md:p-8 overflow-y-auto relative">

                {/* Top Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 sticky top-0 bg-slate-950/90 backdrop-blur-xl z-20 py-4 border-b border-white/5">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search catalog (SKU, Name)..."
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                        {filteredProfiles.length} Items Found
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredProfiles.map((item) => {
                        const isExpanded = expandedProfile === item.sku;
                        const system = getSystemComponents(item);

                        return (
                            <div
                                key={item.sku}
                                className={`relative group rounded-2xl border transition-all duration-300 ${isExpanded
                                        ? 'bg-slate-900 border-blue-500/50 shadow-2xl shadow-blue-900/20 z-10 scale-[1.02]'
                                        : 'bg-slate-900/30 border-white/5 hover:bg-slate-800/50 hover:border-white/10 hover:-translate-y-1'
                                    }`}
                            >
                                {/* Top Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <span className="bg-slate-950/80 backdrop-blur border border-white/10 text-white text-[10px] font-mono px-2 py-1 rounded-md">
                                        #{item.sku}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-6 cursor-pointer" onClick={() => setExpandedProfile(isExpanded ? null : item.sku)}>
                                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center mb-4 text-slate-400 group-hover:text-blue-400 transition-colors">
                                        <Grid className="w-6 h-6" />
                                    </div>

                                    <h4 className="text-white font-bold text-lg mb-1 pr-12 line-clamp-1">{item.name}</h4>
                                    <p className="text-slate-500 text-xs mb-4 flex items-center gap-2">
                                        <span className="text-blue-400">{item.manufacturer}</span> • {item.material}
                                    </p>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/50 rounded-lg p-3 border border-white/5">
                                        <div>
                                            <div className="text-slate-500 uppercase font-bold tracking-wider mb-0.5">Weight</div>
                                            <div className="text-slate-300 font-mono">{(item.weight || 0).toFixed(2)} kg/m</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 uppercase font-bold tracking-wider mb-0.5">Inertia (Iy)</div>
                                            <div className="text-slate-300 font-mono">{(item.structural?.Iy || 0).toFixed(1)} cm4</div>
                                        </div>
                                    </div>

                                    {/* Load Indicator Bar */}
                                    <div className={`h-1 w-full mt-4 rounded-full ${item.loadCapacity === 'Heavy' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' :
                                            item.loadCapacity === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                                        }`} />
                                </div>

                                {/* Expanded Detail Overlay */}
                                {isExpanded && (
                                    <div className="px-6 pb-6 pt-0 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="h-px w-full bg-white/5 my-4" />

                                        {system ? (
                                            <div className="space-y-3">
                                                <h5 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
                                                    <Layers className="w-3 h-3" /> Compatible System
                                                </h5>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {[system.base, system.bolt, system.cap].map((comp, i) => (
                                                        comp && (
                                                            <div key={i} className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-white/5">
                                                                <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-slate-500">
                                                                    <Box className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-slate-300 font-medium">{comp.name}</div>
                                                                    <div className="text-[10px] text-slate-600 font-mono">SKU: {comp.sku}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-white/5 text-xs text-slate-500 text-center italic">
                                                Detailed system components not available for mocked items.
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                            <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors">
                                                View Datasheet <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
