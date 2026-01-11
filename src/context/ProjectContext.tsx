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
    activeTab: 'config' | 'supports' | 'weights' | 'photos' | 'branding';
    setActiveTab: (tab: 'config' | 'supports' | 'weights' | 'photos' | 'branding') => void;
    supportConfig: SupportConfig;
    setSupportConfig: (config: Partial<SupportConfig>) => void;
    branding: BrandingConfig;
    setBranding: (config: Partial<BrandingConfig>) => void;
}

const ProjectContext = createContext<ProjectState | undefined>(undefined);

// Helper function to initialize state from localStorage
const initializeFromStorage = (): Partial<ProjectState> => {
    if (typeof window === 'undefined') return {};
    
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
    // Get saved data once
    const savedData = typeof window !== 'undefined' ? initializeFromStorage() : {};
    
    // 1. Project Details - with lazy initialization
    const [projectDetails, setProjectDetails] = useState<ProjectDetails>(() => {
        return savedData.projectDetails || {
            projectName: 'Data Center Cooling',
            projectNumber: '2024-001',
            designer: 'Ing. Popescu',
            location: 'București',
            beneficiary: '-',
            date: new Date().toISOString().split('T')[0],
            revision: 'A',
        };
    });

    // 2. Pipe Segments - with lazy initialization
    const [segments, setSegments] = useState<PipeSegment[]>(() => {
        return savedData.segments || [];
    });

    // 3. Equipment - with lazy initialization
    const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(() => {
        return savedData.equipmentList || [];
    });

    // 4. Fluid Configuration - with lazy initialization
    const [fluidType, setFluidType] = useState<FluidType>(() => {
        return savedData.fluidType || 'ethylene';
    });
    
    const [glycolPercentage, setGlycolPercentage] = useState<number>(() => {
        return typeof savedData.glycolPercentage === 'number' ? savedData.glycolPercentage : 30;
    });
    
    const [safetyMargin, setSafetyMargin] = useState<boolean>(() => {
        return typeof savedData.safetyMargin === 'boolean' ? savedData.safetyMargin : true;
    });
    
    const [safetyMarginPercentage, setSafetyMarginPercentage] = useState<number>(() => {
        return typeof savedData.safetyMarginPercentage === 'number' ? savedData.safetyMarginPercentage : 5;
    });

    const [supportConfig, setSupportConfig] = useState<SupportConfig>(() => {
        const defaultConfig: SupportConfig = {
            spacing: 2.5,
            mountingType: 'suspended',
            height: 1.5,
            pipesPerSupport: 1,
            insulationThickness: 30,
            insulationDensity: 100,
            addLeftConsole: false,
            addRightConsole: false,
            addUpperRail: false
        };
        return savedData.supportConfig ? { ...defaultConfig, ...savedData.supportConfig } : defaultConfig;
    });

    const [branding, setBranding] = useState<BrandingConfig>(() => {
        const defaultBranding: BrandingConfig = {
            primaryColor: '#3b82f6',
            accentColor: '#10b981',
            pdfTheme: 'modern'
        };
        return savedData.branding ? { ...defaultBranding, ...savedData.branding } : defaultBranding;
    });

    // 5. UI State
    const [activeTab, setActiveTab] = useState<'config' | 'supports' | 'weights' | 'photos' | 'branding'>('config');

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
