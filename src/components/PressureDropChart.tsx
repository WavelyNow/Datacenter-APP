import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { PipeSegment } from '@/lib/types';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { calculateHydraulics } from '@/lib/calc/hydraulics';
import { Activity } from 'lucide-react';

interface PressureDropChartProps {
    segments: PipeSegment[];
    glycolPercentage: number;
}

export function PressureDropChart({ segments, glycolPercentage }: PressureDropChartProps) {
    const data = useMemo(() => {
        let cumulativeLength = 0;
        let cumulativePressure = 0;
        const density = 1000 + (glycolPercentage * 5);
        const points = [];

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            // Calculate hydraulic properties for this segment
            const id_mm = segment.material === 'custom'
                ? (segment.customInnerDiameter || 0)
                : (PIPE_STANDARDS[segment.material]?.dimensions.find(d => d.dn === segment.size)?.id || 0);

            const hydraulics = calculateHydraulics(
                segment.flowRate || 0,
                id_mm,
                0.045,
                density,
                0.000001
            );

            const segmentPressureDrop = hydraulics.pressureDropKpa * segment.length;

            cumulativeLength += segment.length;
            cumulativePressure += segmentPressureDrop;

            points.push({
                name: `S${i + 1}`,
                length: cumulativeLength,
                pressure: cumulativePressure,
                velocity: hydraulics.velocity,
                segmentName: `S${i + 1} (${segment.size})`,
                segmentDrop: segmentPressureDrop
            });
        }

        // Add initial point (0,0)
        return [
            { name: 'Start', length: 0, pressure: 0, velocity: 0, segmentName: 'Source', segmentDrop: 0 },
            ...points
        ];
    }, [segments, glycolPercentage]);

    if (segments.length === 0) return null;

    return (
        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                    <Activity className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">Pressure Drop Profile</h3>
                    <p className="text-xs text-muted-foreground">Cumulative distribution of hydraulic losses along the path</p>
                </div>
            </div>

            <div className="h-[300px] w-full font-mono text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="length"
                            type="number"
                            unit="m"
                            stroke="hsl(var(--muted-foreground))"
                            tickFormatter={(value) => `${value.toFixed(0)}m`}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            unit="kPa"
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const point = payload[0].payload;
                                    return (
                                        <div className="bg-popover border border-border p-3 rounded-xl shadow-xl backdrop-blur-md">
                                            <p className="font-bold text-foreground mb-1">{point.segmentName}</p>
                                            <div className="space-y-1 text-muted-foreground">
                                                <p>Distance: <span className="text-foreground font-mono">{point.length.toFixed(1)} m</span></p>
                                                <p>Total Drop: <span className="text-pink-500 font-mono font-bold">{point.pressure.toFixed(2)} kPa</span></p>
                                                {point.velocity > 0 && (
                                                    <p>Velocity: <span className={`font-mono ${point.velocity > 2.5 ? 'text-red-500 font-bold' : 'text-emerald-500'}`}>{point.velocity.toFixed(2)} m/s</span></p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        {/* Gradient definition would go here usually, keeping it simple for now */}
                        <Line
                            type="monotone"
                            dataKey="pressure"
                            stroke="#ec4899"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
