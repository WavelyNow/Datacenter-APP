'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import { useUI } from '@/context/UIContext';
import { TabId } from '@/lib/types';
import { useTranslation } from '@/context/PreferencesContext';
import {
    LayoutDashboard,
    Cuboid,
    Layers,
    Package,
    Wrench,
    Leaf,
    Anchor,
    Scale,
    Calculator,
    ClipboardList,
    ClipboardCheck,
    Book,
    Camera,
    Palette,
    HelpCircle,
    Save,
    FileDown,
    Settings,
    Sparkles,
    ArrowRight,
    X,
    Command,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    action: () => void;
    keywords?: string[];
    category: 'navigation' | 'action' | 'settings';
}

interface CommandPaletteProps {
    onSave?: () => void;
    onExport?: () => void;
    onSettings?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    onSave,
    onExport,
    onSettings
}) => {
    const { segments, equipmentList } = useProject();
    const { setActiveTab, setHighlightedItemId } = useUI();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Define static commands
    const staticCommands: CommandItem[] = useMemo(() => [
        // Navigation
        { id: 'nav-dashboard', title: t('commandPalette.cmds.dashboard.title'), subtitle: t('commandPalette.cmds.dashboard.subtitle'), icon: <LayoutDashboard className="w-4 h-4" />, action: () => setActiveTab('dashboard' as TabId), keywords: ['home', 'start'], category: 'navigation' },
        { id: 'nav-bim-gallery', title: t('commandPalette.cmds.bimGallery.title'), subtitle: t('commandPalette.cmds.bimGallery.subtitle'), icon: <Cuboid className="w-4 h-4" />, action: () => setActiveTab('bim_gallery' as TabId), keywords: ['3d', 'models'], category: 'navigation' },
        { id: 'nav-bim', title: t('commandPalette.cmds.ifcMapping.title'), subtitle: t('commandPalette.cmds.ifcMapping.subtitle'), icon: <Layers className="w-4 h-4" />, action: () => setActiveTab('bim' as TabId), keywords: ['ifc', 'import'], category: 'navigation' },
        { id: 'nav-config', title: t('commandPalette.cmds.pipingRouting.title'), subtitle: t('commandPalette.cmds.pipingRouting.subtitle'), icon: <Package className="w-4 h-4" />, action: () => setActiveTab('config' as TabId), keywords: ['pipes', 'routing', 'segments'], category: 'navigation' },
        { id: 'nav-hydraulics', title: t('commandPalette.cmds.hydraulics.title'), subtitle: t('commandPalette.cmds.hydraulics.subtitle'), icon: <Wrench className="w-4 h-4" />, action: () => setActiveTab('hydraulics' as TabId), keywords: ['flow', 'pressure'], category: 'navigation' },
        { id: 'nav-energy', title: t('commandPalette.cmds.sustainability.title'), subtitle: t('commandPalette.cmds.sustainability.subtitle'), icon: <Leaf className="w-4 h-4" />, action: () => setActiveTab('energy' as TabId), keywords: ['pue', 'green'], category: 'navigation' },
        { id: 'nav-supports', title: t('commandPalette.cmds.supports.title'), subtitle: t('commandPalette.cmds.supports.subtitle'), icon: <Anchor className="w-4 h-4" />, action: () => setActiveTab('supports' as TabId), keywords: ['hangers', 'brackets'], category: 'navigation' },
        { id: 'nav-weights', title: t('commandPalette.cmds.loadCalc.title'), subtitle: t('commandPalette.cmds.loadCalc.subtitle'), icon: <Scale className="w-4 h-4" />, action: () => setActiveTab('weights' as TabId), keywords: ['mass', 'load'], category: 'navigation' },
        { id: 'nav-costs', title: t('commandPalette.cmds.costEstimation.title'), subtitle: t('commandPalette.cmds.costEstimation.subtitle'), icon: <Calculator className="w-4 h-4" />, action: () => setActiveTab('costs' as TabId), keywords: ['budget', 'price'], category: 'navigation' },
        { id: 'nav-quantities', title: t('commandPalette.cmds.materialQuantities.title'), subtitle: t('commandPalette.cmds.materialQuantities.subtitle'), icon: <ClipboardList className="w-4 h-4" />, action: () => setActiveTab('boq' as TabId), keywords: ['boq', 'materials', 'list'], category: 'navigation' },
        { id: 'nav-checklist', title: t('commandPalette.cmds.commissioning.title'), subtitle: t('commandPalette.cmds.commissioning.subtitle'), icon: <ClipboardCheck className="w-4 h-4" />, action: () => setActiveTab('checklist' as TabId), keywords: ['test', 'verify'], category: 'navigation' },
        { id: 'nav-catalogs', title: t('commandPalette.cmds.techLibrary.title'), subtitle: t('commandPalette.cmds.techLibrary.subtitle'), icon: <Book className="w-4 h-4" />, action: () => setActiveTab('catalogs' as TabId), keywords: ['library', 'database'], category: 'navigation' },
        { id: 'nav-photos', title: t('commandPalette.cmds.sitePhotos.title'), subtitle: t('commandPalette.cmds.sitePhotos.subtitle'), icon: <Camera className="w-4 h-4" />, action: () => setActiveTab('photos' as TabId), keywords: ['images', 'pictures'], category: 'navigation' },
        { id: 'nav-branding', title: t('commandPalette.cmds.reportBranding.title'), subtitle: t('commandPalette.cmds.reportBranding.subtitle'), icon: <Palette className="w-4 h-4" />, action: () => setActiveTab('branding' as TabId), keywords: ['logo', 'style'], category: 'navigation' },
        { id: 'nav-help', title: t('commandPalette.cmds.helpCenter.title'), subtitle: t('commandPalette.cmds.helpCenter.subtitle'), icon: <HelpCircle className="w-4 h-4" />, action: () => setActiveTab('help' as TabId), keywords: ['docs', 'support'], category: 'navigation' },
        { id: 'nav-architecture-spec', title: t('commandPalette.cmds.architectureSpec.title'), subtitle: t('commandPalette.cmds.architectureSpec.subtitle'), icon: <Sparkles className="w-4 h-4" />, action: () => setActiveTab('architecture_spec' as TabId), keywords: ['ai', 'specs', 'caiet'], category: 'navigation' },

        // Actions
        { id: 'action-save', title: t('commandPalette.cmds.saveProject.title'), subtitle: t('commandPalette.cmds.saveProject.subtitle'), icon: <Save className="w-4 h-4" />, action: () => onSave?.(), keywords: ['export', 'backup'], category: 'action' },
        { id: 'action-export', title: t('commandPalette.cmds.exportPdf.title'), subtitle: t('commandPalette.cmds.exportPdf.subtitle'), icon: <FileDown className="w-4 h-4" />, action: () => onExport?.(), keywords: ['print', 'report'], category: 'action' },

        // Settings
        { id: 'settings-open', title: t('commandPalette.cmds.projectSettings.title'), subtitle: t('commandPalette.cmds.projectSettings.subtitle'), icon: <Settings className="w-4 h-4" />, action: () => onSettings?.(), keywords: ['preferences', 'config'], category: 'settings' },
    ], [setActiveTab, onSave, onExport, onSettings, t]);

    // Combine static and dynamic commands
    const filteredCommands = useMemo(() => {
        if (!query.trim()) return staticCommands;

        const lowerQuery = query.toLowerCase();

        // Filter Static
        const staticMatches = staticCommands.filter(cmd => {
            const matchTitle = cmd.title.toLowerCase().includes(lowerQuery);
            const matchSubtitle = cmd.subtitle?.toLowerCase().includes(lowerQuery);
            const matchKeywords = cmd.keywords?.some(k => k.toLowerCase().includes(lowerQuery));
            return matchTitle || matchSubtitle || matchKeywords;
        });

        // Search dynamic content (Segments & Equipment)
        const dynamicMatches: CommandItem[] = [];

        // Search Equipment
        equipmentList.forEach(eq => {
            if (
                eq.name.toLowerCase().includes(lowerQuery) ||
                eq.manufacturer?.toLowerCase().includes(lowerQuery) ||
                eq.model?.toLowerCase().includes(lowerQuery) ||
                eq.type.toLowerCase().includes(lowerQuery)
            ) {
                dynamicMatches.push({
                    id: `eq-${eq.id}`,
                    title: eq.name,
                    subtitle: `${eq.manufacturer} ${eq.model} (${eq.type})`,
                    icon: <Cuboid className="w-4 h-4 hover:text-primary" />,
                    category: 'navigation', // Treat as nav to item
                    action: () => {
                        setActiveTab('boq' as TabId);
                        setHighlightedItemId(eq.id); // Context highlight
                    }
                });
            }
        });

        // Search Segments
        segments.forEach((seg, index) => {
            const name = seg.name || `Segment ${index + 1}`;
            if (
                name.toLowerCase().includes(lowerQuery) ||
                seg.material.toLowerCase().includes(lowerQuery) ||
                seg.size.toLowerCase().includes(lowerQuery)
            ) {
                dynamicMatches.push({
                    id: `seg-${seg.id}`,
                    title: name,
                    subtitle: `${seg.material} ${seg.size} - ${seg.length}m`,
                    icon: <Package className="w-4 h-4 hover:text-primary" />,
                    category: 'navigation',
                    action: () => {
                        setActiveTab('boq' as TabId);
                        setHighlightedItemId(seg.id);
                    }
                });
            }
        });

        return [...staticMatches, ...dynamicMatches];
    }, [staticCommands, query, equipmentList, segments, setActiveTab, setHighlightedItemId]);

    // Group commands by category (Keep this logic)
    const groupedCommands = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {
            navigation: [],
            action: [],
            settings: []
        };
        filteredCommands.forEach(cmd => {
            // Default to navigation if category unknown (safety)
            const cat = groups[cmd.category] ? cmd.category : 'navigation';
            groups[cat].push(cmd);
        });
        return groups;
    }, [filteredCommands]);

    // Keyboard shortcut to open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Navigate with arrow keys
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = filteredCommands[selectedIndex];
            if (cmd) {
                cmd.action();
                setIsOpen(false);
            }
        }
    }, [filteredCommands, selectedIndex]);

    // Scroll selected item into view
    useEffect(() => {
        const item = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        item?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    const executeCommand = (cmd: CommandItem) => {
        cmd.action();
        setIsOpen(false);
    };

    let flatIndex = -1;

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground text-xs hover:bg-muted hover:border-border transition-all"
            >
                <Search className="w-3.5 h-3.5" />
                <span>{t('commandPalette.quickSearch')}</span>
                <kbd className="ml-2 px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">
                    ⌘K
                </kbd>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100"
                        />

                        {/* Palette */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.15 }}
                            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-101"
                        >
                            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                                    <Search className="w-5 h-5 text-muted-foreground" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={t('commandPalette.searchPlaceholder')}
                                        value={query}
                                        onChange={e => {
                                            setQuery(e.target.value);
                                            setSelectedIndex(0);
                                        }}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none text-sm"
                                    />
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 rounded hover:bg-muted"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>

                                {/* Results */}
                                <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
                                    {filteredCommands.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground text-sm">
                                            {t('commandPalette.noResults')} &quot;{query}&quot;
                                        </div>
                                    ) : (
                                        <>
                                            {groupedCommands.navigation.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                                                        {t('commandPalette.navigate')}
                                                    </p>
                                                    {groupedCommands.navigation.map(cmd => {
                                                        flatIndex++;
                                                        const idx = flatIndex;
                                                        return (
                                                            <button
                                                                key={cmd.id}
                                                                data-index={idx}
                                                                onClick={() => executeCommand(cmd)}
                                                                onMouseEnter={() => setSelectedIndex(idx)}
                                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${selectedIndex === idx
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'hover:bg-muted'
                                                                    }`}
                                                            >
                                                                <span className={selectedIndex === idx ? 'text-primary-foreground' : 'text-muted-foreground'}>
                                                                    {cmd.icon}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{cmd.title}</p>
                                                                    {cmd.subtitle && (
                                                                        <p className={`text-xs truncate ${selectedIndex === idx ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                                            {cmd.subtitle}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <ArrowRight className={`w-4 h-4 ${selectedIndex === idx ? 'text-primary-foreground' : 'text-muted-foreground/30'}`} />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {groupedCommands.action.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                                                        {t('commandPalette.actions')}
                                                    </p>
                                                    {groupedCommands.action.map(cmd => {
                                                        flatIndex++;
                                                        const idx = flatIndex;
                                                        return (
                                                            <button
                                                                key={cmd.id}
                                                                data-index={idx}
                                                                onClick={() => executeCommand(cmd)}
                                                                onMouseEnter={() => setSelectedIndex(idx)}
                                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${selectedIndex === idx
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'hover:bg-muted'
                                                                    }`}
                                                            >
                                                                <span className={selectedIndex === idx ? 'text-primary-foreground' : 'text-muted-foreground'}>
                                                                    {cmd.icon}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{cmd.title}</p>
                                                                    {cmd.subtitle && (
                                                                        <p className={`text-xs truncate ${selectedIndex === idx ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                                            {cmd.subtitle}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {groupedCommands.settings.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                                                        {t('commandPalette.settings')}
                                                    </p>
                                                    {groupedCommands.settings.map(cmd => {
                                                        flatIndex++;
                                                        const idx = flatIndex;
                                                        return (
                                                            <button
                                                                key={cmd.id}
                                                                data-index={idx}
                                                                onClick={() => executeCommand(cmd)}
                                                                onMouseEnter={() => setSelectedIndex(idx)}
                                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${selectedIndex === idx
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'hover:bg-muted'
                                                                    }`}
                                                            >
                                                                <span className={selectedIndex === idx ? 'text-primary-foreground' : 'text-muted-foreground'}>
                                                                    {cmd.icon}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{cmd.title}</p>
                                                                    {cmd.subtitle && (
                                                                        <p className={`text-xs truncate ${selectedIndex === idx ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                                            {cmd.subtitle}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-1 py-0.5 rounded bg-background border border-border">↑</kbd>
                                            <kbd className="px-1 py-0.5 rounded bg-background border border-border">↓</kbd>
                                            {t('commandPalette.toNavigate')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-1 py-0.5 rounded bg-background border border-border">↵</kbd>
                                            {t('commandPalette.toSelect')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-1 py-0.5 rounded bg-background border border-border">esc</kbd>
                                            {t('commandPalette.toClose')}
                                        </span>
                                    </div>
                                    <span className="flex items-center gap-1">
                                        <Command className="w-3 h-3" />
                                        {t('commandPalette.title')}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default CommandPalette;
