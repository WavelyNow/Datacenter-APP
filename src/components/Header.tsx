
import React, { useState } from 'react';
import { ProjectDetails } from '@/lib/types';
import { PdfData } from '@/lib/pdf/types';
import { Box, FileText, MapPin, Printer, Save, Upload, User } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { PipeCatalogModal } from './PipeCatalogModal';

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
    const { segments, equipmentList, fluidType, glycolPercentage, safetyMargin } = useProject();
    const [isDownloading, setIsDownloading] = useState(false);

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
            safetyMargin
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
            // Limit size if needed, but for now just save it
            updateDetail('companyLogo', result);
        };
        reader.readAsDataURL(file);
    };

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            const data: PdfData = {
                projectDetails,
                segments: segments || [],
                equipmentList: equipmentList || [],
                fluidType: fluidType || 'ethylene',
                glycolPercentage: glycolPercentage || 30,
                safetyMargin: safetyMargin || false
            };

            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Generation failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Proiect_${projectDetails.projectName.replace(/\s+/g, '_')}_Rev${projectDetails.revision}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            console.error('PDF Download Error:', error);
            alert(`Eroare la generare PDF: ${error.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const [isCatalogOpen, setIsCatalogOpen] = useState(false);

    return (
        <header className="bg-neutral-900 border-b border-amber-900/30 pt-6 pb-6 px-4 mb-0 shadow-lg relative z-10 screen-only">

            {/* Catalog Modal */}
            <PipeCatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    {/* Brand / Logo Area */}
                    <div className="flex items-center gap-4 group cursor-pointer relative" title="Click to upload logo">
                        <label className="relative block cursor-pointer">
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-1 rounded-xl shadow-lg shadow-orange-900/20 overflow-hidden w-16 h-16 flex items-center justify-center">
                                {projectDetails.companyLogo ? (
                                    <img src={projectDetails.companyLogo} alt="Company Logo" className="w-full h-full object-contain bg-white rounded-lg" />
                                ) : (
                                    <Box className="w-8 h-8 text-black" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-4 h-4 text-white" />
                            </div>
                        </label>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">
                                    Engineering Suite
                                </h1>
                                <button
                                    onClick={() => setIsCatalogOpen(true)}
                                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-500 rounded-lg border border-neutral-700 transition-all hover:scale-105"
                                    title="Open Pipe Catalog"
                                >
                                    <Book className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-amber-500/80 text-xs font-medium tracking-wide flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                HYDRAULIC CALC V2.0
                            </p>
                        </div>
                    </div>

                    {/* Project Metadata Inputs - Unchanged */}
                    <div className="flex-1 w-full lg:w-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-800/50 p-4 rounded-lg border border-neutral-800">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Nume Proiect</label>
                            <div className="relative group">
                                <FileText className="absolute left-2 top-2 w-4 h-4 text-neutral-600 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="text"
                                    value={projectDetails.projectName}
                                    onChange={(e) => updateDetail('projectName', e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded text-sm px-2 py-1.5 pl-8 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-neutral-200"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Locație</label>
                            <div className="relative group">
                                <MapPin className="absolute left-2 top-2 w-4 h-4 text-neutral-600 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="text"
                                    value={projectDetails.location}
                                    onChange={(e) => updateDetail('location', e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded text-sm px-2 py-1.5 pl-8 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-neutral-200"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Proiectant</label>
                            <div className="relative group">
                                <User className="absolute left-2 top-2 w-4 h-4 text-neutral-600 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="text"
                                    value={projectDetails.designer}
                                    onChange={(e) => updateDetail('designer', e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded text-sm px-2 py-1.5 pl-8 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-neutral-200"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">ID Proiect</label>
                                <input
                                    type="text"
                                    value={projectDetails.projectNumber}
                                    onChange={(e) => updateDetail('projectNumber', e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded text-sm px-2 py-1.5 focus:ring-1 focus:ring-amber-500 text-neutral-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Revizie</label>
                                <input
                                    type="text"
                                    value={projectDetails.revision}
                                    onChange={(e) => updateDetail('revision', e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded text-sm px-2 py-1.5 focus:ring-1 focus:ring-amber-500 text-neutral-200 text-center"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions Area */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-bold shadow-lg shadow-amber-900/20 active:transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    Generare...
                                </>
                            ) : (
                                <>
                                    <Printer className="w-4 h-4" />
                                    Download PDF
                                </>
                            )}
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={saveProject}
                                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded text-xs font-medium border border-neutral-700 transition-colors flex items-center justify-center gap-1"
                            >
                                <Save className="w-3 h-3" /> Save
                            </button>
                            <label className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded text-xs font-medium border border-neutral-700 transition-colors flex items-center justify-center gap-1 cursor-pointer">
                                <Upload className="w-3 h-3" /> Load
                                <input type="file" accept=".json" onChange={loadProject} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
