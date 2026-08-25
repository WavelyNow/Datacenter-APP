'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ProjectProvider, useProject } from '@/context/ProjectContext';
import { UIProvider, useUI } from '@/context/UIContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { PipeStandardsPage } from '@/components/PipeStandardsPage';
import { DesignWizard } from '@/components/DesignWizard';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { PageTransition } from '@/components/ui/PageTransition';
import { TableSkeleton } from '@/components/ui/Skeleton';

// Dynamic imports for heavy components (code splitting)
const BimGalleryPage = dynamic(() => import('@/components/BimGalleryPage').then(m => ({ default: m.BimGalleryPage })), {
  loading: () => <div className="p-8"><TableSkeleton rows={6} /></div>,
  ssr: false
});

const HydraulicsPage = dynamic(() => import('@/components/HydraulicsPage').then(m => ({ default: m.HydraulicsPage })), {
  loading: () => <div className="p-8"><TableSkeleton rows={6} /></div>
});

const NormativeSearchPage = dynamic(() => import('@/components/NormativeSearchPage').then(m => ({ default: m.NormativeSearchPage })), {
  loading: () => <div className="p-8"><TableSkeleton rows={6} /></div>
});

const SpecAssistantPage = dynamic(() => import('@/components/SpecAssistantPage').then(m => ({ default: m.SpecAssistantPage })), {
  loading: () => <div className="p-8"><TableSkeleton rows={8} /></div>
});

// Add dynamic imports for previously static components
const HelpPage = dynamic(() => import('@/components/HelpPage').then(m => ({ default: m.HelpPage })), {
  loading: () => <div className="p-8"><TableSkeleton rows={4} /></div>
});

const PipingRoutingPage = dynamic(() => import('@/components/PipingRoutingPage').then(m => ({ default: m.PipingRoutingPage })), {
  loading: () => <div className="p-8"><TableSkeleton rows={6} /></div>
});

const SupportManager = dynamic(() => import('@/components/SupportManager').then(m => ({ default: m.SupportManager })), {
  loading: () => <div className="p-8"><TableSkeleton rows={5} /></div>
});

const BrandingManager = dynamic(() => import('@/components/BrandingManager').then(m => ({ default: m.BrandingManager })), {
  loading: () => <div className="p-8"><TableSkeleton rows={5} /></div>
});

const EquipmentManager = dynamic(() => import('@/components/EquipmentManager').then(m => ({ default: m.EquipmentManager })), {
  loading: () => <div className="p-8"><TableSkeleton rows={10} /></div>
});

const SettingsPage = dynamic(() => import('@/components/SettingsPage').then(m => ({ default: m.SettingsPage })), {
  loading: () => <div className="p-8"><TableSkeleton rows={4} /></div>
});

// Global modals — lazy-loaded (PdfWizardModal pulls pdf-lib + exceljs, ~1.5MB;
// ProjectSettingsModal is rarely opened). Keeps the main bundle small.
const KeyboardShortcutsModal = dynamic(() => import('@/components/KeyboardShortcutsModal').then(m => m.KeyboardShortcutsModal), {
  loading: () => <div className="p-8"><TableSkeleton rows={6} /></div>,
  ssr: false,
});

const ProjectSettingsModal = dynamic(() => import('@/components/ProjectSettingsModal').then(m => m.ProjectSettingsModal), {
  loading: () => <div className="p-8"><TableSkeleton rows={5} /></div>,
  ssr: false,
});

const PdfWizardModal = dynamic(() => import('@/components/PdfWizardModal').then(m => m.PdfWizardModal), {
  loading: () => <div className="p-8"><TableSkeleton rows={10} /></div>,
  ssr: false,
});

// Memoize stable layout components
const MemoizedSidebar = React.memo(Sidebar);
const MemoizedHeader = React.memo(Header);
const MemoizedDashboard = React.memo(Dashboard);

import { ProjectLoadData } from '@/lib/types';

import { useKeyboardShortcuts, createStandardShortcuts } from '@/hooks/useKeyboardShortcuts';

import {
  Scale,
  Camera,
} from 'lucide-react';

const DashboardContent = () => {
  const {
    activeTab,
    setActiveTab
  } = useUI();

  const {
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
    boqItems,
    ifcModelUrl,
    importProjectData,
    isInitialized,
    undo, redo, canUndo, canRedo,
    fittingItems
  } = useProject();

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);



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
      supportConfig,
      branding,
      boqItems,
      fittingItems,
      ifcModelUrl
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_${projectDetails.projectNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [projectDetails, segments, equipmentList, fluidType, glycolPercentage, safetyMargin, safetyMarginPercentage, supportConfig, branding, boqItems, fittingItems, ifcModelUrl]);

  // Keyboard Shortcuts — useKeyboardShortcuts skips shortcuts while typing in
  // inputs/textarea/contentEditable, so Cmd+Z no longer hijacks native undo in text fields.
  const shortcuts = React.useMemo(() => createStandardShortcuts({
    onSave: saveProject,
    onExport: () => setIsExportOpen(true),
    onUndo: undo,
    onRedo: redo,
    onHelp: () => setIsShortcutsOpen(true)
  }), [saveProject, undo, redo]);
  useKeyboardShortcuts(shortcuts);

  // NOTE: local persistence of the project is owned by ProjectContext (debounced
  // writer to 'hydraulic_calc_project_v2'). No autosave writer is needed here.

  // Dashboard "Export Comandă" -> deschide PdfWizard (eveniment decuplat)
  React.useEffect(() => {
    const handler = () => setIsExportOpen(true);
    window.addEventListener('opencode:open-export', handler);
    return () => window.removeEventListener('opencode:open-export', handler);
  }, []);

  const loadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Full restore (supportConfig, safetyMarginPercentage, branding...);
        // validation (non-array segments/equipmentList) happens in importProjectData.
        importProjectData(data);
      } catch (error) {
        console.error('Error loading project:', error);
        alert('Eroare la încărcarea fișierului.');
      }
    };
    reader.readAsText(file);
  };


  // Wrap setters in useCallback for stable props
  const handleLoadProject = React.useCallback((data: ProjectLoadData) => {
    importProjectData(data);
  }, [importProjectData]);

  const toggleSettings = React.useCallback(() => setIsSettingsOpen(prev => !prev), []);
  const toggleExport = React.useCallback(() => setIsExportOpen(prev => !prev), []);
  const toggleShortcuts = React.useCallback(() => setIsShortcutsOpen(prev => !prev), []);

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
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* 1. Global Modals (Rendered at root for Portal stability) */}
      {isShortcutsOpen && <KeyboardShortcutsModal isOpen onClose={toggleShortcuts} />}
      {isSettingsOpen && (
      <ProjectSettingsModal
        isOpen
        onClose={toggleSettings}
        projectDetails={projectDetails}
        onProjectDetailsChange={setProjectDetails}
      />
      )}
      {isExportOpen && (
      <PdfWizardModal
        isOpen
        onClose={toggleExport}
        data={{
          projectDetails,
          segments: segments || [],
          equipmentList: equipmentList || [],
          fluidType: fluidType || 'ethylene',
          glycolPercentage: glycolPercentage ?? 30,
          safetyMargin: safetyMargin || false,
          safetyMarginPercentage: safetyMarginPercentage ?? 5,
          supportConfig: supportConfig,
          branding: branding,
          fittingItems: fittingItems || []
        }}
      />
      )}


      {/* 2. Sidebar Navigation */}
      <MemoizedSidebar
        onSettingsOpen={toggleSettings}
        onExportOpen={toggleExport}
        onSave={saveProject}
        onLoad={loadProject}
      />

      {/* 3. Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Header (Top Bar) */}
        <MemoizedHeader
          projectDetails={projectDetails}
          onProjectDetailsChange={setProjectDetails}
          onLoadProject={handleLoadProject}
          onOpenExport={toggleExport}
          onOpenSettings={toggleSettings}
          onSaveProject={saveProject}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <div className="flex-1 overflow-y-auto scroll-smooth pb-32">
          <PageTransition pageKey={activeTab}>
            {activeTab === 'dashboard' ? (
              <MemoizedDashboard />
            ) : (
              <div className="spacing-page py-8">
                <div className="animate-in fade-in duration-300">

                  {/* Tab 1: Piping & Routing (New Design) */}
                  {activeTab === 'config' && (
                    <PipingRoutingPage />
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

                  {activeTab === 'wizard' && (
                    <div className="h-full overflow-y-auto">
                      <DesignWizard />
                    </div>
                  )}

                  {/* Tab: Standarde Țevi (pagina dedicată) */}
                  {activeTab === 'pipe-standards' && (
                    <PipeStandardsPage />
                  )}

                  {/* Tab: BIM Gallery (Interactive) */}
                  {activeTab === 'bim_gallery' && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <BimGalleryPage />
                    </div>
                  )}

                  {/* Tab: Hydraulic Tools (Unified) */}
                  {activeTab === 'hydraulics' && (
                    <HydraulicsPage />
                  )}

                  {activeTab === 'help' && (
                    <HelpPage />
                  )}

                  {/* Tab: Normative Search */}
                  {activeTab === 'normative' && (
                    <NormativeSearchPage />
                  )}

                  {/* Tab: AI Spec Assistant */}
                  {activeTab === 'architecture_spec' && (
                    <SpecAssistantPage />
                  )}

                  {/* Tab: Settings */}
                  {activeTab === 'settings' && (
                    <SettingsPage />
                  )}


                </div>
              </div>
            )}
          </PageTransition>
        </div>
      </main>
      <OnboardingOverlay />
    </div>
  );
};

export default function Home() {
  return (
    <ProjectProvider>
      <UIProvider>
        <DashboardContent />
      </UIProvider>
    </ProjectProvider>
  );
}
