import React, { useMemo } from 'react';
import { Scale, ClipboardList, Droplet, FileSpreadsheet, PieChart as PieIcon } from 'lucide-react';
import { generateBoQ, getDetailedWeightReport, calculatePipeVolume } from '@/lib/calculations';
import { useProject } from '@/context/ProjectContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, useTransform, useMotionValue, animate } from 'framer-motion';

// --- Animated Number Component ---
function AnimatedNumber({ value, unit, className }: { value: number, unit?: string, className?: string }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest * 10) / 10);

    React.useEffect(() => {
        const controls = animate(count, value, { duration: 1, ease: 'easeOut' });
        return controls.stop;
    }, [value, count]);

    return (
        <span className={className}>
            <motion.span>{rounded}</motion.span>
            {unit && <span className="opacity-70 ml-1">{unit}</span>}
        </span>
    );
}

// --- Donut Chart Stats ---
const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))', 'hsl(var(--muted))'];

export const ResultsDisplay: React.FC = React.memo(() => {
    const {
        segments,
        equipmentList,
        glycolPercentage,
        safetyMargin,
        safetyMarginPercentage
    } = useProject();

    // Optimize heavy calculations
    const { pipesVolume, equipmentVolume, totalSystemVolume } = useMemo(() => {
        const pVol = segments.reduce((sum, seg) => sum + (seg ? calculatePipeVolume(seg) : 0), 0);
        const eVol = equipmentList?.reduce((sum, item) => sum + (item.volume || 0), 0) || 0;
        return {
            pipesVolume: pVol,
            equipmentVolume: eVol,
            totalSystemVolume: pVol + eVol
        };
    }, [segments, equipmentList]);

    const boqItems = useMemo(() => generateBoQ(segments), [segments]);

    const totalWeight = useMemo(() => {
        const detailedWeights = getDetailedWeightReport(segments, equipmentList, glycolPercentage);
        return detailedWeights.reduce((sum, item) => sum + item.totalWeight, 0);
    }, [segments, equipmentList, glycolPercentage]);

    const { toOrderVolume } = useMemo(() => {
        const marginMultiplier = safetyMargin ? (1 + (safetyMarginPercentage / 100)) : 1;
        const buffered = totalSystemVolume * marginMultiplier;
        const finalVal = Math.ceil(buffered / 50) * 50;
        return {
            toOrderVolume: finalVal === 0 ? 0 : finalVal
        };
    }, [totalSystemVolume, safetyMargin, safetyMarginPercentage]);

    // Data for Chart
    const chartData = useMemo(() => [
        { name: 'Pipe Volume', value: pipesVolume },
        { name: 'Equipment', value: equipmentVolume },
    ], [pipesVolume, equipmentVolume]);

    // Filter out zero values for cleaner chart
    const activeChartData = chartData.filter(d => d.value > 0);
    if (activeChartData.length === 0 && totalSystemVolume === 0) {
        // Placeholder
        activeChartData.push({ name: 'Empty', value: 100 });
    }

    const exportToCSV = () => {
        if (boqItems.length === 0) return;

        const headers = ['Material', 'Dimensiune (DN)', 'Lungime Totala (m)'];
        const rows = boqItems.map(item => [
            item.materialName,
            item.size,
            item.totalLength.toFixed(1)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `BoQ_Proiect_${toOrderVolume}L.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-10">
            {/* Main Dashboard Card with Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-card border border-border shadow-sm p-1.5 rounded-3xl relative overflow-hidden shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all"
            >
                <div className="bg-background/40 backdrop-blur-2xl rounded-2xl overflow-hidden p-8 relative z-10">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                                <Scale className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground leading-none tracking-tight">System Overview</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5 opacity-70">Weight & Volume Distribution</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid: Left Stats, Right Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                        {/* Text Stats */}
                        <div>
                            <div className="text-center lg:text-left py-4 relative">
                                <div className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Total Operating Weight</div>
                                <div className="flex items-baseline justify-center lg:justify-start gap-1">
                                    <AnimatedNumber value={totalWeight} className="text-5xl lg:text-6xl font-black text-foreground tracking-tighter" />
                                    <span className="text-xl font-bold text-primary/80 ml-1">kg</span>
                                </div>
                                <div className="text-xs text-muted-foreground font-medium mt-2">
                                    Includes pipes, fluid ({glycolPercentage}% Glycol), and equipment.
                                </div>
                            </div>

                            {/* Detailed Volume Text */}
                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/40">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-xs font-medium">Pipe Volume</span>
                                    </div>
                                    <span className="font-mono font-bold">{pipesVolume.toFixed(0)} L</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/40">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                                        <span className="text-xs font-medium">Equipment</span>
                                    </div>
                                    <span className="font-mono font-bold">{equipmentVolume.toFixed(0)} L</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-[200px] w-full relative">
                            {totalSystemVolume > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                        <Pie
                                            data={activeChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {activeChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30">
                                    <PieIcon className="w-12 h-12 mb-2 opacity-50" strokeWidth={1} />
                                    <span className="text-xs font-medium">Add data to visualize</span>
                                </div>
                            )}

                            {/* Center Text in Donut */}
                            {totalSystemVolume > 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                                    <span className="text-xl font-bold font-mono text-foreground">{totalSystemVolume.toFixed(0)}L</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Suggestion Banner */}
                    <div className="mt-8 pt-6 border-t border-border/40">
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 relative overflow-hidden group/order flex items-center justify-between">
                            <div className="relative z-10">
                                <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
                                    Recommended Order Volume
                                </div>
                                <div className="text-3xl font-black text-foreground tracking-tight">
                                    {toOrderVolume.toLocaleString('ro-RO')} <span className="text-lg text-muted-foreground font-bold">L</span>
                                </div>
                                {safetyMargin && <div className="text-[10px] text-muted-foreground mt-1">Include {safetyMarginPercentage}% marja de siguranță</div>}
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover/order:scale-110 transition-transform">
                                <Droplet className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </div>

                </div>
            </motion.div>

            {/* BoQ Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card border border-border/40 p-8 rounded-3xl shadow-lg shadow-stone-200/20 dark:shadow-none"
            >
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-muted rounded-xl">
                            <ClipboardList className="w-5 h-5 text-foreground" />
                        </div>
                        <h3 className="text-base font-bold text-foreground">Bill of Quantities</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToCSV}
                            title="Export CSV"
                            disabled={boqItems.length === 0}
                            className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border/50">{boqItems.length} Items</span>
                    </div>
                </div>

                <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {boqItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                            {/* <ClipboardList className="w-8 h-8 mb-2" /> */}
                            <div className="text-sm italic">Add pipes to generate BoQ.</div>
                        </div>
                    ) : (
                        boqItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/50 transition-colors group/item border border-transparent hover:border-border/40">
                                <div>
                                    <div className="text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors">{item.materialName}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono tracking-wide uppercase opacity-70">{item.size}</div>
                                </div>
                                <div className="text-sm font-bold text-primary font-mono bg-primary/10 px-2 py-1 rounded-lg">
                                    {item.totalLength.toFixed(1)}m
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
});

ResultsDisplay.displayName = 'ResultsDisplay';
