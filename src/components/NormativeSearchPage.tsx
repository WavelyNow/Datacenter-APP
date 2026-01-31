"use client";
"use no memo";

import React, { useState, useMemo, useCallback } from 'react';
import {
    Search,
    FileText,
    Filter,
    X,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Copy,
    Check,
    BookOpen,
    Zap,
    Flame,
    Building2,
    Network,
    RefreshCw,
    Wind,
    Lock,
    Plug,
    Snowflake,
    Tag,
    LucideIcon,
    Library,
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import {
    searchNormatives,
    getAllSources,
    getAllCategories,
    categoryTranslations,
    sourceTranslations,
    NormativeSource,
    NormativeCategory,
    SearchResult,
    NormativeEntry,
    normativeRegistry
} from '@/lib/normativeRegistry';
import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// Iconițe pentru categorii
const categoryIcons: Record<NormativeCategory, LucideIcon> = {
    thermal: Zap,
    electrical: Plug,
    fire: Flame,
    infrastructure: Building2,
    cabling: Network,
    redundancy: RefreshCw,
    hvac: Wind,
    security: Lock,
    power: Plug,
    cooling: Snowflake
};

// Culori pentru surse
const sourceColors: Record<NormativeSource, string> = {
    'ASHRAE': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'TIA-942': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'EN-50600': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Uptime': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Romanian': 'bg-red-500/20 text-red-400 border-red-500/30',
    'IEEE': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
};

type ViewMode = 'search' | 'browse' | 'reading';

interface FilterChipProps {
    label: string;
    active: boolean;
    onClick: () => void;
    className?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick, className }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
            } ${className}`}
    >
        {label}
    </button>
);

// ============================================================================
// Full Reading View Component
// ============================================================================
interface FullReadingViewProps {
    entry: NormativeEntry;
    onBack: () => void;
}

const FullReadingView: React.FC<FullReadingViewProps> = ({ entry, onBack }) => {
    const CategoryIcon = categoryIcons[entry.category];
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        // Scroll to top when opening a normative
        window.scrollTo(0, 0);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(`${entry.code}: ${entry.title}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="shrink-0 p-4 border-b border-border bg-card/50 backdrop-blur-sm">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Înapoi la listă
                </button>

                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${sourceColors[entry.source]} shrink-0`}>
                        <CategoryIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${sourceColors[entry.source]}`}>
                                {sourceTranslations[entry.source]}
                            </span>
                            <span className="text-sm text-muted-foreground font-mono">
                                {entry.code}
                            </span>
                            {entry.year && (
                                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                                    {entry.year}
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl font-bold text-foreground mb-2">
                            {entry.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {entry.summary}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-3">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded bg-secondary/50 hover:bg-secondary"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Copiat!' : 'Copiază referința'}
                            </button>

                            {entry.url && (
                                <a
                                    href={entry.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-primary hover:underline px-2 py-1 rounded bg-primary/10"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Document oficial
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Main Content */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Conținut Complet
                    </h2>
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                        {entry.content}
                    </pre>
                </div>

                {/* Articles */}
                {entry.articles && entry.articles.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Articole Detaliate ({entry.articles.length})
                        </h2>
                        {entry.articles.map(article => (
                            <div
                                key={article.id}
                                className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                            >
                                <h3 className="font-semibold text-primary mb-2">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {article.content}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {article.keywords.map(kw => (
                                        <span
                                            key={kw}
                                            className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Keywords */}
                <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Cuvinte Cheie
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {entry.keywords.map(kw => (
                            <span
                                key={kw}
                                className="text-xs px-3 py-1.5 rounded-full border bg-secondary/50 text-muted-foreground border-border"
                            >
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// Browse Card Component  
// ============================================================================
interface BrowseCardProps {
    entry: NormativeEntry;
    onOpen: () => void;
}

const BrowseCard: React.FC<BrowseCardProps> = ({ entry, onOpen }) => {
    const CategoryIcon = categoryIcons[entry.category];

    return (
        <button
            onClick={onOpen}
            className="w-full text-left bg-card border border-border rounded-xl p-4 hover:bg-secondary/30 hover:border-primary/30 transition-all group"
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${sourceColors[entry.source]} shrink-0 group-hover:scale-110 transition-transform`}>
                    <CategoryIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                            {entry.code}
                        </span>
                        {entry.year && (
                            <span className="text-[10px] text-muted-foreground">
                                ({entry.year})
                            </span>
                        )}
                    </div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {entry.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {entry.summary}
                    </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
        </button>
    );
};

// ============================================================================
// Search Card Component (existing, simplified)
// ============================================================================
interface NormativeCardProps {
    result: SearchResult;
    isExpanded: boolean;
    onToggle: () => void;
    onOpenFull: () => void;
}

const NormativeCard: React.FC<NormativeCardProps> = ({ result, isExpanded, onToggle, onOpenFull }) => {
    const { entry, matchedKeywords } = result;
    const CategoryIcon = categoryIcons[entry.category];

    // Highlight keywords în text
    const highlightText = useCallback((text: string, keywords: string[]) => {
        if (keywords.length === 0) return text;
        const pattern = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const regex = new RegExp(`(${pattern})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) => {
            if (keywords.some(k => k.toLowerCase() === part.toLowerCase())) {
                return <mark key={i} className="bg-primary/30 text-primary-foreground px-0.5 rounded">{part}</mark>;
            }
            return part;
        });
    }, []);

    return (
        <motion.div
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            layout
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card/40 backdrop-blur-md border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
        >
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-start gap-4 text-left hover:bg-secondary/30 transition-colors"
            >
                <div className={`p-2.5 rounded-lg ${sourceColors[entry.source]} shrink-0`}>
                    <CategoryIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sourceColors[entry.source]}`}>
                            {entry.source}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                            {entry.code}
                        </span>
                    </div>

                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                        {entry.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.summary}
                    </p>

                    {matchedKeywords.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <Tag className="w-3 h-3 text-muted-foreground" />
                            {matchedKeywords.slice(0, 4).map(kw => (
                                <span key={kw} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                                    {kw}
                                </span>
                            ))}
                            {matchedKeywords.length > 4 && (
                                <span className="text-[10px] text-muted-foreground">
                                    +{matchedKeywords.length - 4}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
            </button>

            {/* Preview Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border overflow-hidden"
                    >
                        <div className="p-4 space-y-3">
                            {/* Preview snippet */}
                            <div className="bg-secondary/30 rounded-lg p-3 max-h-32 overflow-hidden relative">
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                                    {highlightText(entry.content.slice(0, 400) + '...', matchedKeywords)}
                                </pre>
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-secondary/80 to-transparent" />
                            </div>

                            {/* Open full button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onOpenFull(); }}
                                className="w-full py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                Citește normativul complet
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ============================================================================
// Main Page Component
// ============================================================================
export const NormativeSearchPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('search');
    const [query, setQuery] = useState('');
    const [selectedSources, setSelectedSources] = useState<NormativeSource[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<NormativeCategory[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [readingEntry, setReadingEntry] = useState<NormativeEntry | null>(null);
    const [browseSource, setBrowseSource] = useState<NormativeSource | null>(null);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Parent ref for virtualization
    const parentRef = useRef<HTMLDivElement>(null);

    const allSources = useMemo(() => getAllSources(), []);
    const allCategories = useMemo(() => getAllCategories(), []);

    // Search results using debounced query
    const results = useMemo(() => {
        if (!debouncedQuery.trim() && selectedSources.length === 0 && selectedCategories.length === 0) {
            return [];
        }
        return searchNormatives(debouncedQuery, {
            sources: selectedSources.length > 0 ? selectedSources : undefined,
            categories: selectedCategories.length > 0 ? selectedCategories : undefined
        });
    }, [debouncedQuery, selectedSources, selectedCategories]);

    // Virtualization for results
    const rowVirtualizer = useVirtualizer({
        count: results.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 140, // Estimated height of NormativeCard
        overscan: 5,
    });

    // Browse: normatives grouped by source
    const normativesBySource = useMemo(() => {
        const grouped: Record<NormativeSource, NormativeEntry[]> = {} as Record<NormativeSource, NormativeEntry[]>;
        for (const entry of normativeRegistry) {
            if (!grouped[entry.source]) grouped[entry.source] = [];
            grouped[entry.source].push(entry);
        }
        return grouped;
    }, []);

    const toggleSource = (source: NormativeSource) => {
        setSelectedSources(prev =>
            prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
        );
    };

    const toggleCategory = (category: NormativeCategory) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const clearFilters = () => {
        setSelectedSources([]);
        setSelectedCategories([]);
        setQuery('');
    };

    const openReading = (entry: NormativeEntry) => {
        setReadingEntry(entry);
        setViewMode('reading');
    };

    const closeReading = () => {
        setReadingEntry(null);
        setViewMode(browseSource ? 'browse' : 'search');
    };

    const activeFiltersCount = selectedSources.length + selectedCategories.length;

    // Reading Mode
    if (viewMode === 'reading' && readingEntry) {
        return <FullReadingView entry={readingEntry} onBack={closeReading} />;
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col h-full bg-transparent"
        >
            {/* Header */}
            <motion.div 
                variants={itemVariants}
                className="shrink-0 p-6 border-b border-border bg-card/40 backdrop-blur-md"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Normative Datacenter</h1>
                            <p className="text-sm text-muted-foreground">
                                Caută sau răsfoiește reglementări pentru centre de date
                            </p>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                        <button
                            onClick={() => { setViewMode('search'); setBrowseSource(null); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'search'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Search className="w-4 h-4" />
                            Căutare
                        </button>
                        <button
                            onClick={() => { setViewMode('browse'); setQuery(''); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'browse'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Library className="w-4 h-4" />
                            Răsfoiește
                        </button>
                    </div>
                </div>

                {/* Search Mode Header */}
                {viewMode === 'search' && (
                    <>
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Caută după cuvinte cheie (ex: temperatură rack, incendiu, tier 3...)"
                                className="w-full pl-12 pr-12 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Filter Toggle */}
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters || activeFiltersCount > 0
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                Filtre
                                {activeFiltersCount > 0 && (
                                    <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Șterge filtrele
                                </button>
                            )}
                        </div>

                        {/* Filters Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Surse</label>
                                            <div className="flex flex-wrap gap-2">
                                                {allSources.map(source => (
                                                    <FilterChip
                                                        key={source}
                                                        label={sourceTranslations[source]}
                                                        active={selectedSources.includes(source)}
                                                        onClick={() => toggleSource(source)}
                                                        className={selectedSources.includes(source) ? '' : sourceColors[source]}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Categorii</label>
                                            <div className="flex flex-wrap gap-2">
                                                {allCategories.map(category => (
                                                    <FilterChip
                                                        key={category}
                                                        label={categoryTranslations[category]}
                                                        active={selectedCategories.includes(category)}
                                                        onClick={() => toggleCategory(category)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* Browse Mode Header */}
                {viewMode === 'browse' && browseSource && (
                    <button
                        onClick={() => setBrowseSource(null)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Înapoi la surse
                    </button>
                )}
            </motion.div>

            {/* Content */}
            <div ref={parentRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
                {/* SEARCH MODE */}
                {viewMode === 'search' && (
                    <>
                        {debouncedQuery.trim() === '' && activeFiltersCount === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="p-4 bg-secondary/30 rounded-full mb-4">
                                    <Search className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Începe căutarea</h3>
                                <p className="text-sm text-muted-foreground max-w-md mb-6">
                                    Introdu cuvinte cheie sau folosește modul &quot;Răsfoiește&quot; pentru a vedea toate normativele.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['temperatură server', 'distanță rack', 'tier 3', 'incendiu', 'UPS'].map(suggestion => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setQuery(suggestion)}
                                            className="px-3 py-1.5 bg-secondary/50 text-muted-foreground text-sm rounded-full hover:bg-secondary hover:text-foreground transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="p-4 bg-secondary/30 rounded-full mb-4">
                                    <FileText className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Niciun rezultat</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Nu am găsit normative pentru &quot;{query}&quot;. Încearcă alți termeni.
                                </p>
                            </div>
                        ) : (
                            <div 
                                className="relative w-full"
                                style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                            >
                                <div className="text-sm text-muted-foreground mb-4">
                                    {results.length} {results.length === 1 ? 'rezultat' : 'rezultate'}
                                </div>
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const result = results[virtualRow.index];
                                    return (
                                        <div
                                            key={virtualRow.key}
                                            data-index={virtualRow.index}
                                            ref={rowVirtualizer.measureElement}
                                            className="absolute top-0 left-0 w-full"
                                            style={{
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                        >
                                            <div className="pb-3">
                                                <NormativeCard
                                                    result={result}
                                                    isExpanded={expandedId === result.entry.id}
                                                    onToggle={() => setExpandedId(expandedId === result.entry.id ? null : result.entry.id)}
                                                    onOpenFull={() => openReading(result.entry)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* BROWSE MODE */}
                {viewMode === 'browse' && (
                    <>
                        {!browseSource ? (
                            // Source Selection
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allSources.map(source => {
                                    const entries = normativesBySource[source] || [];
                                    const SourceIcon = entries[0] ? categoryIcons[entries[0].category] : FileText;
                                    return (
                                        <button
                                            key={source}
                                            onClick={() => setBrowseSource(source)}
                                            className={`p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-lg ${sourceColors[source]}`}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <SourceIcon className="w-8 h-8" />
                                                <div>
                                                    <h3 className="font-bold text-lg">{sourceTranslations[source]}</h3>
                                                    <p className="text-xs opacity-70">{entries.length} normative</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                {entries.slice(0, 3).map(e => (
                                                    <p key={e.id} className="text-xs opacity-60 truncate">• {e.code}</p>
                                                ))}
                                                {entries.length > 3 && (
                                                    <p className="text-xs opacity-40">+ {entries.length - 3} altele...</p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            // Normatives List for selected source
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm ${sourceColors[browseSource]}`}>
                                            {sourceTranslations[browseSource]}
                                        </span>
                                        <span className="text-muted-foreground font-normal text-sm">
                                            {normativesBySource[browseSource]?.length || 0} normative
                                        </span>
                                    </h2>
                                </div>
                                {(normativesBySource[browseSource] || []).map(entry => (
                                    <BrowseCard key={entry.id} entry={entry} onOpen={() => openReading(entry)} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default NormativeSearchPage;
