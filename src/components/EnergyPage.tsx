import React from 'react';
import { PueGauge, EnergyConsumptionChart } from './EnergyWidgets';
import { Leaf, Wind, Zap, Scale } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';

export const EnergyPage = () => {
    const { equipmentList } = useProject();

    // Mock calculations based on equipment
    const totalPower = equipmentList.reduce((acc, item) => acc + (item.power || 0), 0);
    const estKwhPerYear = totalPower * 24 * 365 * 0.8; // 80% load factor

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Leaf className="w-8 h-8 text-emerald-500" />
                        Energy & Sustainability
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Optimize your data center's cooling efficiency and carbon footprint.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Estimated Load</div>
                    <div className="text-3xl font-mono font-bold">{totalPower.toFixed(1)} <span className="text-lg text-muted-foreground">kW</span></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* PUE Gauge Section */}
                <div className="md:col-span-1">
                    <div className="h-full flex flex-col gap-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Power Usage Effectiveness
                        </h3>
                        <PueGauge pue={1.42} />
                        <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border">
                            Based on your current equipment selection and hydraulic configuration, the system achieves a Gold Efficiency Rating.
                        </div>
                    </div>
                </div>

                {/* Consumption Chart */}
                <div className="md:col-span-2">
                    <div className="h-full flex flex-col gap-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Wind className="w-5 h-5 text-blue-500" />
                            Annual Carbon Impact
                        </h3>
                        <div className="flex-1">
                            <EnergyConsumptionChart />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border">
                <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400">
                        <Leaf className="w-4 h-4" />
                        Free Cooling Potential
                    </h4>
                    <p className="text-sm text-foreground/80">
                        Your location allows for approximately <strong>2,400 hours</strong> of free cooling per year. Consider adding a dry cooler loop.
                    </p>
                </div>
                <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                        <Zap className="w-4 h-4" />
                        Variable Speed Drive
                    </h4>
                    <p className="text-sm text-foreground/80">
                        All selected pumps support VSD. Ensure control logic is set to ΔP-v for maximum savings (approx -30% energy).
                    </p>
                </div>
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-400">
                        <Scale className="w-4 h-4" />
                        Heat Recovery
                    </h4>
                    <p className="text-sm text-foreground/80">
                        Total rejected heat is {totalPower * 0.9} kW. This could heat <strong>2,500 m²</strong> of office space during winter.
                    </p>
                </div>
            </div>
        </div>
    );
};
