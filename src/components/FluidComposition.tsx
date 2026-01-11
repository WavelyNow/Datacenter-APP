import React from 'react';
import { Snowflake, Droplets, ThermometerSnowflake, Info } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';

export const FluidComposition: React.FC = () => {
    const {
        glycolPercentage, setGlycolPercentage,
        safetyMargin, setSafetyMargin,
        safetyMarginPercentage, setSafetyMarginPercentage
    } = useProject();

    // Calculate approximate freezing point (Ethylene Glycol estimation)
    const getFreezingPoint = (pct: number) => {
        if (pct < 10) return -3;
        if (pct < 20) return -8;
        if (pct < 30) return -15;
        if (pct < 40) return -24;
        if (pct < 50) return -36;
        return -45;
    };

    const freezingPoint = getFreezingPoint(glycolPercentage);

    // Dynamic color based on concentration
    const getFluidColor = (pct: number) => {
        if (pct < 25) return 'from-cyan-400 to-blue-500'; // Dilute
        if (pct < 40) return 'from-blue-500 to-indigo-600'; // Standard
        return 'from-indigo-600 to-purple-600'; // Concentrated
    };

    return (
        <div className="bg-card border border-border p-0 rounded-3xl relative overflow-hidden group shadow-sm">
            {/* Header / Top Section */}
            <div className="p-6 pb-4 border-b border-border relative z-10 bg-muted/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                            <Snowflake className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Fluid Mix</h2>
                            <p className="text-xs text-muted-foreground font-medium">Water / Glycol Ratio</p>
                        </div>
                    </div>

                    {/* Freezing Point Badge */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
                            <ThermometerSnowflake className="w-3.5 h-3.5" />
                            Freezing Point
                        </div>
                        <div className="text-xl font-black text-foreground font-mono bg-card px-3 py-1 rounded-lg border border-border">
                            {freezingPoint}°C
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Control Section */}
            <div className="p-8 relative">
                {/* Background Decor */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getFluidColor(glycolPercentage)} opacity-[0.03] pointer-events-none`}></div>

                <div className="flex flex-col gap-8">
                    {/* Large Percentage Display */}
                    <div className="flex items-center justify-center relative py-4">
                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground drop-shadow-sm tracking-tighter">
                            {glycolPercentage}%
                        </div>
                        <div className="absolute top-0 right-1/4 translate-x-8 text-xs font-bold text-muted-foreground border border-border rounded px-1.5 py-0.5 uppercase tracking-wider">
                            Concentration
                        </div>
                    </div>

                    {/* Slider Container */}
                    <div className="relative w-full h-14 bg-muted/30 rounded-2xl border border-border p-1.5 shadow-inner backdrop-blur-sm">

                        {/* Interactive Track Area */}
                        <div className="relative w-full h-full rounded-xl overflow-hidden">
                            {/* Filled Part */}
                            <div
                                className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${getFluidColor(glycolPercentage)} transition-all duration-300 ease-out shadow-[0_0_20px_rgba(37,99,235,0.3)]`}
                                style={{ width: `${glycolPercentage}%` }}
                            >
                                {/* Fluid Texture/Shine */}
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
                            </div>

                            {/* Unfilled Part (Water) */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10 opacity-50">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Water</span>
                                <Droplets className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>

                            {/* Slider Input (Invisible overlay) */}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={glycolPercentage}
                                onChange={(e) => setGlycolPercentage(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-muted/10 rounded-xl p-3 border border-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Droplets className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Water Vol</div>
                            <div className="text-sm font-bold text-foreground">{(100 - glycolPercentage)}%</div>
                        </div>
                    </div>
                    <div className="bg-muted/10 rounded-xl p-3 border border-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <Snowflake className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Glycol Vol</div>
                            <div className="text-sm font-bold text-foreground">{glycolPercentage}%</div>
                        </div>
                    </div>
                </div>
                {/* Safety & Reserve Section */}
                <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-amber-500/70" />
                            <span className="text-sm font-bold text-foreground">Rezervă de Siguranță</span>
                        </div>
                        <button
                            onClick={() => setSafetyMargin(!safetyMargin)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${safetyMargin ? 'bg-amber-500' : 'bg-muted'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${safetyMargin ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {safetyMargin && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Procent Rezervă</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        step="any"
                                        value={safetyMarginPercentage}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                setSafetyMarginPercentage(0);
                                                return;
                                            }
                                            setSafetyMarginPercentage(parseFloat(val));
                                        }}
                                        className="w-24 bg-card border border-border rounded-xl px-4 py-2 text-center text-base font-bold text-amber-500 focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
                                    />
                                    <span className="text-sm font-bold text-muted-foreground select-none">%</span>
                                </div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.1"
                                value={safetyMarginPercentage}
                                onChange={(e) => setSafetyMarginPercentage(parseFloat(e.target.value))}
                                className="w-full accent-amber-500 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                * Această marjă este aplicată peste volumul total brut. Se recomandă între 2% și 5% pentru a acoperi pierderile neprevăzute.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
