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
    activeTab: 'config' | 'weights' | 'photos';
    setActiveTab: (tab: 'config' | 'weights' | 'photos') => void;
}

const ProjectContext = createContext<ProjectState | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    // 1. Project Details
    const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
        projectName: 'Data Center Cooling',
        projectNumber: '2024-001',
        designer: 'Ing. Popescu',
        location: 'București',
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

    // 5. UI State
    const [activeTab, setActiveTab] = useState<'config' | 'weights' | 'photos'>('config');

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
            safetyMargin
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
                    console.error('Failed to save even without logo:', retryError);
                }
            } else {
                console.error('Failed to save to localStorage:', e);
            }
        }
    }, [projectDetails, segments, equipmentList, fluidType, glycolPercentage, safetyMargin]);

    const value = {
        projectDetails, setProjectDetails,
        segments, setSegments,
        equipmentList, setEquipmentList,
        fluidType, setFluidType,
        glycolPercentage, setGlycolPercentage,
        safetyMargin, setSafetyMargin,
        activeTab, setActiveTab
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
