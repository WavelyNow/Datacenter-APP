import React, { useState, useRef, useEffect } from 'react';
import { ProjectDetails, ProjectLoadData } from '@/lib/types';
import { Box, Book, Printer, Save, Upload, Layers, Undo, Redo, User, ChevronRight, Settings, LogOut, UserCircle } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useProject } from '@/context/ProjectContext';
import { CloudBrowserAction } from './CloudBrowserAction';
import { CommandPalette } from './CommandPalette';
import { Tooltip } from './ui/Tooltip';

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

const HeaderBase: React.FC<HeaderProps> = ({
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
    const { activeTab, setActiveTab } = useUI();
    const { resetProject } = useProject();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateDetail = React.useCallback((field: keyof ProjectDetails, value: string) => {
        onProjectDetailsChange({ ...projectDetails, [field]: value });
    }, [onProjectDetailsChange, projectDetails]);

    const handleLoadProject = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const projectData = JSON.parse(content) as ProjectLoadData;
                onLoadProject(projectData);
            } catch (error) {
                console.error('Failed to parse project file:', error);
                alert('A apărut o eroare la încărcarea fișierului.');
            }
        };
        reader.readAsText(file);
    }, [onLoadProject]);

    // Helper to get readable name for active tab
    const getTabName = React.useCallback((tab: string) => {
        const keys: Record<string, string> = {
            'dashboard': 'Tablou Bord',
            'bim_gallery': 'Galerie BIM',
            'bim': 'Mapare BIM',
            'config': 'Tubulatură & Rutare',
            'hydraulics': 'Hidraulică',
            'energy': 'Sustenabilitate',
            'supports': 'Suporți',
            'weights': 'Calcul Greutăți',
            'costs': 'Estimator Costuri',
            'boq': 'Cantități (BoQ)',
            'checklist': 'Commissioning',
            'catalogs': 'Librărie Tehnică',
            'photos': 'Fotografii Șantier',
            'branding': 'Personalizare Raport',
            'settings': 'Setări',
            'help': 'Ajutor'
        };
        return keys[tab] || tab;
    }, []);

    return (
        <header className="sticky top-0 z-40 w-full mb-0 bg-background/80 backdrop-blur-xl border-b border-border/60 screen-only transition-all duration-300" >
            <div className="px-6 h-18 py-3 flex items-center justify-between gap-4">

                {/* Left: Breadcrumbs & Project Title */}
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        <span>{projectDetails.projectNumber || 'PR-000'}</span>
                        <ChevronRight className="w-3 h-3 opacity-50" />
                        <span className="text-primary">{getTabName(activeTab)}</span>
                    </div>

                    {/* Project Title Input */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={projectDetails.projectName}
                            onChange={(e) => updateDetail('projectName', e.target.value)}
                            className="bg-transparent border-none p-0 text-lg font-bold text-foreground placeholder:text-muted-foreground/50 focus:ring-0 focus:bg-muted/30 rounded px-1 -ml-1 transition-all w-full max-w-[300px] truncate"
                            placeholder="Nume Proiect..."
                        />
                        <CommandPalette
                            onSave={onSaveProject}
                            onExport={onOpenExport}
                            onSettings={onOpenSettings}
                        />
                    </div>
                </div>

                {/* Right: Tools & Catalogs */}
                <div className="flex items-center gap-2 md:gap-4 shrink-0">

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

                    {/* Quick Catalogs */}
                    <div className="hidden xl:flex items-center gap-1 md:gap-2 bg-secondary/40 p-1.5 rounded-xl border border-border/40">
                        <Tooltip content="Catalog Echipamente" side="bottom">
                            <button
                                onClick={onOpenEquipmentCatalog}
                                className="btn btn-ghost btn-sm h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-2 px-2.5"
                            >
                                <Box className="w-4 h-4" />
                                <span className="hidden xl:inline">Echipamente</span>
                            </button>
                        </Tooltip>
                        <div className="w-px h-4 bg-border/40" />
                        <Tooltip content="Catalog Țevi" side="bottom">
                            <button
                                onClick={onOpenPipeCatalog}
                                className="btn btn-ghost btn-sm h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-2 px-2.5"
                            >
                                <Book className="w-4 h-4" />
                                <span className="hidden xl:inline">Țevi</span>
                            </button>
                        </Tooltip>
                        <div className="w-px h-4 bg-border/40" />
                        <Tooltip content="Catalog Profile" side="bottom">
                            <button
                                onClick={onOpenProfileCatalog}
                                className="btn btn-ghost btn-sm h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-2 px-2.5"
                            >
                                <Layers className="w-4 h-4" />
                                <span className="hidden xl:inline">Profile</span>
                            </button>
                        </Tooltip>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <CloudBrowserAction />

                        <div className="hidden sm:flex items-center border border-border/40 rounded-xl bg-card/50 shadow-sm p-1 gap-0.5" title="Salvare / Import">
                            <button
                                onClick={onSaveProject}
                                className="btn btn-ghost btn-icon h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-border/40" />
                            <label className="btn btn-ghost btn-icon h-8 w-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted">
                                <Upload className="w-4 h-4" />
                                <input type="file" accept=".json" onChange={handleLoadProject} className="hidden" />
                            </label>
                        </div>

                        <button
                            onClick={onOpenExport}
                            className="btn btn-primary h-10 w-10 md:w-auto md:px-5 gap-2 text-xs font-bold shadow-lg shadow-primary/20 ml-1 md:ml-3 flex items-center justify-center"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden md:inline">Export Raport</span>
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="h-10 w-10 ml-2 rounded-full bg-linear-to-tr from-primary to-primary/50 p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
                                aria-label="Meniu Utilizator"
                                aria-expanded={isUserMenuOpen}
                                aria-haspopup="true"
                            >
                                <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-card border border-border rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* User Info Header */}
                                    <div className="px-4 py-3 bg-muted/30 border-b border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-linear-to-tr from-primary to-primary/50 p-[2px]">
                                                <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    {projectDetails.designer || 'Utilizator'}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {projectDetails.projectNumber || 'Fără proiect'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                setActiveTab('settings');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                                        >
                                            <UserCircle className="w-4 h-4 text-muted-foreground" />
                                            <span>Profil</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                onOpenSettings();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-muted-foreground" />
                                            <span>Setări</span>
                                        </button>

                                        <div className="my-1 mx-3 border-t border-border/50" />

                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                // There is NO auth/session in the app — a fake "logout"
                                                // would lie to the user. This resets the local project
                                                // (a REAL operation): clears data + cloud link.
                                                if (window.confirm('Resetare proiect: se șterge TOT conținutul proiectului local (inclusiv link-ul cloud). Continuați?')) {
                                                    resetProject();
                                                    setActiveTab('dashboard');
                                                }
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Reset Proiect (Șterge tot)</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header >
    );
};

export const Header = React.memo(HeaderBase);
