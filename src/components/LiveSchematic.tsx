'use client';

import React, { useMemo } from 'react';
import { PipeSegment, EquipmentItem } from '@/lib/types';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';

const MATERIAL_COLORS: Record<string, string> = {
    steel: '#6366f1',      // indigo
    copper: '#64748b',     // slate
    plastic: '#475569',    // slate dark
    special: '#4f46e5',    // indigo deep
    default: '#94a3b8',
};

function materialColor(material: string): string {
    if (material.includes('steel') || material.includes('inox')) return MATERIAL_COLORS.steel;
    if (material.includes('copper')) return MATERIAL_COLORS.copper;
    if (material.includes('pvc') || material.includes('pp') || material.includes('pe') || material.includes('gf_')) return material.includes('gf_') ? MATERIAL_COLORS.special : MATERIAL_COLORS.plastic;
    if (material === 'custom') return MATERIAL_COLORS.special;
    return MATERIAL_COLORS.default;
}

/**
 * SCHEMATIC LIVE al sistemului — se desenează din segmentele proiectului:
 * grosimea conductei = diametrul real, culori pe material, animație de debit,
 * echipamente ca noduri, etichete DN + lungime. Legenda integrată.
 */
export const LiveSchematic: React.FC<{
    segments: PipeSegment[];
    equipmentList?: EquipmentItem[];
    compact?: boolean;
}> = ({ segments, equipmentList = [], compact = false }) => {
    const W = 1100;
    const H = compact ? 130 : 190;
    const PAD_X = 40;

    // Poziții + lățimi proporționale cu Ø interior (clamp 3–14px) — calculate O singură dată
    const placed = useMemo(() => {
        const withDims = segments.map(seg => {
            let id = 0;
            if (seg.material === 'custom') id = seg.customInnerDiameter || 20;
            else id = PIPE_STANDARDS[seg.material]?.dimensions.find(d => d.dn === seg.size)?.id || 20;
            return { seg, id };
        });
        const maxId = Math.max(1, ...withDims.map(w => w.id));
        const totalLength = withDims.reduce((s, i) => s + (i.seg.length || 0), 0);

        const spans = withDims.map(w => {
            const width = Math.min(14, Math.max(3, (w.id / maxId) * 12 + 3));
            const span = Math.max(80, (w.seg.length / Math.max(totalLength, 1)) * (W - PAD_X * 2));
            return { width, span };
        });
        // Poziții X = sumă prefix (fără variabile mutabile)
        const xPositions = spans.map((_, i) => PAD_X + spans.slice(0, i).reduce((a, s) => a + s.span, 0));

        return withDims.map((w, i) => ({
            seg: w.seg,
            id: w.id,
            width: spans[i].width,
            x: xPositions[i],
            w: spans[i].span,
        }));
    }, [segments]);

    const totalLength = placed.reduce((s, i) => s + (i.seg.length || 0), 0);
    const hasFlow = totalLength > 0;

    const legend = [
        { label: 'Oțel', color: MATERIAL_COLORS.steel },
        { label: 'Cupru', color: MATERIAL_COLORS.copper },
        { label: 'Plastic', color: MATERIAL_COLORS.plastic },
        { label: 'CoolFit/Pre-izolat', color: MATERIAL_COLORS.special },
    ];

    const yBase = H / 2 + (compact ? 10 : 14);

    return (
        <div className="bg-card border border-border/70 rounded-2xl shadow-sm overflow-hidden">
            {!compact && (
                <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Schema sistemului — live</h3>
                        <p className="text-[11px] text-muted-foreground">Se actualizează automat din segmentele definite</p>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        {totalLength.toFixed(1)} m · {segments.length} segmente
                    </span>
                </div>
            )}

            <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${compact ? 'h-[130px]' : 'h-[190px]'}`} role="img" aria-label="Schema sistemului">
                <defs>
                    <style>{`
                        @keyframes schematic-dash { to { stroke-dashoffset: -24; } }
                        .flow-anim { animation: schematic-dash 1.2s linear infinite; }
                    `}</style>
                </defs>

                {/* Linia de bază a sistemului */}
                <line x1={PAD_X} y1={yBase} x2={W - PAD_X} y2={yBase} stroke="rgba(148,163,184,0.35)" strokeWidth="2" />

                {placed.length === 0 ? (
                    <>
                        <text x={W / 2} y={yBase - 8} textAnchor="middle" fill="#94a3b8" fontSize="13" fontFamily="inherit">
                            Adauga segmente de teava pentru a vedea schema
                        </text>
                        <text x={W / 2} y={yBase + 14} textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="inherit">
                            Dimensioneaza tubulatura din tab-ul Segmente
                        </text>
                    </>
                ) : (
                    placed.map((p, i) => {
                        const cx = p.x + p.w / 2;
                        return (
                            <g key={p.seg.id}>
                                {/* Conductă */}
                                <line
                                    x1={p.x} y1={yBase} x2={p.x + p.w} y2={yBase}
                                    stroke={materialColor(p.seg.material)}
                                    strokeWidth={p.width}
                                    strokeLinecap="round"
                                />
                                {/* Debit animat (dacă are flowRate) */}
                                {(p.seg.flowRate ?? 0) > 0 && (
                                    <line
                                        x1={p.x + 4} y1={yBase} x2={p.x + p.w - 4} y2={yBase}
                                        stroke="rgba(255,255,255,0.75)"
                                        strokeWidth={Math.max(1.5, p.width * 0.25)}
                                        strokeDasharray="8 16"
                                        className="flow-anim"
                                        strokeLinecap="round"
                                    />
                                )}
                                {/* Etichete */}
                                <text x={cx} y={yBase - p.width / 2 - 8} textAnchor="middle" fill="#334155" fontSize={compact ? 9 : 11} fontWeight="600" fontFamily="inherit">
                                    {p.seg.size}
                                </text>
                                <text x={cx} y={yBase + p.width / 2 + 14} textAnchor="middle" fill="#94a3b8" fontSize={compact ? 8 : 9} fontFamily="inherit">
                                    {p.seg.length} m{p.seg.flowRate ? ` · ${p.seg.flowRate} m³/h` : ''}
                                </text>
                                {/* Tooltip */}
                                <title>{`${p.seg.material.toUpperCase()} ${p.seg.size} · ${p.seg.length} m${p.seg.flowRate ? ` · ${p.seg.flowRate} m³/h` : ''}`}</title>
                                {/* Nod între segmente */}
                                <circle cx={p.x} cy={yBase} r={3.5} fill="#fff" stroke={materialColor(p.seg.material)} strokeWidth="1.5" />
                                {i === placed.length - 1 && (
                                    <circle cx={p.x + p.w} cy={yBase} r={3.5} fill="#fff" stroke={materialColor(p.seg.material)} strokeWidth="1.5" />
                                )}
                            </g>
                        );
                    })
                )}

                {/* Echipamente ca noduri la capete */}
                {equipmentList.length > 0 && (
                    <>
                        <rect x={PAD_X - 24} y={yBase - 9} width={18} height={18} rx={4} fill="#0a84ff" />
                        <text x={PAD_X - 15} y={yBase + 3.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="inherit">E</text>
                        <rect x={W - PAD_X + 6} y={yBase - 9} width={18} height={18} rx={4} fill="#30d158" />
                        <text x={W - PAD_X + 15} y={yBase + 3.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="inherit">F</text>
                    </>
                )}
            </svg>

            {/* Legendă */}
            {!compact && (
                <div className="px-5 pb-4 pt-1 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border/40">
                    {legend.map(l => (
                        <span key={l.label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="w-3 h-1.5 rounded-full" style={{ background: l.color }} />
                            {l.label}
                        </span>
                    ))}
                    {equipmentList.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="w-3 h-3 rounded bg-[#0a84ff]" /> Echipamente cu apă ({equipmentList.reduce((s, e) => s + (e.volume || 0), 0)} L)
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
