import React, { useMemo } from 'react';
import { PueGauge, EnergyConsumptionChart } from './EnergyWidgets';
import { Leaf, Wind, Zap, Scale, Lightbulb, ThermometerSun, Fan, AlertCircle } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { calculateEnergyMetrics, EnergyRecommendation } from '@/lib/calculations/energy';

export const EnergyPage = () => {
    const { equipmentList, projectDetails } = useProject();

    // Calculate real energy metrics based on equipment
    const metrics = useMemo(() =>
        calculateEnergyMetrics(equipmentList, projectDetails.location),
        [equipmentList, projectDetails.location]
    );

    // Calculate potential reduction percentage
    const potentialReduction = metrics.freeCoolingSavingsKwh > 0 && metrics.annualEnergyKwh > 0
        ? (metrics.freeCoolingSavingsKwh / metrics.annualEnergyKwh) * 100
        : 0;

    // Recommendation icon mapping
    const getRecommendationIcon = (category: string) => {
        switch (category) {
            case 'efficiency': return Zap;
            case 'sustainability': return Leaf;
            case 'cost': return Scale;
            default: return Lightbulb;
        }
    };

    const getRecommendationColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-destructive/10 border-destructive/20 text-destructive';
            case 'medium': return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
            case 'low': return 'bg-primary/10 border-primary/20 text-primary';
            default: return 'bg-muted/50 border-border text-muted-foreground';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Leaf className="w-8 h-8 text-primary" />
                        Energy & Sustainability
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Optimize your data center&apos;s cooling efficiency and carbon footprint.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Power</div>
                    <div className="text-3xl font-mono font-bold">
                        {metrics.totalFacilityPower.toFixed(1)}
                        <span className="text-lg text-muted-foreground"> kW</span>
                    </div>
                    {metrics.totalFacilityPower === 0 && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                            <AlertCircle className="w-3 h-3" />
                            Add equipment with power data
                        </div>
                    )}
                </div>
            </div>

            {/* Power Breakdown Cards */}
            {metrics.totalFacilityPower > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">IT Load</div>
                        <div className="text-2xl font-bold text-primary">
                            {metrics.totalITLoad.toFixed(1)} <span className="text-sm">kW</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Cooling Infrastructure</div>
                        <div className="text-2xl font-bold text-foreground">
                            {metrics.totalCoolingInfrastructure.toFixed(1)} <span className="text-sm">kW</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Pumping</div>
                        <div className="text-2xl font-bold text-foreground/80">
                            {metrics.totalPumpPower.toFixed(1)} <span className="text-sm">kW</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* PUE Gauge Section */}
                <div className="md:col-span-1">
                    <div className="h-full flex flex-col gap-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            Power Usage Effectiveness
                        </h3>
                        {metrics.totalFacilityPower > 0 ? (
                            <>
                                <PueGauge
                                    pue={metrics.pue}
                                    pueIdeal={metrics.pueIdeal}
                                    efficiencyClass={metrics.efficiencyClass}
                                    efficiencyScore={metrics.efficiencyScore}
                                    isEstimate={metrics.pueIsEstimate}
                                />
                                <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border">
                                    {metrics.pueIsEstimate ? (
                                        <>⚠️ PUE ESTIMAT — nu s-au definit echipamente IT (CRAH/CDU). Valoarea e orientativă.</>
                                    ) : (
                                        <>Based on your current equipment selection, the system achieves a
                                        <span className={`font-bold ml-1 ${metrics.efficiencyClass === 'Platinum' ? 'text-primary' :
                                            metrics.efficiencyClass === 'Gold' ? 'text-primary' :
                                                metrics.efficiencyClass === 'Silver' ? 'text-muted-foreground' : 'text-muted-foreground'
                                            }`}>
                                            {metrics.efficiencyClass}
                                        </span> Efficiency Rating.</>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 bg-muted/20 rounded-2xl border border-dashed border-border text-center">
                                <p className="text-sm text-muted-foreground">
                                    Nu există echipamente cu putere — PUE nu poate fi calculat.
                                    Adăugați echipamente IT și de răcire pentru a obține un PUE real.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Consumption Chart */}
                <div className="md:col-span-2">
                    <div className="h-full flex flex-col gap-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Wind className="w-5 h-5 text-primary" />
                            Annual Carbon Impact
                        </h3>
                        <div className="flex-1">
                            <EnergyConsumptionChart
                                annualEnergyKwh={metrics.annualEnergyKwh}
                                annualCO2Tons={metrics.annualCO2Tons}
                                potentialReductionPercent={potentialReduction}
                                freeCoolingSavingsKwh={metrics.freeCoolingSavingsKwh}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            {metrics.recommendations.length > 0 && (
                <div className="pt-6 border-t border-border">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Optimization Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {metrics.recommendations.map((rec: EnergyRecommendation) => {
                            const Icon = getRecommendationIcon(rec.category);
                            return (
                                <div
                                    key={rec.id}
                                    className={`p-5 rounded-xl border ${getRecommendationColor(rec.priority)}`}
                                >
                                    <h4 className="font-bold flex items-center gap-2 mb-2">
                                        <Icon className="w-4 h-4" />
                                        {rec.title}
                                    </h4>
                                    <p className="text-sm text-foreground/80 mb-3">
                                        {rec.description}
                                    </p>
                                    <div className="text-xs font-semibold opacity-70 bg-background/50 rounded px-2 py-1 inline-block">
                                        💡 {rec.potentialSavings}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Static Info Cards — ONLY for facts we can verify from equipment data */}
            {metrics.recommendations.length === 0 && metrics.totalFacilityPower > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border">
                    {metrics.hasFreeCooling && (
                        <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
                            <h4 className="font-bold flex items-center gap-2 mb-2 text-primary">
                                <Fan className="w-4 h-4" />
                                Free Cooling Equipment Present
                            </h4>
                            <p className="text-sm text-foreground/80">
                                Sistemul include echipamente de free cooling. Durata estimată în
                                <strong> {metrics.freeCoolingHours.toLocaleString()} ore/an</strong> pentru
                                {projectDetails.location || ' regiunea selectată'} (valoare tabelară, estimare).
                            </p>
                        </div>
                    )}
                    {metrics.hasVSDPumps && (
                        <div className="p-5 rounded-xl bg-muted/30 border border-border/50">
                            <h4 className="font-bold flex items-center gap-2 mb-2 text-foreground">
                                <Zap className="w-4 h-4" />
                                VSD Pumps Detected
                            </h4>
                            <p className="text-sm text-foreground/80">
                                Variable speed drives are active. Ensure control logic is set to ΔP-v for maximum savings.
                            </p>
                        </div>
                    )}
                    {metrics.hasHeatRecovery && (
                        <div className="p-5 rounded-xl bg-muted/20 border border-border/40">
                            <h4 className="font-bold flex items-center gap-2 mb-2 text-foreground/80">
                                <ThermometerSun className="w-4 h-4" />
                                Heat Recovery Potential
                            </h4>
                            <p className="text-sm text-foreground/80">
                                Total recoverable heat: <strong>{metrics.heatRecoveryPotentialKw.toFixed(0)} kW</strong>.
                                This could heat ~{Math.round(metrics.heatRecoveryPotentialKw * 25).toLocaleString()} m² of office space.
                            </p>
                        </div>
                    )}
                    {!metrics.hasFreeCooling && !metrics.hasVSDPumps && !metrics.hasHeatRecovery && (
                        <div className="p-5 rounded-xl bg-muted/20 border border-border/40 md:col-span-3">
                            <p className="text-sm text-foreground/80">
                                Niciun sistem special detectat în echipamentele proiectului (free cooling, pompe VSD sau recuperare căldură).
                                Adăugați echipamente cu opțiunile respective pentru ca aceste carduri să devină relevante.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {metrics.totalFacilityPower === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Leaf className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold mb-2">No Energy Data Available</h3>
                    <p className="text-sm max-w-md mx-auto">
                        Add equipment with power specifications (kW) in the Equipment Manager to see energy
                        efficiency calculations, PUE projections, and optimization recommendations.
                    </p>
                </div>
            )}
        </div>
    );
};
