import React, { useState } from 'react';
import { SupportItem } from '@/lib/calculations';
import { AlertTriangle, CheckCircle, Settings, Info, ChevronDown, ChevronUp, Activity, PenTool } from 'lucide-react';
interface AnalysisTableProps {
    report: SupportItem[];
}

export const AnalysisTable: React.FC<AnalysisTableProps> = ({ report }) => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-[10px] text-slate-500 uppercase tracking-wider font-bold bg-white/5">
                        <th className="p-4">Segmente / Descriere</th>
                        <th className="p-4">Sarcină de Calcul (ULS)</th>
                        <th className="p-4">Moment Încovoiere</th>
                        <th className="p-4 text-center">Status Structură</th>
                        <th className="p-4 text-right">Profil Recomandat</th>
                        <th className="w-10"></th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
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
                            let statusColor = "text-emerald-400";
                            let StatusIcon = CheckCircle;
                            let statusText = "OPTIM";
                            let rowBg = "";

                            if (item.status === 'warning') { // Was item.utilization > 80
                                statusColor = "text-amber-400";
                                StatusIcon = AlertTriangle;
                                statusText = "LIMITĂ (80%+)";
                            }
                            if (item.status === 'critical') {
                                statusColor = "text-red-400 animate-pulse";
                                StatusIcon = AlertTriangle;
                                statusText = "INSUFICIENT - UPGRADE";
                                rowBg = "bg-red-500/5";
                            }

                            return (
                                <React.Fragment key={item.segmentId}>
                                    <tr
                                        onClick={() => toggleRow(item.segmentId)}
                                        className={`hover:bg-white/5 transition-colors cursor-pointer ${isExpanded ? 'bg-white/5' : rowBg}`}
                                    >
                                        <td className="p-4">
                                            <div className="text-slate-300 font-medium">{item.description}</div>
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                Len: <span className="text-slate-400">{item.length.toFixed(2)}m</span> |
                                                Pas: <span className="text-slate-400">{item.spacing}m</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono">
                                            <div className="text-white font-bold text-lg">{item.designLoad.toFixed(1)} <span className="text-sm text-slate-500">kg</span></div>
                                            <div className="text-[10px] text-slate-500">Include Factor Siguranță 1.4</div>
                                        </td>
                                        <td className="p-4 font-mono text-slate-300">
                                            {item.moment.toFixed(1)} <span className="text-[10px] text-slate-500">Nm</span>
                                        </td>
                                        <td className="p-4">
                                            <div className={`flex items-center justify-center gap-2 font-bold text-xs border rounded-full py-1 px-3 w-fit mx-auto ${item.status === 'pass'
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                : item.status === 'warning'
                                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                }`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {statusText}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="bg-slate-800 text-white px-3 py-1 rounded inline-block font-mono border border-white/10 shadow-lg">
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
                                                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                                                            <Activity className="w-3 h-3" /> Analiză Sarcini
                                                        </h4>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">Greutate Liniară Totală:</span>
                                                                <span className="text-slate-300 font-mono">{item.totalWeightPerMeter.toFixed(2)} kg/m</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">Sarcină pe punct (SLS):</span>
                                                                <span className="text-slate-300 font-mono">{item.loadPerPoint.toFixed(1)} kg</span>
                                                            </div>
                                                            <div className="flex justify-between pt-2 border-t border-white/10">
                                                                <span className="text-white font-bold">Sarcină de Calcul (ULS):</span>
                                                                <span className="text-blue-400 font-bold font-mono">{item.designLoad.toFixed(1)} kg</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card 2: Mechanical Properties */}
                                                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                                                            <Settings className="w-3 h-3" /> Proprietăți Secțiune
                                                        </h4>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">Wy (Rezistență):</span>
                                                                <span className="text-slate-300 font-mono">{item.recommendedProfile?.structural?.Wy} cm³</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">Iy (Inerție):</span>
                                                                <span className="text-slate-300 font-mono">{item.recommendedProfile?.structural?.Iy} cm⁴</span>
                                                            </div>
                                                            <div className="flex justify-between pt-2 border-t border-white/10">
                                                                <span className="text-slate-300">Material:</span>
                                                                <span className="text-slate-300 font-mono">{item.recommendedProfile?.description || 'Oțel Zincat'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card 3: Stress & Deflection Check */}
                                                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                                            <CheckCircle className="w-3 h-3" /> Verificare Eurocod 3
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="relative">
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-slate-500 text-xs">Utilizare (Efort):</span>
                                                                    <span className={`font-mono text-xs font-bold ${item.utilization > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
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
                                                                    <span className="text-slate-500 text-xs">Săgeată (Deflecție):</span>
                                                                    <span className="font-mono text-slate-300 text-xs">{item.deflection.toFixed(2)} mm</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-600">Max admis: L/250</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card 4: Anchor Check & Heavy Duty Warning */}
                                                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                                                            <Settings className="w-3 h-3" /> Ancore & Hardware
                                                        </h4>

                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                                <span className="text-slate-500 text-xs">Reacțiune (Smulgere):</span>
                                                                <span className="font-mono text-slate-300 text-xs">
                                                                    {item.anchorReaction.toFixed(0)} kgf
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Restored Anchor Details */}
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-slate-500 leading-tight">
                                                                Forța de smulgere per ancoră (x1.2):
                                                            </p>
                                                            <div className="text-2xl font-bold text-white font-mono">
                                                                {item.anchorReaction.toFixed(1)} kg
                                                            </div>
                                                            <div className="text-[10px] text-slate-500">
                                                                Recomandare: <span className="text-purple-300 font-bold">{item.anchorReaction > 500 ? 'M12 Hilti HIT' : item.anchorReaction > 200 ? 'M10 Expandabil' : 'M8 Standard'}</span>
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
                                                <div className="mt-6 bg-slate-900/80 p-5 rounded-xl border border-blue-500/20 shadow-lg relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-blue-300 uppercase tracking-widest mb-3 relative z-10">
                                                        <PenTool className="w-4 h-4" /> Ghid de Montaj
                                                    </h4>

                                                    <div className="relative z-10 font-mono text-xs md:text-sm text-slate-300 leading-relaxed bg-black/20 p-4 rounded-lg border border-white/5">
                                                        {item.mountingNote || 'Instrucțiuni indisponibile.'}
                                                    </div>
                                                </div>

                                                {/* Safety Note */}
                                                <div className="mt-4 flex items-start gap-2 text-[10px] text-blue-300/60 italic bg-blue-900/10 p-3 rounded-lg border border-blue-500/10">
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
