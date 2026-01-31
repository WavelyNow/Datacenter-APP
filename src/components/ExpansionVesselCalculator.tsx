'use client';

import React, { useState, useMemo } from 'react';
import {
    Droplets,
    Thermometer,
    ArrowUp,
    Gauge,
    AlertTriangle,
    CheckCircle,
    Info,
    Calculator
} from 'lucide-react';
import {
    calculateExpansionVessel,
    ExpansionVesselInput
} from '@/lib/calculations/expansionVessel';
import { useProject } from '@/context/ProjectContext';
import { calculateTotalVolume } from '@/lib/calculations/hydraulics';

interface ExpansionVesselCalculatorProps {
    externalSystemVolume?: number;
}

export function ExpansionVesselCalculator({ externalSystemVolume }: ExpansionVesselCalculatorProps) {
    const { segments, equipmentList, glycolPercentage, fluidType } = useProject();

    // Calculate system volume from project data or use external prop
    const systemVolume = useMemo(() => {
        if (externalSystemVolume !== undefined) return externalSystemVolume;
        return calculateTotalVolume(segments, equipmentList, true);
    }, [segments, equipmentList, externalSystemVolume]);

    // Input state
    const [input, setInput] = useState<ExpansionVesselInput>({
        systemVolume: systemVolume,
        glycolPercentage: glycolPercentage,
        fluidType: fluidType,
        minTemperature: 10,
        maxTemperature: 45,
        staticHeight: 5,
        safetyValvePressure: 6,
    });

    // Update input when project data changes
    React.useEffect(() => {
        setInput(prev => ({
            ...prev,
            systemVolume: systemVolume,
            glycolPercentage: glycolPercentage,
            fluidType: fluidType,
        }));
    }, [systemVolume, glycolPercentage, fluidType]);

    // Calculate result
    const result = useMemo(() => {
        return calculateExpansionVessel(input);
    }, [input]);

    const handleInputChange = (field: keyof ExpansionVesselInput, value: number) => {
        setInput(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary shadow-lg shadow-primary/20">
                    <Droplets className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        Dimensionare Vas Expansiune
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Conform EN 12828 pentru sisteme închise
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-primary" />
                            Parametri Sistem
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* System Volume */}
                            <div>
                                <label htmlFor="systemVolume" className="block text-xs text-muted-foreground mb-1">
                                    Volum Sistem (L)
                                </label>
                                <input
                                    id="systemVolume"
                                    type="number"
                                    value={input.systemVolume}
                                    onChange={(e) => handleInputChange('systemVolume', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Din proiect: {systemVolume.toFixed(0)} L
                                </p>
                            </div>

                            {/* Glycol Percentage */}
                            <div>
                                <label htmlFor="glycolPercentage" className="block text-xs text-muted-foreground mb-1">
                                    Concentrație Glicol (%)
                                </label>
                                <input
                                    id="glycolPercentage"
                                    type="number"
                                    value={input.glycolPercentage}
                                    onChange={(e) => handleInputChange('glycolPercentage', parseFloat(e.target.value) || 0)}
                                    min={0}
                                    max={60}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>

                            {/* Min Temperature */}
                            <div>
                                <label htmlFor="minTemperature" className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Thermometer className="w-3 h-3" />
                                    T min / Umplere (°C)
                                </label>
                                <input
                                    id="minTemperature"
                                    type="number"
                                    value={input.minTemperature}
                                    onChange={(e) => handleInputChange('minTemperature', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>

                            {/* Max Temperature */}
                            <div>
                                <label htmlFor="maxTemperature" className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Thermometer className="w-3 h-3 text-destructive" />
                                    T max / Operare (°C)
                                </label>
                                <input
                                    id="maxTemperature"
                                    type="number"
                                    value={input.maxTemperature}
                                    onChange={(e) => handleInputChange('maxTemperature', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>

                            {/* Static Height */}
                            <div>
                                <label htmlFor="staticHeight" className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3" />
                                    Înălțime Statică (m)
                                </label>
                                <input
                                    id="staticHeight"
                                    type="number"
                                    value={input.staticHeight}
                                    onChange={(e) => handleInputChange('staticHeight', parseFloat(e.target.value) || 0)}
                                    step={0.5}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Cel mai înalt punct față de vas
                                </p>
                            </div>

                            {/* Safety Valve */}
                            <div>
                                <label htmlFor="safetyValvePressure" className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Gauge className="w-3 h-3" />
                                    Supapa Siguranță (bar)
                                </label>
                                <select
                                    id="safetyValvePressure"
                                    value={input.safetyValvePressure}
                                    onChange={(e) => handleInputChange('safetyValvePressure', parseFloat(e.target.value))}
                                    className="w-full bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value={3}>3 bar</option>
                                    <option value={4}>4 bar</option>
                                    <option value={6}>6 bar</option>
                                    <option value={8}>8 bar</option>
                                    <option value={10}>10 bar</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Warnings */}
                    {result.warnings.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-amber-400 mb-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">Atenționări</span>
                            </div>
                            <ul className="text-sm text-amber-300/80 space-y-1">
                                {result.warnings.map((warning, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-amber-500">•</span>
                                        {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    {/* Main Result */}
                    <div className={`rounded-xl p-6 border ${result.isValid
                        ? 'bg-linear-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30'
                        : 'bg-linear-to-br from-red-500/10 to-orange-500/10 border-red-500/30'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-zinc-400">Vas Recomandat</span>
                            {result.isValid ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            )}
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">
                            {result.recommendedVessel} L
                        </div>
                        <p className="text-sm text-zinc-400">
                            Volum necesar: {result.requiredVolume} L
                        </p>
                    </div>

                    {/* Pressure Details */}
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Gauge className="w-4 h-4" />
                            Presiuni
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-background/50 rounded-lg p-3">
                                <div className="text-xs text-muted-foreground">Presiune Statică</div>
                                <div className="text-lg font-semibold text-foreground">
                                    {result.staticPressure} bar
                                </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3">
                                <div className="text-xs text-muted-foreground">Preîncărcare</div>
                                <div className="text-lg font-semibold text-primary">
                                    {result.prechargePressure} bar
                                </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3">
                                <div className="text-xs text-muted-foreground">Umplere</div>
                                <div className="text-lg font-semibold text-primary/80">
                                    {result.fillPressure} bar
                                </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3">
                                <div className="text-xs text-muted-foreground">Maximă Admisă</div>
                                <div className="text-lg font-semibold text-destructive">
                                    {result.maxPressure} bar
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expansion Details */}
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Droplets className="w-4 h-4" />
                            Dilatare Fluid
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {result.expansionVolume} L
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Volum Dilatare
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary/80">
                                    {(result.expansionCoefficient * 100).toFixed(2)}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Coef. Dilatare
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary/60">
                                    {(result.acceptanceFactor * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Factor Acceptare
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                            <div className="text-sm text-blue-300/80">
                                <p className="mb-1">
                                    <strong>Rezervă apă inițială:</strong> {result.waterReserve} L
                                </p>
                                <p>
                                    Vasul trebuie preîncărcat la <strong>{result.prechargePressure} bar</strong> (azot)
                                    înainte de umplerea sistemului.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
