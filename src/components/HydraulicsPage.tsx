'use client';

import React, { useState } from 'react';
import {
    Wrench,
    Droplets,
    Thermometer,
    Gauge,
    GitBranch,
    Zap
} from 'lucide-react';

// Import all calculator components
import { ExpansionVesselCalculator } from './ExpansionVesselCalculator';

type HydraulicTool = 'flow' | 'expansion' | 'thermal' | 'valve' | 'fittings' | 'pump';

interface ToolTab {
    id: HydraulicTool;
    label: string;
    icon: React.ElementType<{ className?: string }>;
    description: string;
}

const TOOL_TABS: ToolTab[] = [
    {
        id: 'expansion',
        label: 'Vas Expansiune',
        icon: Droplets,
        description: 'Dimensionare conform EN 12828'
    },
    {
        id: 'thermal',
        label: 'Dilatare Termică',
        icon: Thermometer,
        description: 'Alungire țevi și compensatori'
    },
    {
        id: 'valve',
        label: 'Kv Robineți',
        icon: Gauge,
        description: 'Selectare robineți pe debit/ΔP'
    },
    {
        id: 'fittings',
        label: 'K-Factors',
        icon: GitBranch,
        description: 'Pierderi locale fitinguri'
    },
    {
        id: 'pump',
        label: 'Dimensionare Pompă',
        icon: Zap,
        description: 'Curba sistem și selecție pompă'
    }
];

export function HydraulicsPage() {
    const [activeTool, setActiveTool] = useState<HydraulicTool>('expansion');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-linear-to-br from-primary to-primary/70">
                    <Wrench className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Instrumente Hidraulice
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Calculatoare pentru proiectare sisteme de răcire
                    </p>
                </div>
            </div>

            {/* Tool Tabs */}
            <div className="flex flex-wrap gap-2">
                {TOOL_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTool === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTool(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                                }
                                border shadow-sm
                            `}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                            <div className="text-left">
                                <div className="text-sm font-medium">{tab.label}</div>
                                <div className="text-xs text-zinc-500 hidden sm:block">{tab.description}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Content Area — tool-urile raman MONTATE (ascunse) ca sa nu se piarda parametrii */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                {[
                    { id: 'flow', el: <FlowAndSizeTool /> },
                    { id: 'expansion', el: <ExpansionVesselCalculator /> },
                    { id: 'thermal', el: <ThermalExpansionTool /> },
                    { id: 'valve', el: <ValveSizingTool /> },
                    { id: 'fittings', el: <FittingsTool /> },
                    { id: 'pump', el: <PumpSizingTool /> },
                ].map(tool => (
                    <div key={tool.id} style={{ display: activeTool === tool.id ? 'block' : 'none' }}>
                        {tool.el}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// Thermal Expansion Tool
// ============================================================================
import {
    calculateThermalExpansion,
    ThermalExpansionInput
} from '@/lib/calculations/thermalExpansion';

function ThermalExpansionTool() {
    const [input, setInput] = useState<ThermalExpansionInput>({
        material: 'steel_light',
        length: 20,
        outerDiameter: 60,
        wallThickness: 3,
        installTemperature: 10,
        operatingTemperature: 50,
        isFixedBothEnds: false
    });

    const result = calculateThermalExpansion(input);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Thermometer className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">Calcul Dilatare Termică</h2>
                    <p className="text-sm text-muted-foreground">ΔL = α × L × ΔT</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-4">
                    <div className="bg-muted/50 rounded-xl p-4 border border-border">
                        <h3 className="text-sm font-bold text-foreground mb-4">Parametri Țeavă</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Material</label>
                                <select
                                    value={input.material}
                                    onChange={e => setInput(prev => ({ ...prev, material: e.target.value }))}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                                >
                                    <option value="steel_light">Oțel (α = 0.012 mm/m·K)</option>
                                    <option value="copper">Cupru (α = 0.017 mm/m·K)</option>
                                    <option value="inox_press">Inox (α = 0.016 mm/m·K)</option>
                                    <option value="ppr_pn20">PPR (α = 0.15 mm/m·K)</option>
                                    <option value="pehd_sdr17">PEHD (α = 0.20 mm/m·K)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Lungime (m)</label>
                                <input
                                    type="number"
                                    value={input.length}
                                    onChange={e => setInput(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Diametru Ext. (mm)</label>
                                <input
                                    type="number"
                                    value={input.outerDiameter}
                                    onChange={e => setInput(prev => ({ ...prev, outerDiameter: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">T instalare (°C)</label>
                                <input
                                    type="number"
                                    value={input.installTemperature}
                                    onChange={e => setInput(prev => ({ ...prev, installTemperature: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">T operare (°C)</label>
                                <input
                                    type="number"
                                    value={input.operatingTemperature}
                                    onChange={e => setInput(prev => ({ ...prev, operatingTemperature: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={input.isFixedBothEnds}
                                        onChange={e => setInput(prev => ({ ...prev, isFixedBothEnds: e.target.checked }))}
                                        className="rounded border-border bg-background"
                                    />
                                    <span className="text-sm text-foreground">Ambele capete fixe (ancore)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Alungire Termică</div>
                        <div className="text-4xl font-black text-foreground">{result.elongation} mm</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            ΔT = {result.temperatureDelta}°C | α = {result.expansionCoefficient} mm/m·K
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 rounded-lg p-4 border border-border">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Compensator</div>
                            <div className="text-lg font-bold text-foreground">{result.compensatorType}</div>
                            {result.compensatorLegLength > 0 && (
                                <div className="text-xs text-muted-foreground">Braț: {result.compensatorLegLength} mm</div>
                            )}
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 border border-border">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Ghidaje</div>
                            <div className="text-lg font-bold text-foreground">{result.guidesRequired} buc</div>
                            <div className="text-xs text-muted-foreground">La {result.guideSpacing} m</div>
                        </div>

                        {input.isFixedBothEnds && (
                            <div className="col-span-2 bg-primary/5 rounded-lg p-4 border border-primary/20 shadow-sm">
                                <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Forță pe Ancore</div>
                                <div className="text-lg font-bold text-foreground">{result.anchorForce} kN</div>
                            </div>
                        )}
                    </div>

                    {result.recommendations.length > 0 && (
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                            <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Recomandări</div>
                            <ul className="text-xs text-primary/80 space-y-1">
                                {result.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="shrink-0">•</span>
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Valve Sizing Tool
// ============================================================================
import {
    calculateValveSizing,
    ValveSizingInput
} from '@/lib/calculations/valveSizing';

function ValveSizingTool() {
    const [input, setInput] = useState<ValveSizingInput>({
        flowRate: 10,
        pressureDrop: 0.5,
        fluidDensity: 1038, // 30% glycol
    });

    const result = calculateValveSizing(input);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Gauge className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">Dimensionare Robineți (Kv)</h2>
                    <p className="text-sm text-muted-foreground">Kv = Q × √(ρ/ΔP) conform IEC 60534</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                    <h3 className="text-sm font-bold text-foreground mb-4">Parametri Debit</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Debit (m³/h)</label>
                            <input
                                type="number"
                                value={input.flowRate}
                                onChange={e => setInput(prev => ({ ...prev, flowRate: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Cădere Presiune (bar)</label>
                            <input
                                type="number"
                                step={0.1}
                                value={input.pressureDrop}
                                onChange={e => setInput(prev => ({ ...prev, pressureDrop: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Densitate Fluid (kg/m³)</label>
                            <input
                                type="number"
                                value={input.fluidDensity}
                                onChange={e => setInput(prev => ({ ...prev, fluidDensity: parseFloat(e.target.value) || 1000 }))}
                                className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">Apă: 1000, Glicol 30%: 1038</p>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Kv Necesar</div>
                                <div className="text-3xl font-black text-foreground">{result.kvRequired}</div>
                                <div className="text-[10px] text-muted-foreground">+15% = {result.kvWithMargin}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Dimensiune</div>
                                <div className="text-3xl font-black text-primary">{result.recommendedDN}</div>
                                <div className="text-[10px] text-muted-foreground">Kv = {result.kvAvailable}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Viteză</div>
                            <div className="text-lg font-bold text-foreground">{result.velocity} m/s</div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Deschidere</div>
                            <div className="text-lg font-bold text-foreground">{result.openingPercent}%</div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Autoritate</div>
                            <div className="text-lg font-bold text-foreground">{result.authority}</div>
                        </div>
                    </div>

                    {result.recommendations.length > 0 && (
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                            {result.recommendations.map((rec, i) => (
                                <p key={i} className="text-xs text-primary/80 flex items-start gap-2">
                                    <span className="shrink-0">•</span>
                                    <span>{rec}</span>
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Fittings K-Factor Tool
// ============================================================================
import {
    calculateFittingsPressureLoss,
    getFittingTypes,
    createFitting,
    Fitting,
    FittingType
} from '@/lib/calculations/fittings';
import { calculateFlowFromLoad, suggestPipeSize } from '@/lib/calc/hydraulics';
import { getFluidProperties } from '@/lib/calculations/pressureDrop';
import { suggestGlycolPercent } from '@/lib/calculations/glycol';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { Plus, Trash2 } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { FittingItem } from '@/lib/types';


function FlowAndSizeTool() {
    const { fluidType, glycolPercentage, setGlycolPercentage } = useProject();
    const [powerKw, setPowerKw] = useState(500);
    const [deltaT, setDeltaT] = useState(8);
    const [minTemp, setMinTemp] = useState(-25);
    const [material, setMaterial] = useState('steel_light');

    const { flowM3H, massFlowKgS } = calculateFlowFromLoad(powerKw, deltaT, fluidType, glycolPercentage);
    const props = getFluidProperties(fluidType, glycolPercentage);
    const std = PIPE_STANDARDS[material];
    const dims = (std?.dimensions ?? []).map(d => ({ dn: d.dn, id: d.id }));
    const sugg = suggestPipeSize(flowM3H, dims, 2.5, props.kinematicViscosityM2S, props.densityKgM3);

    const recPct: number | null = fluidType === 'water'
        ? 0
        : suggestGlycolPercent(minTemp, fluidType === 'propylene' ? 'propylene' : 'ethylene');

    const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none";
    const lbl = "block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Gauge className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">Debit din sarcina termica + DN recomandat</h2>
                    <p className="text-sm text-muted-foreground">Q = P / (cp · ρ · ΔT) — apoi cel mai mic DN cu viteza sub limita</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inputs */}
                <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-4">
                    <h3 className="text-sm font-bold text-foreground mb-2">Sarcina termica</h3>
                    <div>
                        <label className={lbl}>Putere de racire (kW)</label>
                        <input type="number" min={0} value={powerKw || ''} onChange={(e) => setPowerKw(parseFloat(e.target.value) || 0)} className={inputCls} />
                    </div>
                    <div>
                        <label className={lbl}>ΔT tur-retur (K)</label>
                        <input type="number" min={0.5} max={20} value={deltaT || ''} onChange={(e) => setDeltaT(parseFloat(e.target.value) || 0)} className={inputCls} />
                        <p className="text-[10px] text-muted-foreground mt-1">Tipic CHW: 6–8 K · variabil la AI/CDU</p>
                    </div>
                    <div>
                        <label className={lbl}>Material teava</label>
                        <select value={material} onChange={(e) => setMaterial(e.target.value)} className={inputCls}>
                            {Object.entries(PIPE_STANDARDS).map(([key, std]) => (
                                <option key={key} value={key}>{std.label}</option>
                            ))}
                        </select>
                    </div>

                    <h3 className="text-sm font-bold text-foreground pt-2">Protectie inghet</h3>
                    <div>
                        <label className={lbl}>Temperatura minima de protectie (°C)</label>
                        <input type="number" min={-50} max={5} value={minTemp} onChange={(e) => setMinTemp(parseFloat(e.target.value) || 0)} className={inputCls} />
                    </div>
                </div>

                {/* Rezultat debit + DN */}
                <div className="bg-card rounded-xl p-4 border border-border space-y-3">
                    <h3 className="text-sm font-bold text-foreground">Rezultat</h3>
                    <div className="flex justify-between py-2 border-b border-border/40">
                        <span className="text-sm text-muted-foreground">Debit necesar</span>
                        <span className={`font-mono font-bold text-lg ${flowM3H > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{flowM3H.toFixed(1)} m³/h</span>
                    </div>
                    {flowM3H > 0 && (
                        <>
                            <div className="flex justify-between py-2 border-b border-border/40 last:border-0">
                                <span className="text-sm text-muted-foreground">Debit masic</span>
                                <span className="font-mono text-sm">{massFlowKgS.toFixed(2)} kg/s</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border/40 last:border-0">
                                <span className="text-sm text-muted-foreground">DN recomandat (v ≤ 2.5 m/s)</span>
                                <span className="font-mono font-bold">{sugg ? sugg.size : '-'}</span>
                            </div>
                            {sugg && (
                                <div className={`text-xs px-3 py-2 rounded-lg ${sugg.withinLimit ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                    Viteza la DN recomandat: <strong>{sugg.velocity.toFixed(2)} m/s</strong>
                                    {!sugg.withinLimit && ' — peste limita: creste DN-ul sau imparte circuitul in doua'}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Glicol recomandat */}
                <div className="bg-card rounded-xl p-4 border border-border space-y-3">
                    <h3 className="text-sm font-bold text-foreground">Glicol recomandat</h3>
                    {fluidType === 'water' ? (
                        <p className="text-xs text-muted-foreground">Seteaza un tip de glicol in proiect pentru recomandarea concentratiei.</p>
                    ) : recPct === null ? (
                        <p className="text-xs text-amber-600 bg-amber-500/10 p-3 rounded-lg leading-relaxed">
                            Nici 60% glicol nu protejeaza pana la {minTemp}°C (cu marja de 3°C).
                            Considera incalzire de sprijin sau trasare termica.
                        </p>
                    ) : (
                        <>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <span className="text-sm text-muted-foreground">Protecție până la {minTemp}°C</span>
                                <span className="font-mono font-bold text-lg">{recPct}% vol</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">Marja practică de +3°C față de punctul de îngheț inclusă.</p>
                            {recPct > glycolPercentage && (
                                <button onClick={() => setGlycolPercentage(recPct)} className="btn btn-secondary btn-sm w-full">
                                    Aplica {recPct}% în proiect
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function FittingsTool() {
    // Fittingurile sunt PARTE din proiect (persistate) — apar în listele de cumpărat
    // din PDF/Excel și alimentează pierderile hidraulice.
    const { fittingItems, setFittingItems } = useProject();
    const [flowRate, setFlowRate] = useState(10);
    const [innerDiameter, setInnerDiameter] = useState(53);
    const [density, setDensity] = useState(1038);

    const fittings = fittingItems;
    const setFittings = setFittingItems;

    const fittingTypes = getFittingTypes();
    const result = calculateFittingsPressureLoss(fittings as Fitting[], flowRate, innerDiameter, density);

    const addFitting = () => {
        setFittings(prev => {
            const existing = prev.find(f => f.type === 'elbow_90_std' && f.size === 'DN50');
            if (existing) {
                // dedup: incrementam cantitatea in loc de rand duplicat
                return prev.map(f => f === existing ? { ...f, quantity: (f.quantity || 0) + 1 } : f);
            }
            return [...prev, createFitting('elbow_90_std', 'DN50', 1) as FittingItem];
        });
    };

    const updateFitting = <K extends keyof Fitting>(index: number, field: K, value: Fitting[K]) => {
        setFittings(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } as FittingItem : f));
    };

    const removeFitting = (index: number) => {
        setFittings(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <GitBranch className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">Pierderi Locale (K-Factors)</h2>
                    <p className="text-sm text-muted-foreground">ΔP = K × (ρ × v²) / 2</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Flow Parameters */}
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                    <h3 className="text-sm font-bold text-foreground mb-4">Parametri Debit</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Debit (m³/h)</label>
                            <input
                                type="number"
                                value={flowRate}
                                onChange={e => setFlowRate(parseFloat(e.target.value) || 0)}
                                className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Diametru Interior (mm)</label>
                            <input
                                type="number"
                                value={innerDiameter}
                                onChange={e => setInnerDiameter(parseFloat(e.target.value) || 0)}
                                className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Densitate (kg/m³)</label>
                            <input
                                type="number"
                                value={density}
                                onChange={e => setDensity(parseFloat(e.target.value) || 1000)}
                                className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                            />
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="mt-4 pt-4 border-t border-border">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                                <div className="text-2xl font-black text-primary">{result.totalPressureDropKPa}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">kPa Total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-slate-600 dark:text-slate-400">{result.totalEquivalentLength}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">m Echivalent</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fittings List */}
                <div className="lg:col-span-2 bg-muted/50 rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-foreground">Lista Fitinguri</h3>
                        <button
                            onClick={addFitting}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-[10px] font-bold uppercase tracking-wider border border-primary/20"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Adaugă
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {fittings.map((fitting, index) => (
                            <div key={fitting.id} className="flex items-center gap-2 bg-card rounded-lg p-2 border border-border shadow-sm">
                                <select
                                    value={fitting.type}
                                    onChange={e => updateFitting(index, 'type', e.target.value as FittingType)}
                                    className="flex-1 bg-background text-foreground text-sm px-2 py-1.5 rounded border border-border"
                                >
                                    {fittingTypes.map(ft => (
                                        <option key={ft.type} value={ft.type}>
                                            {ft.label} (K={ft.kFactor})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={fitting.quantity}
                                    onChange={e => updateFitting(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-16 bg-background text-foreground text-sm px-2 py-1.5 rounded border border-border text-center font-bold"
                                    min={1}
                                />
                                <span className="text-[10px] font-bold text-muted-foreground w-16 text-right">
                                    {result.fittings[index]?.pressureDropKPa.toFixed(2)} kPa
                                </span>
                                <button
                                    onClick={() => removeFitting(index)}
                                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Pump Sizing Tool
// ============================================================================
import {
    calculatePumpSizing,
    findBestPump,
    PumpSizingInput
} from '@/lib/calculations/pumpSizing';

function PumpSizingTool() {
    const [input, setInput] = useState<PumpSizingInput>({
        designFlowM3H: 15,
        staticHeadM: 3,
        frictionLossKPa: 50,
        safetyFactor: 1.1
    });

    const result = calculatePumpSizing(input);
    const bestPump = findBestPump(result.systemCurve, result.designFlow, result.designHead);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">Dimensionare Pompă</h2>
                    <p className="text-sm text-muted-foreground">Curba sistem H = H_st + K × Q²</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                    <h3 className="text-sm font-bold text-foreground mb-4">Cerințe Sistem</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Debit Proiectat (m³/h)</label>
                            <input
                                type="number"
                                value={input.designFlowM3H}
                                onChange={e => setInput(prev => ({ ...prev, designFlowM3H: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Înălțime Statică (m)</label>
                            <input
                                type="number"
                                value={input.staticHeadM}
                                onChange={e => setInput(prev => ({ ...prev, staticHeadM: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Pierderi Fricțiune (kPa)</label>
                            <input
                                type="number"
                                value={input.frictionLossKPa}
                                onChange={e => setInput(prev => ({ ...prev, frictionLossKPa: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Factor Siguranță</label>
                            <select
                                value={input.safetyFactor}
                                onChange={e => setInput(prev => ({ ...prev, safetyFactor: parseFloat(e.target.value) }))}
                                className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                            >
                                <option value={1.0}>1.0 (fără)</option>
                                <option value={1.1}>1.1 (+10%)</option>
                                <option value={1.15}>1.15 (+15%)</option>
                                <option value={1.2}>1.2 (+20%)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Design Point */}
                <div className="space-y-4">
                    <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Punct de Lucru Proiectat</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-3xl font-black text-foreground">{result.designFlow} m³/h</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Debit</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-primary">{result.designHead} m</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Înălțime</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 rounded-lg p-4 border border-border">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Putere Estimată</div>
                            <div className="text-xl font-bold text-foreground">{result.requiredPower} kW</div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 border border-border">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Tip Pompă</div>
                            <div className="text-xl font-bold text-foreground">{result.recommendedPumpType}</div>
                        </div>
                    </div>

                    {bestPump && (
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 shadow-sm">
                            <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Pompă Recomandată</div>
                            <div className="text-lg font-bold text-foreground">
                                {bestPump.pump.manufacturer} {bestPump.pump.model}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Punct funcționare: {bestPump.operatingPoint.flowM3H} m³/h @ {bestPump.operatingPoint.headM} m
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Eficiență: {bestPump.operatingPoint.efficiency}% | Putere: {bestPump.operatingPoint.powerKW} kW
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* System Curve Table */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Curba Sistem</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Q (m³/h)</th>
                                {result.systemCurve.map((point, i) => (
                                    <th key={i} className="text-center py-2 px-2 text-foreground font-bold">
                                        {point.flowM3H}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-2 px-3 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">H (m)</td>
                                {result.systemCurve.map((point, i) => (
                                    <td key={i} className="text-center py-2 px-2 text-foreground font-medium">
                                        {point.headM}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {result.recommendations.length > 0 && (
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Recomandări</div>
                    <ul className="text-xs text-primary/80 space-y-1">
                        {result.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="shrink-0">•</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
