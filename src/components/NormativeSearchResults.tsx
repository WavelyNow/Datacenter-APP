"use client";
import React, { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronRight, Tag, BookOpen } from 'lucide-react';
import { categoryIcons, sourceColors } from '@/lib/normativeConstants';
import { SearchResult, NormativeEntry } from '@/lib/normativeRegistry';
import { itemVariants } from '@/lib/animations';

interface SearchResultsListProps {
    results: SearchResult[];
    query: string;
    expandedId: string | null;
    onToggle: (id: string) => void;
    onOpenFull: (entry: NormativeEntry) => void;
    setQuery: (query: string) => void;
}

const NormativeCard = ({ result, isExpanded, onToggle, onOpenFull }: { result: SearchResult, isExpanded: boolean, onToggle: () => void, onOpenFull: () => void }) => {
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

export const SearchResultsList: React.FC<SearchResultsListProps> = ({ 
    results, 
    query,
    expandedId,
    onToggle,
    onOpenFull,
    setQuery
}) => {
    // Parent ref for virtualization
    const parentRef = useRef<HTMLDivElement>(null);

    // Virtualization for results
    const rowVirtualizer = useVirtualizer({
        count: results.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 140, // Estimated height of NormativeCard
        overscan: 5,
    });

    return (
        <div ref={parentRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {results.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-4 bg-secondary/30 rounded-full mb-4">
                        <FileText className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Niciun rezultat</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        Nu am găsit normative pentru &quot;{query}&quot;. Încearcă alți termeni.
                    </p>
                    <div className="mt-6">
                         <button 
                             onClick={() => setQuery('')}
                             className="text-primary hover:underline text-sm"
                         >
                             Șterge căutarea
                         </button>
                    </div>
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
                                        onToggle={() => onToggle(result.entry.id)}
                                        onOpenFull={() => onOpenFull(result.entry)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
