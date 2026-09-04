'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

import { TabId } from '@/lib/types';

export type PipingTab = 'segments' | 'equipment' | 'fluid';
export type HydraulicToolId = 'flow' | 'expansion' | 'thermal' | 'valve' | 'fittings' | 'pump';

interface UIContextState {
    // Navigation
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;

    // Sub-navigation for the dense engineering workspaces.
    pipingTab: PipingTab;
    setPipingTab: (tab: PipingTab) => void;
    hydraulicTool: HydraulicToolId;
    setHydraulicTool: (tool: HydraulicToolId) => void;

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
    const [pipingTab, setPipingTab] = useState<PipingTab>('segments');
    const [hydraulicTool, setHydraulicTool] = useState<HydraulicToolId>('expansion');
    const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsSidebarCollapsed(prev => !prev);
    }, []);

    const value: UIContextState = useMemo(() => ({
        activeTab,
        setActiveTab,
        pipingTab,
        setPipingTab,
        hydraulicTool,
        setHydraulicTool,
        highlightedItemId,
        setHighlightedItemId,
        isSidebarCollapsed,
        toggleSidebar
    }), [activeTab, pipingTab, hydraulicTool, highlightedItemId, isSidebarCollapsed, toggleSidebar]);

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
