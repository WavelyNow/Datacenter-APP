'use client';

import React from 'react';
import { ProjectProvider, useProject } from '@/context/ProjectContext';
import { Header } from '@/components/Header';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { PipeManager } from '@/components/PipeManager';
import { EquipmentManager } from '@/components/EquipmentManager';
import { FluidComposition } from '@/components/FluidComposition';
import { Package, Scale, Camera } from 'lucide-react';

const DashboardContent = () => {
  const {
    activeTab,
    setActiveTab,
    segments,
    setSegments,
    equipmentList,
    setEquipmentList,
    fluidType,
    setFluidType,
    glycolPercentage,
    setGlycolPercentage,
    safetyMargin,
    setSafetyMargin,
    projectDetails,
    setProjectDetails
  } = useProject();

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 font-sans selection:bg-amber-500/30">
      {/* PrintReport removed as it is replaced by PDF API */}

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

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="flex border-b border-neutral-800">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'config'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
            >
              <Package className="w-4 h-4" />
              Configurare & Volum
            </button>
            <button
              onClick={() => setActiveTab('weights')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'weights'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
            >
              <Scale className="w-4 h-4" />
              Sarcini Statice
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'photos'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
            >
              <Camera className="w-4 h-4" />
              Documentație FOTO
            </button>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Tab 1: Configuration & Volume */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
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
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <ResultsDisplay />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specific Weights & Static Loads */}
          {activeTab === 'weights' && (
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-neutral-900 border border-amber-900/30 rounded-lg p-6">
                <h2 className="text-xl font-bold text-amber-500 mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Gestionare Greutăți Echipamente
                </h2>
                <p className="text-neutral-400 text-sm mb-6">
                  Introduceți greutatea proprie (gol) a echipamentelor. Greutatea fluidului se calculează automat pe baza volumului configurat.
                </p>
                <EquipmentManager
                  equipmentList={equipmentList}
                  onEquipmentChange={setEquipmentList}
                  viewMode="weights"
                />
              </div>

              {/* Live Preview of Weight Report could go here or reuse logic */}
            </div>
          )}

          {/* Tab 3: Technical Photos */}
          {activeTab === 'photos' && (
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-neutral-900 border border-amber-900/30 rounded-lg p-6">
                <h2 className="text-xl font-bold text-amber-500 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Documentație Vizuală
                </h2>
                <p className="text-neutral-400 text-sm mb-6">
                  Încărcați fișe tehnice sau poze de la fața locului pentru a fi incluse în Anexa 2 a raportului.
                </p>
                <EquipmentManager
                  equipmentList={equipmentList}
                  onEquipmentChange={setEquipmentList}
                  viewMode="photos"
                />
              </div>
            </div>
          )}
        </main>
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
