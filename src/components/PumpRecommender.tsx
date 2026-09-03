import React, { useMemo } from 'react';
import { AlertTriangle, ArrowRight, Zap } from 'lucide-react';

interface Pump {
    id: string;
    model: string;
    manufacturer: string;
    maxFlow: number; // m3/h
    maxHead: number; // kPa
    power: string;
    image?: string;
    efficiencyClass: 'IE3' | 'IE4' | 'IE5';
}

// Catalog orientativ de pompe pentru răcire datacenter.
// Datele sunt REFERINȚE de dimensionare (nu listă oficială de prețuri/curbe —
// verifică întotdeauna curba reală la producător înainte de achiziție).
const PUMP_DATABASE: Pump[] = [
    { id: '1', manufacturer: 'Grundfos', model: 'MAGNA3 25-60', maxFlow: 8, maxHead: 60, power: '85W', efficiencyClass: 'IE5' },
    { id: '2', manufacturer: 'Grundfos', model: 'MAGNA3 32-120 F', maxFlow: 18, maxHead: 120, power: '340W', efficiencyClass: 'IE5' },
    { id: '3', manufacturer: 'Wilo', model: 'Stratos MAXO 30/0,5-12', maxFlow: 12, maxHead: 100, power: '280W', efficiencyClass: 'IE4' },
    { id: '4', manufacturer: 'Grundfos', model: 'TP 50-160/2', maxFlow: 40, maxHead: 160, power: '1.1kW', efficiencyClass: 'IE3' },
    { id: '5', manufacturer: 'Wilo', model: 'Yonos MAXO 50/0,5-16', maxFlow: 35, maxHead: 150, power: '950W', efficiencyClass: 'IE3' },
    { id: '6', manufacturer: 'Grundfos', model: 'NB 80-160/177', maxFlow: 150, maxHead: 250, power: '15kW', efficiencyClass: 'IE4' },
];

interface PumpRecommenderProps {
    requiredFlow: number; // m3/h
    requiredHead: number; // kPa
}

export function PumpRecommender({ requiredFlow, requiredHead }: PumpRecommenderProps) {

    // Logic: match pe debit/presiune + verificare aproximativă de curbă.
    // O pompă NU poate livra head-ul maxim la debit maxim simultan — verificăm
    // dacă punctul de lucru e pe o curbă plauzibilă (aprox. parabolică):
    // head_available(Q) ≈ maxHead × (1 − (Q/Qmax)²).
    const matches = useMemo(() => {
        if (requiredFlow <= 0 || requiredHead <= 0) return [];

        return PUMP_DATABASE.filter(p => {
            if (p.maxFlow < requiredFlow * 1.1) return false;
            // Verificare curbă: head disponibil la debitul cerut (aproximare tipică)
            const qRatio = Math.min(1, requiredFlow / p.maxFlow);
            const headAtQ = p.maxHead * (1 - Math.pow(qRatio, 2));
            return headAtQ >= requiredHead * 1.1;
        }).sort((a, b) => {
            // Closest to requirements first (smallest sufficient pump)
            const scoreA = (a.maxFlow - requiredFlow) + (a.maxHead - requiredHead);
            const scoreB = (b.maxFlow - requiredFlow) + (b.maxHead - requiredHead);
            return scoreA - scoreB;
        }).slice(0, 3); // Take top 3
    }, [requiredFlow, requiredHead]);

    const operatingPoint = {
        flow: requiredFlow.toFixed(1),
        head: requiredHead.toFixed(1)
    };

    // Stare goală: orice valoare lipsă = "introduceți date", NU "nu există pompe"
    if (requiredFlow <= 0 || requiredHead <= 0) {
        return (
            <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm flex items-center justify-center text-muted-foreground text-sm h-full">
                Introduceți debitul și presiunea necesară pentru recomandări.
            </div>
        );
    }

    return (
        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">Potrivire pompă</h3>
                    <p className="text-xs text-muted-foreground">Selecție automată pe baza punctului de funcționare</p>
                </div>
            </div>

            {/* Operating Point Badge */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-muted/30 p-3 rounded-lg border border-border/30">
                    <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">DEBIT CERUT</div>
                    <div className="text-lg font-mono font-bold text-foreground">{operatingPoint.flow} <span className="text-xs text-muted-foreground font-normal">m³/h</span></div>
                </div>
                <div className="flex-1 bg-muted/30 p-3 rounded-lg border border-border/30">
                    <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">ÎNĂLȚIME CERUTĂ</div>
                    <div className="text-lg font-mono font-bold text-foreground">{operatingPoint.head} <span className="text-xs text-muted-foreground font-normal">kPa</span></div>
                </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {matches.length > 0 ? (
                    matches.map((pump, idx) => (
                        <div key={pump.id} className="group relative bg-background/40 hover:bg-background/80 border border-border/40 hover:border-yellow-500/50 transition-all rounded-xl p-4 cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-foreground">{pump.manufacturer}</span>
                                        {idx === 0 && <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 text-[9px] font-bold rounded uppercase">Potrivire optimă</span>}
                                    </div>
                                    <div className="text-lg font-black tracking-tight text-foreground/90 mt-0.5">{pump.model}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-mono text-muted-foreground">{pump.power}</div>
                                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mt-1
                                        ${pump.efficiencyClass === 'IE5' ? 'bg-primary/20 text-primary' :
                                            pump.efficiencyClass === 'IE4' ? 'bg-muted text-primary' : 'bg-muted text-muted-foreground'}
                                    `}>
                                        {pump.efficiencyClass}
                                    </div>
                                </div>
                            </div>

                            {/* Specs Bar */}
                            <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                <div>Debit maxim: <span className="text-foreground">{pump.maxFlow} m³/h</span></div>
                                <div>Înălțime maximă: <span className="text-foreground">{pump.maxHead} kPa</span></div>
                            </div>

                            <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 opacity-70">
                        <AlertTriangle className="w-8 h-8 text-yellow-500" />
                        <p className="text-sm font-medium">Nicio pompă din catalogul orientativ nu acoperă punctul de lucru.</p>
                        <p className="text-xs text-muted-foreground max-w-[240px]">Debitul sau înălțimea necesară depășește catalogul de referință. Verificați curba reală la producător.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
