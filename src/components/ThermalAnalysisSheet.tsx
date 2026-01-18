import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Thermometer, Flame, Droplets, Wind, Layers, CheckCircle } from 'lucide-react';
import { PipeSegment } from '@/lib/types';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';

interface ThermalAnalysisSheetProps {
    segment: PipeSegment | null;
    onClose: () => void;
}

export function ThermalAnalysisSheet({ segment, onClose }: ThermalAnalysisSheetProps) {
    // Environmental Inputs State
    const [ambientTemp, setAmbientTemp] = useState(30); // °C
    const [fluidTemp, setFluidTemp] = useState(7);      // °C (Chilled Water typical)
    const [humidity, setHumidity] = useState(60);       // % RH
    const [insulationThickness, setInsulationThickness] = useState(19); // mm (Armaflex standard)
    const [insulationConductivity, setInsulationConductivity] = useState(0.036); // W/mK

    const standardData = useMemo(() => {
        if (!segment) return null;
        if (segment.material === 'custom') return null;
        return PIPE_STANDARDS[segment.material];
    }, [segment]);

    const calculations = useMemo(() => {
        if (!segment) return null;

        const od_mm = standardData
            ? standardData.dimensions.find(d => d.dn === segment.size)?.od || 0
            : 50; // default/fallback

        const od_m = od_mm / 1000;
        const ins_m = insulationThickness / 1000;
        const total_od_m = od_m + (2 * ins_m);
        const length_m = segment.length;

        // 1. Dew Point Calculation (Magnus formula approximation)
        // const lnRH = Math.log(humidity / 100);
        // const beta = 17.625;
        // const lambda = 243.04;
        // const dp_numer = lambda * (lnRH + (beta * ambientTemp) / (lambda + ambientTemp));
        // const dp_denom = beta - (lnRH + (beta * ambientTemp) / (lambda + ambientTemp));
        // const dewPoint = dp_numer / dp_denom;

        // Simplified High-Performance approx
        const a = 17.27;
        const b = 237.7;
        const alpha = ((a * ambientTemp) / (b + ambientTemp)) + Math.log(humidity / 100.0);
        const dewPoint = (b * alpha) / (a - alpha);

        // 2. Surface Tempearture Estimate (Simplified)
        // R_ins = ln(D_out/D_in) / (2*pi*k)
        const r_ins = Math.log(total_od_m / od_m) / (2 * Math.PI * insulationConductivity);

        // R_se (Surface Air Resistance) - approx 0.1 m²K/W for indoor still air
        const h_se = 9; // W/m²K convection coeff
        const r_se = 1 / (Math.PI * total_od_m * h_se);

        const total_R_thermal = r_ins + r_se;
        const delta_T_overall = ambientTemp - fluidTemp;

        // Heat Loss (or Gain) Q (Watts per meter)
        const q_loss_per_meter = delta_T_overall / total_R_thermal;
        const total_heat_transfer = q_loss_per_meter * length_m; // Watts

        // Surface Temp Ts
        // Q = (Tam - Ts) / R_se => Ts = Tam - Q * R_se
        const surfaceTemp = ambientTemp - (q_loss_per_meter * r_se);

        return {
            dewPoint,
            surfaceTemp,
            q_loss_per_meter,
            total_heat_transfer,
            riskCondensation: surfaceTemp < dewPoint
        };
    }, [segment, standardData, ambientTemp, fluidTemp, humidity, insulationThickness, insulationConductivity]);

    if (!segment) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={onClose}
            />
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border shadow-2xl z-50 overflow-hidden flex flex-col"
            >
                <div className="p-5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <Flame className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-wider text-xs">Thermal Analysis</span>
                        </div>
                        <button onClick={onClose}>
                            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold">{segment.size} - {segment.length}m</h2>
                    <p className="text-xs text-muted-foreground">Heat transfer & condensation risk assessment</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Status Card */}
                    {calculations && (
                        <div className={`p-4 rounded-xl border ${calculations.riskCondensation
                            ? 'bg-destructive/10 border-destructive/50'
                            : 'bg-primary/10 border-primary/50'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {calculations.riskCondensation
                                    ? <Droplets className="w-6 h-6 text-destructive" />
                                    : <CheckCircle className="w-6 h-6 text-primary" />
                                }
                                <div className="font-bold text-lg">
                                    {calculations.riskCondensation ? 'Condensation RISK' : 'Safe Operation'}
                                </div>
                            </div>
                            <p className="text-xs opacity-80 leading-relaxed">
                                {calculations.riskCondensation
                                    ? `Surface temp (${calculations.surfaceTemp.toFixed(1)}°C) is below Dew Point (${calculations.dewPoint.toFixed(1)}°C). Increase insulation!`
                                    : `Surface temp (${calculations.surfaceTemp.toFixed(1)}°C) is above Dew Point (${calculations.dewPoint.toFixed(1)}°C).`}
                            </p>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2 border-b border-border/50 pb-2">
                            <Wind className="w-4 h-4 text-zinc-400" /> Environment
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Ambient (°C)</label>
                                <input type="number" value={ambientTemp} onChange={e => setAmbientTemp(Number(e.target.value))}
                                    className="w-full bg-muted/50 border border-border/50 rounded px-2 py-1 text-sm text-foreground" />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Humidity (%)</label>
                                <input type="number" value={humidity} onChange={e => setHumidity(Number(e.target.value))}
                                    className="w-full bg-muted/50 border border-border/50 rounded px-2 py-1 text-sm text-foreground" />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Fluid Temp (°C)</label>
                                <input type="number" value={fluidTemp} onChange={e => setFluidTemp(Number(e.target.value))}
                                    className="w-full bg-muted/50 border border-border/50 rounded px-2 py-1 text-sm cursor-not-allowed opacity-70" />
                            </div>
                        </div>

                        <h3 className="text-sm font-semibold flex items-center gap-2 border-b border-border/50 pb-2 pt-2">
                            <Layers className="w-4 h-4 text-zinc-400" /> Insulation
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Thickness (mm)</label>
                                <input type="number" value={insulationThickness} onChange={e => setInsulationThickness(Number(e.target.value))}
                                    className="w-full bg-muted/50 border border-border/50 rounded px-2 py-1 text-sm text-foreground" />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Conductivity (W/mK)</label>
                                <input type="number" step="0.001" value={insulationConductivity} onChange={e => setInsulationConductivity(Number(e.target.value))}
                                    className="w-full bg-muted/50 border border-border/50 rounded px-2 py-1 text-sm text-foreground" />
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {calculations && (
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-semibold flex items-center gap-2 border-b border-border/50 pb-2">
                                <Thermometer className="w-4 h-4 text-zinc-400" /> Results
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-muted/20 p-2 rounded">
                                    <div className="text-xs text-muted-foreground">Dew Point</div>
                                    <div className="font-mono font-bold text-foreground">{calculations.dewPoint.toFixed(1)}°C</div>
                                </div>
                                <div className="bg-muted/20 p-2 rounded">
                                    <div className="text-xs text-muted-foreground">Surface Temp</div>
                                    <div className={`font-mono font-bold ${calculations.riskCondensation ? 'text-destructive' : 'text-foreground'}`}>
                                        {calculations.surfaceTemp.toFixed(1)}°C
                                    </div>
                                </div>
                                <div className="col-span-2 bg-gradient-to-r from-primary/10 to-transparent p-3 rounded border border-primary/20">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-primary font-bold uppercase tracking-wider">Energy Loss</span>
                                        <Flame className="w-3 h-3 text-primary/70" />
                                    </div>
                                    <div className="text-2xl font-black text-primary">
                                        {calculations.total_heat_transfer.toFixed(1)} <span className="text-sm font-medium opacity-70">Watts</span>
                                    </div>
                                    <div className="text-[10px] text-primary/60 mt-0.5">
                                        Per meter: {calculations.q_loss_per_meter.toFixed(1)} W/m
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

