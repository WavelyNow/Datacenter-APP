'use client';

import React, { useMemo, useState } from 'react';
import {
    BookOpen,
    Database,
    ExternalLink,
    Gauge,
    Info,
    Ruler,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Snowflake,
    Weight,
} from 'lucide-react';
import { getPipeStandards, PipeDimension, PipeStandard } from '@/lib/pipeStandards';

type PipeCategory = 'all' | 'metal' | 'plastic' | 'special';
type CatalogEntry = { key: string; data: PipeStandard };

const CATEGORY_LABELS: Record<PipeCategory, string> = {
    all: 'Toate',
    metal: 'Metal',
    plastic: 'Plastic',
    special: 'Speciale',
};

const formatNumber = (value: number, maximumFractionDigits = 1) => value.toLocaleString('ro-RO', {
    maximumFractionDigits,
});

const getNominalDn = (dimension: PipeDimension) => {
    if (dimension.nominalDn) return dimension.nominalDn;
    if (/^DN/i.test(dimension.dn)) return dimension.dn;
    return null;
};

const getDimensionText = (dimension: PipeDimension) => [
    dimension.dn,
    dimension.nominalDn ?? '',
    dimension.inch,
    String(dimension.od),
    String(dimension.thickness),
    String(dimension.id),
    dimension.pressureClass ? `PN${dimension.pressureClass}` : '',
    dimension.sdr ? `SDR${dimension.sdr}` : '',
].join(' ').toLowerCase();

const getStandardText = (standard: PipeStandard) => [
    standard.label,
    standard.description,
    standard.material ?? '',
    ...(standard.sources ?? []).map(source => source.name),
].join(' ').toLowerCase();

const inferSingleSdr = (standard: PipeStandard): number | undefined => {
    const matches = [...new Set(
        `${standard.label} ${standard.description}`
            .match(/SDR\s*[\d.]+/gi)
            ?.map(value => Number(value.replace(/SDR\s*/i, ''))) ?? []
    )];
    return matches.length === 1 ? matches[0] : undefined;
};

const getDimensionRating = (standard: PipeStandard, dimension: PipeDimension) => {
    const pressure = dimension.pressureClass;
    const sdr = dimension.sdr ?? inferSingleSdr(standard);
    return {
        pressure: pressure === undefined ? null : `PN${formatNumber(pressure, 0)}`,
        sdr: sdr === undefined ? null : `SDR${formatNumber(sdr, 1)}`,
    };
};

const getStandardPressureLabel = (standard: PipeStandard) => {
    const pressureClasses = [...new Set(
        standard.dimensions
            .map(dimension => dimension.pressureClass)
            .filter((pressure): pressure is number => pressure !== undefined)
    )];
    return pressureClasses.length > 0
        ? pressureClasses.map(pressure => `PN${formatNumber(pressure, 0)}`).join(' / ')
        : 'Presiune în funcție de dimensiune';
};

const getWeightLabel = (standard: PipeStandard) => {
    if (standard.weightBasis === 'preinsulated-total') return 'kg/m cu manta și izolație';
    if (standard.weightBasis === 'bare') return 'kg/m țeavă simplă';
    return 'kg/m';
};

const getCategoryTone = (category: PipeCategory) => {
    if (category === 'metal') return 'bg-indigo-500';
    if (category === 'plastic') return 'bg-cyan-500';
    return 'bg-violet-500';
};

const getSeriesRange = (dimensions: readonly PipeDimension[]) => {
    if (dimensions.length === 0) return 'Fără dimensiuni';
    return `${dimensions[0].dn} – ${dimensions[dimensions.length - 1].dn}`;
};

const DimensionCard: React.FC<{ standard: PipeStandard; dimension: PipeDimension }> = ({ standard, dimension }) => {
    const rating = getDimensionRating(standard, dimension);
    const nominalDn = getNominalDn(dimension);

    return (
        <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    {nominalDn && <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{nominalDn}</p>}
                    <h3 className="mt-1 font-mono text-lg font-bold text-foreground">{dimension.dn}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{dimension.inch !== '-' ? dimension.inch : 'Dimensiune metrică'}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                    {rating.pressure && <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-600">{rating.pressure}</span>}
                    {rating.sdr && <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-600">{rating.sdr}</span>}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-muted/50 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Ø exterior</p>
                    <p className="mt-0.5 font-mono text-sm font-semibold">{formatNumber(dimension.od)} mm</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Grosime</p>
                    <p className="mt-0.5 font-mono text-sm font-semibold">{formatNumber(dimension.thickness, 2)} mm</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5">
                    <p className="text-[10px] text-primary/70">ID hidraulic</p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-primary">{formatNumber(dimension.id, 1)} mm</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Greutate</p>
                    <p className="mt-0.5 font-mono text-sm font-semibold">{formatNumber(dimension.weight, 3)} kg/m</p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                {dimension.insulatedOd && <span>Izolat: <strong className="text-foreground">{formatNumber(dimension.insulatedOd)} mm</strong></span>}
                {dimension.supportSpacing?.water && <span>Reazem apă: <strong className="text-foreground">{formatNumber(dimension.supportSpacing.water, 2)} m</strong></span>}
            </div>
        </article>
    );
};

/**
 * Catalogul tehnic este un selector read-only: alegi seria, apoi vezi
 * dimensiunile complete. Pe mobil, tabelul devine o listă de carduri.
 */
export const PipeStandardsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PipeCategory>('all');
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const standards = getPipeStandards();

    const allEntries = useMemo<CatalogEntry[]>(() => Object.entries(standards).map(([key, data]) => ({ key, data })), [standards]);
    const query = searchQuery.trim().toLowerCase();

    const categoryCounts = useMemo(() => {
        const counts: Record<PipeCategory, number> = { all: 0, metal: 0, plastic: 0, special: 0 };
        allEntries.forEach(({ data }) => {
            counts.all += 1;
            counts[data.category] += 1;
        });
        return counts;
    }, [allEntries]);

    const filteredEntries = useMemo(() => allEntries.filter(({ data }) => {
        if (selectedCategory !== 'all' && data.category !== selectedCategory) return false;
        if (!query) return true;
        return getStandardText(data).includes(query) || data.dimensions.some(dimension => getDimensionText(dimension).includes(query));
    }), [allEntries, query, selectedCategory]);

    const selectedEntry = useMemo(() => {
        if (selectedKey) {
            const exact = filteredEntries.find(entry => entry.key === selectedKey);
            if (exact) return exact;
        }
        return filteredEntries[0] ?? null;
    }, [filteredEntries, selectedKey]);

    const visibleDimensions = useMemo(() => {
        if (!selectedEntry) return [];
        const standardMatches = !query || getStandardText(selectedEntry.data).includes(query);
        if (standardMatches) return selectedEntry.data.dimensions;
        return selectedEntry.data.dimensions.filter(dimension => getDimensionText(dimension).includes(query));
    }, [query, selectedEntry]);

    const totalDimensions = allEntries.reduce((sum, entry) => sum + entry.data.dimensions.length, 0);
    const selectedPressure = selectedEntry ? getStandardPressureLabel(selectedEntry.data) : null;

    return (
        <div className="mx-auto max-w-[1600px] space-y-4 px-3 pb-28 pt-4 sm:space-y-6 sm:px-6 sm:pt-6 lg:px-8">
            <section className="relative overflow-hidden rounded-[24px] border border-primary/20 bg-linear-to-br from-primary/10 via-card to-card p-4 shadow-sm sm:rounded-[30px] sm:p-7 lg:p-8">
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 sm:h-14 sm:w-14">
                            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Bibliotecă de proiectare</p>
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600">
                                    <ShieldCheck className="h-3 w-3" /> Catalog blocat
                                </span>
                            </div>
                            <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-4xl">Catalog tehnic de țevi</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                Alege o serie și verifică rapid DN-ul, diametrul exterior, ID-ul hidraulic, PN-ul, SDR-ul și greutatea. Valorile sunt aceleași în dimensionare, hidraulică și export.
                            </p>
                        </div>
                    </div>

                    <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[420px] lg:shrink-0">
                        <div className="rounded-2xl border border-border/70 bg-card/80 p-3">
                            <Database className="h-4 w-4 text-primary" />
                            <p className="mt-2 text-lg font-black">{categoryCounts.all}</p>
                            <p className="text-[10px] text-muted-foreground">serii</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-card/80 p-3">
                            <Ruler className="h-4 w-4 text-primary" />
                            <p className="mt-2 text-lg font-black">{totalDimensions}</p>
                            <p className="text-[10px] text-muted-foreground">dimensiuni</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-card/80 p-3">
                            <Gauge className="h-4 w-4 text-primary" />
                            <p className="mt-2 text-lg font-black">ID</p>
                            <p className="text-[10px] text-muted-foreground">hidraulic</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-card/80 p-3">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <p className="mt-2 text-lg font-black">100%</p>
                            <p className="text-[10px] text-muted-foreground">doar vizualizare</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            aria-label="Caută în catalogul de țevi"
                            placeholder="Caută serie, DN, d/OD, ID, PN sau SDR..."
                            className="h-11 w-full rounded-xl border-border bg-background pl-10 pr-4 text-sm"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <SlidersHorizontal className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Filtrează după categorie</span>
                    </div>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {(Object.keys(CATEGORY_LABELS) as PipeCategory[]).map(category => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${selectedCategory === category
                                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                }`}
                        >
                            {CATEGORY_LABELS[category]} <span className="ml-1 opacity-70">{categoryCounts[category]}</span>
                        </button>
                    ))}
                </div>
            </section>

            {filteredEntries.length === 0 ? (
                <section className="rounded-2xl border border-dashed border-border p-10 text-center">
                    <Search className="mx-auto h-7 w-7 text-muted-foreground/50" />
                    <p className="mt-3 font-semibold">Nu am găsit nimic în catalog</p>
                    <p className="mt-1 text-sm text-muted-foreground">Încearcă un producător, un diametru sau golește filtrele.</p>
                </section>
            ) : selectedEntry ? (
                <div className="grid gap-4 xl:grid-cols-[290px_minmax(0,1fr)] xl:gap-5">
                    <aside className="min-w-0 rounded-2xl border border-border/70 bg-card p-3 shadow-sm sm:p-4">
                        <div className="flex items-center justify-between gap-3 px-1 pb-3">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Serii disponibile</p>
                                <p className="mt-1 text-sm font-semibold">{filteredEntries.length} rezultate</p>
                            </div>
                            <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible">
                            {filteredEntries.map(({ key, data }) => {
                                const isSelected = key === selectedEntry.key;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedKey(key)}
                                        className={`group min-w-[235px] rounded-xl border p-3 text-left transition-all xl:min-w-0 ${isSelected
                                            ? 'border-primary/40 bg-primary/8 shadow-sm'
                                            : 'border-border/60 bg-background hover:border-primary/30 hover:bg-muted/40'
                                            }`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <span className={`mt-1 h-8 w-1 rounded-full ${getCategoryTone(data.category)}`} />
                                            <span className="min-w-0 flex-1">
                                                <span className={`block truncate text-sm font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{data.label}</span>
                                                <span className="mt-1 block truncate text-[11px] text-muted-foreground">{data.description}</span>
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                                            <span className="rounded-full bg-muted px-2 py-1">{data.dimensions.length} dimensiuni</span>
                                            <span className="truncate">{getSeriesRange(data.dimensions)}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <section className="min-w-0 space-y-4">
                        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className={`mt-1 h-10 w-1.5 shrink-0 rounded-full ${getCategoryTone(selectedEntry.data.category)}`} />
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-lg font-black tracking-tight sm:text-xl">{selectedEntry.data.label}</h2>
                                            <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">{CATEGORY_LABELS[selectedEntry.data.category]}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">{selectedEntry.data.description}</p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-2 text-[10px] font-bold">
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-emerald-600"><ShieldCheck className="h-3 w-3" /> Doar vizualizare</span>
                                    {selectedEntry.data.sources?.[0]?.url && (
                                        <a
                                            href={selectedEntry.data.sources[0].url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-primary hover:bg-primary/10"
                                        >
                                            Fișă tehnică <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                <div className="rounded-xl bg-muted/50 p-3">
                                    <p className="text-[10px] text-muted-foreground">Gama</p>
                                    <p className="mt-1 truncate font-mono text-sm font-bold">{getSeriesRange(selectedEntry.data.dimensions)}</p>
                                </div>
                                <div className="rounded-xl bg-blue-500/5 p-3">
                                    <p className="text-[10px] text-blue-600/70">Presiune</p>
                                    <p className="mt-1 truncate text-sm font-bold text-blue-600">{selectedPressure}</p>
                                </div>
                                <div className="rounded-xl bg-cyan-500/5 p-3">
                                    <p className="text-[10px] text-cyan-700/70">Temperatură</p>
                                    <p className="mt-1 text-sm font-bold text-cyan-700">{selectedEntry.data.tempRange ? `${selectedEntry.data.tempRange.min}…${selectedEntry.data.tempRange.max}°C` : '—'}</p>
                                </div>
                                <div className="rounded-xl bg-violet-500/5 p-3">
                                    <p className="text-[10px] text-violet-700/70">Masă</p>
                                    <p className="mt-1 truncate text-sm font-bold text-violet-700">{getWeightLabel(selectedEntry.data).replace('kg/m ', '')}</p>
                                </div>
                            </div>
                        </div>

                        {visibleDimensions.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nu există dimensiuni potrivite în seria selectată.</div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                                <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/20 px-4 py-3 sm:px-5">
                                    <div>
                                        <p className="text-sm font-bold">Dimensiuni verificate</p>
                                        <p className="text-[11px] text-muted-foreground">{visibleDimensions.length} variante afișate · valorile nu pot fi editate</p>
                                    </div>
                                    <Weight className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full min-w-[900px] text-left text-sm">
                                        <caption className="sr-only">Dimensiuni pentru {selectedEntry.data.label}</caption>
                                        <thead className="border-b border-border/70 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 font-bold">DN nominal</th>
                                                <th className="px-4 py-3 font-bold">d / OD</th>
                                                <th className="px-4 py-3 font-bold">Grosime</th>
                                                <th className="bg-primary/5 px-4 py-3 font-bold text-primary">ID hidraulic</th>
                                                <th className="px-4 py-3 font-bold">PN</th>
                                                <th className="px-4 py-3 font-bold">SDR</th>
                                                <th className="px-4 py-3 font-bold">Greutate</th>
                                                <th className="px-4 py-3 font-bold">Izolat</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {visibleDimensions.map(dimension => {
                                                const rating = getDimensionRating(selectedEntry.data, dimension);
                                                return (
                                                    <tr key={dimension.dn} className="hover:bg-muted/20">
                                                        <td className="px-4 py-3 font-bold">{getNominalDn(dimension) ?? <span className="text-muted-foreground">Metric</span>}</td>
                                                        <td className="px-4 py-3 font-mono font-semibold">{dimension.dn}<span className="ml-1.5 text-xs font-normal text-muted-foreground">({formatNumber(dimension.od)} mm)</span></td>
                                                        <td className="px-4 py-3 font-mono">{formatNumber(dimension.thickness, 2)} mm</td>
                                                        <td className="bg-primary/5 px-4 py-3 font-mono font-bold text-primary">{formatNumber(dimension.id, 1)} mm</td>
                                                        <td className="px-4 py-3">{rating.pressure ?? '—'}</td>
                                                        <td className="px-4 py-3">{rating.sdr ?? '—'}</td>
                                                        <td className="px-4 py-3 font-mono">{formatNumber(dimension.weight, 3)} kg/m</td>
                                                        <td className="px-4 py-3">{dimension.insulatedOd ? `${formatNumber(dimension.insulatedOd)} mm` : '—'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-3 p-3 lg:hidden">
                                    {visibleDimensions.map(dimension => <DimensionCard key={dimension.dn} standard={selectedEntry.data} dimension={dimension} />)}
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs leading-relaxed text-muted-foreground sm:p-5">
                            <div className="flex items-start gap-2.5">
                                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                <p><strong className="text-foreground">Regulă:</strong> pentru seriile GF, <code className="rounded bg-background/70 px-1 py-0.5 font-mono text-[11px]">d140</code> este diametrul exterior al țevii care corespunde nominalului <code className="rounded bg-background/70 px-1 py-0.5 font-mono text-[11px]">DN125</code>. OD-ul, grosimea și ID-ul provin din fișa seriei și nu se ajustează manual. Pentru o piesă atipică folosește separat <strong className="text-foreground">Personalizat / BIM</strong>.</p>
                            </div>
                        </div>

                        {(selectedEntry.data.sources ?? []).some(source => source.note) && (
                            <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
                                {(selectedEntry.data.sources ?? []).filter(source => source.note).map(source => <p key={source.name}>{source.note}</p>)}
                            </div>
                        )}
                    </section>
                </div>
            ) : null}

            <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground">
                <Snowflake className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>Catalogul este o sursă tehnică comună pentru dimensionare. Seriile cu fișă de producător au link direct către referință; seriile generice bazate pe standard trebuie confirmate cu producătorul înainte de emiterea unei comenzi.</p>
            </div>
        </div>
    );
};
