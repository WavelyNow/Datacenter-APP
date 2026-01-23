import React from 'react';
import { ProjectDetails, ProjectLoadData } from '@/lib/types';
import { useTranslation } from '@/context/PreferencesContext';
import { Box, Book, Printer, Save, Upload, Layers, Settings, Undo, Redo } from 'lucide-react';
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

    return (
        <header className="sticky top-0 z-40 w-full mb-0 bg-background/80 backdrop-blur-xl border-b border-border/60 screen-only transition-all duration-300" >
            <div className="px-6 h-18 flex items-center justify-between gap-4">

                {/* Left: Project Title Context */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex flex-col min-w-0">
                        <input
                            type="text"
                            value={projectDetails.projectName}
                            onChange={(e) => updateDetail('projectName', e.target.value)}
                            className="bg-transparent border-none p-0 text-base font-bold text-foreground placeholder:text-muted-foreground/50 focus:ring-0 focus:bg-muted/30 rounded px-2 -ml-2 transition-all w-full max-w-[180px] md:max-w-[300px] truncate"
                            placeholder={t('header.projectNamePlaceholder')}
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground px-0">
                            <span className="font-mono opacity-70">{projectDetails.projectNumber}</span>
                            <span className="opacity-50">•</span>
                            <span className="opacity-70">{t('common.version')} {projectDetails.revision}</span>
                        </div>
                    </div>

                    {/* Command Palette */}
                    <CommandPalette
                        onSave={onSaveProject}
                        onExport={onOpenExport}
                        onSettings={onOpenSettings}
                    />
                </div>

                {/* Right: Tools & Catalogs */}
                <div className="flex items-center gap-2 md:gap-4 shrink-0">

                    {/* Undo/Redo */}
                    <div className="flex items-center gap-0.5 bg-secondary/40 p-1 rounded-xl border border-border/40">
                        <button
                            onClick={onUndo}
                            disabled={!canUndo}
                            className="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={`${t('common.undo')} (Ctrl+Z)`}
                        >
                            <Undo className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-border/40 mx-0.5" />
                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            className="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={`${t('common.redo')} (Ctrl+Y)`}
                        >
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Quick Catalogs */}
                    <div className="hidden md:flex items-center gap-1 md:gap-2 bg-secondary/40 p-1.5 rounded-xl border border-border/40">
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

                    <div className="h-6 w-px bg-border/40 mx-1 hidden lg:block" />

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <CloudBrowserAction />

                        <button
                            onClick={onOpenSettings}
                            className="btn btn-ghost btn-icon h-10 w-10 text-muted-foreground hover:text-foreground"
                            title={t('common.settings')}
                        >
                            <Settings className="w-5 h-5 transition-transform hover:rotate-45 duration-500" />
                        </button>

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
                            className="btn btn-primary h-10 px-5 gap-2 text-xs font-bold shadow-lg shadow-primary/20 ml-1 md:ml-3"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden lg:inline">{t('sidebar.exportRaport')}</span>
                            <span className="lg:hidden">{t('common.export')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </header >
    );
};
