'use client';

import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { PipeSegment, EquipmentItem, ProjectDetails, FluidType, SupportConfig, BrandingConfig, BoQItem } from '@/lib/types';
import { useHistory } from '@/hooks/useHistory';

interface ProjectState {
    projectDetails: ProjectDetails;
    setProjectDetails: (details: ProjectDetails) => void;
    segments: PipeSegment[];
    setSegments: (segments: PipeSegment[]) => void;
    addSegments: (segments: PipeSegment[]) => void;
    equipmentList: EquipmentItem[];
    setEquipmentList: (list: EquipmentItem[] | ((prev: EquipmentItem[]) => EquipmentItem[])) => void;
    fluidType: FluidType;
    setFluidType: (type: FluidType) => void;
    ifcModelUrl: string | null;
    setIfcModelUrl: (url: string | null) => void;
    glycolPercentage: number;
    setGlycolPercentage: (pct: number) => void;
    safetyMargin: boolean;
    setSafetyMargin: (enabled: boolean) => void;
    safetyMarginPercentage: number;
    setSafetyMarginPercentage: (pct: number) => void;
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

    // BoQ State
    boqItems: BoQItem[];
    setBoqItems: (items: BoQItem[] | ((prev: BoQItem[]) => BoQItem[])) => void;
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

// Lazy import or check context within provider?
// We import supabase client at top level if environment allows.
import { supabase } from '@/lib/supabase';
import { ProjectLoadData } from '@/lib/types';

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    // Initial State Definition
    const defaultState = React.useMemo(() => ({
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
        ifcModelUrl: null as string | null,
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
        cloudProjectId: null as string | null,
        boqItems: [] as BoQItem[]
    }), []);

    const { state, set, undo, redo, canUndo, canRedo, reset } = useHistory(defaultState);

    // Initialization check
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Load saved data using useHistory reset
    useEffect(() => {
        const saved = loadFromStorage();
        if (Object.keys(saved).length > 0) {
            // Merge saved with default to populate any missing fields
            reset({ ...defaultState, ...saved });
        }

        // Push to next tick to avoid cascading render warning in React
        setTimeout(() => {
            setIsInitialized(true);
        }, 0);
    }, [defaultState, reset]);

    // Cloud Methods
    const saveToCloud = useCallback(async () => {
        if (!state.cloudProjectId) {
            // Insert
            const payload: ProjectLoadData = {
                projectDetails: state.projectDetails,
                segments: state.segments,
                equipmentList: state.equipmentList,
                fluidType: state.fluidType,
                glycolPercentage: state.glycolPercentage,
                safetyMargin: state.safetyMargin,
                ifcModelUrl: state.ifcModelUrl
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
                safetyMargin: state.safetyMargin,
                ifcModelUrl: state.ifcModelUrl
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
    }, [state.cloudProjectId, state.projectDetails, state.segments, state.equipmentList, state.fluidType, state.glycolPercentage, state.safetyMargin, state.ifcModelUrl, set]);

    const loadFromCloud = useCallback(async (id: string) => {
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
                safetyMargin: projectData.safetyMargin ?? defaultState.safetyMargin,
                ifcModelUrl: projectData.ifcModelUrl || null
            };
            reset(newState);
        }
    }, [defaultState, reset]);

    // Setters Adapters
    const setProjectDetails = useCallback((val: ProjectDetails | ((prev: ProjectDetails) => ProjectDetails)) =>
        set(prev => ({ ...prev, projectDetails: typeof val === 'function' ? val(prev.projectDetails) : val })), [set]);

    const setSegments = useCallback((val: PipeSegment[] | ((prev: PipeSegment[]) => PipeSegment[])) =>
        set(prev => ({ ...prev, segments: typeof val === 'function' ? val(prev.segments) : val })), [set]);

    const setEquipmentList = useCallback((val: EquipmentItem[] | ((prev: EquipmentItem[]) => EquipmentItem[])) =>
        set(prev => ({ ...prev, equipmentList: typeof val === 'function' ? val(prev.equipmentList) : val })), [set]);

    const setFluidType = useCallback((val: FluidType | ((prev: FluidType) => FluidType)) =>
        set(prev => ({ ...prev, fluidType: typeof val === 'function' ? val(prev.fluidType) : val })), [set]);

    const setIfcModelUrl = useCallback((val: string | null | ((prev: string | null) => string | null)) =>
        set(prev => ({ ...prev, ifcModelUrl: typeof val === 'function' ? val(prev.ifcModelUrl) : val })), [set]);

    const setGlycolPercentage = useCallback((val: number | ((prev: number) => number)) =>
        set(prev => ({ ...prev, glycolPercentage: typeof val === 'function' ? val(prev.glycolPercentage) : val })), [set]);

    const setSafetyMargin = useCallback((val: boolean | ((prev: boolean) => boolean)) =>
        set(prev => ({ ...prev, safetyMargin: typeof val === 'function' ? val(prev.safetyMargin) : val })), [set]);

    const setSafetyMarginPercentage = useCallback((val: number | ((prev: number) => number)) =>
        set(prev => ({ ...prev, safetyMarginPercentage: typeof val === 'function' ? val(prev.safetyMarginPercentage) : val })), [set]);

    const setSupportConfig = useCallback((config: Partial<SupportConfig>) => {
        set(prev => ({ ...prev, supportConfig: { ...prev.supportConfig, ...config } }));
    }, [set]);

    const setBranding = useCallback((config: Partial<BrandingConfig>) => {
        set(prev => ({ ...prev, branding: { ...prev.branding, ...config } }));
    }, [set]);

    const setBoqItems = useCallback((val: BoQItem[] | ((prev: BoQItem[]) => BoQItem[])) =>
        set(prev => ({ ...prev, boqItems: typeof val === 'function' ? val(prev.boqItems) : val })), [set]);

    const addSegments = useCallback((newSegments: PipeSegment[]) =>
        set(prev => ({ ...prev, segments: [...prev.segments, ...newSegments] })), [set]);

    const value = React.useMemo(() => ({
        projectDetails: state.projectDetails, setProjectDetails,
        segments: state.segments, setSegments,
        equipmentList: state.equipmentList, setEquipmentList,
        fluidType: state.fluidType, setFluidType,
        ifcModelUrl: state.ifcModelUrl, setIfcModelUrl,
        glycolPercentage: state.glycolPercentage, setGlycolPercentage,
        safetyMargin: state.safetyMargin, setSafetyMargin,
        safetyMarginPercentage: state.safetyMarginPercentage, setSafetyMarginPercentage,
        supportConfig: state.supportConfig, setSupportConfig,
        branding: state.branding, setBranding,
        isInitialized,
        undo, redo, canUndo, canRedo,
        // Actions
        addSegments,
        // Cloud
        cloudProjectId: state.cloudProjectId,
        saveToCloud,
        loadFromCloud,

        // BoQ
        boqItems: state.boqItems, setBoqItems,
    }), [
        state, setProjectDetails, setSegments, setEquipmentList, setFluidType,
        setIfcModelUrl, setGlycolPercentage, setSafetyMargin, setSafetyMarginPercentage,
        setSupportConfig, setBranding, isInitialized,
        undo, redo, canUndo, canRedo, addSegments, saveToCloud, loadFromCloud,
        setBoqItems
    ]);

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

