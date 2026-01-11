
import React from 'react';
import { PipeSegment } from '@/lib/types';
import { Activity } from 'lucide-react';

interface SchematicCanvasProps {
    segments: PipeSegment[];
}

interface SegmentPosition {
    segment: PipeSegment;
    startX: number;
    endX: number;
    width: number;
    index: number;
}

export const SchematicCanvas: React.FC<SchematicCanvasProps> = ({ segments }) => {
    if (segments.length === 0) return null;

    // Calculate total length for scaling
    const totalLength = segments.reduce((sum, s) => sum + s.length, 0);
    const canvasWidth = 800; // Fixed base width for SVG
    const padding = 60;
    const drawableWidth = canvasWidth - (padding * 2);

    // Scale factor: pixels per meter
    const scale = totalLength > 0 ? drawableWidth / totalLength : 0;

    // Calculate all segment positions immutably
    const segmentPositions: SegmentPosition[] = segments.reduce((acc, segment, index) => {
        const segmentWidth = segment.length * scale;
        const startX = index === 0 ? padding : acc[index - 1].endX;
        const endX = startX + segmentWidth;
        
        return [...acc, { segment, startX, endX, width: segmentWidth, index }];
    }, [] as SegmentPosition[]);

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/20 overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Activity className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Pipe Schematic Visualization</h3>
                </div>
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                    Scale: 1m = {scale.toFixed(1)}px
                </div>
            </div>

            <div className="relative overflow-x-auto no-scrollbar py-4 px-2">
                <svg width={canvasWidth} height="120" viewBox={`0 0 ${canvasWidth} 120`} className="mx-auto overflow-visible">
                    {/* Background Line (Glow) */}
                    <path
                        d={`M ${padding} 60 L ${canvasWidth - padding} 60`}
                        stroke="rgba(99, 102, 241, 0.05)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {segmentPositions.map(({ segment, startX, endX, width, index }) => {
                        // Color selection based on material
                        let color = "#cbd5e1"; // default slate
                        if (segment.material.includes('steel')) color = "#60a5fa"; // blue
                        if (segment.material.includes('co')) color = "#fb923c"; // orange (copper)
                        if (segment.material.includes('pvc') || segment.material.includes('pp')) color = "#4ade80"; // green
                        if (segment.material === 'custom') color = "#f59e0b"; // amber

                        return (
                            <g key={segment.id} className="group/seg cursor-help transition-all duration-300">
                                {/* Segment Line */}
                                <line
                                    x1={startX}
                                    y1="60"
                                    x2={endX}
                                    y2="60"
                                    stroke={color}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                                />

                                {/* Node Marker (Connections) */}
                                <circle
                                    cx={startX}
                                    cy="60"
                                    r="4"
                                    fill={index === 0 ? "#fff" : color}
                                    stroke="#0f172a"
                                    strokeWidth="2"
                                />

                                {index === segmentPositions.length - 1 && (
                                    <circle cx={endX} cy="60" r="4" fill="#fff" stroke="#0f172a" strokeWidth="2" />
                                )}

                                {/* Label (Size) */}
                                <text
                                    x={startX + (width / 2)}
                                    y="45"
                                    textAnchor="middle"
                                    className="fill-slate-400 text-[10px] font-mono font-bold"
                                >
                                    {segment.size}
                                </text>

                                {/* Label (Length) */}
                                <text
                                    x={startX + (width / 2)}
                                    y="80"
                                    textAnchor="middle"
                                    className="fill-slate-600 text-[9px] font-bold"
                                >
                                    {segment.length}m
                                </text>

                                {/* Hover Info Card (Fake Tooltip using SVG or absolute? Let's use simple CSS title for now) */}
                                <title>{`${segment.material.toUpperCase()} - ${segment.size}\nLength: ${segment.length}m`}</title>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-white/5">
                {[
                    { label: 'Steel', color: 'bg-blue-400' },
                    { label: 'Copper', color: 'bg-orange-400' },
                    { label: 'Plastic', color: 'bg-green-400' },
                    { label: 'Custom', color: 'bg-amber-500' },
                ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${l.color}`} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{l.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
