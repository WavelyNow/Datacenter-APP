'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowRight,
    BookOpen,
    Check,
    Database,
    ExternalLink,
    Info,
    Ruler,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Snowflake,
    Weight,
    X,
} from 'lucide-react';
import { getPipeStandards, PipeDimension, PipeStandard } from '@/lib/pipeStandards';

type PipeCategory = 'all' | 'metal' | 'plastic' | 'special';
type CatalogEntry = { key: string; data: PipeStandard };
type DimensionMatch = { entry: CatalogEntry; dimension: PipeDimension };

const CATEGORY_LABELS: Record<PipeCategory, string> = {
    all: 'Toate',
    metal: 'Metal',
    plastic: 'Plastic',
    special: 'Speciale',
};

const QUICK_SEARCHES = ['DN125', 'd140', 'ID 114,6', 'PN16', 'SDR11'];

const formatNumber = (value: number, maximumFractionDigits = 1) => value.toLocaleString('ro-RO', {
    maximumFractionDigits,
});

/**
 * Search uses a compact, accent-free representation so DN 125, DN125,
 * d140 and Ø140 all find the same verified dimension.
 */
const normalizeSearch = (value: string) => value
    .toLocaleLowerCase('ro-RO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/g, 'o')
    .replace(/[^a-z0-9]+/g, '');

const isDimensionQuery = (query: string) => /^(?:dn|d|od|id|pn|sdr|o|mm)?\d/.test(query);

const getNominalDn = (dimension: PipeDimension) => {
    if (dimension.nominalDn) return dimension.nominalDn;
    if (/^DN/i.test(dimension.dn)) return dimension.dn;
    return null;
};

function inferSingleSdr(standard: PipeStandard): number | undefined {
    const matches = [...new Set(
        (standard.label + ' ' + standard.description)
            .match(/SDR\s*[\d.]+/gi)
            ?.map(value => Number(value.replace(/SDR\s*/i, ''))) ?? []
    )];
    return matches.length === 1 ? matches[0] : undefined;
}

const getDimensionRating = (standard: PipeStandard, dimension: PipeDimension) => {
    const pressure = dimension.pressureClass;
    const sdr = dimension.sdr ?? inferSingleSdr(standard);
    return {
        pressure: pressure === undefined ? null : 'PN' + formatNumber(pressure, 0),
        sdr: sdr === undefined ? null : 'SDR' + formatNumber(sdr, 1),
    };
};

const getDimensionSearchText = (standard: PipeStandard, dimension: PipeDimension) => {
    const rating = getDimensionRating(standard, dimension);
    return normalizeSearch([
        dimension.dn,
        dimension.nominalDn ?? '',
        dimension.inch,
        'd' + dimension.od,
        'od' + dimension.od,
        'diametru exterior ' + dimension.od,
        'ø' + dimension.od,
        'id' + dimension.id,
        'diametru interior ' + dimension.id,
        rating.pressure ?? '',
        rating.sdr ?? '',
    ].join(' '));
};

const getStandardText = (standard: PipeStandard) => normalizeSearch([
    standard.label,
    standard.description,
    standard.material ?? '',
    ...(standard.sources ?? []).map(source => source.name),
].join(' '));

const getStandardPressureLabel = (standard: PipeStandard) => {
    const pressureClasses = [...new Set(
        standard.dimensions
            .map(dimension => dimension.pressureClass)
            .filter((pressure): pressure is number => pressure !== undefined)
    )];
    return pressureClasses.length > 0
        ? pressureClasses.map(pressure => 'PN' + formatNumber(pressure, 0)).join(' / ')
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
    return dimensions[0].dn + ' – ' + dimensions[dimensions.length - 1].dn;
};

const getDimensionDisplay = (dimension: PipeDimension) => {
    if (/^d/i.test(dimension.dn)) return dimension.dn;
    return 'Ø' + formatNumber(dimension.od) + ' mm';
};

const getDimensionMatchScore = (query: string, dimension: PipeDimension) => {
    const dn = normalizeSearch(dimension.dn);
    const nominalDn = normalizeSearch(dimension.nominalDn ?? '');
    const od = normalizeSearch(String(dimension.od));
    const id = normalizeSearch(String(dimension.id));
    if (query === dn || query === nominalDn) return 0;
    if (query === 'd' + od || query === 'od' + od || query === 'o' + od || query === od) return 1;
    if (query === 'id' + id) return 2;
    return 3;
};

const DimensionResultCard: React.FC<{
    entry: CatalogEntry;
    dimension: PipeDimension;
    isSelected: boolean;
    onSelect: () => void;
    showSeries?: boolean;
}> = ({ entry, dimension, isSelected, onSelect, showSeries = true }) => {
    const rating = getDimensionRating(entry.data, dimension);
    const nominalDn = getNominalDn(dimension);

    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={isSelected}
            className={isSelected
                ? 'group relative w-full rounded-[22px] border border-primary/50 bg-primary/[0.06] p-4 text-left shadow-[0_14px_34px_-22px_hsl(var(--primary))] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                : 'group relative w-full rounded-[22px] border border-border/70 bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_36px_-24px_rgba(15,23,42,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    {showSeries && <p className="truncate text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{entry.data.label}</p>}
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-lg font-black tracking-tight text-foreground">{nominalDn ?? 'Metric'}</span>
                        <span className="font-mono text-sm font-semibold text-primary">{dimension.dn}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {dimension.inch !== '-' ? dimension.inch : 'Dimensiune metrică'} · d / OD {formatNumber(dimension.od)} mm
                    </p>
                </div>
                <span className={isSelected
                    ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors'
                    : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary'}>
                    {isSelected ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-muted/50 px-3 py-2.5">
                    <p className="text-[10px] font-medium text-muted-foreground">OD exterior</p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-foreground">{formatNumber(dimension.od)} mm</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/[0.07] px-3 py-2.5">
                    <p className="text-[10px] font-medium text-primary/75">ID hidraulic</p>
                    <p className="mt-0.5 font-mono text-sm font-black text-primary">{formatNumber(dimension.id)} mm</p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="rounded-full border border-border/70 bg-background px-2 py-1 font-mono text-muted-foreground">
                    perete {formatNumber(dimension.thickness, 2)} mm
                </span>
                {rating.pressure && <span className="rounded-full bg-blue-500/10 px-2 py-1 font-bold text-blue-600">{rating.pressure}</span>}
                {rating.sdr && <span className="rounded-full bg-violet-500/10 px-2 py-1 font-bold text-violet-600">{rating.sdr}</span>}
                <span className="ml-auto inline-flex items-center gap-1 font-mono text-muted-foreground">
                    <Weight className="h-3 w-3" /> {formatNumber(dimension.weight, 3)} kg/m
                </span>
            </div>

            {(dimension.insulatedOd || dimension.supportSpacing?.water) && (
                <div className="mt-3 border-t border-border/60 pt-2.5 text-[10px] text-muted-foreground">
                    {dimension.insulatedOd && <span>Izolat: <strong className="text-foreground">{formatNumber(dimension.insulatedOd)} mm</strong></span>}
                    {dimension.insulatedOd && dimension.supportSpacing?.water && <span className="mx-2 text-border">·</span>}
                    {dimension.supportSpacing?.water && <span>Reazem apă: <strong className="text-foreground">{formatNumber(dimension.supportSpacing.water, 2)} m</strong></span>}
                </div>
            )}
        </button>
    );
};

const SeriesCard: React.FC<{
    entry: CatalogEntry;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ entry, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={isSelected
            ? 'group flex min-h-[154px] w-full flex-col rounded-[22px] border border-primary/45 bg-primary/[0.06] p-4 text-left shadow-[0_16px_38px_-26px_hsl(var(--primary))] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
            : 'group flex min-h-[154px] w-full flex-col rounded-[22px] border border-border/70 bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_36px_-24px_rgba(15,23,42,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'}
    >
        <div className="flex items-start gap-3">
            <span className={'mt-1 h-9 w-1.5 shrink-0 rounded-full ' + getCategoryTone(entry.data.category)} />
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <span className={isSelected ? 'line-clamp-2 text-sm font-black leading-tight text-primary' : 'line-clamp-2 text-sm font-black leading-tight text-foreground'}>{entry.data.label}</span>
                    <span className={isSelected ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground' : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}>
                        {isSelected ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                    </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{entry.data.description}</p>
            </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4 text-[10px]">
            <span className="rounded-full bg-muted px-2 py-1 font-bold text-muted-foreground">{entry.data.dimensions.length} dimensiuni</span>
            <span className="rounded-full border border-border/70 bg-background px-2 py-1 font-mono text-muted-foreground">{getSeriesRange(entry.data.dimensions)}</span>
            <span className="ml-auto font-bold text-muted-foreground">{CATEGORY_LABELS[entry.data.category]}</span>
        </div>
    </button>
);

/**
 * Catalog tehnic read-only. Căutarea pornește de la dimensiune, nu de la
 * seria aleasă, pentru ca un DN sau un ID să fie găsit dintr-o singură acțiune.
 */
export const PipeStandardsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PipeCategory>('all');
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [selectedDimensionKey, setSelectedDimensionKey] = useState<string | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const standards = getPipeStandards();

    const allEntries = useMemo<CatalogEntry[]>(() => Object.entries(standards).map(([key, data]) => ({ key, data })), [standards]);
    const query = normalizeSearch(searchQuery.trim());

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
            if ((event.key === '/' && !isTyping) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
                event.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, []);

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
        return getStandardText(data).includes(query) || data.dimensions.some(dimension => getDimensionSearchText(data, dimension).includes(query));
    }), [allEntries, query, selectedCategory]);

    const directMatches = useMemo<DimensionMatch[]>(() => {
        if (!query) return [];
        const dimensionQuery = isDimensionQuery(query);
        const matches = filteredEntries.flatMap(entry => {
            const seriesMatches = !dimensionQuery && getStandardText(entry.data).includes(query);
            const dimensions = seriesMatches
                ? entry.data.dimensions
                : entry.data.dimensions.filter(dimension => getDimensionSearchText(entry.data, dimension).includes(query));
            return dimensions.map(dimension => ({ entry, dimension }));
        });
        return matches.sort((left, right) => getDimensionMatchScore(query, left.dimension) - getDimensionMatchScore(query, right.dimension));
    }, [filteredEntries, query]);

    const selectedEntry = useMemo(() => {
        if (selectedKey) {
            const exact = filteredEntries.find(entry => entry.key === selectedKey);
            if (exact) return exact;
        }
        return filteredEntries[0] ?? null;
    }, [filteredEntries, selectedKey]);

    const visibleDimensions = useMemo(() => {
        if (!selectedEntry) return [];
        if (!query || (!isDimensionQuery(query) && getStandardText(selectedEntry.data).includes(query))) return selectedEntry.data.dimensions;
        return selectedEntry.data.dimensions.filter(dimension => getDimensionSearchText(selectedEntry.data, dimension).includes(query));
    }, [query, selectedEntry]);

    const selectedDimension = useMemo(() => {
        if (!selectedEntry || !selectedDimensionKey) return null;
        return selectedEntry.data.dimensions.find(dimension => selectedEntry.key + ':' + dimension.dn === selectedDimensionKey) ?? null;
    }, [selectedDimensionKey, selectedEntry]);

    const totalDimensions = allEntries.reduce((sum, entry) => sum + entry.data.dimensions.length, 0);
    const selectedPressure = selectedEntry ? getStandardPressureLabel(selectedEntry.data) : null;

    const selectDimension = (entry: CatalogEntry, dimension: PipeDimension) => {
        setSelectedKey(entry.key);
        setSelectedDimensionKey(entry.key + ':' + dimension.dn);
    };

    const setQuickSearch = (value: string) => {
        setSearchQuery(value);
        setSelectedDimensionKey(null);
    };

    return (
        <div className="mx-auto max-w-[1640px] space-y-4 px-3 pb-28 pt-4 sm:space-y-6 sm:px-6 sm:pt-6 lg:px-8">
            <section className="relative overflow-hidden rounded-[28px] bg-[#0a1220] px-4 py-6 text-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)] sm:rounded-[34px] sm:px-8 sm:py-9 lg:px-10 lg:py-11">
                <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="relative">
                    <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                            <BookOpen className="h-3.5 w-3.5" />
                            Bibliotecă tehnică · sursă read-only
                        </div>
                        <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">Găsește țeava potrivită.</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                            Caută după ce ai pe plan sau în fișa tehnică. Rezultatele leagă explicit DN-ul nominal de d / OD și ID-ul hidraulic, ca să alegi corect din prima.
                        </p>
                    </div>

                    <div className="mt-7 max-w-4xl rounded-[22px] border border-white/15 bg-white/[0.08] p-2 shadow-2xl backdrop-blur-sm sm:mt-8 sm:rounded-[26px]">
                        <div className="relative flex items-center">
                            <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-300" />
                            <input
                                ref={searchInputRef}
                                type="search"
                                aria-label="Caută DN, diametru, ID, PN sau SDR"
                                placeholder="Caută DN125, d140, Ø140, PN16, SDR11, Georg Fischer…"
                                className="h-14 w-full rounded-[18px] border-0 bg-white pr-24 pl-12 text-sm font-medium text-slate-900 shadow-lg outline-none ring-0 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-300 sm:h-16 sm:text-base"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    aria-label="Golește căutarea"
                                    onClick={() => {
                                        setSearchQuery('');
                                        searchInputRef.current?.focus();
                                    }}
                                    className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : (
                                <kbd className="absolute right-4 hidden rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 sm:block">⌘ K</kbd>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-2 sm:px-3">
                            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Căutări rapide</span>
                            {QUICK_SEARCHES.map(value => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setQuickSearch(value)}
                                    className={searchQuery === value
                                        ? 'rounded-full border border-cyan-300 bg-cyan-300/20 px-2.5 py-1.5 text-[11px] font-bold text-cyan-100 transition-colors'
                                        : 'rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-bold text-slate-300 transition-colors hover:border-cyan-300/50 hover:text-white'}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-cyan-300" /> {categoryCounts.all} serii</span>
                        <span className="inline-flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5 text-cyan-300" /> {totalDimensions} dimensiuni verificate</span>
                        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Valori blocate în calcule</span>
                    </div>
                </div>
            </section>

            <section className="rounded-[22px] border border-border/70 bg-card p-3 shadow-sm sm:rounded-[26px] sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" />
                        <span className="font-bold text-foreground">Filtrează biblioteca</span>
                        <span className="hidden sm:inline">· alege familia de material</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {(Object.keys(CATEGORY_LABELS) as PipeCategory[]).map(category => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setSelectedDimensionKey(null);
                                }}
                                className={selectedCategory === category
                                    ? 'shrink-0 rounded-full border border-primary bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                                    : 'shrink-0 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'}
                            >
                                {CATEGORY_LABELS[category]} <span className="ml-1 opacity-70">{categoryCounts[category]}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-[11px] text-muted-foreground" aria-live="polite">
                    <span><strong className="text-foreground">{query ? directMatches.length : filteredEntries.reduce((sum, entry) => sum + entry.data.dimensions.length, 0)}</strong> {query ? 'potriviri directe' : 'dimensiuni disponibile'}</span>
                    {query && <span>în <strong className="text-foreground">{filteredEntries.length}</strong> {filteredEntries.length === 1 ? 'serie' : 'serii'}</span>}
                    {selectedCategory !== 'all' && <span>familia {CATEGORY_LABELS[selectedCategory].toLocaleLowerCase('ro-RO')}</span>}
                </div>
            </section>

            {filteredEntries.length === 0 ? (
                <section className="rounded-[26px] border border-dashed border-border bg-card p-10 text-center shadow-sm">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-4 font-bold">Nu am găsit nimic în catalog</p>
                    <p className="mt-1 text-sm text-muted-foreground">Încearcă un producător, DN, d / OD, ID sau golește filtrul.</p>
                    <button type="button" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="mt-5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">Resetează căutarea</button>
                </section>
            ) : (
                <>
                    {query && directMatches.length > 0 && (
                        <section className="space-y-3">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Rezultat direct</p>
                                    <h2 className="mt-1 text-xl font-black tracking-tight">Potriviri pentru „{searchQuery}”</h2>
                                </div>
                                <p className="text-xs text-muted-foreground">Selectează o dimensiune pentru fișa rapidă.</p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {directMatches.map(({ entry, dimension }) => (
                                    <DimensionResultCard
                                        key={entry.key + ':' + dimension.dn}
                                        entry={entry}
                                        dimension={dimension}
                                        isSelected={selectedDimensionKey === entry.key + ':' + dimension.dn}
                                        onSelect={() => selectDimension(entry, dimension)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="space-y-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Biblioteca disponibilă</p>
                                <h2 className="mt-1 text-xl font-black tracking-tight">Serii de țevi</h2>
                            </div>
                            <p className="text-xs text-muted-foreground">{filteredEntries.length} {filteredEntries.length === 1 ? 'serie' : 'serii'} · date tehnice read-only</p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {filteredEntries.map(entry => (
                                <SeriesCard
                                    key={entry.key}
                                    entry={entry}
                                    isSelected={selectedEntry?.key === entry.key}
                                    onSelect={() => {
                                        setSelectedKey(entry.key);
                                        setSelectedDimensionKey(null);
                                    }}
                                />
                            ))}
                        </div>
                    </section>

                    {selectedEntry && (
                        <section className="space-y-3">
                            <div className="rounded-[26px] border border-border/70 bg-card p-4 shadow-sm sm:p-6">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className={'mt-1 h-11 w-1.5 shrink-0 rounded-full ' + getCategoryTone(selectedEntry.data.category)} />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Seria selectată</p>
                                                <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">{CATEGORY_LABELS[selectedEntry.data.category]}</span>
                                            </div>
                                            <h2 className="mt-1 text-2xl font-black tracking-tight">{selectedEntry.data.label}</h2>
                                            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{selectedEntry.data.description}</p>
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
                                                Sursă producător <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    <div className="rounded-2xl bg-muted/50 p-3">
                                        <p className="text-[10px] text-muted-foreground">Dimensiuni</p>
                                        <p className="mt-1 text-lg font-black">{selectedEntry.data.dimensions.length}</p>
                                    </div>
                                    <div className="rounded-2xl bg-blue-500/5 p-3">
                                        <p className="text-[10px] text-blue-600/70">Presiune</p>
                                        <p className="mt-1 truncate text-sm font-bold text-blue-600">{selectedPressure}</p>
                                    </div>
                                    <div className="rounded-2xl bg-cyan-500/5 p-3">
                                        <p className="text-[10px] text-cyan-700/70">Temperatură</p>
                                        <p className="mt-1 text-sm font-bold text-cyan-700">{selectedEntry.data.tempRange ? selectedEntry.data.tempRange.min + '…' + selectedEntry.data.tempRange.max + '°C' : '—'}</p>
                                    </div>
                                    <div className="rounded-2xl bg-violet-500/5 p-3">
                                        <p className="text-[10px] text-violet-700/70">Bază greutate</p>
                                        <p className="mt-1 truncate text-sm font-bold text-violet-700">{getWeightLabel(selectedEntry.data).replace('kg/m ', '')}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedDimension && (
                                <div className="rounded-[26px] border border-primary/25 bg-primary/[0.055] p-4 shadow-sm sm:p-5">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Fișă rapidă · selecție curentă</p>
                                            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                <h3 className="text-xl font-black">{getNominalDn(selectedDimension) ?? 'Metric'}</h3>
                                                <span className="font-mono text-base font-bold text-primary">{getDimensionDisplay(selectedDimension)}</span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">DN nominal și diametru exterior sunt afișate separat; ID-ul este valoarea folosită în calculele hidraulice.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2">
                                                <p className="text-[10px] text-muted-foreground">OD exterior</p>
                                                <p className="mt-0.5 font-mono text-sm font-bold">{formatNumber(selectedDimension.od)} mm</p>
                                            </div>
                                            <div className="rounded-xl border border-primary/25 bg-background/80 px-3 py-2">
                                                <p className="text-[10px] text-primary/75">ID hidraulic</p>
                                                <p className="mt-0.5 font-mono text-sm font-black text-primary">{formatNumber(selectedDimension.id)} mm</p>
                                            </div>
                                            <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2">
                                                <p className="text-[10px] text-muted-foreground">Grosime</p>
                                                <p className="mt-0.5 font-mono text-sm font-bold">{formatNumber(selectedDimension.thickness, 2)} mm</p>
                                            </div>
                                            <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2">
                                                <p className="text-[10px] text-muted-foreground">Greutate</p>
                                                <p className="mt-0.5 font-mono text-sm font-bold">{formatNumber(selectedDimension.weight, 3)} kg/m</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-[26px] border border-border/70 bg-card p-3 shadow-sm sm:p-5">
                                <div className="flex flex-col gap-1 border-b border-border/70 px-1 pb-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Dimensiuni verificate</p>
                                        <h3 className="mt-1 text-lg font-black">Alege după DN, d / OD sau ID</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{visibleDimensions.length} variante afișate · niciun câmp editabil</p>
                                </div>

                                {visibleDimensions.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground">Nu există dimensiuni potrivite în seria selectată.</div>
                                ) : (
                                    <div className="grid gap-3 pt-4 md:grid-cols-2 xl:grid-cols-3">
                                        {visibleDimensions.map(dimension => (
                                            <DimensionResultCard
                                                key={selectedEntry.key + ':' + dimension.dn}
                                                entry={selectedEntry}
                                                dimension={dimension}
                                                isSelected={selectedDimensionKey === selectedEntry.key + ':' + dimension.dn}
                                                onSelect={() => selectDimension(selectedEntry, dimension)}
                                                showSeries={false}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {(selectedEntry.data.sources ?? []).some(source => source.note) && (
                                <div className="rounded-[22px] border border-border/70 bg-muted/20 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
                                    {(selectedEntry.data.sources ?? []).filter(source => source.note).map(source => <p key={source.name}>{source.note}</p>)}
                                </div>
                            )}
                        </section>
                    )}
                </>
            )}

            <div className="flex items-start gap-2.5 rounded-[22px] border border-blue-500/20 bg-blue-500/5 p-4 text-xs leading-relaxed text-muted-foreground sm:p-5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p><strong className="text-foreground">Regulă de identificare:</strong> pentru seriile GF, <code className="rounded bg-background/70 px-1 py-0.5 font-mono text-[11px]">d140</code> este diametrul exterior al țevii care corespunde nominalului <code className="rounded bg-background/70 px-1 py-0.5 font-mono text-[11px]">DN125</code>. OD-ul, grosimea și ID-ul provin din fișa seriei și nu se ajustează manual. Seriile fără link de producător trebuie confirmate înainte de comandă.</p>
            </div>

            <div className="flex items-start gap-2.5 rounded-[22px] border border-border/70 bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground">
                <Snowflake className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>Acest catalog este sursa comună pentru dimensionare, hidraulică și export. Când găsești o dimensiune, folosește ID-ul hidraulic afișat aici, nu o valoare introdusă manual.</p>
            </div>
        </div>
    );
};
