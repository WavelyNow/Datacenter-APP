'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
    Package,
    Plus,
    Download,
    Upload,
    ChevronRight,
    ChevronDown,
    Trash2,
    Search,
    Filter,
    Copy,
    GripVertical,
    Check,
    X,
    RefreshCw,
    FileSpreadsheet,
    MoreHorizontal
} from 'lucide-react';
import { MaterialItem, MaterialCategory, MaterialUnit, MaterialStatus } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

// Constants
const CATEGORIES: MaterialCategory[] = ['Pipes', 'Fittings', 'Valves', 'Equipment', 'Supports', 'Insulation', 'Other'];
const UNITS: MaterialUnit[] = ['m', 'pcs', 'kg', 'set', 'lot', 'L', 'sqm', 'ml'];
const STATUSES: MaterialStatus[] = ['draft', 'confirmed', 'ordered', 'delivered'];

const generateId = () => `mat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Category styling
const categoryConfig: Record<MaterialCategory, { icon: string; color: string; darkColor: string }> = {
    Pipes: { icon: '🔧', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', darkColor: 'dark:bg-blue-500/20 dark:text-blue-400' },
    Fittings: { icon: '🔩', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', darkColor: 'dark:bg-amber-500/20 dark:text-amber-400' },
    Valves: { icon: '🎛️', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', darkColor: 'dark:bg-rose-500/20 dark:text-rose-400' },
    Equipment: { icon: '⚙️', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', darkColor: 'dark:bg-emerald-500/20 dark:text-emerald-400' },
    Supports: { icon: '🏗️', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20', darkColor: 'dark:bg-slate-500/20 dark:text-slate-400' },
    Insulation: { icon: '🧱', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', darkColor: 'dark:bg-purple-500/20 dark:text-purple-400' },
    Other: { icon: '📦', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', darkColor: 'dark:bg-gray-500/20 dark:text-gray-400' }
};

const statusConfig: Record<MaterialStatus, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' },
    ordered: { label: 'Ordered', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' },
    delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' }
};

// Inline Edit Cell Component
interface InlineEditCellProps {
    value: string | number;
    type: 'text' | 'number' | 'select';
    options?: string[];
    onSave: (value: string | number) => void;
    className?: string;
    placeholder?: string;
}

const InlineEditCell: React.FC<InlineEditCellProps> = ({ value, type, options, onSave, className = '', placeholder }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (inputRef.current instanceof HTMLInputElement) {
                inputRef.current.select();
            }
        }
    }, [isEditing]);

    const handleSave = () => {
        const finalValue = type === 'number' ? parseFloat(String(editValue)) || 0 : editValue;
        onSave(finalValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditValue(value);
            setIsEditing(false);
        } else if (e.key === 'Tab') {
            handleSave();
        }
    };

    if (isEditing) {
        if (type === 'select' && options) {
            return (
                <select
                    ref={inputRef as React.RefObject<HTMLSelectElement>}
                    value={String(editValue)}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className={`w-full bg-background border border-primary rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }
        return (
            <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type={type}
                value={editValue}
                onChange={e => setEditValue(type === 'number' ? e.target.value : e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full bg-background border border-primary rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={`cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors ${className}`}
            title="Click to edit"
        >
            {value || <span className="text-muted-foreground/50 italic">{placeholder || 'Click to edit'}</span>}
        </div>
    );
};

// Main Component
export const QuantityListPage = () => {
    const { boqItems, setBoqItems, segments, equipmentList } = useProject();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<MaterialCategory | 'all'>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedCategories, setExpandedCategories] = useState<Set<MaterialCategory>>(new Set(CATEGORIES));
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Migrate old items if needed (add missing fields)
    const materialItems = useMemo((): MaterialItem[] => {
        return boqItems.map((item, index) => ({
            ...item,
            status: (item as MaterialItem).status || 'draft',
            order: (item as MaterialItem).order ?? index,
            category: migrateCategory(item.category as string) as MaterialCategory
        }));
    }, [boqItems]);

    // Helper to migrate old categories
    function migrateCategory(cat: string): MaterialCategory {
        const mapping: Record<string, MaterialCategory> = {
            'Mechanical': 'Equipment',
            'Electrical': 'Equipment',
            'Services': 'Other',
            'Consumables': 'Other'
        };
        return mapping[cat] || (CATEGORIES.includes(cat as MaterialCategory) ? cat as MaterialCategory : 'Other');
    }

    // Calculate category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<MaterialCategory, number> = {
            Pipes: 0, Fittings: 0, Valves: 0, Equipment: 0, Supports: 0, Insulation: 0, Other: 0
        };
        materialItems.forEach(item => { counts[item.category]++; });
        return counts;
    }, [materialItems]);

    // Filtered and grouped items
    const filteredItems = useMemo(() => {
        return materialItems
            .filter(item => {
                const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
                const matchesSearch = searchQuery === '' ||
                    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.specification?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (item.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()));
                return matchesCategory && matchesSearch;
            })
            .sort((a, b) => a.order - b.order);
    }, [materialItems, categoryFilter, searchQuery]);

    // Group by category
    const groupedItems = useMemo(() => {
        const groups: Record<MaterialCategory, MaterialItem[]> = {
            Pipes: [], Fittings: [], Valves: [], Equipment: [], Supports: [], Insulation: [], Other: []
        };
        filteredItems.forEach(item => {
            groups[item.category].push(item);
        });
        return groups;
    }, [filteredItems]);

    // Actions
    const handleAddItem = useCallback((category: MaterialCategory = 'Other') => {
        const newItem: MaterialItem = {
            id: generateId(),
            category,
            code: '',
            description: 'New Item',
            quantity: 1,
            unit: 'pcs',
            status: 'draft',
            isAutoGenerated: false,
            isOverridden: false,
            updatedAt: new Date().toISOString(),
            order: materialItems.length
        };
        setBoqItems([...boqItems, newItem as MaterialItem]);
    }, [boqItems, materialItems.length, setBoqItems]);

    const handleUpdateItem = useCallback((id: string, updates: Partial<MaterialItem>) => {
        setBoqItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
            if (item.isAutoGenerated && !item.isOverridden) {
                (updated as MaterialItem).isOverridden = true;
            }
            return updated;
        }));
    }, [setBoqItems]);

    const handleDeleteItem = useCallback((id: string) => {
        setBoqItems(prev => prev.filter(item => item.id !== id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, [setBoqItems]);

    const handleDuplicateItem = useCallback((item: MaterialItem) => {
        const newItem: MaterialItem = {
            ...item,
            id: generateId(),
            code: `${item.code}-copy`,
            isAutoGenerated: false,
            isOverridden: false,
            updatedAt: new Date().toISOString(),
            order: materialItems.length
        };
        setBoqItems([...boqItems, newItem as MaterialItem]);
    }, [boqItems, materialItems.length, setBoqItems]);

    // Bulk actions
    const handleBulkDelete = useCallback(() => {
        setBoqItems(prev => prev.filter(item => !selectedIds.has(item.id)));
        setSelectedIds(new Set());
    }, [selectedIds, setBoqItems]);

    const handleBulkStatusChange = useCallback((status: MaterialStatus) => {
        setBoqItems(prev => prev.map(item =>
            selectedIds.has(item.id) ? { ...item, status, updatedAt: new Date().toISOString() } : item
        ));
    }, [selectedIds, setBoqItems]);

    // Selection
    const handleSelectAll = useCallback(() => {
        if (selectedIds.size === filteredItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredItems.map(i => i.id)));
        }
    }, [filteredItems, selectedIds.size]);

    const handleSelectItem = useCallback((id: string, shiftKey: boolean) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Sync from design
    const handleSyncFromDesign = useCallback(() => {
        const existingSourceIds = new Set(materialItems.filter(i => i.isAutoGenerated).map(i => i.sourceId));

        const pipeItems: MaterialItem[] = segments
            .filter(seg => !existingSourceIds.has(seg.id))
            .map((seg, i) => ({
                id: generateId(),
                category: 'Pipes' as MaterialCategory,
                code: `PIPE-${seg.material.toUpperCase()}-${seg.size}`,
                description: `${seg.name || 'Pipe Segment'} - ${seg.size}`,
                specification: `${seg.material}, ${seg.standard}`,
                quantity: seg.length,
                unit: 'm' as MaterialUnit,
                status: 'draft' as MaterialStatus,
                isAutoGenerated: true,
                sourceId: seg.id,
                isOverridden: false,
                updatedAt: new Date().toISOString(),
                order: materialItems.length + i
            }));

        const equipItems: MaterialItem[] = equipmentList
            .filter(eq => !existingSourceIds.has(eq.id))
            .map((eq, i) => ({
                id: generateId(),
                category: 'Equipment' as MaterialCategory,
                code: `EQ-${(eq.manufacturer || 'GEN').toUpperCase().substring(0, 3)}-${eq.id.substring(0, 4)}`,
                description: `${eq.name} (${eq.type})`,
                specification: eq.model || '',
                manufacturer: eq.manufacturer,
                quantity: 1,
                unit: 'pcs' as MaterialUnit,
                status: 'draft' as MaterialStatus,
                isAutoGenerated: true,
                sourceId: eq.id,
                isOverridden: false,
                updatedAt: new Date().toISOString(),
                order: materialItems.length + pipeItems.length + i
            }));

        const newItems = [...pipeItems, ...equipItems];
        if (newItems.length > 0) {
            setBoqItems([...boqItems, ...newItems]);
        }
    }, [boqItems, materialItems, segments, equipmentList, setBoqItems]);

    // Toggle category
    const toggleCategory = useCallback((cat: MaterialCategory) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) {
                next.delete(cat);
            } else {
                next.add(cat);
            }
            return next;
        });
    }, []);

    // Export to CSV
    const handleExportCSV = useCallback(() => {
        const headers = ['Code', 'Description', 'Category', 'Quantity', 'Unit', 'Specification', 'Manufacturer', 'Part Number', 'Status', 'Notes'];
        const rows = materialItems.map(item => [
            item.code,
            item.description,
            item.category,
            item.quantity,
            item.unit,
            item.specification || '',
            item.manufacturer || '',
            item.partNumber || '',
            item.status,
            item.notes || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `material_quantities_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [materialItems]);

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 bg-background/50 relative overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 px-8 py-6 border-b border-border/40 bg-background/80 backdrop-blur-md z-10">
                <div className="flex flex-col gap-4">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
                        <span>Project</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">Material Quantities</span>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-foreground tracking-tight mb-2 flex items-center gap-3">
                                <Package className="w-8 h-8 text-primary" />
                                Material Quantities
                            </h1>
                            <p className="text-muted-foreground max-w-2xl text-sm font-medium">
                                Track and manage all project materials, specifications, and quantities.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={handleSyncFromDesign} className="btn btn-secondary gap-2 h-10">
                                <RefreshCw className="w-4 h-4" /> Sync from Design
                            </button>
                            <button onClick={handleExportCSV} className="btn btn-secondary gap-2 h-10">
                                <FileSpreadsheet className="w-4 h-4" /> Export CSV
                            </button>
                            <button onClick={() => handleAddItem()} className="btn btn-primary gap-2 h-10">
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-8 py-4 border-b border-border/40 bg-muted/20 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by code, description, spec..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    {(['all', ...CATEGORIES] as const).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${categoryFilter === cat
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border text-muted-foreground hover:border-primary/30'
                                }`}
                        >
                            {cat === 'all' ? 'All' : `${categoryConfig[cat].icon} ${cat}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 py-3 bg-primary/10 border-b border-primary/20 flex items-center gap-4"
                    >
                        <span className="text-sm font-bold text-primary">{selectedIds.size} selected</span>
                        <div className="flex items-center gap-2">
                            <button onClick={handleBulkDelete} className="btn btn-sm bg-destructive/10 text-destructive hover:bg-destructive/20 gap-1">
                                <Trash2 className="w-3 h-3" /> Delete
                            </button>
                            <select
                                onChange={e => handleBulkStatusChange(e.target.value as MaterialStatus)}
                                className="text-xs bg-background border border-border rounded px-2 py-1"
                                defaultValue=""
                            >
                                <option value="" disabled>Change Status</option>
                                {STATUSES.map(s => (
                                    <option key={s} value={s}>{statusConfig[s].label}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
                            Clear selection
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 min-h-0">
                <div className="max-w-[1800px] mx-auto">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                        {CATEGORIES.map(cat => (
                            <div
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`rounded-xl p-4 border cursor-pointer transition-all hover:scale-105 ${categoryConfig[cat].color} ${categoryConfig[cat].darkColor} ${categoryFilter === cat ? 'ring-2 ring-primary' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{categoryConfig[cat].icon}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{cat}</span>
                                </div>
                                <p className="text-2xl font-black">{categoryCounts[cat]}</p>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[40px_100px_1fr_100px_80px_60px_150px_120px_100px_100px_80px] gap-2 px-4 py-3 bg-muted/50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <div className="flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-border"
                                />
                            </div>
                            <div>Code</div>
                            <div>Description</div>
                            <div>Category</div>
                            <div className="text-right">Qty</div>
                            <div>Unit</div>
                            <div>Specification</div>
                            <div>Manufacturer</div>
                            <div>Part No.</div>
                            <div>Status</div>
                            <div className="text-center">Actions</div>
                        </div>

                        {/* Grouped Rows */}
                        <div className="divide-y divide-border/30">
                            {CATEGORIES.map(cat => {
                                const items = groupedItems[cat];
                                if (items.length === 0 && categoryFilter !== 'all') return null;
                                if (items.length === 0) return null;

                                const isExpanded = expandedCategories.has(cat);

                                return (
                                    <div key={cat}>
                                        {/* Category Header */}
                                        <div
                                            onClick={() => toggleCategory(cat)}
                                            className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-muted/30 transition-colors ${categoryConfig[cat].color} ${categoryConfig[cat].darkColor}`}
                                        >
                                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            <span className="text-lg">{categoryConfig[cat].icon}</span>
                                            <span className="font-bold text-sm">{cat}</span>
                                            <span className="text-xs text-muted-foreground">({items.length} items)</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAddItem(cat); }}
                                                className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Add
                                            </button>
                                        </div>

                                        {/* Items */}
                                        <AnimatePresence>
                                            {isExpanded && items.map(item => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className={`grid grid-cols-[40px_100px_1fr_100px_80px_60px_150px_120px_100px_100px_80px] gap-2 px-4 py-2 items-center hover:bg-muted/20 transition-colors text-sm ${selectedIds.has(item.id) ? 'bg-primary/5' : ''
                                                        } ${item.isAutoGenerated && !item.isOverridden ? 'border-l-2 border-l-primary/50' : ''}`}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(item.id)}
                                                            onChange={() => handleSelectItem(item.id, false)}
                                                            className="w-4 h-4 rounded border-border"
                                                        />
                                                    </div>
                                                    <div className="font-mono text-xs">
                                                        <InlineEditCell
                                                            value={item.code}
                                                            type="text"
                                                            placeholder="CODE"
                                                            onSave={v => handleUpdateItem(item.id, { code: String(v) })}
                                                        />
                                                    </div>
                                                    <div className="font-medium">
                                                        <InlineEditCell
                                                            value={item.description}
                                                            type="text"
                                                            placeholder="Description"
                                                            onSave={v => handleUpdateItem(item.id, { description: String(v) })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InlineEditCell
                                                            value={item.category}
                                                            type="select"
                                                            options={CATEGORIES}
                                                            onSave={v => handleUpdateItem(item.id, { category: v as MaterialCategory })}
                                                        />
                                                    </div>
                                                    <div className="text-right font-mono">
                                                        <InlineEditCell
                                                            value={item.quantity}
                                                            type="number"
                                                            onSave={v => handleUpdateItem(item.id, { quantity: Number(v) })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InlineEditCell
                                                            value={item.unit}
                                                            type="select"
                                                            options={UNITS}
                                                            onSave={v => handleUpdateItem(item.id, { unit: v as MaterialUnit })}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        <InlineEditCell
                                                            value={item.specification || ''}
                                                            type="text"
                                                            placeholder="e.g., DN50, PN16"
                                                            onSave={v => handleUpdateItem(item.id, { specification: String(v) })}
                                                        />
                                                    </div>
                                                    <div className="text-xs">
                                                        <InlineEditCell
                                                            value={item.manufacturer || ''}
                                                            type="text"
                                                            placeholder="Manufacturer"
                                                            onSave={v => handleUpdateItem(item.id, { manufacturer: String(v) })}
                                                        />
                                                    </div>
                                                    <div className="text-xs font-mono">
                                                        <InlineEditCell
                                                            value={item.partNumber || ''}
                                                            type="text"
                                                            placeholder="Part #"
                                                            onSave={v => handleUpdateItem(item.id, { partNumber: String(v) })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <select
                                                            value={item.status}
                                                            onChange={e => handleUpdateItem(item.id, { status: e.target.value as MaterialStatus })}
                                                            className={`text-[10px] font-bold px-2 py-1 rounded-full border-0 cursor-pointer ${statusConfig[item.status].color}`}
                                                        >
                                                            {STATUSES.map(s => (
                                                                <option key={s} value={s}>{statusConfig[s].label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => handleDuplicateItem(item)}
                                                            className="p-1.5 rounded hover:bg-muted"
                                                            title="Duplicate"
                                                        >
                                                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            className="p-1.5 rounded hover:bg-destructive/10"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {filteredItems.length === 0 && (
                            <div className="p-12 text-center text-muted-foreground">
                                <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="font-bold text-lg mb-2">No materials yet</p>
                                <p className="text-sm mb-6">Start by adding items manually or sync from your piping design.</p>
                                <div className="flex items-center justify-center gap-3">
                                    <button onClick={handleSyncFromDesign} className="btn btn-secondary gap-2">
                                        <RefreshCw className="w-4 h-4" /> Sync from Design
                                    </button>
                                    <button onClick={() => handleAddItem()} className="btn btn-primary gap-2">
                                        <Plus className="w-4 h-4" /> Add Item
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Stats */}
                    {filteredItems.length > 0 && (
                        <div className="mt-4 text-sm text-muted-foreground text-center">
                            Showing {filteredItems.length} of {materialItems.length} items
                            {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuantityListPage;
