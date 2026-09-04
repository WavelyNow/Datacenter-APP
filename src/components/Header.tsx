import React, { useState, useEffect } from 'react';
import { ProjectDetails } from '@/lib/types';
import { Menu, Printer, Save, Upload, Undo, Redo, ChevronRight, Settings, CheckCircle2 } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useProject } from '@/context/ProjectContext';
import { CommandPalette } from './CommandPalette';

interface HeaderProps {
    projectDetails: ProjectDetails;
    onProjectDetailsChange: (details: ProjectDetails) => void;
    onLoadProjectFile: (file: File) => void;
    // Actions
    onOpenExport: () => void;
    onOpenSettings: () => void;
    onOpenNavigation: () => void;
    onSaveProject: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const HeaderBase: React.FC<HeaderProps> = ({
    projectDetails,
    onProjectDetailsChange,
    onLoadProjectFile,
    onOpenExport,
    onOpenSettings,
    onOpenNavigation,
    onSaveProject,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}) => {
    const { activeTab } = useUI();
    const { isProjectDirty } = useProject();
    // Feedback discret: "Salvat local" după autosave
    const [savedFlash, setSavedFlash] = useState(false);
    useEffect(() => {
        const handler = () => {
            setSavedFlash(true);
            setTimeout(() => setSavedFlash(false), 1600);
        };
        window.addEventListener('opencode:project-saved', handler);
        return () => window.removeEventListener('opencode:project-saved', handler);
    }, []);

    const updateDetail = React.useCallback((field: keyof ProjectDetails, value: string) => {
        onProjectDetailsChange({ ...projectDetails, [field]: value });
    }, [onProjectDetailsChange, projectDetails]);

    const handleLoadProject = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        onLoadProjectFile(file);
        event.target.value = '';
    }, [onLoadProjectFile]);

    // Helper to get readable name for active tab
    const getTabName = React.useCallback((tab: string) => {
        const keys: Record<string, string> = {
            'dashboard': 'Tablou Bord',
            'bim_gallery': 'Galerie BIM 3D',
            'config': 'Dimensionare Conducte',
            'hydraulics': 'Hidraulică',
            'supports': 'Suporți',
            'weights': 'Calcul Greutăți',
            'pipe-standards': 'Standarde Țevi',
            'photos': 'Fotografii Șantier',
            'branding': 'Personalizare Raport',
            'normative': 'Normative',
            'architecture_spec': 'Asistent Specificații',
            'settings': 'Setări',
            'help': 'Ajutor'
        };
        return keys[tab] || tab;
    }, []);

    return (
        <header className="sticky top-0 z-40 w-full mb-0 bg-background/70 backdrop-blur-xl border-b border-border/50 screen-only transition-all duration-200" >
            <div className="flex h-16 items-center justify-between gap-1 px-2 sm:gap-4 sm:px-5">

                <button
                    type="button"
                    onClick={onOpenNavigation}
                    className="btn btn-ghost btn-icon h-10 w-10 shrink-0 rounded-xl lg:hidden"
                    aria-label="Deschide meniul de navigare"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Left: Breadcrumbs & Project Title */}
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        <span className="hidden sm:inline">{projectDetails.projectNumber || 'PR-000'}</span>
                        <ChevronRight className="w-3 h-3 opacity-50" />
                        <span className="text-primary">{getTabName(activeTab)}</span>
                        {isProjectDirty ? (
                            <span className="ml-1.5 inline-flex items-center gap-1 text-amber-600 text-[9px] font-bold animate-in fade-in duration-200">
                                Modificări nesalvate
                            </span>
                        ) : savedFlash && (
                            <span className="ml-1.5 inline-flex items-center gap-1 text-emerald-600 text-[9px] font-bold animate-in fade-in zoom-in-95 duration-200">
                                <CheckCircle2 className="w-3 h-3" /> Salvat local
                            </span>
                        )}
                    </div>

                    {/* Project Title Input */}
                    <div className="flex min-w-0 items-center gap-2">
                        <input
                            type="text"
                            value={projectDetails.projectName}
                            onChange={(e) => updateDetail('projectName', e.target.value)}
                            className="-ml-1 w-full max-w-[300px] truncate rounded bg-transparent px-1 p-0 text-base font-bold text-foreground placeholder:text-muted-foreground/50 focus:bg-muted/30 focus:ring-0 sm:text-lg"
                            placeholder="Nume Proiect..."
                        />
                        <div className="hidden sm:block">
                            <CommandPalette
                                onSave={onSaveProject}
                                onExport={onOpenExport}
                                onSettings={onOpenSettings}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Tools & Catalogs */}
                <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">

                    {/* Undo/Redo */}
                    <div className="hidden lg:flex items-center gap-0.5 bg-secondary/40 p-1 rounded-xl border border-border/40">
                        <button
                            onClick={onUndo}
                            disabled={!canUndo}
                            className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Anulare (Ctrl+Z)"
                        >
                            <Undo className="w-4 h-4" />
                        </button>
                        <div className="w-px h-3 bg-border/40 mx-0.5" />
                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Refacere (Ctrl+Y)"
                        >
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Quick Catalogs — REMOVED (încărcau header-ul; catalogul e acum în sidebar: „Standarde Țevi" + galeria 3D) */}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="hidden sm:flex items-center border border-border/40 rounded-xl bg-card/50 shadow-sm p-1 gap-0.5" title="Salvare / Import">
                            <button
                                onClick={onSaveProject}
                                aria-label="Salvează proiectul local"
                                className="btn btn-ghost btn-icon h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-border/40" />
                            <label className="btn btn-ghost btn-icon h-8 w-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted" aria-label="Încarcă proiect local">
                                <Upload className="w-4 h-4" />
                                <input type="file" accept=".json" onChange={handleLoadProject} className="hidden" />
                            </label>
                        </div>

                        <button
                            onClick={onOpenExport}
                            aria-label="Exportă raportul"
                            className="btn btn-primary h-10 w-10 md:w-auto md:px-5 gap-2 text-xs font-bold shadow-lg shadow-primary/20 ml-1 md:ml-3 flex items-center justify-center"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden md:inline">Export Raport</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenSettings}
                            aria-label="Deschide setările"
                            title="Setări"
                            className="btn btn-ghost btn-icon h-10 w-10 ml-1 text-muted-foreground hover:text-foreground"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </header >
    );
};

export const Header = React.memo(HeaderBase);
