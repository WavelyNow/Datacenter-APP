'use client';

import React, { useMemo, useState } from 'react';
import {
    Book, Search, Save, RotateCcw, Plus, Trash2, Download, Check,
    Info, ShieldCheck, AlertTriangle
} from 'lucide-react';
import {
    getPipeStandards,
    saveUserPipeStandards,
    resetUserPipeStandards,
    hasUserPipeStandardsOverride,
    PipeStandard,
    PipeDimension,
} from '@/lib/pipeStandards';

type PipeCategory = 'all' | 'metal' | 'plastic' | 'special';

interface EditableDim extends PipeDimension {
    _key: string; // stable key for editing
}

let dimSeq = 0;
const makeKey = () => `dim-${Date.now()}-${dimSeq++}`;

/**
 * Pagina „Standarde Țevi” — înlocuiește meniul/modalul vechi de catalog.
 * Permite VIZUALIZAREA și CORECTAREA tabelelor (Ø exterior, grosime, Ø interior,
 * greutate, Ø izolat) pentru toți producătorii, cu salvare locală (override)
 * și export/întoarcere la datele oficiale.
 */
export const PipeStandardsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PipeCategory>('all');
    const [hasOverride, setHasOverride] = useState<boolean>(() => hasUserPipeStandardsOverride());
    const [savedFlash, setSavedFlash] = useState(false);
    // Working copy: key → standard (copy of getPipeStandards on mount)
    const [standards, setStandards] = useState<Record<string, PipeStandard>>(() => {
        const standards = getPipeStandards();
        // add stable keys to dimensions
        const out: Record<string, PipeStandard> = {};
        Object.entries(standards).forEach(([key, std]) => {
            out[key] = {
                ...std,
                dimensions: std.dimensions.map(d => ({ ...d, _key: makeKey() } as EditableDim)),
            };
        });
        return out;
    });

    const standardsList = useMemo(() => {
        return Object.entries(standards)
            .map(([key, data]) => ({ key, data }))
            .filter(({ data }) => {
                if (selectedCategory !== 'all' && data.category !== selectedCategory) return false;
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return (
                        data.label.toLowerCase().includes(q) ||
                        data.description.toLowerCase().includes(q) ||
                        data.dimensions.some(d => d.dn.toLowerCase().includes(q) || (d.inch ?? '').toLowerCase().includes(q))
                    );
                }
                return true;
            });
    }, [standards, searchQuery, selectedCategory]);

    const categoryCounts = useMemo(() => {
        const counts: Record<PipeCategory, number> = { all: 0, metal: 0, plastic: 0, special: 0 };
        Object.values(standards).forEach(s => { counts.all++; counts[s.category]++; });
        return counts;
    }, [standards]);

    const updateStandardMeta = (key: string, patch: Partial<PipeStandard>) => {
        setStandards(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    };

    const updateDim = (key: string, dimKey: string, patch: Partial<PipeDimension>) => {
        setStandards(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                dimensions: prev[key].dimensions.map(d =>
                    (d as EditableDim)._key === dimKey ? { ...d, ...patch } : d
                ),
            },
        }));
    };

    const removeDim = (key: string, dimKey: string) => {
        setStandards(prev => ({
            ...prev,
            [key]: { ...prev[key], dimensions: prev[key].dimensions.filter(d => (d as EditableDim)._key !== dimKey) },
        }));
    };

    const addDim = (key: string) => {
        setStandards(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                dimensions: [...prev[key].dimensions, { dn: `d${prev[key].dimensions.length ? prev[key].dimensions[prev[key].dimensions.length - 1].od + 10 : 20}`, inch: '-', od: 0, thickness: 0, id: 0, weight: 0, _key: makeKey() } as EditableDim],
            },
        }));
    };

    const autoFillId = (d: PipeDimension): number | undefined => {
        if (d.od > 0 && d.thickness > 0) return Math.round((d.od - 2 * d.thickness) * 10) / 10;
        return undefined;
    };

    const handleSave = () => {
        // Strip internal keys before saving
        const clean: Record<string, PipeStandard> = {};
        Object.entries(standards).forEach(([key, std]) => {
            clean[key] = { ...std, dimensions: std.dimensions.map(d => {
                const { _key, ...rest } = d as EditableDim;
                return rest;
            })};
        });
        saveUserPipeStandards(clean);
        setHasOverride(true);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
    };

    const handleReset = () => {
        if (!confirm('Resetezi la datele OFICIALE din librăria aplicației? Modificările locale se pierd.')) return;
        resetUserPipeStandards();
        const fresh = getPipeStandards();
        const out: Record<string, PipeStandard> = {};
        Object.entries(fresh).forEach(([key, std]) => {
            out[key] = { ...std, dimensions: std.dimensions.map(d => ({ ...d, _key: makeKey() } as EditableDim)) };
        });
        setStandards(out);
        setHasOverride(false);
    };

    const handleExportTs = () => {
        // Generate a ready-to-paste pipeStandards.ts data block (defaults rebuild)
        const lines: string[] = ['// Export generat din pagina „Standarde Țevi” — valori curente', ''];
        lines.push('const OFFICIAL_DEFAULTS: Record<string, PipeStandard> = {');
        Object.entries(standards).forEach(([key, std]) => {
            lines.push(`  ${key}: {`);
            lines.push(`    label: ${JSON.stringify(std.label)},`);
            lines.push(`    description: ${JSON.stringify(std.description)},`);
            lines.push(`    category: '${std.category}',`);
            lines.push(`    material: ${JSON.stringify(std.material ?? '')},`);
            if (std.maxPressure !== undefined) lines.push(`    maxPressure: ${std.maxPressure},`);
            if (std.tempRange) lines.push(`    tempRange: { min: ${std.tempRange.min}, max: ${std.tempRange.max} },`);
            if (std.thermalExpansion !== undefined) lines.push(`    thermalExpansion: ${std.thermalExpansion},`);
            if (std.roughness !== undefined) lines.push(`    roughness: ${std.roughness},`);
            if (std.insulationType) lines.push(`    insulationType: ${JSON.stringify(std.insulationType)},`);
            lines.push(`    dimensions: [`);
            std.dimensions.forEach(d => {
                const parts = [
                    `dn: ${JSON.stringify(d.dn)}`,
                    `inch: ${JSON.stringify(d.inch ?? '-')}`,
                    `od: ${d.od}`,
                    `thickness: ${d.thickness}`,
                    `id: ${d.id}`,
                    `weight: ${d.weight}`,
                ];
                if (d.insulatedOd) parts.push(`insulatedOd: ${d.insulatedOd}`);
                if (d.supportSpacing?.water) parts.push(`supportSpacing: { water: ${d.supportSpacing.water} }`);
                lines.push(`      { ${parts.join(', ')} },`);
            });
            lines.push(`    ],`);
            lines.push(`  },`);
        });
        lines.push('};');
        lines.push('');
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pipeStandards_export.ts';
        a.click();
        URL.revokeObjectURL(url);
    };

    const categories: { id: PipeCategory; label: string }[] = [
        { id: 'all', label: 'Toate' },
        { id: 'metal', label: 'Metal' },
        { id: 'plastic', label: 'Plastic' },
        { id: 'special', label: 'Speciale' },
    ];

    return (
        <div className="max-w-[1400px] mx-auto p-6 md:p-8 space-y-6 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                        <Book className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Standarde Țevi</h1>
                        <p className="text-sm text-muted-foreground">
                            Catalog complet al producătorilor: dimensiuni Ø exterior/interior, grosimi, greutăți și Ø izolat. Editabil — datele au fost corectate conform librăriilor oficiale (GF COOL-FIT 2026, Uponor, Pipelife, Valrom).
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {hasOverride && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30">
                            <AlertTriangle className="w-3.5 h-3.5" /> Modificări locale active
                        </span>
                    )}
                    <button onClick={handleReset} className="btn btn-secondary btn-sm gap-2">
                        <RotateCcw className="w-4 h-4" /> Date Oficiale
                    </button>
                    <button onClick={handleExportTs} className="btn btn-secondary btn-sm gap-2">
                        <Download className="w-4 h-4" /> Export TS
                    </button>
                    <button onClick={handleSave} className="btn btn-primary btn-sm gap-2">
                        {savedFlash ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {savedFlash ? 'Salvat!' : 'Salvează Modificările'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Caută după producător, DN sau inch..."
                        className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/20 text-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedCategory === cat.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border text-muted-foreground hover:border-foreground/30'
                                }`}
                        >
                            {cat.label} ({categoryCounts[cat.id]})
                        </button>
                    ))}
                </div>
            </div>

            {/* Standards */}
            <div className="space-y-6">
                {standardsList.map(({ key, data }) => (
                    <div key={key} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        {/* Standard Header */}
                        <div className="px-5 py-4 border-b border-border bg-muted/20 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-10 rounded-full ${data.category === 'metal' ? 'bg-indigo-500' : data.category === 'plastic' ? 'bg-slate-400' : 'bg-slate-500'}`} />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold">{data.label}</h3>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${data.category === 'metal' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : data.category === 'plastic' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                                                {data.category}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <input
                                                className="text-xs bg-transparent text-muted-foreground border-b border-dashed border-border focus:border-primary outline-none w-full max-w-md"
                                                value={data.description}
                                                onChange={(e) => updateStandardMeta(key, { description: e.target.value })}
                                                title="Dublu-click pe text pentru editare"
                                            />
                                            {data.maxPressure !== undefined && <span className="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded border border-blue-500/20">PN{data.maxPressure}</span>}
                                            {data.tempRange && <span className="text-[10px] bg-orange-500/10 text-orange-600 px-1.5 py-0.5 rounded border border-orange-500/20">{data.tempRange.min}°C ... {data.tempRange.max}°C</span>}
                                            {data.thermalExpansion !== undefined && <span className="text-[10px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded border border-purple-500/20">α = {data.thermalExpansion}</span>}
                                            {data.roughness !== undefined && <span className="text-[10px] bg-slate-500/10 text-slate-600 px-1.5 py-0.5 rounded border border-slate-500/20">k = {data.roughness} mm</span>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => addDim(key)} className="btn btn-secondary btn-sm gap-1.5 shrink-0">
                                    <Plus className="w-3.5 h-3.5" /> Dimensiune
                                </button>
                            </div>
                        </div>

                        {/* Dimensions Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">DN</th>
                                        <th className="px-4 py-3 font-bold">Inch</th>
                                        <th className="px-4 py-3 font-bold">Ø Ext (mm)</th>
                                        <th className="px-4 py-3 font-bold">Grosime (mm)</th>
                                        <th className="px-4 py-3 font-bold text-primary bg-primary/5">Ø Int (mm)</th>
                                        <th className="px-4 py-3 font-bold">kg/m</th>
                                        <th className="px-4 py-3 font-bold">Ø Izolat (mm)</th>
                                        <th className="px-4 py-3 font-bold">L/m</th>
                                        <th className="px-4 py-3 font-bold w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {data.dimensions.map((pipe) => {
                                        const d = pipe as EditableDim;
                                        const area_mm2 = Math.PI * Math.pow((d.id || 0) / 2, 2);
                                        const vol = (area_mm2 * 1000) / 1000000;
                                        const idRound = autoFillId(d);
                                        const idMismatch = idRound !== undefined && d.id > 0 && Math.abs(idRound - d.id) > 0.2;
                                        return (
                                            <tr key={d._key} className="hover:bg-muted/20 transition-colors group">
                                                <td className="px-4 py-1.5">
                                                    <input className="w-20 bg-transparent border-b border-transparent focus:border-primary outline-none font-bold text-sm py-1"
                                                        value={d.dn} onChange={(e) => updateDim(key, d._key, { dn: e.target.value })} />
                                                </td>
                                                <td className="px-4 py-1.5">
                                                    <input className="w-16 bg-transparent border-b border-transparent focus:border-primary outline-none text-sm py-1 text-muted-foreground"
                                                        value={d.inch ?? '-'} onChange={(e) => updateDim(key, d._key, { inch: e.target.value })} />
                                                </td>
                                                <td className="px-4 py-1.5">
                                                    <input type="number" className="w-20 bg-transparent border-b border-transparent focus:border-primary outline-none font-mono text-sm py-1"
                                                        value={d.od || ''} onChange={(e) => updateDim(key, d._key, { od: parseFloat(e.target.value) || 0 })} />
                                                </td>
                                                <td className="px-4 py-1.5">
                                                    <input type="number" className="w-20 bg-transparent border-b border-transparent focus:border-primary outline-none font-mono text-sm py-1"
                                                        value={d.thickness || ''} onChange={(e) => updateDim(key, d._key, { thickness: parseFloat(e.target.value) || 0 })} />
                                                </td>
                                                <td className="px-4 py-1.5">
                                                    <div className="flex items-center gap-1">
                                                        <input type="number" className={`w-20 bg-transparent border-b outline-none font-mono text-sm py-1 ${idMismatch ? 'border-amber-500 text-amber-600' : 'border-transparent focus:border-primary'}`}
                                                            value={d.id || ''} onChange={(e) => updateDim(key, d._key, { id: parseFloat(e.target.value) || 0 })} />
                                                        {idMismatch && (
                                                            <button title={`Auto: ID = Ø ext − 2×grosime = ${idRound} mm. Click pentru corectare`}
                                                                onClick={() => updateDim(key, d._key, { id: idRound })}
                                                                className="text-amber-500 hover:bg-amber-500/10 p-1 rounded">
                                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-1.5">
                                                    <input type="number" className="w-20 bg-transparent border-b border-transparent focus:border-primary outline-none font-mono text-sm py-1"
                                                        value={d.weight || ''} onChange={(e) => updateDim(key, d._key, { weight: parseFloat(e.target.value) || 0 })} />
                                                </td>
                                                <td className="px-4 py-1.5">
                                                    <input type="number" className="w-20 bg-transparent border-b border-transparent focus:border-primary outline-none font-mono text-sm py-1"
                                                        value={d.insulatedOd || ''} onChange={(e) => updateDim(key, d._key, { insulatedOd: parseFloat(e.target.value) || undefined })} />
                                                </td>
                                                <td className="px-4 py-1.5 font-mono text-indigo-500/80 text-xs">{vol.toFixed(3)}</td>
                                                <td className="px-4 py-1.5 text-right">
                                                    <button onClick={() => removeDim(key, d._key)}
                                                        className="p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {standardsList.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Book className="w-12 h-12 mb-4 opacity-30" />
                        <p className="text-sm">Nu s-au găsit standarde</p>
                        <p className="text-xs mt-1">Încearcă să modifici filtrele</p>
                    </div>
                )}
            </div>

            {/* Info footer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p><strong>Surse:</strong> GF COOL-FIT 2.0/4.0 — broșuri & fișe tehnice oficiale 2026 (d32–d140 / d32–d450, PN16 SDR11 / PN10 SDR17, greutăți complete cu manta). Uponor PE-Xa — certificat KIWA, EN ISO 15875. Pipelife/Valrom România — EN ISO 15494 / EN ISO 15874.</p>
                    <p><strong>Sfaturi:</strong> Ø interior trebuie să fie «Ø exterior − 2 × grosime». Dacă nu se potrivește, apare un buton de auto-corectare. Salvează pentru a aplica modificările în tot proiectul; &bdquo;Date Oficiale&rdquo; revine la valorile verificate.</p>
                </div>
            </div>
        </div>
    );
};
