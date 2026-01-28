import React from 'react';
import { ProjectDetails, ProjectLoadData } from '@/lib/types';
import { useTranslation } from '@/context/PreferencesContext';
import { Box, Book, Printer, Save, Upload, Layers, Undo, Redo } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { User, ChevronRight } from 'lucide-react';
import { CloudBrowserAction } from './CloudBrowserAction';
import { CommandPalette } from './CommandPalette';

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
    const { t } = useTranslation();
    const { activeTab } = useProject();

    const updateDetail = (field: keyof ProjectDetails, value: string) => {
        onProjectDetailsChange({ ...projectDetails, [field]: value });
    };

    const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                alert(t('common.error'));
            }
        };
        reader.readAsText(file);
    };

    // Helper to get readable name for active tab
    const getTabName = (tab: string) => {
        const keys: Record<string, string> = {
            'dashboard': t('sidebar.dashboard'),
            'bim_gallery': t('sidebar.bimGallery'),
            'bim': t('sidebar.ifcMapping'),
            'config': t('sidebar.pipingRouting'),
            'hydraulics': t('sidebar.hydraulics'),
            'energy': t('sidebar.sustainability'),
            'supports': t('sidebar.supports'),
            'weights': t('sidebar.loadCalc'),
            'costs': t('sidebar.costEstimator'),
            'boq': t('sidebar.quantities'),
            'checklist': t('sidebar.commissioning'),
            'catalogs': t('sidebar.techLibrary'),
            'photos': t('sidebar.sitePhotos'),
            'branding': t('sidebar.reportBranding'),
            'settings': t('common.settings'),
            'help': t('common.help')
        };
        return keys[tab] || tab;
    };

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
                            placeholder={t('header.projectNamePlaceholder')}
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
                            title={`${t('common.undo')} (Ctrl+Z)`}
                        >
                            <Undo className="w-4 h-4" />
                        </button>
                        <div className="w-px h-3 bg-border/40 mx-0.5" />
                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={`${t('common.redo')} (Ctrl+Y)`}
                        >
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Quick Catalogs */}
                    <div className="hidden xl:flex items-center gap-1 md:gap-2 bg-secondary/40 p-1.5 rounded-xl border border-border/40">
                        <button
                            onClick={onOpenEquipmentCatalog}
                            className="btn btn-ghost btn-sm h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-2 px-2.5"
                            title="Equipment Database"
                        >
                            <Box className="w-4 h-4" />
                            <span className="hidden xl:inline">{t('header.equipment')}</span>
                        </button>
                        <div className="w-px h-4 bg-border/40" />
                        <button
                            onClick={onOpenPipeCatalog}
                            className="btn btn-ghost btn-sm h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-2 px-2.5"
                            title="Pipe Catalog"
                        >
                            <Book className="w-4 h-4" />
                            <span className="hidden xl:inline">{t('header.pipes')}</span>
                        </button>
                        <div className="w-px h-4 bg-border/40" />
                        <button
                            onClick={onOpenProfileCatalog}
                            className="btn btn-ghost btn-sm h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-background gap-2 px-2.5"
                            title="Profile Catalog"
                        >
                            <Layers className="w-4 h-4" />
                            <span className="hidden xl:inline">{t('header.profiles')}</span>
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <CloudBrowserAction />

                        <div className="hidden sm:flex items-center border border-border/40 rounded-xl bg-card/50 shadow-sm p-1 gap-0.5" title={`${t('common.save')} / ${t('common.import')}`}>
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
                            <span className="hidden md:inline">{t('sidebar.exportRaport')}</span>
                        </button>

                        {/* User Avatar Placeholder */}
                        <div className="h-10 w-10 ml-2 rounded-full bg-gradient-to-tr from-primary to-primary/50 p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-md">
                            <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header >
    );
};
