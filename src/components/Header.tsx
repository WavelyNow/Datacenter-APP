
import React from 'react';
import { ProjectDetails, ProjectLoadData } from '@/lib/types';
import { Box, Book, Printer, Save, Upload, Layers, Settings, Undo, Redo, FileText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CloudBrowserAction } from './CloudBrowserAction';

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
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
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

    onSaveProject,
    onUndo,
    onRedo,
    canUndo,
    canRedo
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
        <header className="sticky top-0 z-40 w-full mb-0 bg-background/80 backdrop-blur-xl border-b border-border/60 screen-only transition-all duration-300">
            <div className="px-6 h-18 flex items-center justify-between gap-4">

                {/* Left: Project Title Context */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex flex-col min-w-0">
                        <input
                            type="text"
                            value={projectDetails.projectName}
                            onChange={(e) => updateDetail('projectName', e.target.value)}
                            className="bg-transparent border-none p-0 text-base font-bold text-foreground placeholder:text-muted-foreground/50 focus:ring-0 focus:bg-muted/30 rounded px-2 -ml-2 transition-all w-full max-w-[180px] md:max-w-[300px] truncate"
                            placeholder="Project Name"
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground px-0">
                            <span className="font-mono opacity-70">{projectDetails.projectNumber}</span>
                            <span className="opacity-50">•</span>
                            <span className="opacity-70">Rev. {projectDetails.revision}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Tools & Catalogs - Scrollable on very small screens or wrapped? No, keep single line. */}
                <div className="flex items-center gap-2 md:gap-4 shrink-0">

                    {/* Undo/Redo */}
                    <div className="flex items-center gap-0.5 bg-secondary/40 p-1 rounded-xl border border-border/40">
                        <button
                            onClick={onUndo}
                            disabled={!canUndo}
                            className="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-border/40 mx-0.5" />
                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            className="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Quick Catalogs - Hidden on mobile, Icons only on Tablet, Full on Desktop */}
                    <div className="hidden md:flex items-center gap-1 md:gap-2 bg-secondary/40 p-1.5 rounded-xl border border-border/40">
                        <button
                            onClick={onOpenEquipmentCatalog}
                            className="btn btn-ghost btn-sm h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-2 px-2.5"
                            title="Equipment Database"
                        >
                            <Box className="w-4 h-4" />
                            <span className="hidden xl:inline">Equipment</span>
                        </button>
                        <div className="w-px h-4 bg-border/40" />
                        <button
                            onClick={onOpenPipeCatalog}
                            className="btn btn-ghost btn-sm h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-2 px-2.5"
                            title="Pipe Catalog"
                        >
                            <Book className="w-4 h-4" />
                            <span className="hidden xl:inline">Pipes</span>
                        </button>
                        <div className="w-px h-4 bg-border/40" />
                        <button
                            onClick={onOpenProfileCatalog}
                            className="btn btn-ghost btn-sm h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-2 px-2.5"
                            title="Profile Catalog"
                        >
                            <Layers className="w-4 h-4" />
                            <span className="hidden xl:inline">Profiles</span>
                        </button>
                    </div>

                    <div className="h-6 w-px bg-border/40 mx-1 hidden lg:block" />

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <CloudBrowserAction />

                        <button
                            onClick={onOpenSettings}
                            className="btn btn-ghost btn-icon h-10 w-10 text-muted-foreground hover:text-foreground"
                            title="Project Settings"
                        >
                            <Settings className="w-5 h-5 transition-transform hover:rotate-45 duration-500" />
                        </button>

                        <div className="hidden sm:flex items-center border border-border/40 rounded-xl bg-card/50 shadow-sm p-1 gap-0.5" title="Save / Load">
                            <button
                                onClick={onSaveProject}
                                className="btn btn-ghost btn-icon h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-border/40" />
                            <label className="btn btn-ghost btn-icon h-8 w-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted">
                                <Upload className="w-4 h-4" />
                                <input type="file" accept=".json" onChange={loadProject} className="hidden" />
                            </label>
                        </div>

                        <button
                            onClick={onOpenExport}
                            className="btn btn-primary h-10 px-5 gap-2 text-xs font-bold shadow-lg shadow-primary/20 ml-1 md:ml-3"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden lg:inline">Export Raport</span>
                            <span className="lg:hidden">Export</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
