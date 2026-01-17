'use client';

import React, { useState, useMemo } from 'react';
import {
    ClipboardCheck,
    Droplets,
    Shield,
    Cpu,
    Activity,
    FileText,
    Check,
    Circle,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Clock,
    User,
    Download,
    RefreshCw,
    LucideIcon
} from 'lucide-react';
import {
    CHECKLIST_CATEGORIES,
    CHECKLIST_ITEMS,
    ChecklistItem,
    ChecklistCategory,
    getItemsByCategory
} from '@/lib/commissioning/checklistItems';

// Icon mapping
const CATEGORY_ICONS: Record<string, LucideIcon> = {
    'ClipboardCheck': ClipboardCheck,
    'Droplets': Droplets,
    'Shield': Shield,
    'Cpu': Cpu,
    'Activity': Activity,
    'FileText': FileText,
};

interface ChecklistState {
    [itemId: string]: {
        completed: boolean;
        completedAt?: string;
        completedBy?: string;
        notes?: string;
    };
}

export const CommissioningChecklist: React.FC = () => {
    const [checklistState, setChecklistState] = useState<ChecklistState>(() => {
        if (typeof window === 'undefined') return {};
        const saved = localStorage.getItem('commissioning_checklist_state');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return {};
            }
        }
        return {};
    });

    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(CHECKLIST_CATEGORIES.map(c => c.id))
    );
    const [filterPriority, setFilterPriority] = useState<string | null>(null);
    const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

    // Save state to localStorage
    const saveState = (newState: ChecklistState) => {
        setChecklistState(newState);
        localStorage.setItem('commissioning_checklist_state', JSON.stringify(newState));
    };

    // Toggle item completion
    const toggleItem = (itemId: string) => {
        const newState = { ...checklistState };
        if (newState[itemId]?.completed) {
            delete newState[itemId];
        } else {
            newState[itemId] = {
                completed: true,
                completedAt: new Date().toISOString(),
            };
        }
        saveState(newState);
    };

    // Reset all progress
    const resetProgress = () => {
        if (confirm('Ștergeți tot progresul? Această acțiune nu poate fi anulată.')) {
            saveState({});
        }
    };

    // Calculate overall progress
    const progress = useMemo(() => {
        const total = CHECKLIST_ITEMS.length;
        const completed = Object.values(checklistState).filter(s => s.completed).length;
        return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }, [checklistState]);

    // Calculate category progress
    const getCategoryProgress = (categoryId: string) => {
        const items = getItemsByCategory(categoryId);
        const completed = items.filter(item => checklistState[item.id]?.completed).length;
        return { total: items.length, completed };
    };

    // Filter items
    const getFilteredItems = (categoryId: string) => {
        let items = getItemsByCategory(categoryId);

        if (filterPriority) {
            items = items.filter(item => item.priority === filterPriority);
        }

        if (showOnlyIncomplete) {
            items = items.filter(item => !checklistState[item.id]?.completed);
        }

        return items;
    };

    const toggleCategory = (categoryId: string) => {
        const newSet = new Set(expandedCategories);
        if (newSet.has(categoryId)) {
            newSet.delete(categoryId);
        } else {
            newSet.add(categoryId);
        }
        setExpandedCategories(newSet);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'low': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
            default: return 'text-muted-foreground bg-muted/10';
        }
    };

    const getCategoryColor = (color: string) => {
        const colors: Record<string, string> = {
            'blue': 'from-indigo-500/10 to-indigo-600/10 border-indigo-500/20',
            'cyan': 'from-sky-500/10 to-sky-600/10 border-sky-500/20',
            'red': 'from-red-500/10 to-red-600/10 border-red-500/20',
            'purple': 'from-slate-500/10 to-slate-600/10 border-slate-500/20',
            'green': 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20',
            'amber': 'from-amber-500/10 to-amber-600/10 border-amber-500/20',
        };
        return colors[color] || colors['blue'];
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <ClipboardCheck className="w-6 h-6 text-primary" />
                        Commissioning Checklist
                    </h2>
                    <p className="text-muted-foreground mt-1">Track system commissioning and verification tasks</p>
                </div>
                <button
                    onClick={resetProgress}
                    className="btn btn-secondary gap-2 text-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                </button>
            </div>

            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Overall Progress</div>
                        <div className="text-3xl font-bold text-foreground">{progress.percentage}%</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-muted-foreground">Completed</div>
                        <div className="text-2xl font-bold text-foreground">{progress.completed} / {progress.total}</div>
                    </div>
                </div>

                <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full transition-all duration-500"
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm text-muted-foreground">Priority:</span>
                <div className="flex gap-2">
                    {['critical', 'high', 'medium', 'low'].map(priority => (
                        <button
                            key={priority}
                            onClick={() => setFilterPriority(filterPriority === priority ? null : priority)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${filterPriority === priority
                                ? getPriorityColor(priority)
                                : 'bg-muted/20 border-border text-muted-foreground hover:border-border/80'
                                }`}
                        >
                            {priority}
                        </button>
                    ))}
                </div>
                <div className="flex-1" />
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={showOnlyIncomplete}
                        onChange={e => setShowOnlyIncomplete(e.target.checked)}
                        className="w-4 h-4 rounded"
                    />
                    Show only incomplete
                </label>
            </div>

            {/* Checklist Categories */}
            <div className="space-y-4">
                {CHECKLIST_CATEGORIES.map(category => {
                    const Icon = CATEGORY_ICONS[category.icon] || ClipboardCheck;
                    const isExpanded = expandedCategories.has(category.id);
                    const categoryProgress = getCategoryProgress(category.id);
                    const items = getFilteredItems(category.id);
                    const isComplete = categoryProgress.completed === categoryProgress.total;

                    return (
                        <div key={category.id} className={`card-premium overflow-hidden ${isComplete ? 'border-emerald-500/30' : ''}`}>
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className={`w-full p-5 flex items-center justify-between hover:bg-muted/20 transition-colors bg-gradient-to-r ${getCategoryColor(category.color)}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? 'bg-emerald-500' : 'bg-background border border-border'
                                        }`}>
                                        {isComplete ? (
                                            <Check className="w-5 h-5 text-white" />
                                        ) : (
                                            <Icon className={`w-5 h-5 text-indigo-500`} />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-foreground">{category.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {categoryProgress.completed} / {categoryProgress.total} completed
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-2 bg-muted/30 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-primary'}`}
                                            style={{ width: `${(categoryProgress.completed / categoryProgress.total) * 100}%` }}
                                        />
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </button>

                            {/* Items List */}
                            {isExpanded && items.length > 0 && (
                                <div className="border-t border-border">
                                    {items.map((item, idx) => {
                                        const isCompleted = checklistState[item.id]?.completed;

                                        return (
                                            <div
                                                key={item.id}
                                                className={`p-4 flex items-start gap-4 hover:bg-muted/10 transition-colors ${idx < items.length - 1 ? 'border-b border-border/50' : ''
                                                    } ${isCompleted ? 'opacity-60' : ''}`}
                                            >
                                                {/* Checkbox */}
                                                <button
                                                    onClick={() => toggleItem(item.id)}
                                                    className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isCompleted
                                                        ? 'bg-emerald-500 border-emerald-500'
                                                        : 'border-muted-foreground/30 hover:border-primary'
                                                        }`}
                                                >
                                                    {isCompleted && <Check className="w-4 h-4 text-white" />}
                                                </button>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                            {item.title}
                                                        </span>
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
                                                            {item.priority}
                                                        </span>
                                                        {item.requiresSignoff && (
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-500`}>
                                                                Signoff
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>

                                                    {/* Completion info */}
                                                    {isCompleted && checklistState[item.id]?.completedAt && (
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(checklistState[item.id].completedAt!).toLocaleString('ro-RO')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Empty state for filtered */}
                            {isExpanded && items.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No items match current filters</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <strong>Important:</strong> This checklist is a guideline. Actual commissioning procedures should follow
                        project specifications, manufacturer requirements, and local regulations. All critical items require
                        formal sign-off by authorized personnel.
                    </div>
                </div>
            </div>
        </div>
    );
};
