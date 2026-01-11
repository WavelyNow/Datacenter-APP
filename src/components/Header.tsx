
import React, { useState } from 'react';
import { ProjectDetails, ProjectLoadData } from '@/lib/types';
import { Box, Book, Printer, Save, Upload, Layers, Sparkles, Settings, GitBranch, ChevronRight } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { PipeCatalogModal } from './PipeCatalogModal';
import { ExportModal } from './ExportModal';
import { PdfWizardModal } from './PdfWizardModal';
import { ProfileCatalogModal } from './ProfileCatalogModal';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
    projectDetails: ProjectDetails;
    onProjectDetailsChange: (details: ProjectDetails) => void;
    onLoadProject: (data: ProjectLoadData) => void;
    // Actions
    onOpenPipeCatalog: () => void;
    onOpenProfileCatalog: () => void;
    onOpenEquipmentCatalog: () => void;
    onOpenExport: () => void;
    onOpenSettings: () => void;
    onSaveProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    projectDetails,
    onProjectDetailsChange,
    onLoadProject,
    onOpenPipeCatalog,
    onOpenProfileCatalog,
    onOpenEquipmentCatalog,
    onOpenExport,
    onOpenSettings,
    onSaveProject
}) => {

    const updateDetail = (field: keyof ProjectDetails, value: string) => {
        onProjectDetailsChange({ ...projectDetails, [field]: value });
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

    return (
        <header className="sticky top-0 z-40 w-full mb-0 bg-background/80 backdrop-blur-md border-b border-border screen-only transition-all duration-300">
            <div className="spacing-page h-16 flex items-center justify-between gap-4">

                {/* Left: Project Title Context */}
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex flex-col">
                        <input
                            type="text"
                            value={projectDetails.projectName}
                            onChange={(e) => updateDetail('projectName', e.target.value)}
                            className="bg-transparent border-none p-0 text-base font-bold text-foreground placeholder:text-muted-foreground/50 focus:ring-0 focus:bg-muted/30 rounded px-2 -ml-2 transition-all w-64 truncate"
                            placeholder="Project Name"
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground px-0">
                            <span className="font-mono">{projectDetails.projectNumber}</span>
                            <span>•</span>
                            <span>Rev. {projectDetails.revision}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Tools & Catalogs */}
                <div className="flex items-center gap-3 shrink-0">

                    {/* Quick Catalogs */}
                    <div className="flex items-center gap-2 mr-2 bg-secondary/50 p-1.5 rounded-xl border border-border/50">
                        <button
                            onClick={onOpenEquipmentCatalog}
                            className="btn btn-ghost btn-sm h-7 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-1.5 px-3"
                            title="Open Equipment Database"
                        >
                            <Box className="w-3.5 h-3.5" />
                            Equipment
                        </button>
                        <div className="w-px h-4 bg-border/50" />
                        <button
                            onClick={onOpenPipeCatalog}
                            className="btn btn-ghost btn-sm h-7 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-1.5 px-3"
                            title="Open Pipe Catalog"
                        >
                            <Book className="w-3.5 h-3.5" />
                            Pipes
                        </button>
                        <div className="w-px h-4 bg-border/50" />
                        <button
                            onClick={onOpenProfileCatalog}
                            className="btn btn-ghost btn-sm h-7 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-1.5 px-3"
                            title="Open Profile Catalog"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Profiles
                        </button>
                    </div>

                    <div className="h-5 w-px bg-border mx-1 hidden lg:block" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        <button
                            onClick={onOpenSettings}
                            className="btn btn-ghost btn-icon h-9 w-9 text-muted-foreground hover:text-foreground"
                            title="Project Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>

                        <div className="flex items-center border border-border rounded-lg bg-card shadow-sm p-0.5" title="Save / Load">
                            <button
                                onClick={onSaveProject}
                                className="btn btn-ghost btn-icon h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-border mx-0.5" />
                            <label className="btn btn-ghost btn-icon h-8 w-8 rounded-md cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted">
                                <Upload className="w-4 h-4" />
                                <input type="file" accept=".json" onChange={loadProject} className="hidden" />
                            </label>
                        </div>

                        <button
                            onClick={onOpenExport}
                            className="btn btn-primary h-9 px-4 gap-2 text-xs font-bold shadow-lg shadow-primary/20 ml-2"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
