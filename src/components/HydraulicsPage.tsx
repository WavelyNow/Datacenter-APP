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

type HydraulicTool = 'expansion' | 'thermal' | 'valve' | 'fittings' | 'pump';

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
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">
                        Instrumente Hidraulice
                    </h1>
                    <p className="text-sm text-zinc-400">
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
                                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/50 text-white'
                                    : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                                }
                                border
                            `}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                            <div className="text-left">
                                <div className="text-sm font-medium">{tab.label}</div>
                                <div className="text-xs text-zinc-500 hidden sm:block">{tab.description}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
                {activeTool === 'expansion' && <ExpansionVesselCalculator />}

                {activeTool === 'thermal' && (
                    <ThermalExpansionTool />
                )}

                {activeTool === 'valve' && (
                    <ValveSizingTool />
                )}

                {activeTool === 'fittings' && (
                    <FittingsTool />
                )}

                {activeTool === 'pump' && (
                    <PumpSizingTool />
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Thermal Expansion Tool
// ============================================================================
import {
    calculateThermalExpansion,
    EXPANSION_COEFFICIENTS,
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
                <div className="p-2 rounded-lg bg-orange-500/20">
                    <Thermometer className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-zinc-100">Calcul Dilatare Termică</h2>
                    <p className="text-sm text-zinc-400">ΔL = α × L × ΔT</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-4">
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                        <h3 className="text-sm font-medium text-zinc-300 mb-4">Parametri Țeavă</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs text-zinc-400 mb-1">Material</label>
                                <select
                                    value={input.material}
                                    onChange={e => setInput(prev => ({ ...prev, material: e.target.value }))}
                                    className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                                >
                                    <option value="steel_light">Oțel (α = 0.012 mm/m·K)</option>
                                    <option value="copper">Cupru (α = 0.017 mm/m·K)</option>
                                    <option value="inox_press">Inox (α = 0.016 mm/m·K)</option>
                                    <option value="ppr_pn20">PPR (α = 0.15 mm/m·K)</option>
                                    <option value="pehd_sdr17">PEHD (α = 0.20 mm/m·K)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Lungime (m)</label>
                                <input
                                    type="number"
                                    value={input.length}
                                    onChange={e => setInput(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Diametru Ext. (mm)</label>
                                <input
                                    type="number"
                                    value={input.outerDiameter}
                                    onChange={e => setInput(prev => ({ ...prev, outerDiameter: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">T instalare (°C)</label>
                                <input
                                    type="number"
                                    value={input.installTemperature}
                                    onChange={e => setInput(prev => ({ ...prev, installTemperature: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">T operare (°C)</label>
                                <input
                                    type="number"
                                    value={input.operatingTemperature}
                                    onChange={e => setInput(prev => ({ ...prev, operatingTemperature: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={input.isFixedBothEnds}
                                        onChange={e => setInput(prev => ({ ...prev, isFixedBothEnds: e.target.checked }))}
                                        className="rounded border-zinc-600 bg-zinc-800"
                                    />
                                    <span className="text-sm text-zinc-300">Ambele capete fixe (ancore)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/30">
                        <div className="text-sm text-zinc-400 mb-2">Alungire Termică</div>
                        <div className="text-4xl font-bold text-white">{result.elongation} mm</div>
                        <div className="text-sm text-zinc-500 mt-1">
                            ΔT = {result.temperatureDelta}°C | α = {result.expansionCoefficient} mm/m·K
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                            <div className="text-xs text-zinc-500">Compensator</div>
                            <div className="text-lg font-semibold text-zinc-100">{result.compensatorType}</div>
                            {result.compensatorLegLength > 0 && (
                                <div className="text-xs text-zinc-500">Braț: {result.compensatorLegLength} mm</div>
                            )}
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                            <div className="text-xs text-zinc-500">Ghidaje</div>
                            <div className="text-lg font-semibold text-zinc-100">{result.guidesRequired} buc</div>
                            <div className="text-xs text-zinc-500">La {result.guideSpacing} m</div>
                        </div>

                        {input.isFixedBothEnds && (
                            <div className="col-span-2 bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
                                <div className="text-xs text-amber-400">Forță pe Ancore</div>
                                <div className="text-lg font-semibold text-white">{result.anchorForce} kN</div>
                            </div>
                        )}
                    </div>

                    {result.recommendations.length > 0 && (
                        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                            <div className="text-sm text-blue-400 mb-2">Recomandări</div>
                            <ul className="text-sm text-blue-300/80 space-y-1">
                                {result.recommendations.map((rec, i) => (
                                    <li key={i}>• {rec}</li>
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
    getAvailableSizes,
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
                <div className="p-2 rounded-lg bg-purple-500/20">
                    <Gauge className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-zinc-100">Dimensionare Robineți (Kv)</h2>
                    <p className="text-sm text-zinc-400">Kv = Q × √(ρ/ΔP) conform IEC 60534</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                    <h3 className="text-sm font-medium text-zinc-300 mb-4">Parametri Debit</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Debit (m³/h)</label>
                            <input
                                type="number"
                                value={input.flowRate}
                                onChange={e => setInput(prev => ({ ...prev, flowRate: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Cădere Presiune (bar)</label>
                            <input
                                type="number"
                                step={0.1}
                                value={input.pressureDrop}
                                onChange={e => setInput(prev => ({ ...prev, pressureDrop: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Densitate Fluid (kg/m³)</label>
                            <input
                                type="number"
                                value={input.fluidDensity}
                                onChange={e => setInput(prev => ({ ...prev, fluidDensity: parseFloat(e.target.value) || 1000 }))}
                                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Apă: 1000, Glicol 30%: 1038</p>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-zinc-400">Kv Necesar</div>
                                <div className="text-3xl font-bold text-white">{result.kvRequired}</div>
                                <div className="text-xs text-zinc-500">+15% = {result.kvWithMargin}</div>
                            </div>
                            <div>
                                <div className="text-sm text-zinc-400">Dimensiune</div>
                                <div className="text-3xl font-bold text-purple-400">{result.recommendedDN}</div>
                                <div className="text-xs text-zinc-500">Kv = {result.kvAvailable}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                            <div className="text-xs text-zinc-500">Viteză</div>
                            <div className="text-lg font-semibold text-zinc-100">{result.velocity} m/s</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                            <div className="text-xs text-zinc-500">Deschidere</div>
                            <div className="text-lg font-semibold text-zinc-100">{result.openingPercent}%</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                            <div className="text-xs text-zinc-500">Autoritate</div>
                            <div className="text-lg font-semibold text-zinc-100">{result.authority}</div>
                        </div>
                    </div>

                    {result.recommendations.length > 0 && (
                        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                            {result.recommendations.map((rec, i) => (
                                <p key={i} className="text-sm text-blue-300/80">• {rec}</p>
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
import { Plus, Trash2 } from 'lucide-react';

function FittingsTool() {
    const [fittings, setFittings] = useState<Fitting[]>([
        createFitting('elbow_90_std', 'DN50', 4),
        createFitting('tee_branch', 'DN50', 2),
        createFitting('valve_ball', 'DN50', 2),
    ]);
    const [flowRate, setFlowRate] = useState(10);
    const [innerDiameter, setInnerDiameter] = useState(53);
    const [density, setDensity] = useState(1038);

    const fittingTypes = getFittingTypes();
    const result = calculateFittingsPressureLoss(fittings, flowRate, innerDiameter, density);

    const addFitting = () => {
        setFittings([...fittings, createFitting('elbow_90_std', 'DN50', 1)]);
    };

    const updateFitting = (index: number, field: keyof Fitting, value: any) => {
        const updated = [...fittings];
        (updated[index] as any)[field] = value;
        setFittings(updated);
    };

    const removeFitting = (index: number) => {
        setFittings(fittings.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                    <GitBranch className="w-5 h-5 text-green-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-zinc-100">Pierderi Locale (K-Factors)</h2>
                    <p className="text-sm text-zinc-400">ΔP = K × (ρ × v²) / 2</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Flow Parameters */}
                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                    <h3 className="text-sm font-medium text-zinc-300 mb-4">Parametri Debit</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Debit (m³/h)</label>
                            <input
                                type="number"
                                value={flowRate}
                                onChange={e => setFlowRate(parseFloat(e.target.value) || 0)}
                                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Diametru Interior (mm)</label>
                            <input
                                type="number"
                                value={innerDiameter}
                                onChange={e => setInnerDiameter(parseFloat(e.target.value) || 0)}
                                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Densitate (kg/m³)</label>
                            <input
                                type="number"
                                value={density}
                                onChange={e => setDensity(parseFloat(e.target.value) || 1000)}
                                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                            />
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="mt-4 pt-4 border-t border-zinc-700">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{result.totalPressureDropKPa}</div>
                                <div className="text-xs text-zinc-500">kPa Total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-cyan-400">{result.totalEquivalentLength}</div>
                                <div className="text-xs text-zinc-500">m Echivalent</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fittings List */}
                <div className="lg:col-span-2 bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-zinc-300">Lista Fitinguri</h3>
                        <button
                            onClick={addFitting}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Adaugă
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {fittings.map((fitting, index) => (
                            <div key={fitting.id} className="flex items-center gap-2 bg-zinc-900/50 rounded-lg p-2">
                                <select
                                    value={fitting.type}
                                    onChange={e => updateFitting(index, 'type', e.target.value as FittingType)}
                                    className="flex-1 bg-zinc-800 text-white text-sm px-2 py-1.5 rounded border border-zinc-700"
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
                                    className="w-16 bg-zinc-800 text-white text-sm px-2 py-1.5 rounded border border-zinc-700 text-center"
                                    min={1}
                                />
                                <span className="text-xs text-zinc-500 w-16 text-right">
                                    {result.fittings[index]?.pressureDropKPa.toFixed(2)} kPa
                                </span>
                                <button
                                    onClick={() => removeFitting(index)}
                                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded"
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
    getAvailablePumps,
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
                <div className="p-2 rounded-lg bg-blue-500/20">
                    <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-zinc-100">Dimensionare Pompă</h2>
                    <p className="text-sm text-zinc-400">Curba sistem H = H_st + K × Q²</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                    <h3 className="text-sm font-medium text-zinc-300 mb-4">Cerințe Sistem</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Debit Proiectat (m³/h)</label>
                            <input
                                type="number"
                                value={input.designFlowM3H}
                                onChange={e => setInput(prev => ({ ...prev, designFlowM3H: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Înălțime Statică (m)</label>
                            <input
                                type="number"
                                value={input.staticHeadM}
                                onChange={e => setInput(prev => ({ ...prev, staticHeadM: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Pierderi Fricțiune (kPa)</label>
                            <input
                                type="number"
                                value={input.frictionLossKPa}
                                onChange={e => setInput(prev => ({ ...prev, frictionLossKPa: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Factor Siguranță</label>
                            <select
                                value={input.safetyFactor}
                                onChange={e => setInput(prev => ({ ...prev, safetyFactor: parseFloat(e.target.value) }))}
                                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700"
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
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
                        <div className="text-sm text-zinc-400 mb-2">Punct de Lucru Proiectat</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-3xl font-bold text-white">{result.designFlow} m³/h</div>
                                <div className="text-xs text-zinc-500">Debit</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-cyan-400">{result.designHead} m</div>
                                <div className="text-xs text-zinc-500">Înălțime</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                            <div className="text-xs text-zinc-500">Putere Estimată</div>
                            <div className="text-xl font-semibold text-zinc-100">{result.requiredPower} kW</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                            <div className="text-xs text-zinc-500">Tip Pompă</div>
                            <div className="text-xl font-semibold text-zinc-100">{result.recommendedPumpType}</div>
                        </div>
                    </div>

                    {bestPump && (
                        <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                            <div className="text-sm text-emerald-400 mb-2">Pompă Recomandată</div>
                            <div className="text-lg font-semibold text-white">
                                {bestPump.pump.manufacturer} {bestPump.pump.model}
                            </div>
                            <div className="text-sm text-zinc-400 mt-1">
                                Punct funcționare: {bestPump.operatingPoint.flowM3H} m³/h @ {bestPump.operatingPoint.headM} m
                            </div>
                            <div className="text-sm text-zinc-500">
                                Eficiență: {bestPump.operatingPoint.efficiency}% | Putere: {bestPump.operatingPoint.powerKW} kW
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* System Curve Table */}
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">Curba Sistem</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-700">
                                <th className="text-left py-2 px-3 text-zinc-400 font-medium">Q (m³/h)</th>
                                {result.systemCurve.map((point, i) => (
                                    <th key={i} className="text-center py-2 px-2 text-zinc-300 font-normal">
                                        {point.flowM3H}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-2 px-3 text-zinc-400">H (m)</td>
                                {result.systemCurve.map((point, i) => (
                                    <td key={i} className="text-center py-2 px-2 text-zinc-100">
                                        {point.headM}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {result.recommendations.length > 0 && (
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                    <div className="text-sm text-blue-400 mb-2">Recomandări</div>
                    <ul className="text-sm text-blue-300/80 space-y-1">
                        {result.recommendations.map((rec, i) => (
                            <li key={i}>• {rec}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
