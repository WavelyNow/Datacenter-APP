import React, { useState } from 'react';
import { SupportItem } from '@/lib/calculations';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Activity, Settings, PenTool, Info } from 'lucide-react';
interface AnalysisTableProps {
    report: SupportItem[];
}

export const AnalysisTable: React.FC<AnalysisTableProps> = ({ report }) => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-bold bg-muted/50">
                        <th className="p-4">Segmente / Descriere</th>
                        <th className="p-4">Sarcină de Calcul (ULS)</th>
                        <th className="p-4">Moment Încovoiere</th>
                        <th className="p-4 text-center">Status Structură</th>
                        <th className="p-4 text-right">Profil Recomandat</th>
                        <th className="w-10"></th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-border">
                    {report.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                                Nu există date pentru analiză. Configurați parametrii sistemului.
                            </td>
                        </tr>
                    ) : (
                        report.map((item) => {
                            const isExpanded = expandedRow === item.segmentId;

                            // Visual Status Logic
                            let StatusIcon = CheckCircle;
                            let statusText = "OPTIM";
                            let rowBg = "";

                            if (item.status === 'warning') {
                                StatusIcon = AlertTriangle;
                                statusText = "LIMITĂ (80%+)";
                            }
                            if (item.status === 'critical') {
                                StatusIcon = AlertTriangle;
                                statusText = "INSUFICIENT - UPGRADE";
                                rowBg = "bg-red-500/5";
                            }

                            return (
                                <React.Fragment key={item.segmentId}>
                                    <tr
                                        onClick={() => toggleRow(item.segmentId)}
                                        className={`hover:bg-muted/50 transition-colors cursor-pointer ${isExpanded ? 'bg-muted' : rowBg}`}
                                    >
                                        <td className="p-4">
                                            <div className="text-foreground font-medium">{item.description}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1">
                                                Len: <span className="font-semibold">{item.length.toFixed(2)}m</span> |
                                                Pas: <span className="font-semibold">{item.spacing}m</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono">
                                            <div className="text-foreground font-bold text-lg">{item.designLoad.toFixed(1)} <span className="text-sm text-muted-foreground">kg</span></div>
                                            <div className="text-[10px] text-muted-foreground">Include Factor Siguranță 1.4</div>
                                        </td>
                                        <td className="p-4 font-mono text-foreground">
                                            {item.moment.toFixed(1)} <span className="text-[10px] text-muted-foreground">Nm</span>
                                        </td>
                                        <td className="p-4">
                                            <div className={`flex items-center justify-center gap-2 font-bold text-xs border rounded-full py-1 px-3 w-fit mx-auto ${item.status === 'pass'
                                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-emerald-400'
                                                : item.status === 'warning'
                                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                                    : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                                                }`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {statusText}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="bg-primary text-primary-foreground px-3 py-1 rounded inline-block font-mono border border-primary/20 shadow-sm">
                                                {item.recommendedProfile?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-slate-500">
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <tr className="bg-slate-950/30 shadow-inner">
                                            <td colSpan={6} className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                                                    {/* Card 1: Loads Analysis */}
                                                    <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-3">
                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                                                            <Activity className="w-3 h-3" /> Analiză Sarcini
                                                        </h4>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Greutate Liniară Totală:</span>
                                                                <span className="text-foreground font-mono">{item.totalWeightPerMeter.toFixed(2)} kg/m</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Sarcină pe punct (SLS):</span>
                                                                <span className="text-foreground font-mono">{item.loadPerPoint.toFixed(1)} kg</span>
                                                            </div>
                                                            <div className="flex justify-between pt-2 border-t border-border">
                                                                <span className="text-foreground font-bold">Sarcină de Calcul (ULS):</span>
                                                                <span className="text-indigo-500 font-bold font-mono">{item.designLoad.toFixed(1)} kg</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card 2: Mechanical Properties */}
                                                    <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-3">
                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                            <Settings className="w-3 h-3" /> Proprietăți Secțiune
                                                        </h4>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Wy (Rezistență):</span>
                                                                <span className="text-foreground font-mono">{item.recommendedProfile?.structural?.Wy} cm³</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Iy (Inerție):</span>
                                                                <span className="text-foreground font-mono">{item.recommendedProfile?.structural?.Iy} cm⁴</span>
                                                            </div>
                                                            <div className="flex justify-between pt-2 border-t border-border">
                                                                <span className="text-muted-foreground">Material:</span>
                                                                <span className="text-foreground font-mono">{item.recommendedProfile?.description || 'Oțel Zincat'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card 3: Stress & Deflection Check */}
                                                    <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-3">
                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                                                            <CheckCircle className="w-3 h-3" /> Verificare Eurocod 3
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="relative">
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-muted-foreground text-xs">Utilizare (Efort):</span>
                                                                    <span className={`font-mono text-xs font-bold ${item.utilization > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                                        {item.utilization.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all ${item.utilization > 100 ? 'bg-red-500' : item.utilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                                        style={{ width: `${Math.min(item.utilization, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="relative">
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-muted-foreground text-xs">Săgeată (Deflecție):</span>
                                                                    <span className="font-mono text-foreground text-xs">{item.deflection.toFixed(2)} mm</span>
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground/60">Max admis: L/250</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card 4: Anchor Check & Heavy Duty Warning */}
                                                    <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-3">
                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                            <Settings className="w-3 h-3" /> Ancore & Hardware
                                                        </h4>

                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between border-b border-border pb-2">
                                                                <span className="text-muted-foreground text-xs">Reacțiune (Smulgere):</span>
                                                                <span className="font-mono text-foreground text-xs">
                                                                    {item.anchorReaction.toFixed(0)} kgf
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Restored Anchor Details */}
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-muted-foreground leading-tight">
                                                                Forța de smulgere per ancoră (x1.2):
                                                            </p>
                                                            <div className="text-2xl font-bold text-foreground font-mono">
                                                                {item.anchorReaction.toFixed(1)} kg
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">
                                                                Recomandare: <span className="text-indigo-500 font-bold">{item.anchorReaction > 500 ? 'M12 Hilti HIT' : item.anchorReaction > 200 ? 'M10 Expandabil' : 'M8 Standard'}</span>
                                                            </div>
                                                        </div>

                                                        {/* HEAVY DUTY WARNING TRIGGER */}
                                                        {item.isHeavyDuty && (
                                                            <div className="mt-3 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                                                                <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                                                                    <AlertTriangle className="w-3.5 h-3.5" /> Avertisment Sarcină Mare
                                                                </div>
                                                                <p className="text-[10px] text-red-300/80 leading-relaxed">
                                                                    Sistem comutat la <span className="text-white font-semibold">Heavy-Duty</span>.
                                                                    Cuplu Necesar:
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] font-mono text-white/90">
                                                                    <div className="bg-red-900/40 px-1.5 py-0.5 rounded border border-red-500/30 text-center">
                                                                        M12: 40 Nm
                                                                    </div>
                                                                    <div className="bg-red-900/40 px-1.5 py-0.5 rounded border border-red-500/30 text-center">
                                                                        M16: 95 Nm
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card 5: Installation Guide (Mounting Note) */}
                                                <div className="mt-6 bg-muted/60 p-5 rounded-xl border border-indigo-500/20 shadow-lg relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-500 uppercase tracking-widest mb-3 relative z-10">
                                                        <PenTool className="w-4 h-4" /> Ghid de Montaj
                                                    </h4>

                                                    <div className="relative z-10 font-mono text-xs md:text-sm text-foreground leading-relaxed bg-background/50 p-4 rounded-lg border border-border">
                                                        {item.mountingNote || 'Instrucțiuni indisponibile.'}
                                                    </div>
                                                </div>

                                                {/* Safety Note */}
                                                <div className="mt-4 flex items-start gap-2 text-[10px] text-indigo-500/60 italic bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                                                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                                    <p>
                                                        Calcul simplificat pentru grindă în consolă. Pentru structuri complexe (cadre, contravântuiri), consultați un inginer structurist.
                                                        Valorile Stress sunt calculate folosind Sigma = M / Wy.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};
