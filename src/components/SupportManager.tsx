
import React, { useState, useMemo } from 'react';
import { PipeSegment } from '@/lib/types';
import { calculateSupportReport } from '@/lib/calculations';
import { Ruler, Anchor, Calculator, ArrowRight, Layers, Activity } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { SupportStepper } from './SupportStepper';
import { AnalysisTable } from './AnalysisTable';
import { SupportOrderSummary } from './SupportOrderSummary';
import { generateSupportBoM } from '@/lib/calculations';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SupportManagerProps {
    segments: PipeSegment[];
}




type SupportStep = 'config' | 'summary';

export const SupportManager: React.FC<SupportManagerProps> = ({ segments }) => {
    const { glycolPercentage, supportConfig, setSupportConfig } = useProject();
    const [currentStep, setCurrentStep] = useState<SupportStep>('config');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Calculate report on fly
    const report = useMemo(() => {
        return calculateSupportReport(segments, glycolPercentage || 0, supportConfig);
    }, [segments, glycolPercentage, supportConfig]); // Added dependencies for clarity

    const handleNext = () => {
        if (currentStep === 'config') setCurrentStep('summary');
    };

    return (
        <div className="glass-panel min-h-[600px] flex flex-col relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Stepper Navigation */}
            <SupportStepper currentStep={currentStep} onStepChange={setCurrentStep} />

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* STEP 1: CONFIGURATION */}
                {currentStep === 'config' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-white mb-2">Configurare Parametri Sistem</h2>
                            <p className="text-slate-400">Definiți scenariul de montaj pntru a calcula corect încărcările statice și dinamice.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Spacing Card */}
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <Ruler className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-200">Pas Suporți</h4>
                                            <p className="text-xs text-slate-500">Distanța între punctele de susținere</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-blue-400 font-mono">{supportConfig.spacing.toFixed(1)}m</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="6"
                                    step="0.5"
                                    value={supportConfig.spacing}
                                    onChange={(e) => setSupportConfig({ ...supportConfig, spacing: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                                />
                                <div className="flex justify-between mt-2 text-xs text-slate-600 font-mono">
                                    <span>1.0m</span>
                                    <span>6.0m</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    {[1.5, 2.0, 3.0].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setSupportConfig({ ...supportConfig, spacing: val })}
                                            className="px-2 py-1 rounded bg-slate-900 border border-white/10 text-[10px] text-slate-400 hover:text-white hover:border-blue-500/50 transition-colors"
                                        >
                                            {val}m
                                        </button>
                                    ))}
                                    <span className="text-[10px] text-slate-600 self-center ml-auto">Presets</span>
                                </div>
                            </div>

                            {/* Mounting Height Card */}
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                            <Layers className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-200">Înălțime Montaj (H)</h4>
                                            <p className="text-xs text-slate-500">Lungime consolă / tijă</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-purple-400 font-mono">{supportConfig.height.toFixed(1)}m</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="5.0"
                                    step="0.5"
                                    value={supportConfig.height}
                                    onChange={(e) => setSupportConfig({ ...supportConfig, height: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                                />
                                <div className="flex justify-between mt-2 text-xs text-slate-600 font-mono">
                                    <span>0.5m</span>
                                    <span>5.0m</span>
                                </div>
                            </div>

                            {/* Pipes per Support Card */}
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                            <Calculator className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-200">Încărcare Paralelă</h4>
                                            <p className="text-xs text-slate-500">Număr de țevi pe o consolă</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-emerald-400 font-mono">x{supportConfig.pipesPerSupport}</span>
                                </div>
                                <div className="flex gap-3">
                                    {[1, 2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setSupportConfig({ ...supportConfig, pipesPerSupport: num })}
                                            className={`flex-1 py-3 rounded-xl border font-bold transition-all ${supportConfig.pipesPerSupport === num
                                                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg scale-105'
                                                : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-emerald-500/30'
                                                }`}
                                        >
                                            {num} {num === 1 ? 'Țeavă' : 'Țevi'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Advanced Settings Toggle */}
                        <div className="md:col-span-2 flex justify-center">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
                            >
                                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                {showAdvanced ? 'Ascunde Setări Avansate' : 'Setări Avansate (Izolație)'}
                            </button>
                        </div>

                        {/* Insulation Card (Collapsible) */}
                        {showAdvanced && (
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all group md:col-span-2 animate-in slide-in-from-top-4 fade-in duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                            <Layers className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-200">Izolație Termică</h4>
                                            <p className="text-xs text-slate-500">Grosime și densitate material</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-amber-400 font-mono">{supportConfig.insulationThickness} <span className="text-sm text-slate-500">mm</span></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Thickness Slider */}
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
                                            <span>Grosime (mm)</span>
                                            <span>{supportConfig.insulationThickness}mm</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={supportConfig.insulationThickness}
                                            onChange={(e) => setSupportConfig({ ...supportConfig, insulationThickness: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                        />
                                        <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-mono">
                                            <span>0mm</span>
                                            <span>50mm</span>
                                            <span>100mm</span>
                                        </div>
                                    </div>

                                    {/* Density Selector */}
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
                                            <span>Tip Material (Densitate)</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: 'Vată Minerală', val: 100 },
                                                { label: 'Vată Sticlă', val: 50 },
                                                { label: 'PIR / PUR', val: 40 },
                                                { label: 'Elastomer', val: 19 }
                                            ].map(opt => (
                                                <button
                                                    key={opt.val}
                                                    onClick={() => setSupportConfig({ ...supportConfig, insulationDensity: opt.val })}
                                                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${supportConfig.insulationDensity === opt.val
                                                        ? 'bg-amber-500 text-white border-amber-400'
                                                        : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800'
                                                        }`}
                                                >
                                                    {opt.label} ({opt.val})
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mounting Type Selector */}
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                            <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                                <Anchor className="w-5 h-5 text-amber-500" />
                                Mod de Fixare
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSupportConfig({ ...supportConfig, mountingType: 'concrete' })}
                                    className={`p-4 rounded-xl border text-left transition-all ${supportConfig.mountingType === 'concrete'
                                        ? 'bg-amber-500/10 border-amber-500 text-amber-100'
                                        : 'bg-slate-900/30 border-white/5 text-slate-500 hover:bg-slate-800'
                                        }`}
                                >
                                    <h5 className="font-bold mb-1">Pardoseală / Beton</h5>
                                    <p className="text-sm opacity-70">Montaj direct pe placă cu conexpand sau ancore chimice.</p>
                                </button>
                                <button
                                    onClick={() => setSupportConfig({ ...supportConfig, mountingType: 'suspended' })}
                                    className={`p-4 rounded-xl border text-left transition-all ${supportConfig.mountingType === 'suspended'
                                        ? 'bg-amber-500/10 border-amber-500 text-amber-100'
                                        : 'bg-slate-900/30 border-white/5 text-slate-500 hover:bg-slate-800'
                                        }`}
                                >
                                    <h5 className="font-bold mb-1">Suspendat (Tavan)</h5>
                                    <p className="text-sm opacity-70">Prindere în tavan cu tije filetate, coliere sau șine montaj.</p>
                                </button>
                            </div>
                        </div>

                        {/* Modular Topology Configuration */}
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
                            <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-emerald-500" />
                                Configurație Modulară (Elemente Adiționale)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setSupportConfig({ ...supportConfig, addLeftConsole: !supportConfig.addLeftConsole })}
                                    className={`p-4 rounded-xl border text-center transition-all ${supportConfig.addLeftConsole
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                        : 'bg-slate-900/30 border-white/5 text-slate-500 hover:border-emerald-500/20'
                                        }`}
                                >
                                    <div className="text-xs font-bold uppercase mb-1">Consolă Stânga</div>
                                    <div className="text-lg font-bold">{supportConfig.addLeftConsole ? 'ACTIVAT' : 'DEZACTIVAT'}</div>
                                </button>
                                <button
                                    onClick={() => setSupportConfig({ ...supportConfig, addRightConsole: !supportConfig.addRightConsole })}
                                    className={`p-4 rounded-xl border text-center transition-all ${supportConfig.addRightConsole
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                        : 'bg-slate-900/30 border-white/5 text-slate-500 hover:border-emerald-500/20'
                                        }`}
                                >
                                    <div className="text-xs font-bold uppercase mb-1">Consolă Dreapta</div>
                                    <div className="text-lg font-bold">{supportConfig.addRightConsole ? 'ACTIVAT' : 'DEZACTIVAT'}</div>
                                </button>
                                <button
                                    onClick={() => setSupportConfig({ ...supportConfig, addUpperRail: !supportConfig.addUpperRail })}
                                    className={`p-4 rounded-xl border text-center transition-all ${supportConfig.addUpperRail
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                        : 'bg-slate-900/30 border-white/5 text-slate-500 hover:border-blue-500/20'
                                        }`}
                                >
                                    <div className="text-xs font-bold uppercase mb-1">Etaj Superior (Rail)</div>
                                    <div className="text-lg font-bold">{supportConfig.addUpperRail ? 'ACTIVAT' : 'DEZACTIVAT'}</div>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                            >
                                Analizează Structura <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: SUMMARY & ANALYSIS */}
                {currentStep === 'summary' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Rezumat & Verificare</h2>
                                <p className="text-slate-400 text-sm">Calcul automat cantități și verificare structurală.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentStep('config')}
                                    className="text-slate-400 hover:text-white px-4 py-2 font-bold text-sm transition-all"
                                >
                                    Înapoi la Configurare
                                </button>
                            </div>
                        </div>

                        {/* BOM Summary */}
                        <SupportOrderSummary
                            bom={generateSupportBoM(report)}
                            onExport={() => window.print()}
                        />



                        {/* Engineering Analysis (Collapsible or visible below) */}
                        <div className="pt-8 border-t border-white/5">
                            <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-400" />
                                Detalii Inginerie (Raport Tehnic)
                            </h3>
                            <AnalysisTable report={report} />
                        </div>
                    </div>
                )}




            </div>
        </div>
    );
};
