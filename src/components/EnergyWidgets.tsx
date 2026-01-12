import React from 'react';
import { Zap, Leaf, TrendingDown, Info } from 'lucide-react';

/**
 * PUE (Power Usage Effectiveness) Gauge Component
 * Ideal PUE is 1.0 (perfect efficiency). Typical DC is 1.5-1.8. Google is ~1.1.
 */
export const PueGauge = ({ pue = 1.6 }: { pue?: number }) => {
    // Normalize for gauge: 1.0 = 0%, 2.0 = 100% (roughly)
    const percentage = Math.min(Math.max((pue - 1.0) * 100, 0), 100);

    let color = 'text-red-500';
    if (pue < 1.4) color = 'text-emerald-500';
    else if (pue < 1.6) color = 'text-yellow-500';

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
                    className={`absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-transparent border-b-0 transition-transform duration-1000 ease-out ${pue < 1.4 ? 'border-t-emerald-500 border-l-emerald-500' : 'border-t-yellow-500 border-l-yellow-500'}`}
                    style={{ transform: `rotate(${-45 + (percentage * 1.8)}deg)` }}
                ></div>
            </div>

            <div className="text-center relative -mt-8">
                <div className={`text-4xl font-black ${color} tracking-tighter`}>{pue.toFixed(2)}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Projected PUE</div>
            </div>

            <div className="mt-6 w-full space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Efficiency Class</span>
                    <span className={`font-bold ${color}`}>{pue < 1.2 ? 'Platinum' : pue < 1.4 ? 'Gold' : pue < 1.6 ? 'Silver' : 'Bronze'}</span>
                </div>
                <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div className={`h-full ${pue < 1.4 ? 'bg-emerald-500' : 'bg-yellow-500'} transition-all`} style={{ width: `${(pue / 2.5) * 100}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export const EnergyConsumptionChart = () => {
    return (
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm flex flex-col h-full">
            <h3 className="font-bold flex items-center gap-2 mb-6">
                <Leaf className="w-5 h-5 text-emerald-500" />
                Carbon Footprint Impact
            </h3>

            <div className="flex-1 flex gap-4 items-end justify-center min-h-[120px] pb-4 border-b border-border/50">
                {/* Simplified Bar Chart */}
                {[40, 65, 45, 80, 55, 30].map((h, i) => (
                    <div key={i} className="group relative w-8 bg-muted/30 rounded-t-lg hover:bg-primary/20 transition-all cursor-pointer">
                        <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-primary/40 to-primary/80 rounded-t-lg transition-all duration-500 group-hover:bg-primary"
                            style={{ height: `${h}%` }}
                        ></div>
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-opacity">
                            {h * 120} kWh
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold text-foreground">~450 <span className="text-sm font-normal text-muted-foreground">tons/yr</span></div>
                    <div className="text-xs text-muted-foreground">CO2 Optimization</div>
                </div>
                <div className="text-right">
                    <div className="text-emerald-500 font-bold flex items-center gap-1 justify-end">
                        <TrendingDown className="w-4 h-4" />
                        12%
                    </div>
                    <div className="text-xs text-muted-foreground">vs. Standard Cooling</div>
                </div>
            </div>
        </div>
    )
}
