'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Box, Plus, Trash2, X, Check, Scale, Ruler } from 'lucide-react';
import { MUPRO_MASTER_CATALOG, MuproComponent } from '@/lib/muproVerifiedStandards';

// --- Types ---
type LoadCapacity = 'Light' | 'Medium' | 'Heavy';
type ProfileType = 'All' | 'C-Channel' | 'U-Profile' | 'L-Angle' | 'Square';

interface CustomProfile extends MuproComponent {
    isCustom: true;
}

// --- Helper to detect profile type from name ---
const getProfileType = (name: string): ProfileType => {
    if (name.includes('MPR') || name.includes('Consolă')) return 'C-Channel';
    if (name.includes('U ')) return 'U-Profile';
    if (name.includes('Cornier') || name.includes('L ')) return 'L-Angle';
    if (name.includes('Pătrată')) return 'Square';
    return 'C-Channel';
};

export const ProfileCatalog: React.FC = () => {
    // --- State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<ProfileType>('All');
    const [selectedLoad, setSelectedLoad] = useState<LoadCapacity | 'All'>('All');
    const [customProfiles, setCustomProfiles] = useState<CustomProfile[]>([]);
    const [isCreateMode, setIsCreateMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        weight: 0,
        h: 0,
        w: 0,
        loadCapacity: 'Medium' as LoadCapacity
    });

    // Load Custom Profiles from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('custom_profiles_catalog');
        if (saved) {
            try {
                setCustomProfiles(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse custom profiles", e);
            }
        }
    }, []);

    // --- Combined Catalog ---
    const allProfiles = useMemo(() => {
        const muproProfiles = MUPRO_MASTER_CATALOG.filter(c => c.category === 'profile');
        return [...customProfiles, ...muproProfiles];
    }, [customProfiles]);

    // --- Filters ---
    const filteredProfiles = useMemo(() => {
        return allProfiles.filter(p => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
            const matchesType = selectedType === 'All' || getProfileType(p.name) === selectedType;
            const matchesLoad = selectedLoad === 'All' || p.loadCapacity === selectedLoad;
            return matchesSearch && matchesType && matchesLoad;
        });
    }, [allProfiles, searchQuery, selectedType, selectedLoad]);

    // Profile Types for Pills
    const profileTypes: ProfileType[] = ['All', 'C-Channel', 'U-Profile', 'L-Angle', 'Square'];

    // --- Handlers ---
    const handleSaveCustom = () => {
        if (!formData.name) return;

        const newProfile: CustomProfile = {
            sku: `custom-${Date.now()}`,
            name: formData.name,
            description: formData.description,
            category: 'profile',
            loadCapacity: formData.loadCapacity,
            weight: formData.weight,
            dimensions: { h: formData.h, w: formData.w, length: 6000 },
            isCustom: true
        };

        const updated = [...customProfiles, newProfile];
        setCustomProfiles(updated);
        localStorage.setItem('custom_profiles_catalog', JSON.stringify(updated));

        // Reset
        setFormData({ name: '', description: '', weight: 0, h: 0, w: 0, loadCapacity: 'Medium' });
        setIsCreateMode(false);
    };

    const handleDelete = (sku: string) => {
        if (confirm('Delete this custom profile?')) {
            const updated = customProfiles.filter(p => p.sku !== sku);
            setCustomProfiles(updated);
            localStorage.setItem('custom_profiles_catalog', JSON.stringify(updated));
        }
    };

    // Load Capacity Colors
    const getLoadColor = (load: LoadCapacity) => {
        switch (load) {
            case 'Light': return 'bg-green-500';
            case 'Medium': return 'bg-amber-500';
            case 'Heavy': return 'bg-red-500';
        }
    };

    return (
        <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border shadow-xl">

            {/* Header */}
            <div className="p-6 border-b border-border bg-secondary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Box className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Profile Metalice</h2>
                        <p className="text-xs text-muted-foreground">{filteredProfiles.length} profile disponibile</p>
                    </div>
                </div>

                {!isCreateMode ? (
                    <button onClick={() => setIsCreateMode(true)} className="btn btn-primary btn-sm gap-2">
                        <Plus className="w-4 h-4" />
                        Add Custom
                    </button>
                ) : (
                    <button onClick={() => setIsCreateMode(false)} className="btn btn-secondary btn-sm gap-2">
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                )}
            </div>

            {isCreateMode ? (
                /* CREATE FORM */
                <div className="flex-1 overflow-y-auto p-8 bg-muted/10">
                    <div className="max-w-xl mx-auto bg-card border border-border rounded-xl p-8 shadow-sm">
                        <h4 className="text-lg font-bold mb-6 text-foreground">Create Custom Profile</h4>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Profile Name</label>
                                <input
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                                    placeholder="e.g. Profil C 60x40x3"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Height (mm)</label>
                                    <input type="number" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground" value={formData.h} onChange={e => setFormData({ ...formData, h: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Width (mm)</label>
                                    <input type="number" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground" value={formData.w} onChange={e => setFormData({ ...formData, w: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Weight (kg/m)</label>
                                    <input type="number" step="0.01" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground" value={formData.weight} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Load Capacity</label>
                                <div className="flex gap-2">
                                    {(['Light', 'Medium', 'Heavy'] as LoadCapacity[]).map(l => (
                                        <button
                                            key={l}
                                            onClick={() => setFormData({ ...formData, loadCapacity: l })}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${formData.loadCapacity === l ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground hover:bg-muted'}`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Description (Optional)</label>
                                <input
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                                    placeholder="e.g. Oțel Zincat"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setIsCreateMode(false)} className="flex-1 btn btn-secondary h-11">Cancel</button>
                            <button onClick={handleSaveCustom} className="flex-1 btn btn-primary h-11 font-bold">Save Profile</button>
                        </div>
                    </div>
                </div>
            ) : (
                /* LIST VIEW */
                <>
                    {/* Filters Row */}
                    <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search profiles..."
                                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/20 text-foreground"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Type Pills */}
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                            {profileTypes.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedType(t)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${selectedType === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:border-foreground/30'}`}
                                >
                                    {t === 'All' ? 'All Types' : t}
                                </button>
                            ))}
                        </div>

                        {/* Load Filter */}
                        <select
                            value={selectedLoad}
                            onChange={e => setSelectedLoad(e.target.value as LoadCapacity | 'All')}
                            className="bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground"
                        >
                            <option value="All">All Loads</option>
                            <option value="Light">Light</option>
                            <option value="Medium">Medium</option>
                            <option value="Heavy">Heavy</option>
                        </select>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-5 bg-muted/5 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProfiles.map((item) => {
                                const isCustom = 'isCustom' in item && item.isCustom;

                                return (
                                    <div
                                        key={item.sku}
                                        className="group bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all hover:border-primary/30 relative"
                                    >
                                        {/* Custom Badge & Delete */}
                                        {isCustom && (
                                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                                <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">CUSTOM</span>
                                                <button onClick={() => handleDelete(item.sku)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}

                                        {/* SKU */}
                                        <div className="text-[10px] font-mono text-muted-foreground mb-2">#{item.sku}</div>

                                        {/* Name */}
                                        <h4 className="text-sm font-bold text-foreground mb-1 pr-16 line-clamp-2 group-hover:text-primary transition-colors">{item.name}</h4>

                                        {/* Manufacturer Badge */}
                                        {'manufacturer' in item && (item as { manufacturer?: string }).manufacturer && (
                                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-2 ${(item as { manufacturer?: string }).manufacturer === 'MÜPRO' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                (item as { manufacturer?: string }).manufacturer === 'Hilti' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                    (item as { manufacturer?: string }).manufacturer === 'OBO Bettermann' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                                        'bg-muted text-muted-foreground'
                                                }`}>
                                                {(item as { manufacturer?: string }).manufacturer}
                                            </span>
                                        )}

                                        {/* Description */}
                                        <p className="text-xs text-muted-foreground mb-4 line-clamp-1">{item.description || '-'}</p>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-secondary/50 rounded-lg p-3 border border-border/50 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <Scale className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-foreground font-mono font-bold">{(item.weight || 0).toFixed(2)} kg/m</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Ruler className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-foreground font-mono font-bold">{item.dimensions?.h || 0}x{item.dimensions?.w || 0}</span>
                                            </div>
                                        </div>

                                        {/* Load Indicator */}
                                        <div className={`h-1 w-full rounded-full ${getLoadColor(item.loadCapacity as LoadCapacity)}`} />
                                    </div>
                                );
                            })}
                        </div>

                        {filteredProfiles.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Box className="w-12 h-12 mb-4 opacity-30" />
                                <p className="text-sm">No profiles found</p>
                                <p className="text-xs mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
