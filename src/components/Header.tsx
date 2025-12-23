
import React, { useState } from 'react';
import { ProjectDetails } from '@/lib/types';
import { PdfData } from '@/lib/pdf/types';
import { Box, Book, FileText, MapPin, Printer, Save, Upload, User, Hash, GitBranch } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { PipeCatalogModal } from './PipeCatalogModal';
import { PdfExportModal } from './PdfExportModal';

interface HeaderProps {
    projectDetails: ProjectDetails;
    onProjectDetailsChange: (details: ProjectDetails) => void;
    onLoadProject: (data: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
    projectDetails,
    onProjectDetailsChange,
    onLoadProject
}) => {
    const { segments, equipmentList, fluidType, glycolPercentage, safetyMargin, safetyMarginPercentage, supportConfig, branding } = useProject();
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const updateDetail = (field: keyof ProjectDetails, value: string) => {
        onProjectDetailsChange({ ...projectDetails, [field]: value });
    };

    const saveProject = () => {
        const data = {
            projectDetails,
            segments,
            equipmentList,
            fluidType,
            glycolPercentage,
            safetyMargin,
            safetyMarginPercentage,
            supportConfig
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project_${projectDetails.projectNumber}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const loadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                onLoadProject(data);
            } catch (error) {
                console.error('Error loading project:', error);
                alert('Eroare la încărcarea fișierului.');
            }
        };
        reader.readAsText(file);
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            updateDetail('companyLogo', result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <header className="relative z-50 pt-6 pb-2 px-4 mb-4 screen-only">
            <PipeCatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />

            <PdfExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={{
                    projectDetails,
                    segments: segments || [],
                    equipmentList: equipmentList || [],
                    fluidType: fluidType || 'ethylene',
                    glycolPercentage: glycolPercentage || 30,
                    safetyMargin: safetyMargin || false,
                    safetyMarginPercentage: safetyMarginPercentage || 5,
                    supportConfig: supportConfig,
                    branding: branding
                }}
            />

            <div className="max-w-7xl mx-auto">
                <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group border border-white/10">
                    {/* Background Decorative Blur */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6 relative z-10">
                        {/* 1. Brand Section */}
                        <div className="flex items-center gap-5 group min-w-fit">
                            <label className="relative block cursor-pointer transition-transform hover:scale-105 duration-300">
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                <div className="bg-slate-800/50 p-2 rounded-2xl shadow-inner border border-white/5 w-16 h-16 flex items-center justify-center backdrop-blur-md">
                                    {projectDetails.companyLogo ? (
                                        <img src={projectDetails.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <Box className="w-8 h-8 text-slate-500" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                    <Upload className="w-5 h-5 text-blue-400" />
                                </div>
                            </label>

                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                    Engineering Suite
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-300">V2.0</span>
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                    <button
                                        className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer font-medium bg-white/5 px-2 py-1 rounded-md hover:bg-white/10"
                                        onClick={() => setIsCatalogOpen(true)}
                                    >
                                        <Book className="w-3.5 h-3.5" />
                                        <span>Catalog Tevi</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Vertical Divider (Desktop) */}
                        <div className="hidden xl:block w-px h-16 bg-white/5 mx-2"></div>

                        {/* 3. Project Info Grid */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
                            {/* Row 1: Main Project Name (Full Width on Mobile, 8 cols on desktop) */}
                            <div className="md:col-span-8 space-y-1">
                                <label className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-1">
                                    <FileText className="w-3 h-3" /> Nume Proiect
                                </label>
                                <input
                                    type="text"
                                    value={projectDetails.projectName}
                                    onChange={(e) => updateDetail('projectName', e.target.value)}
                                    className="w-full input-modern text-sm !bg-slate-900/30 font-medium"
                                    placeholder="ex. Cooling System Data Center"
                                />
                            </div>

                            {/* Row 1: ID (4 cols) */}
                            <div className="md:col-span-4 space-y-1">
                                <label className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-1">
                                    <Hash className="w-3 h-3" /> Project ID
                                </label>
                                <input
                                    type="text"
                                    value={projectDetails.projectNumber}
                                    onChange={(e) => updateDetail('projectNumber', e.target.value)}
                                    className="w-full input-modern text-sm !bg-slate-900/30 font-mono text-blue-300"
                                    placeholder="2024-001"
                                />
                            </div>

                            {/* Row 2: Location (5 cols) */}
                            <div className="md:col-span-5 space-y-1">
                                <label className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-1">
                                    <MapPin className="w-3 h-3" /> Locație
                                </label>
                                <input
                                    type="text"
                                    value={projectDetails.location}
                                    onChange={(e) => updateDetail('location', e.target.value)}
                                    className="w-full input-modern text-xs !py-2 !bg-slate-900/30 text-slate-300"
                                    placeholder="București, Sector 1"
                                />
                            </div>

                            {/* Row 2: Beneficiary (NEW - 4 cols) */}
                            <div className="md:col-span-4 space-y-1">
                                <label className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-1">
                                    <User className="w-3 h-3" /> Beneficiar
                                </label>
                                <input
                                    type="text"
                                    value={projectDetails.beneficiary || ''}
                                    onChange={(e) => updateDetail('beneficiary', e.target.value)}
                                    className="w-full input-modern text-xs !py-2 !bg-slate-900/30 text-slate-300"
                                    placeholder="ex. Spitalul Municipal"
                                />
                            </div>

                            {/* Row 2: Designer (4 cols) */}
                            <div className="md:col-span-4 space-y-1">
                                <label className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-1">
                                    <User className="w-3 h-3" /> Proiectant
                                </label>
                                <input
                                    type="text"
                                    value={projectDetails.designer}
                                    onChange={(e) => updateDetail('designer', e.target.value)}
                                    className="w-full input-modern text-xs !py-2 !bg-slate-900/30 text-slate-300"
                                    placeholder="Ing. Popescu Ion"
                                />
                            </div>

                            {/* Row 2: Revision (1 col) */}
                            <div className="md:col-span-1 space-y-1">
                                <label className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-1">
                                    <GitBranch className="w-3 h-3" /> Rev
                                </label>
                                <input
                                    type="text"
                                    value={projectDetails.revision}
                                    onChange={(e) => updateDetail('revision', e.target.value)}
                                    className="w-full input-modern text-xs text-center !py-2 !bg-slate-900/30 font-bold"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* 4. Vertical Divider (Desktop) */}
                        <div className="hidden xl:block w-px h-16 bg-white/5 mx-2"></div>

                        {/* 5. Actions */}
                        <div className="flex xl:flex-col gap-2 min-w-[140px]">
                            <button
                                onClick={() => setIsExportModalOpen(true)}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 group text-sm"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Export PDF</span>
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={saveProject}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-2 rounded-lg text-[10px] font-bold border border-white/5 transition-all flex items-center justify-center gap-1"
                                    title="Save JSON"
                                >
                                    <Save className="w-3 h-3" /> SAVE
                                </button>
                                <label className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-2 rounded-lg text-[10px] font-bold border border-white/5 transition-all flex items-center justify-center gap-1 cursor-pointer" title="Load JSON">
                                    <Upload className="w-3 h-3" /> LOAD
                                    <input type="file" accept=".json" onChange={loadProject} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
