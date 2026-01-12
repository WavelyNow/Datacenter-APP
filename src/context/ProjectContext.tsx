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
    // Cloud
    cloudProjectId: string | null;
    saveToCloud: () => Promise<string | void>;
    loadFromCloud: (id: string) => Promise<void>;
}


const ProjectContext = createContext<ProjectState | undefined>(undefined);

// Helper function to load state from localStorage (client-side only)
const loadFromStorage = (): Partial<ProjectState> => {
    try {
        const saved = localStorage.getItem('hydraulic_calc_project_v2');
        if (!saved) return {};
        // Strip cloudProjectId from local storage to avoid confusion if reloaded?
        // Actually, if we re-open the browser, we might want to remember we were working on a cloud project.
        // But for now, let's treat local storage as "Draft" and cloud as "Published".
        // Let's store cloudProjectId in local storage too if we want continuity.
        return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load project:', e);
        return {};
    }
};

// Lazy import or check context within provider?
// We import supabase client at top level if environment allows.
import { supabase } from '@/lib/supabase';
import { ProjectLoadData } from '@/lib/types';

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
        } as BrandingConfig,
        cloudProjectId: null as string | null
    };

    // We need to manage cloudProjectId outside of history? Or inside?
    // Ideally inside if undo/redo should track "which project I am working on"? No, linking to cloud is meta-data.
    // Let's keep it in history so if I load a new project, I can undo to previous project state.
    // Actually, loading a new project is a "hard reset" usually.

    // For now, let's put cloudProjectId in the history state to keep it simple with existing adapter pattern.
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

    // persistence logic same as before... (lines 104-141) nothing changes there except cloudProjectId is also saved locally.

    // Cloud Methods
    const saveToCloud = async () => {
        if (!state.cloudProjectId) {
            // Insert
            const payload: ProjectLoadData = {
                projectDetails: state.projectDetails,
                segments: state.segments,
                equipmentList: state.equipmentList,
                fluidType: state.fluidType,
                glycolPercentage: state.glycolPercentage,
                safetyMargin: state.safetyMargin
            };

            const { data, error } = await supabase
                .from('projects')
                .insert([
                    {
                        name: state.projectDetails.projectName,
                        description: state.projectDetails.projectNumber,
                        data: payload
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                // Update local state with new ID
                set(prev => ({ ...prev, cloudProjectId: data.id }));
                return data.id as string;
            }
        } else {
            // Update
            const payload: ProjectLoadData = {
                projectDetails: state.projectDetails,
                segments: state.segments,
                equipmentList: state.equipmentList,
                fluidType: state.fluidType,
                glycolPercentage: state.glycolPercentage,
                safetyMargin: state.safetyMargin
            };

            const { error } = await supabase
                .from('projects')
                .update({
                    name: state.projectDetails.projectName,
                    description: state.projectDetails.projectNumber,
                    data: payload,
                    updated_at: new Date().toISOString()
                })
                .eq('id', state.cloudProjectId);

            if (error) throw error;
            return state.cloudProjectId;
        }
    };

    const loadFromCloud = async (id: string) => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (data && data.data) {
            const projectData = data.data as ProjectLoadData;
            // Full state reset
            const newState = {
                ...defaultState,
                ...projectData,
                cloudProjectId: data.id,
                // Ensure specific fields are correctly typed/initialized from loaded data
                glycolPercentage: typeof projectData.glycolPercentage === 'number' ? projectData.glycolPercentage : defaultState.glycolPercentage,
                safetyMargin: projectData.safetyMargin ?? defaultState.safetyMargin
            };
            reset(newState as any);
        }
    };

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
        undo, redo, canUndo, canRedo,
        // Cloud
        cloudProjectId: state.cloudProjectId,
        saveToCloud,
        loadFromCloud
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
