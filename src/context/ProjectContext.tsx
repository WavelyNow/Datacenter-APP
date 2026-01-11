'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PipeSegment, EquipmentItem, ProjectDetails, FluidType, SupportConfig, BrandingConfig } from '@/lib/types';
import { useHistory } from '@/hooks/useHistory';

interface ProjectState {
    projectDetails: ProjectDetails;
    setProjectDetails: (details: ProjectDetails) => void;
    segments: PipeSegment[];
    setSegments: (segments: PipeSegment[]) => void;
    equipmentList: EquipmentItem[];
    setEquipmentList: (list: EquipmentItem[]) => void;
    fluidType: FluidType;
    setFluidType: (type: FluidType) => void;
    glycolPercentage: number;
    setGlycolPercentage: (pct: number) => void;
    safetyMargin: boolean;
    setSafetyMargin: (enabled: boolean) => void;
    safetyMarginPercentage: number;
    setSafetyMarginPercentage: (pct: number) => void;
    activeTab: 'config' | 'supports' | 'weights' | 'photos' | 'branding' | 'catalogs';
    setActiveTab: (tab: 'config' | 'supports' | 'weights' | 'photos' | 'branding' | 'catalogs') => void;
    supportConfig: SupportConfig;
    setSupportConfig: (config: Partial<SupportConfig>) => void;
    branding: BrandingConfig;
    setBranding: (config: Partial<BrandingConfig>) => void;
    isInitialized: boolean;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}


const ProjectContext = createContext<ProjectState | undefined>(undefined);

// Helper function to load state from localStorage (client-side only)
const loadFromStorage = (): Partial<ProjectState> => {
    try {
        const saved = localStorage.getItem('hydraulic_calc_project_v2');
        if (!saved) return {};
        return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load project:', e);
        return {};
    }
};

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    // Initial State Definition
    const defaultState = {
        projectDetails: {
            projectName: 'Data Center Cooling',
            projectNumber: '2024-001',
            designer: 'Ing. Popescu',
            location: 'București',
            beneficiary: '-',
            date: new Date().toISOString().split('T')[0],
            revision: 'A',
        } as ProjectDetails,
        segments: [] as PipeSegment[],
        equipmentList: [] as EquipmentItem[],
        fluidType: 'ethylene' as FluidType,
        glycolPercentage: 30,
        safetyMargin: true,
        safetyMarginPercentage: 5,
        supportConfig: {
            spacing: 2.5,
            mountingType: 'suspended' as const,
            height: 1.5,
            pipesPerSupport: 1,
            insulationThickness: 30,
            insulationDensity: 100,
            addLeftConsole: false,
            addRightConsole: false,
            addUpperRail: false
        } as SupportConfig,
        branding: {
            primaryColor: '#3b82f6',
            accentColor: '#10b981',
            pdfTheme: 'modern' as const
        } as BrandingConfig
    };

    const { state, set, undo, redo, canUndo, canRedo, reset } = useHistory(defaultState);

    // UI States (Not in History)
    const [activeTab, setActiveTab] = useState<'config' | 'supports' | 'weights' | 'photos' | 'branding' | 'catalogs'>('config');
    const [isInitialized, setIsInitialized] = useState(false);

    // Load saved data using useHistory reset
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = loadFromStorage();
        if (Object.keys(saved).length > 0) {
            // Merge saved with default to populate any missing fields
            reset({ ...defaultState, ...saved } as any);
        }
        setIsInitialized(true);
    }, []);

    // Persistence Logic (Save on Change)
    useEffect(() => {
        if (!isInitialized) return;
        const data = state;
        try {
            localStorage.setItem('hydraulic_calc_project_v2', JSON.stringify(data));
        } catch (e) {
            const error = e as Error;
            if (error.name === 'QuotaExceededError') {
                console.warn('LocalStorage quota exceeded. Attempting to save without logo.');
                try {
                    const dataWithoutLogo = {
                        ...data,
                        projectDetails: {
                            ...data.projectDetails,
                            companyLogo: undefined
                        }
                    };
                    localStorage.setItem('hydraulic_calc_project_v2', JSON.stringify(dataWithoutLogo));
                    console.log('Saved successfully without logo.');
                } catch {
                    console.warn('Still exceeding quota without logo. Pruning equipment photos...');
                    try {
                        const dataNoPhotos = {
                            ...data,
                            projectDetails: { ...data.projectDetails, companyLogo: undefined },
                            equipmentList: data.equipmentList.map(item => ({ ...item, photos: undefined, proofImage: undefined }))
                        };
                        localStorage.setItem('hydraulic_calc_project_v2', JSON.stringify(dataNoPhotos));
                        console.log('Saved successfully after full pruning.');
                    } catch (finalError) {
                        console.error('Failed to save even after pruning everything:', finalError);
                    }
                }
            } else {
                console.error('Failed to save to localStorage:', e);
            }
        }
    }, [state, isInitialized]);

    // Setters Adapters
    const setProjectDetails = useCallback((val: any) => set(prev => ({ ...prev, projectDetails: typeof val === 'function' ? val(prev.projectDetails) : val })), [set]);
    const setSegments = useCallback((val: any) => set(prev => ({ ...prev, segments: typeof val === 'function' ? val(prev.segments) : val })), [set]);
    const setEquipmentList = useCallback((val: any) => set(prev => ({ ...prev, equipmentList: typeof val === 'function' ? val(prev.equipmentList) : val })), [set]);
    const setFluidType = useCallback((val: any) => set(prev => ({ ...prev, fluidType: typeof val === 'function' ? val(prev.fluidType) : val })), [set]);
    const setGlycolPercentage = useCallback((val: any) => set(prev => ({ ...prev, glycolPercentage: typeof val === 'function' ? val(prev.glycolPercentage) : val })), [set]);
    const setSafetyMargin = useCallback((val: any) => set(prev => ({ ...prev, safetyMargin: typeof val === 'function' ? val(prev.safetyMargin) : val })), [set]);
    const setSafetyMarginPercentage = useCallback((val: any) => set(prev => ({ ...prev, safetyMarginPercentage: typeof val === 'function' ? val(prev.safetyMarginPercentage) : val })), [set]);

    const setSupportConfig = useCallback((config: Partial<SupportConfig>) => {
        set(prev => ({ ...prev, supportConfig: { ...prev.supportConfig, ...config } }));
    }, [set]);

    const setBranding = useCallback((config: Partial<BrandingConfig>) => {
        set(prev => ({ ...prev, branding: { ...prev.branding, ...config } }));
    }, [set]);

    const value = {
        projectDetails: state.projectDetails, setProjectDetails,
        segments: state.segments, setSegments,
        equipmentList: state.equipmentList, setEquipmentList,
        fluidType: state.fluidType, setFluidType,
        glycolPercentage: state.glycolPercentage, setGlycolPercentage,
        safetyMargin: state.safetyMargin, setSafetyMargin,
        safetyMarginPercentage: state.safetyMarginPercentage, setSafetyMarginPercentage,
        activeTab, setActiveTab,
        supportConfig: state.supportConfig, setSupportConfig,
        branding: state.branding, setBranding,
        isInitialized,
        undo, redo, canUndo, canRedo
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
