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
            case 'high': return 'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400';
            case 'medium': return 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400';
            case 'low': return 'bg-indigo-500/5 border-indigo-500/20 text-indigo-700 dark:text-emerald-400';
            default: return 'bg-muted/50 border-border text-muted-foreground';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Leaf className="w-8 h-8 text-indigo-500" />
                        Energy & Sustainability
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Optimize your data center's cooling efficiency and carbon footprint.
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
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">IT Load</div>
                        <div className="text-2xl font-bold text-indigo-600 dark:text-emerald-400">
                            {metrics.totalITLoad.toFixed(1)} <span className="text-sm">kW</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/10">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Cooling Infrastructure</div>
                        <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                            {metrics.totalCoolingInfrastructure.toFixed(1)} <span className="text-sm">kW</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-400/5 border border-slate-400/10">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Pumping</div>
                        <div className="text-2xl font-bold text-slate-500 dark:text-slate-400">
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
                            <Zap className="w-5 h-5 text-indigo-500" />
                            Power Usage Effectiveness
                        </h3>
                        <PueGauge
                            pue={metrics.pue}
                            pueIdeal={metrics.pueIdeal}
                            efficiencyClass={metrics.efficiencyClass}
                            efficiencyScore={metrics.efficiencyScore}
                        />
                        <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border">
                            {metrics.totalFacilityPower > 0 ? (
                                <>
                                    Based on your current equipment selection, the system achieves a
                                    <span className={`font-bold ml-1 ${metrics.efficiencyClass === 'Platinum' ? 'text-indigo-500' :
                                        metrics.efficiencyClass === 'Gold' ? 'text-indigo-400' :
                                            metrics.efficiencyClass === 'Silver' ? 'text-slate-400' : 'text-slate-500'
                                        }`}>
                                        {metrics.efficiencyClass}
                                    </span> Efficiency Rating.
                                </>
                            ) : (
                                'Add equipment with power specifications to calculate PUE.'
                            )}
                        </div>
                    </div>
                </div>

                {/* Consumption Chart */}
                <div className="md:col-span-2">
                    <div className="h-full flex flex-col gap-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Wind className="w-5 h-5 text-indigo-500" />
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
                        <Lightbulb className="w-5 h-5 text-indigo-500" />
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

            {/* Static Info Cards (when no recommendations) */}
            {metrics.recommendations.length === 0 && metrics.totalFacilityPower > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border">
                    <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                        <h4 className="font-bold flex items-center gap-2 mb-2 text-indigo-700 dark:text-emerald-400">
                            <Fan className="w-4 h-4" />
                            Free Cooling Active
                        </h4>
                        <p className="text-sm text-foreground/80">
                            Your system is configured for <strong>{metrics.freeCoolingHours.toLocaleString()} hours</strong> of
                            free cooling per year in {projectDetails.location || 'your region'}.
                        </p>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-500/5 border border-slate-500/10">
                        <h4 className="font-bold flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-400">
                            <Zap className="w-4 h-4" />
                            VSD Pumps Detected
                        </h4>
                        <p className="text-sm text-foreground/80">
                            Variable speed drives are active. Ensure control logic is set to ΔP-v for maximum savings.
                        </p>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-400/5 border border-slate-400/10">
                        <h4 className="font-bold flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-400">
                            <ThermometerSun className="w-4 h-4" />
                            Heat Recovery Potential
                        </h4>
                        <p className="text-sm text-foreground/80">
                            Total recoverable heat: <strong>{metrics.heatRecoveryPotentialKw.toFixed(0)} kW</strong>.
                            This could heat ~{Math.round(metrics.heatRecoveryPotentialKw * 25).toLocaleString()} m² of office space.
                        </p>
                    </div>
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
