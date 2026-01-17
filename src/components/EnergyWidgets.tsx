import React from 'react';
import { Zap, Leaf, TrendingDown, Info, TrendingUp } from 'lucide-react';
import { EfficiencyClass } from '@/lib/calculations/energy';

/**
 * PUE (Power Usage Effectiveness) Gauge Component
 * Ideal PUE is 1.0 (perfect efficiency). Typical DC is 1.5-1.8. Google is ~1.1.
 */
interface PueGaugeProps {
    pue?: number;
    pueIdeal?: number;
    efficiencyClass?: EfficiencyClass;
    efficiencyScore?: number;
}

export const PueGauge = ({
    pue = 1.6,
    pueIdeal,
    efficiencyClass,
    efficiencyScore
}: PueGaugeProps) => {
    // Normalize for gauge: 1.0 = 0%, 2.0 = 100% (roughly)
    const percentage = Math.min(Math.max((pue - 1.0) * 100, 0), 100);

    let color = 'text-slate-500';
    if (pue < 1.4) color = 'text-indigo-500';
    else if (pue < 1.6) color = 'text-indigo-400';

    const displayClass = efficiencyClass || (pue < 1.2 ? 'Platinum' : pue < 1.4 ? 'Gold' : pue < 1.6 ? 'Silver' : 'Bronze');

    return (
        <div className="relative flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl shadow-sm">
            <div className="absolute top-4 right-4 text-xs text-muted-foreground cursor-help group">
                <Info className="w-4 h-4" />
                <div className="absolute right-0 w-48 p-2 bg-popover border border-border rounded-md text-[10px] hidden group-hover:block z-50 shadow-xl">
                    Power Usage Effectiveness (PUE) = Total Facility Energy / IT Equipment Energy. Closer to 1.0 is better.
                </div>
            </div>

            <div className="relative w-40 h-20 overflow-hidden mb-4">
                {/* Gauge Background */}
                <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-muted/30 border-b-0 rotate-0"></div>
                {/* Gauge Value */}
                <div
                    className={`absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-transparent border-b-0 transition-transform duration-1000 ease-out ${pue < 1.4 ? 'border-t-indigo-500 border-l-indigo-500' : pue < 1.6 ? 'border-t-indigo-400 border-l-indigo-400' : 'border-t-slate-500 border-l-slate-500'}`}
                    style={{ transform: `rotate(${-45 + (percentage * 1.8)}deg)` }}
                ></div>
            </div>

            <div className="text-center relative -mt-8">
                <div className={`text-4xl font-black ${color} tracking-tighter`}>{pue.toFixed(2)}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
                    {pue === 1.0 ? 'Add Equipment' : 'Calculated PUE'}
                </div>
            </div>

            <div className="mt-6 w-full space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Efficiency Class</span>
                    <span className={`font-bold ${color}`}>{displayClass}</span>
                </div>
                <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${pue < 1.4 ? 'bg-indigo-500' : pue < 1.6 ? 'bg-indigo-400' : 'bg-slate-500'}`}
                        style={{ width: `${efficiencyScore || Math.max(10, 100 - (pue - 1) * 100)}%` }}
                    ></div>
                </div>
                {pueIdeal && pueIdeal < pue && (
                    <div className="text-[10px] text-muted-foreground text-center mt-2">
                        Target PUE with optimizations: <span className="font-bold text-indigo-500">{pueIdeal.toFixed(2)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

interface EnergyConsumptionChartProps {
    annualEnergyKwh?: number;
    annualCO2Tons?: number;
    potentialReductionPercent?: number;
    freeCoolingSavingsKwh?: number;
}

export const EnergyConsumptionChart = ({
    annualEnergyKwh = 0,
    annualCO2Tons = 0,
    potentialReductionPercent = 0,
    freeCoolingSavingsKwh = 0
}: EnergyConsumptionChartProps) => {
    // Generate monthly distribution (simplified - slightly random pattern)
    const monthlyPattern = [0.85, 0.88, 0.82, 0.78, 0.72, 0.95, 1.0, 0.98, 0.85, 0.75, 0.80, 0.88];
    const monthLabels = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthlyKwh = monthlyPattern.map(p => (annualEnergyKwh / 12) * p);
    const maxMonthly = Math.max(...monthlyKwh);

    // Format large numbers
    const formatEnergy = (kwh: number) => {
        if (kwh >= 1000000) return `${(kwh / 1000000).toFixed(1)}M`;
        if (kwh >= 1000) return `${(kwh / 1000).toFixed(0)}k`;
        return kwh.toFixed(0);
    };

    const hasData = annualEnergyKwh > 0;

    return (
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm flex flex-col h-full">
            <h3 className="font-bold flex items-center gap-2 mb-6">
                <Leaf className="w-5 h-5 text-indigo-500" />
                Carbon Footprint Impact
            </h3>

            <div className="flex-1 flex gap-2 items-end justify-center min-h-[120px] pb-4 border-b border-border/50">
                {hasData ? (
                    monthlyKwh.map((kwh, i) => {
                        const heightPercent = maxMonthly > 0 ? (kwh / maxMonthly) * 100 : 0;
                        return (
                            <div key={i} className="group relative flex-1 max-w-8 bg-muted/30 rounded-t-lg hover:bg-primary/20 transition-all cursor-pointer" style={{ height: '100px' }}>
                                <div
                                    className="absolute bottom-0 w-full bg-indigo-500/80 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-600 shadow-sm"
                                    style={{ height: `${heightPercent}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-popover border border-border px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-opacity z-10">
                                    {monthLabels[i]}: {formatEnergy(kwh)} kWh
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex items-center justify-center text-muted-foreground text-sm italic h-full">
                        Adăugați echipamente pentru a vedea consumul estimat
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold text-foreground">
                        {hasData ? `~${annualCO2Tons.toFixed(0)}` : '—'}
                        <span className="text-sm font-normal text-muted-foreground"> tons/yr</span>
                    </div>
                    <div className="text-xs text-muted-foreground">CO2 Emissions</div>
                </div>
                <div className="text-right">
                    {potentialReductionPercent > 0 ? (
                        <>
                            <div className="text-indigo-500 font-bold flex items-center gap-1 justify-end">
                                <TrendingDown className="w-4 h-4" />
                                {potentialReductionPercent.toFixed(0)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Potential Reduction</div>
                        </>
                    ) : hasData ? (
                        <>
                            <div className="text-slate-500 font-bold flex items-center gap-1 justify-end">
                                <TrendingUp className="w-4 h-4" />
                                Optimize
                            </div>
                            <div className="text-xs text-muted-foreground">Add Free Cooling</div>
                        </>
                    ) : (
                        <>
                            <div className="text-muted-foreground font-bold">—</div>
                            <div className="text-xs text-muted-foreground">No Data</div>
                        </>
                    )}
                </div>
            </div>

            {freeCoolingSavingsKwh > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    💨 Free Cooling Savings: <span className="font-bold text-indigo-500">{formatEnergy(freeCoolingSavingsKwh)} kWh/yr</span>
                </div>
            )}
        </div>
    );
};
