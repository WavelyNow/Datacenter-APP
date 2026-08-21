'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

import { TabId } from '@/lib/types';

interface UIContextState {
    // Navigation
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;

    // Search & Highlight (global cross-component communication)
    highlightedItemId: string | null;
    setHighlightedItemId: (id: string | null) => void;

    // Sidebar
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

const UIContext = createContext<UIContextState | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');
    const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsSidebarCollapsed(prev => !prev);
    }, []);

    const value: UIContextState = useMemo(() => ({
        activeTab,
        setActiveTab,
        highlightedItemId,
        setHighlightedItemId,
        isSidebarCollapsed,
        toggleSidebar
    }), [activeTab, highlightedItemId, isSidebarCollapsed, toggleSidebar]);

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
