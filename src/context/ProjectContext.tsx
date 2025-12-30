'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PipeSegment, EquipmentItem, ProjectDetails, FluidType } from '@/lib/types';

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
    supportConfig: {
        spacing: number;
        mountingType: 'concrete' | 'suspended';
        height: number;
        pipesPerSupport: number;
        insulationThickness: number;
        insulationDensity: number;
    };
    setSupportConfig: (config: any) => void;
    branding: {
        primaryColor: string;
        accentColor: string;
        pdfTheme: 'modern' | 'classic' | 'industrial';
    };
    setBranding: (config: any) => void;
}

const ProjectContext = createContext<ProjectState | undefined>(undefined);

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

    const [supportConfig, setSupportConfig] = useState({
        spacing: 2.5,
        mountingType: 'suspended' as 'concrete' | 'suspended',
        height: 1.5,
        pipesPerSupport: 1,
        insulationThickness: 30, // Default 30mm
        insulationDensity: 100   // Default 100kg/m3
    });

    const [branding, setBranding] = useState({
        primaryColor: '#3b82f6',
        accentColor: '#10b981',
        pdfTheme: 'modern' as 'modern' | 'classic' | 'industrial'
    });

    // 5. UI State
    const [activeTab, setActiveTab] = useState<'config' | 'supports' | 'weights' | 'photos' | 'branding'>('config');

    // Persistence Logic (Load on Mount)
    useEffect(() => {
        const saved = localStorage.getItem('hydraulic_calc_project_v2');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.projectDetails) setProjectDetails(data.projectDetails);
                if (data.segments) setSegments(data.segments);
                if (data.equipmentList) setEquipmentList(data.equipmentList);
                if (data.fluidType) setFluidType(data.fluidType);
                if (typeof data.glycolPercentage === 'number') setGlycolPercentage(data.glycolPercentage);
                if (typeof data.safetyMargin === 'boolean') setSafetyMargin(data.safetyMargin);
                if (typeof data.safetyMarginPercentage === 'number') setSafetyMarginPercentage(data.safetyMarginPercentage);
                if (data.supportConfig) {
                    setSupportConfig(prev => ({ ...prev, ...data.supportConfig }));
                }
                if (data.branding) {
                    setBranding(prev => ({ ...prev, ...data.branding }));
                }
            } catch (e) {
                console.error('Failed to load project:', e);
            }
        }
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
        } catch (e: any) {
            if (e.name === 'QuotaExceededError') {
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
                } catch (retryError) {
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

    const value = {
        projectDetails, setProjectDetails,
        segments, setSegments,
        equipmentList, setEquipmentList,
        fluidType, setFluidType,
        glycolPercentage, setGlycolPercentage,
        safetyMargin, setSafetyMargin,
        safetyMarginPercentage, setSafetyMarginPercentage,
        activeTab, setActiveTab,
        supportConfig, setSupportConfig,
        branding, setBranding
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
