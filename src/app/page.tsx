'use client';

import React from 'react';
import { ProjectProvider, useProject } from '@/context/ProjectContext';
import { Header } from '@/components/Header';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { PipeManager } from '@/components/PipeManager';
import { EquipmentManager } from '@/components/EquipmentManager';
import { FluidComposition } from '@/components/FluidComposition';
import { SupportManager } from '@/components/SupportManager';
import { BrandingManager } from '@/components/BrandingManager';
import {
  Package,
  Scale,
  Camera,
  Anchor,
  Palette
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
    setSafetyMargin
  } = useProject();

  const tabs = [
    { id: 'config', label: 'Configurare & Volum', icon: Package },
    { id: 'supports', label: 'Suporți & Prinderi', icon: Anchor },
    { id: 'weights', label: 'Sarcini Statice', icon: Scale },
    { id: 'photos', label: 'Documentație FOTO', icon: Camera },
    { id: 'branding', label: 'Branding & Stil', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30 pb-20">

      <div className="screen-only">
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
        />

        {/* Floating Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 -mt-4 mb-8 sticky top-4 z-40">
          <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-1 w-full md:w-fit mx-auto md:mx-0 shadow-2xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl bg-slate-800/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group ${isActive
                    ? 'text-white shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">

            {/* Tab 1: Configuration & Volume */}
            {activeTab === 'config' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                {/* Left Column: Input and Configuration */}
                <div className="xl:col-span-8 space-y-8">
                  <div className="space-y-8">
                    <PipeManager
                      segments={segments}
                      onSegmentsChange={setSegments}
                    />
                    <EquipmentManager
                      equipmentList={equipmentList}
                      onEquipmentChange={setEquipmentList}
                      viewMode="volume"
                    />
                    <FluidComposition />
                  </div>
                </div>

                {/* Right Column: Results Sticky */}
                <div className="xl:col-span-4">
                  <div className="sticky top-28 space-y-6">
                    <ResultsDisplay />

                    {/* Quick Tips */}
                    <div className="glass-panel p-6 rounded-2xl border-l-4 border-blue-500 bg-slate-800/40">
                      <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        System Status
                      </h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Sistemul calculează automat volumul total incluzând o rezervă de siguranță (dacă este activată).
                        Asigurați-vă că toate diametrele sunt corecte.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Supports Calculator */}
            {activeTab === 'supports' && (
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SupportManager segments={segments} />
              </div>
            )}

            {/* Tab 2: Specific Weights & Static Loads */}
            {activeTab === 'weights' && (
              <div className="max-w-4xl mx-auto">
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden bg-slate-800/40">
                  {/* Background Decor */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Scale className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Gestionare Greutăți Echipamente
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                          Introduceți greutatea proprie a echipamentelor pentru calculul sarcinii totale.
                        </p>
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

            {/* Tab 3: Technical Photos */}
            {activeTab === 'photos' && (
              <div className="max-w-4xl mx-auto">
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden bg-slate-800/40">
                  {/* Background Decor */}
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                        <Camera className="w-6 h-6 text-teal-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Documentație Vizuală
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                          Atașați imagini relevante pentru raportul tehnic (Anexa 2).
                        </p>
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

            {/* Tab 5: Branding & Style */}
            {activeTab === 'branding' && (
              <div className="max-w-4xl mx-auto">
                <BrandingManager />
              </div>
            )}
          </div>
        </main>

        {/* Footer Credit */}
        <footer className="max-w-7xl mx-auto px-4 mt-12 text-center pb-8 opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-xs font-mono text-slate-500">
            Made By <span className="text-blue-500 font-bold">robialexz</span>
          </p>
        </footer>
      </div>
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
