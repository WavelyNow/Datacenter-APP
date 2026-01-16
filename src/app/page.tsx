'use client';

import React, { useState } from 'react';
import { ProjectProvider, useProject } from '@/context/ProjectContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { PipeManager } from '@/components/PipeManager';
import { EquipmentManager } from '@/components/EquipmentManager';
import { FluidComposition } from '@/components/FluidComposition';
import { SupportManager } from '@/components/SupportManager';
import { BrandingManager } from '@/components/BrandingManager';
import { PipeCatalogModal } from '@/components/PipeCatalogModal';
import { ProfileCatalogModal } from '@/components/ProfileCatalogModal';
import { ProjectSettingsModal } from '@/components/ProjectSettingsModal';
import { CatalogManager } from '@/components/CatalogManager';
import { ExportModal } from '@/components/ExportModal';  // Unified Export
import { Dashboard } from '@/components/Dashboard';
import { BimPage } from '@/components/BimPage';
import { EnergyPage } from '@/components/EnergyPage';
import { HelpPage } from '@/components/HelpPage';
import { CostEstimator } from '@/components/CostEstimator';
import { CommissioningChecklist } from '@/components/CommissioningChecklist';
// Note: PdfWizardModal is now internal or accessed via ExportModal if needed, 
// but user requested SINGLE export button. We'll use ExportModal for now which allows reports.
// Actually, let's keep ExportModal as the main entry.

import {
  Scale,
  Camera,
} from 'lucide-react';

const DashboardContent = () => {
  const {
    activeTab,
    setActiveTab,
    segments,
    setSegments,
    equipmentList,
    setEquipmentList,
    setProjectDetails,
    projectDetails,
    setFluidType,
    setGlycolPercentage,
    setSafetyMargin,
    fluidType,
    glycolPercentage,
    safetyMargin,
    safetyMarginPercentage,
    supportConfig,
    branding,
    isInitialized,
    undo, redo, canUndo, canRedo
  } = useProject();

  // Modal States
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isProfileCatalogOpen, setIsProfileCatalogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);



  // File Handlers - defined before keyboard shortcuts effect
  const saveProject = React.useCallback(() => {
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
  }, [projectDetails, segments, equipmentList, fluidType, glycolPercentage, safetyMargin, safetyMarginPercentage, supportConfig]);

  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S / Ctrl+S - Save project
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
      // Cmd+E / Ctrl+E - Export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setIsExportOpen(true);
      }
      // Undo: Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (((e.metaKey || e.ctrlKey) && e.key === 'y') || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject]);

  // Auto-save to localStorage every 30 seconds
  React.useEffect(() => {
    const autoSaveData = {
      projectDetails,
      segments,
      equipmentList,
      fluidType,
      glycolPercentage,
      safetyMargin,
      safetyMarginPercentage,
      supportConfig
    };
    try {
      localStorage.setItem('datacenter_autosave', JSON.stringify(autoSaveData));
    } catch (e) {
      console.warn('Autosave failed:', e);
    }
  }, [projectDetails, segments, equipmentList, fluidType, glycolPercentage, safetyMargin, safetyMarginPercentage, supportConfig]);

  const loadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.segments) setSegments(data.segments);
        if (data.equipmentList) setEquipmentList(data.equipmentList);
        if (data.projectDetails) setProjectDetails(data.projectDetails);
        if (data.fluidType) setFluidType(data.fluidType);
        if (typeof data.glycolPercentage === 'number') setGlycolPercentage(data.glycolPercentage);
        if (typeof data.safetyMargin === 'boolean') setSafetyMargin(data.safetyMargin);
      } catch (error) {
        console.error('Error loading project:', error);
        alert('Eroare la încărcarea fișierului.');
      }
    };
    reader.readAsText(file);
  };


  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">Initializing Engineering Suite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">

      {/* 1. Global Modals (Rendered at root for Portal stability) */}
      <PipeCatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
      <ProfileCatalogModal isOpen={isProfileCatalogOpen} onClose={() => setIsProfileCatalogOpen(false)} />
      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projectDetails={projectDetails}
        onProjectDetailsChange={setProjectDetails}
      />
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
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


      {/* 2. Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projectDetails={projectDetails}
        onSettingsOpen={() => setIsSettingsOpen(true)}
        onExportOpen={() => setIsExportOpen(true)}
        onSave={saveProject}
        onLoad={loadProject}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Header (Top Bar) */}
        <Header
          projectDetails={projectDetails}
          onProjectDetailsChange={setProjectDetails}
          onLoadProject={(data) => {
            if (data.segments) setSegments(data.segments);
            if (data.equipmentList) setEquipmentList(data.equipmentList);
            if (data.projectDetails) setProjectDetails(data.projectDetails);
            if (data.fluidType) setFluidType(data.fluidType);
            if (typeof data.glycolPercentage === 'number') setGlycolPercentage(data.glycolPercentage);
            if (typeof data.safetyMargin === 'boolean') setSafetyMargin(data.safetyMargin);
          }}
          onOpenPipeCatalog={() => setIsCatalogOpen(true)}
          onOpenProfileCatalog={() => setIsProfileCatalogOpen(true)}
          onOpenEquipmentCatalog={() => setActiveTab('catalogs')}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSaveProject={saveProject}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <div className="flex-1 overflow-y-auto scroll-smooth pb-32">
          {activeTab === 'dashboard' ? (
            <Dashboard />
          ) : (
            <div className="spacing-page py-8">

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards ease-out">

                {/* Tab 1: Configuration & Volume */}
                {activeTab === 'config' && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Left: Input */}
                    <div className="xl:col-span-8 space-y-8">
                      <PipeManager
                        segments={segments}
                        onSegmentsChange={setSegments}
                        fluidType={fluidType}
                        glycolPercentage={glycolPercentage}
                      />
                      <EquipmentManager
                        equipmentList={equipmentList}
                        onEquipmentChange={setEquipmentList}
                        viewMode="volume"
                      />
                      <FluidComposition />
                    </div>

                    {/* Right: Results Sticky */}
                    <div className="xl:col-span-4">
                      <div className="sticky top-8 space-y-6">
                        <ResultsDisplay />

                        {/* Helper Card */}
                        <div className="card-premium p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/50">
                          <h4 className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            System Status
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Sistemul calculează automat volumul total incluzând o rezervă de siguranță.
                            Verificați diametrele nominale înainte de export.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Supports */}
                {activeTab === 'supports' && (
                  <div className="max-w-5xl mx-auto">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">Dimensionare Suporți</h2>
                      <p className="text-muted-foreground">Calculul necesarului de materiale pentru prinderi.</p>
                    </div>
                    <SupportManager />
                  </div>
                )}

                {/* Tab 3: Weights */}
                {activeTab === 'weights' && (
                  <div className="max-w-5xl mx-auto">
                    <div className="card-premium p-8 relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/50">
                          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-inner">
                            <Scale className="w-6 h-6 text-foreground" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">Gestionare Greutăți</h2>
                            <p className="text-muted-foreground text-sm mt-1">Introduceți greutatea proprie a echipamentelor.</p>
                          </div>
                        </div>
                        <EquipmentManager
                          equipmentList={equipmentList}
                          onEquipmentChange={setEquipmentList}
                          viewMode="weights"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Photos */}
                {activeTab === 'photos' && (
                  <div className="max-w-5xl mx-auto">
                    <div className="card-premium p-8 relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/50">
                          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-inner">
                            <Camera className="w-6 h-6 text-foreground" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">Documentație Vizuală</h2>
                            <p className="text-muted-foreground text-sm mt-1">Încărcați fotografii pentru raportul tehnic.</p>
                          </div>
                        </div>
                        <EquipmentManager
                          equipmentList={equipmentList}
                          onEquipmentChange={setEquipmentList}
                          viewMode="photos"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: Branding */}
                {activeTab === 'branding' && (
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">Identitate Vizuală</h2>
                      <p className="text-muted-foreground">Personalizați aspectul rapoartelor generate.</p>
                    </div>
                    <BrandingManager />
                  </div>
                )}

                {/* Tab 6: Catalogs (New) */}
                {activeTab === 'catalogs' && (
                  <CatalogManager />
                )}

                {/* Tab 7: BIM (New) */}
                {/* Tab 7: BIM (New) */}
                {activeTab === 'bim' && (
                  <div className="h-full px-6 py-6">
                    <BimPage />
                  </div>
                )}

                {/* Tab 8: Energy (New) */}
                {activeTab === 'energy' && (
                  <EnergyPage />
                )}

                {/* Tab 9: Cost Estimator */}
                {activeTab === 'costs' && (
                  <CostEstimator />
                )}

                {/* Tab 10: Commissioning Checklist */}
                {activeTab === 'checklist' && (
                  <CommissioningChecklist />
                )}

                {activeTab === 'help' && (
                  <HelpPage />
                )}


              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function Home() {
  return (
    <ProjectProvider>
      <DashboardContent />
    </ProjectProvider>
  );
}
