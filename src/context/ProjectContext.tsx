'use client';

import React, { createContext, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { PipeSegment, EquipmentItem, ProjectDetails, FluidType, SupportConfig, BrandingConfig, BoQItem, ProjectLoadData, FittingItem } from '@/lib/types';
import { useHistory } from '@/hooks/useHistory';
import { supabase } from '@/lib/supabase';
import { usePreferences } from '@/context/PreferencesContext';
import { parseProjectData, PROJECT_FILE_VERSION } from '@/lib/projectFile';
import {
    deleteLocalProject as removeStoredLocalProject,
    readLocalProject,
    saveLocalProject,
} from '@/lib/localProjects';

const CLOUD_DISABLED_MESSAGE = 'Cloud dezactivat — setează variabilele de mediu NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY';

// Single shared storage key: ProjectContext owns local persistence of the project.
export const PROJECT_STORAGE_KEY = 'hydraulic_calc_project_v2';

/** Persistable / loadable core project state (no callbacks). */
export interface ProjectDataState {
    projectDetails: ProjectDetails;
    segments: PipeSegment[];
    equipmentList: EquipmentItem[];
    ifcModelUrl: string | null;
    fluidType: FluidType;
    glycolPercentage: number;
    safetyMargin: boolean;
    safetyMarginPercentage: number;
    supportConfig: SupportConfig;
    branding: BrandingConfig;
    cloudProjectId: string | null;
    boqItems: BoQItem[];
    fittingItems: FittingItem[];
}

interface ProjectState {
    projectDetails: ProjectDetails;
    setProjectDetails: (details: ProjectDetails) => void;
    segments: PipeSegment[];
    setSegments: (segments: PipeSegment[]) => void;
    addSegments: (segments: PipeSegment[]) => void;
    equipmentList: EquipmentItem[];
    setEquipmentList: (list: EquipmentItem[] | ((prev: EquipmentItem[]) => EquipmentItem[])) => void;
    addEquipment: (equipment: EquipmentItem[]) => void;
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

    // Fittinguri (vane, coturi, teuri) — pentru pierderi și listă de cumpărat
    fittingItems: FittingItem[];
    setFittingItems: (items: FittingItem[] | ((prev: FittingItem[]) => FittingItem[])) => void;

    // Local file import (full document replace, defaults for missing fields)
    importProjectData: (data: ProjectLoadData) => void;

    // Full local reset (clears everything incl. cloud link)
    resetProject: () => void;
    // Local persistence status and explicit manual save.
    isProjectDirty: boolean;
    saveProjectLocally: () => void;
    localProjectId: string | null;
    saveAsLocalProject: (name: string) => string | null;
    loadLocalProject: (id: string) => boolean;
    deleteLocalProject: (id: string) => boolean;
}


const ProjectContext = createContext<ProjectState | undefined>(undefined);

// Helper function to load state from localStorage (client-side only)
const loadFromStorage = (): Partial<ProjectDataState> => {
    try {
        const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
        if (!saved) return {};
        return parseProjectData(JSON.parse(saved)) as Partial<ProjectDataState>;
    } catch (e) {
        console.error('Failed to load project:', e);
        return {};
    }
};

const serializeProjectState = (s: ProjectDataState): string => {
    // URL-urile blob: (modele GLB incarcate local) NU supravietuiesc refresh-ului
    // — le excludem din persistare (fara obiecte moarte in storage).
    const equipmentList = s.equipmentList.map(eq => (eq.model3d && eq.model3d.startsWith('blob:')) ? { ...eq, model3d: undefined } : eq);
    return JSON.stringify({
        version: PROJECT_FILE_VERSION,
        projectDetails: s.projectDetails,
        segments: s.segments,
        equipmentList,
        ifcModelUrl: s.ifcModelUrl,
        fluidType: s.fluidType,
        glycolPercentage: s.glycolPercentage,
        safetyMargin: s.safetyMargin,
        safetyMarginPercentage: s.safetyMarginPercentage,
        supportConfig: s.supportConfig,
        branding: s.branding,
        cloudProjectId: s.cloudProjectId,
        boqItems: s.boqItems,
        fittingItems: s.fittingItems,
    });
};

const buildProjectLoadData = (s: ProjectDataState): ProjectLoadData => ({
    version: PROJECT_FILE_VERSION,
    projectDetails: s.projectDetails,
    segments: s.segments,
    equipmentList: s.equipmentList,
    fluidType: s.fluidType,
    glycolPercentage: s.glycolPercentage,
    safetyMargin: s.safetyMargin,
    safetyMarginPercentage: s.safetyMarginPercentage,
    supportConfig: s.supportConfig,
    branding: s.branding,
    boqItems: s.boqItems,
    fittingItems: s.fittingItems,
    ifcModelUrl: s.ifcModelUrl,
});

/**
 * Merge a ProjectLoadData document over a base state.
 * Rules:
 *  - Present & valid field (not null / not undefined) => full replace (or spread-merge for config objects)
 *  - Missing field (absent key OR JSON null) => keep the base value, so local data is never destroyed.
 */
const applyProjectData = (base: ProjectDataState, data: ProjectLoadData): ProjectDataState => {
    const out: ProjectDataState = { ...base };

    if (Array.isArray(data.segments)) out.segments = data.segments;
    if (Array.isArray(data.equipmentList)) out.equipmentList = data.equipmentList;
    if (Array.isArray(data.fittingItems)) out.fittingItems = data.fittingItems;
    if (data.projectDetails && typeof data.projectDetails === 'object') {
        out.projectDetails = {
            ...data.projectDetails,
            // Older files may omit the date — fall back to "today"
            date: typeof data.projectDetails.date === 'string' ? data.projectDetails.date : new Date().toISOString().split('T')[0],
        };
    }
    if (data.fluidType === 'ethylene' || data.fluidType === 'propylene' || data.fluidType === 'water') {
        out.fluidType = data.fluidType;
    }
    if (typeof data.glycolPercentage === 'number' && Number.isFinite(data.glycolPercentage)) {
        out.glycolPercentage = data.glycolPercentage;
    }
    if (typeof data.safetyMargin === 'boolean') out.safetyMargin = data.safetyMargin;
    if (typeof data.safetyMarginPercentage === 'number' && Number.isFinite(data.safetyMarginPercentage)) {
        out.safetyMarginPercentage = data.safetyMarginPercentage;
    }
    if (data.supportConfig && typeof data.supportConfig === 'object') {
        out.supportConfig = { ...out.supportConfig, ...data.supportConfig };
    }
    if (data.branding && typeof data.branding === 'object') {
        out.branding = { ...out.branding, ...data.branding };
    }
    if (Array.isArray(data.boqItems)) out.boqItems = data.boqItems;
    if (Object.prototype.hasOwnProperty.call(data, 'ifcModelUrl')) {
        out.ifcModelUrl = data.ifcModelUrl === null || data.ifcModelUrl === undefined ? null : data.ifcModelUrl;
    }

    return out;
};

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const { preferences } = usePreferences();

    // Initial State Definition
    const defaultState = React.useMemo<ProjectDataState>(() => ({
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
            accentColor: '#0071e3',
            pdfTheme: 'modern' as const
        } as BrandingConfig,
        cloudProjectId: null as string | null,
        boqItems: [] as BoQItem[],
        fittingItems: [] as FittingItem[]
    }), []);

    const { state, set, undo, redo, canUndo, canRedo, reset } = useHistory<ProjectDataState>(defaultState);

    // Initialization check
    const [isInitialized, setIsInitialized] = React.useState(false);
    const [isProjectDirty, setIsProjectDirty] = React.useState(false);
    const [localProjectId, setLocalProjectId] = React.useState<string | null>(null);

    // Load saved data using useHistory reset
    useEffect(() => {
        const saved = loadFromStorage();
        if (Object.keys(saved).length > 0) {
            // Merge saved with default to populate any missing fields
            reset(applyProjectData(defaultState, saved));
        }

        // Push to next tick to avoid cascading render warning in React
        const timer = setTimeout(() => {
            setIsInitialized(true);
        }, 0);
        return () => clearTimeout(timer);
    }, [defaultState, reset]);

    // Debounced local persistence — ProjectContext is the single owner of PROJECT_STORAGE_KEY.
    const latestStateRef = useRef<ProjectDataState>(state);
    const lastSeenStateRef = useRef<ProjectDataState>(state);
    const hydratedStateRef = useRef(false);
    const dirtyRef = useRef(false);
    const localProjectIdRef = useRef<string | null>(null);
    useEffect(() => {
        latestStateRef.current = state;
    }, [state]);

    const persistProjectLocally = useCallback((nextState: ProjectDataState, notify = true) => {
        try {
            localStorage.setItem(PROJECT_STORAGE_KEY, serializeProjectState(nextState));
            dirtyRef.current = false;
            if (notify) {
                setIsProjectDirty(false);
                window.dispatchEvent(new CustomEvent('opencode:project-saved'));
            }
        } catch (e) {
            console.error('Failed to persist project:', e);
        }
    }, []);

    const autoSaveDelayMs = preferences.autoSaveInterval === 0
        ? null
        : Math.max(1, Number.isFinite(preferences.autoSaveInterval) ? preferences.autoSaveInterval : 30) * 1000;

    useEffect(() => {
        // Skip writing until the initial localStorage load has been applied.
        if (!isInitialized) return;
        if (!hydratedStateRef.current) {
            hydratedStateRef.current = true;
            lastSeenStateRef.current = state;
            return;
        }

        if (lastSeenStateRef.current !== state) {
            lastSeenStateRef.current = state;
            dirtyRef.current = true;
            setIsProjectDirty(true);
        }

        if (!dirtyRef.current || autoSaveDelayMs === null) return;
        const timer = setTimeout(() => persistProjectLocally(latestStateRef.current), autoSaveDelayMs);
        return () => clearTimeout(timer);
    }, [autoSaveDelayMs, isInitialized, persistProjectLocally, state]);

    // Flush pending changes on unload so the last debounce window is never lost
    useEffect(() => {
        const flush = () => {
            persistProjectLocally(latestStateRef.current, false);
        };
        window.addEventListener('beforeunload', flush);
        return () => window.removeEventListener('beforeunload', flush);
    }, [persistProjectLocally]);

    const saveProjectLocally = useCallback(() => {
        const current = latestStateRef.current;
        persistProjectLocally(current);
        const id = localProjectIdRef.current;
        if (id) {
            saveLocalProject(id, current.projectDetails.projectName, buildProjectLoadData(current));
        }
    }, [persistProjectLocally]);

    const setActiveLocalProject = useCallback((id: string | null) => {
        localProjectIdRef.current = id;
        setLocalProjectId(id);
    }, []);

    const saveAsLocalProject = useCallback((name: string) => {
        const projectName = name.trim();
        if (!projectName) return null;

        const current = latestStateRef.current;
        const nextState: ProjectDataState = {
            ...current,
            cloudProjectId: null,
            projectDetails: { ...current.projectDetails, projectName },
        };
        const id = crypto.randomUUID();
        if (!saveLocalProject(id, projectName, buildProjectLoadData(nextState))) return null;

        set(nextState);
        setActiveLocalProject(id);
        persistProjectLocally(nextState);
        return id;
    }, [persistProjectLocally, set, setActiveLocalProject]);

    const loadLocalProject = useCallback((id: string) => {
        const stored = readLocalProject(id);
        if (!stored) return false;

        try {
            const nextState = applyProjectData(defaultState, parseProjectData(stored.data));
            reset(nextState);
            setActiveLocalProject(id);
            persistProjectLocally(nextState);
            return true;
        } catch (error) {
            console.error('Failed to load local project:', error);
            return false;
        }
    }, [defaultState, persistProjectLocally, reset, setActiveLocalProject]);

    const deleteLocalProject = useCallback((id: string) => {
        const deleted = removeStoredLocalProject(id);
        if (deleted && localProjectIdRef.current === id) setActiveLocalProject(null);
        return deleted;
    }, [setActiveLocalProject]);

    // Cloud Methods
    const cloudSaveInFlightRef = useRef(false);

    const saveToCloud = useCallback(async () => {
        if (!supabase) {
            throw new Error(CLOUD_DISABLED_MESSAGE);
        }
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            throw new Error('Fără conexiune — conectează-te la internet înainte de a salva în Cloud.');
        }
        if (cloudSaveInFlightRef.current) {
            throw new Error('A cloud save is already in progress.');
        }
        cloudSaveInFlightRef.current = true;
        try {
            const payload = buildProjectLoadData(state);
            if (!state.cloudProjectId) {
                // Insert
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
        } finally {
            cloudSaveInFlightRef.current = false;
        }
    }, [state, set]);

    const loadFromCloud = useCallback(async (id: string) => {
        if (!supabase) {
            throw new Error(CLOUD_DISABLED_MESSAGE);
        }

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (data && data.data) {
            const projectData = data.data as ProjectLoadData;
            // MERGE saved fields over the current local state (full replace for core
            // segments/equipment/projectDetails/fluid fields; missing fields keep local values).
            const newState: ProjectDataState = {
                ...applyProjectData(state, projectData),
                cloudProjectId: data.id
            };
            reset(newState);
        }
    }, [state, reset]);

    // Local file import: full document replace with defaults for fields absent from older files.
    const importProjectData = useCallback((data: ProjectLoadData) => {
        const nextState = applyProjectData(defaultState, parseProjectData(data));
        reset(nextState);
        setActiveLocalProject(null);
        persistProjectLocally(nextState);
    }, [defaultState, persistProjectLocally, reset, setActiveLocalProject]);

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
        set(prev => {
            const next = typeof val === 'function' ? val(prev.safetyMarginPercentage) : val;
            return { ...prev, safetyMarginPercentage: Math.max(0, Math.min(20, next)) };
        }), [set]);

    const setSupportConfig = useCallback((config: Partial<SupportConfig>) => {
        set(prev => ({ ...prev, supportConfig: { ...prev.supportConfig, ...config } }));
    }, [set]);

    const setBranding = useCallback((config: Partial<BrandingConfig>) => {
        set(prev => ({ ...prev, branding: { ...prev.branding, ...config } }));
    }, [set]);

    const setFittingItems = useCallback((val: FittingItem[] | ((prev: FittingItem[]) => FittingItem[])) =>
        set(prev => ({ ...prev, fittingItems: typeof val === 'function' ? val(prev.fittingItems) : val })), [set]);


    const setBoqItems = useCallback((val: BoQItem[] | ((prev: BoQItem[]) => BoQItem[])) =>
        set(prev => ({ ...prev, boqItems: typeof val === 'function' ? val(prev.boqItems) : val })), [set]);

    const resetProject = useCallback(() => {
        reset(defaultState);
        setActiveLocalProject(null);
        persistProjectLocally(defaultState);
    }, [defaultState, persistProjectLocally, reset, setActiveLocalProject]);

    const addSegments = useCallback((newSegments: PipeSegment[]) =>
        set(prev => ({ ...prev, segments: [...prev.segments, ...newSegments] })), [set]);

    const addEquipment = useCallback((newEquipment: EquipmentItem[]) =>
        set(prev => ({ ...prev, equipmentList: [...prev.equipmentList, ...newEquipment] })), [set]);

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
        addEquipment,
        // Cloud
        cloudProjectId: state.cloudProjectId,
        saveToCloud,
        loadFromCloud,

        // BoQ
        boqItems: state.boqItems, setBoqItems,

        // Fittinguri (pierderi + listă de cumpărat)
        fittingItems: state.fittingItems, setFittingItems,

        importProjectData,
        // Full local reset (clears everything, incl. cloud link)
        resetProject,
        isProjectDirty,
        saveProjectLocally,
        localProjectId,
        saveAsLocalProject,
        loadLocalProject,
        deleteLocalProject,
    }), [
        state, setProjectDetails, setSegments, setEquipmentList, setFluidType,
        setIfcModelUrl, setGlycolPercentage, setSafetyMargin, setSafetyMarginPercentage,
        setSupportConfig, setBranding, isInitialized,
        undo, redo, canUndo, canRedo, addSegments, addEquipment, saveToCloud, loadFromCloud,
        setBoqItems, setFittingItems, importProjectData, resetProject, isProjectDirty, saveProjectLocally,
        localProjectId, saveAsLocalProject, loadLocalProject, deleteLocalProject
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
