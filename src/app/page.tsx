"use client";

import { useState, useMemo } from 'react';
import { PipeManager } from '@/components/PipeManager';
import { EquipmentManager } from '@/components/EquipmentManager';
import { FluidComposition } from '@/components/FluidComposition';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { Header } from '@/components/Header';
import { PrintReport } from '@/components/PrintReport';
import { PipeSegment, EquipmentItem, AppState } from '@/lib/types';
import { calculateTotalVolume, generateBoQ, calculateSystemWeight, getDetailedWeightReport } from '@/lib/calculations';
import { Settings2, Scale, Image as ImageIcon, LayoutDashboard } from 'lucide-react';

export default function Home() {
  // Project Context State
  const [projectName, setProjectName] = useState<string>('');
  const [engineerName, setEngineerName] = useState<string>('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // Core Application State
  const [segments, setSegments] = useState<PipeSegment[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [safetyMargin, setSafetyMargin] = useState<boolean>(false);
  const [glycolPercentage, setGlycolPercentage] = useState<number>(30);

  // UI State
  const [activeTab, setActiveTab] = useState<'config' | 'weights' | 'photos'>('config');

  // Derived Calculations
  const totalSystemVolume = useMemo(() => {
    return calculateTotalVolume(segments, equipmentList, safetyMargin);
  }, [segments, equipmentList, safetyMargin]);

  const boqItems = useMemo(() => {
    return generateBoQ(segments);
  }, [segments]);

  const systemWeight = useMemo(() => {
    return calculateSystemWeight(segments, totalSystemVolume);
  }, [segments, totalSystemVolume]);

  const detailedWeights = useMemo(() => {
    return getDetailedWeightReport(segments, equipmentList, glycolPercentage);
  }, [segments, equipmentList, glycolPercentage]);


  // Persistence Handlers
  const handleSaveProject = () => {
    const projectData = {
      version: "3.0", // Bumped version for new features
      date: new Date().toISOString(),
      projectDetails: { projectName, engineerName },
      state: {
        segments,
        equipmentList,
        safetyMargin,
        glycolPercentage,
        companyLogo
      } as AppState
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/[^a-z0-9]/gi, '_') || 'Project'}_HydraulicCalc.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.version && json.state) {
          // Restore State
          setProjectName(json.projectDetails?.projectName || '');
          setEngineerName(json.projectDetails?.engineerName || '');
          setSegments(json.state.segments || []);
          setEquipmentList(json.state.equipmentList || []);
          setSafetyMargin(json.state.safetyMargin || false);
          setGlycolPercentage(json.state.glycolPercentage || 30);
          setCompanyLogo(json.state.companyLogo || null);
          alert("Proiect încărcat cu succes!");
        } else {
          alert("Format fișier invalid.");
        }
      } catch (err) {
        console.error(err);
        alert("Eroare la parsarea fișierului.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen pb-20 print:pb-0 bg-neutral-950 print:bg-white text-neutral-100">

      {/* 1. GLOBAL HEADER */}
      <Header
        projectName={projectName}
        onProjectNameChange={setProjectName}
        engineerName={engineerName}
        onEngineerNameChange={setEngineerName}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        companyLogo={companyLogo}
        onLogoUpload={setCompanyLogo}
      />

      {/* 2. NAVIGATION TABS */}
      <div className="bg-neutral-900 border-b border-neutral-800 print:hidden transition-all sticky top-16 z-40 shadow-md">
        <div className="max-w-[1600px] mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('config')}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'config'
                  ? 'border-sky-500 text-sky-500'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'}
              `}
            >
              <LayoutDashboard className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'config' ? 'text-sky-500' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
              <span>1. Configurare & Volum</span>
            </button>

            <button
              onClick={() => setActiveTab('weights')}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'weights'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'}
              `}
            >
              <Scale className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'weights' ? 'text-amber-500' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
              <span>2. Sarcini Statice</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'photos'
                  ? 'border-teal-500 text-teal-500'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'}
              `}
            >
              <ImageIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'photos' ? 'text-teal-500' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
              <span>3. Documentație FOTO</span>
            </button>
          </nav>
        </div>
      </div>

      {/* 3. MAIN PREVIEW AREA */}
      <div className="max-w-[1600px] mx-auto px-6 py-8 print:hidden">

        {/* TAB 1: CONFIGURATION */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            <div className="lg:col-span-8 space-y-8">
              <section>
                <PipeManager segments={segments} onSegmentsChange={setSegments} />
              </section>
              <section>
                <EquipmentManager
                  equipmentList={equipmentList}
                  onEquipmentChange={setEquipmentList}
                  safetyMargin={safetyMargin}
                  onSafetyMarginChange={setSafetyMargin}
                  viewMode="volume"
                />
              </section>
              <section>
                <FluidComposition glycolPercentage={glycolPercentage} onGlycolPercentageChange={setGlycolPercentage} />
              </section>
            </div>

            <div className="lg:col-span-4 sticky top-36">
              <ResultsDisplay
                totalSystemVolume={totalSystemVolume}
                glycolPercentage={glycolPercentage}
                boqItems={boqItems}
                totalWeight={systemWeight.totalWeight}
              />
            </div>
          </div>
        )}

        {/* TAB 2: WEIGHTS */}
        {activeTab === 'weights' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            <div className="lg:col-span-7 space-y-8">
              <EquipmentManager
                equipmentList={equipmentList}
                onEquipmentChange={setEquipmentList}
                safetyMargin={safetyMargin}
                viewMode="weights"
              />
            </div>

            {/* Live Weight Preview Table */}
            <div className="lg:col-span-5 bg-neutral-900 rounded-xl border border-neutral-800 p-6 sticky top-36">
              <h3 className="text-lg font-bold text-neutral-300 mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-500" />
                Previzualizare Raport Sarcini
              </h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="text-neutral-500 border-b border-neutral-700">
                    <tr>
                      <th className="py-2">Element</th>
                      <th className="py-2 text-right">Goală (kg)</th>
                      <th className="py-2 text-right text-blue-400">Fluid (kg)</th>
                      <th className="py-2 text-right text-white">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-300 divide-y divide-neutral-800">
                    {detailedWeights.map(row => (
                      <tr key={row.id}>
                        <td className="py-2 pr-2 truncate max-w-[150px]" title={row.description}>{row.description.split(':')[0]}...</td>
                        <td className="py-2 text-right text-neutral-500">{row.emptyWeight.toFixed(1)}</td>
                        <td className="py-2 text-right text-blue-500/80">{row.fluidWeight.toFixed(1)}</td>
                        <td className="py-2 text-right font-bold text-neutral-100">{row.totalWeight.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-neutral-600 bg-neutral-800/50 font-bold text-amber-400">
                    <tr>
                      <td className="py-3">TOTAL GENERAL</td>
                      <td className="py-3 text-right">{detailedWeights.reduce((s, i) => s + i.emptyWeight, 0).toFixed(0)}</td>
                      <td className="py-3 text-right">{detailedWeights.reduce((s, i) => s + i.fluidWeight, 0).toFixed(0)}</td>
                      <td className="py-3 text-right text-sm">{systemWeight.totalWeight.toFixed(1)} kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHOTOS */}
        {activeTab === 'photos' && (
          <div className="animate-fade-in">
            <EquipmentManager
              equipmentList={equipmentList}
              onEquipmentChange={setEquipmentList}
              safetyMargin={safetyMargin}
              viewMode="photos"
            />
          </div>
        )}

      </div>

      {/* 4. HIDDEN PRINT ENGINE (Always Renders Full Report) */}
      <PrintReport
        projectName={projectName}
        engineerName={engineerName}
        segments={segments}
        equipmentList={equipmentList}
        boqItems={boqItems}
        totalSystemVolume={totalSystemVolume}
        glycolPercentage={glycolPercentage}
        safetyMargin={safetyMargin}
        companyLogo={companyLogo}
      />

    </main>
  );
}
