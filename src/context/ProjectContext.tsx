'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PipeSegment, EquipmentItem, ProjectDetails, FluidType, SupportConfig, BrandingConfig } from '@/lib/types';

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
    // 1. Project Details
    const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
        projectName: 'Data Center Cooling',
        projectNumber: '2024-001',
        designer: 'Ing. Popescu',
        location: 'București',
        beneficiary: '-',
        date: new Date().toISOString().split('T')[0],
        revision: 'A',
    });

    // 2. Pipe Segments
    const [segments, setSegments] = useState<PipeSegment[]>([]);

    // 3. Equipment
    const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);

    // 4. Fluid Configuration
    const [fluidType, setFluidType] = useState<FluidType>('ethylene');

    const [glycolPercentage, setGlycolPercentage] = useState<number>(30);

    const [safetyMargin, setSafetyMargin] = useState<boolean>(true);

    const [safetyMarginPercentage, setSafetyMarginPercentage] = useState<number>(5);

    const [supportConfig, setSupportConfig] = useState<SupportConfig>({
        spacing: 2.5,
        mountingType: 'suspended',
        height: 1.5,
        pipesPerSupport: 1,
        insulationThickness: 30,
        insulationDensity: 100,
        addLeftConsole: false,
        addRightConsole: false,
        addUpperRail: false
    });

    const [branding, setBranding] = useState<BrandingConfig>({
        primaryColor: '#3b82f6',
        accentColor: '#10b981',
        pdfTheme: 'modern'
    });

    // 5. UI State
    const [activeTab, setActiveTab] = useState<'config' | 'supports' | 'weights' | 'photos' | 'branding' | 'catalogs'>('config');

    // Load saved data on client-side only
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = loadFromStorage();
        if (saved.projectDetails) setProjectDetails(saved.projectDetails);
        if (saved.segments) setSegments(saved.segments);
        if (saved.equipmentList) setEquipmentList(saved.equipmentList);
        if (saved.fluidType) setFluidType(saved.fluidType);
        if (saved.glycolPercentage !== undefined) setGlycolPercentage(saved.glycolPercentage);
        if (saved.safetyMargin !== undefined) setSafetyMargin(saved.safetyMargin);
        if (saved.safetyMarginPercentage !== undefined) setSafetyMarginPercentage(saved.safetyMarginPercentage);
        if (saved.supportConfig) setSupportConfig(prev => ({ ...prev, ...saved.supportConfig }));
        if (saved.branding) setBranding(prev => ({ ...prev, ...saved.branding }));
    }, []);

    // Persistence Logic (Save on Change)
    useEffect(() => {
        const data = {
            projectDetails,
            segments,
            equipmentList,
            fluidType,
            glycolPercentage,
            safetyMargin,
            safetyMarginPercentage,
            supportConfig,
            branding
        };
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
                            equipmentList: equipmentList.map(item => ({ ...item, photos: undefined, proofImage: undefined }))
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
    }, [projectDetails, segments, equipmentList, fluidType, glycolPercentage, safetyMargin, safetyMarginPercentage, supportConfig, branding]);

    // Wrapper functions to handle partial updates
    const handleSetSupportConfig = (config: Partial<SupportConfig>) => {
        setSupportConfig(prev => ({ ...prev, ...config }));
    };

    const handleSetBranding = (config: Partial<BrandingConfig>) => {
        setBranding(prev => ({ ...prev, ...config }));
    };

    const value = {
        projectDetails, setProjectDetails,
        segments, setSegments,
        equipmentList, setEquipmentList,
        fluidType, setFluidType,
        glycolPercentage, setGlycolPercentage,
        safetyMargin, setSafetyMargin,
        safetyMarginPercentage, setSafetyMarginPercentage,
        activeTab, setActiveTab,
        supportConfig, setSupportConfig: handleSetSupportConfig,
        branding, setBranding: handleSetBranding
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
