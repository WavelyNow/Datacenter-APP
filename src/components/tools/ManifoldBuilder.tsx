
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, Trash2, ArrowRight, Thermometer, 
    Activity, Gauge, Droplets, Info 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
    ManifoldNode, 
    SimulationResultNode, 
    calculateManifoldSimulation, 
    ZETA_VALUES, 
    FITTING_LABELS,
    FittingType 
} from '@/lib/calculations/manifold';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';
import { NumberInput } from '@/components/ui/ValidatedInput';

const calculateResults = (nodes: ManifoldNode[], inletFlow: number, inletTemp: number): SimulationResultNode[] => {
    return calculateManifoldSimulation(nodes, inletFlow, inletTemp);
};

export const ManifoldBuilder: React.FC = () => {
    // Global Config
    const [inletFlow, setInletFlow] = useState(50); // m3/h
    const [inletTemp, setInletTemp] = useState(7); // C
    const [fluidDensity, setFluidDensity] = useState(1000); // kg/3
    const [globalDn, setGlobalDn] = useState('DN350');
    const [globalMaterial, setGlobalMaterial] = useState('steel_heavy');

    const [nodes, setNodes] = useState<ManifoldNode[]>([
        { id: 'start', type: 'inlet', dn: 'DN350', material: 'steel_heavy' }
    ]);

    // Derived Results
    const results = useMemo(() => calculateResults(nodes, inletFlow, inletTemp), [nodes, inletFlow, inletTemp]);

    const addNode = (type: 'fitting' | 'pipe' | 'outlet', fittingType?: FittingType) => {
        const newNode: ManifoldNode = {
            id: crypto.randomUUID(),
            type,
            fittingType,
            dn: globalDn,
            material: globalMaterial,
            length: type === 'pipe' ? 1.0 : undefined,
            flowExtract: type === 'outlet' ? 0 : undefined
        };
        setNodes([...nodes, newNode]);
    };

    const removeNode = (id: string) => {
        setNodes(nodes.filter(n => n.id !== id));
    };

    const updateNode = (id: string, updates: Partial<ManifoldNode>) => {
        setNodes(nodes.map(n => n.id === id ? { ...n, ...updates } : n));
    };

    // Helper to get result for a node
    const getResult = (id: string) => results.find(r => r.nodeId === id);

    return (
        <div className="space-y-8">
             {/* Global Configuration */}
             <div className="card-premium p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">System DN</label>
                    <select 
                        className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2.5 text-sm"
                        value={globalDn}
                        onChange={(e) => {
                            setGlobalDn(e.target.value);
                            // Optional: Update all existing nodes?
                            if (confirm('Update all existing nodes to this DN?')) {
                                setNodes(nodes.map(n => ({ ...n, dn: e.target.value })));
                            }
                        }}
                    >
                        {PIPE_STANDARDS['steel_heavy']?.dimensions.map(d => (
                            <option key={d.dn} value={d.dn}>{d.dn} ({d.inch})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Inlet Flow</label>
                    <NumberInput 
                        value={inletFlow} 
                        onChange={setInletFlow} 
                        endAdornment="m³/h" 
                        min={0}
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Fluid Temp</label>
                    <NumberInput 
                        value={inletTemp} 
                        onChange={setInletTemp} 
                        endAdornment="°C" 
                    />
                </div>
                <div className="flex flex-col justify-end">
                     <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Total Pressure Drop</span>
                        <span className="text-2xl font-bold text-primary">
                            {(results[results.length - 1]?.cumulativePressureDropPa / 1000 || 0).toFixed(3)} <span className="text-sm font-normal text-muted-foreground">kPa</span>
                        </span>
                     </div>
                </div>
             </div>

             {/* Manifold Construction Area */}
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Visual Builder (Left) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            Construction Sequence
                        </h3>
                        <div className="flex items-center gap-2">
                             <button onClick={() => addNode('fitting', 'tee_branch')} className="btn btn-sm btn-secondary text-xs">+ Tee</button>
                             <button onClick={() => addNode('fitting', 'elbow_90')} className="btn btn-sm btn-secondary text-xs">+ Elbow</button>
                             <button onClick={() => addNode('fitting', 'valve_butterfly')} className="btn btn-sm btn-secondary text-xs">+ Valve</button>
                             <button onClick={() => addNode('pipe')} className="btn btn-sm btn-secondary text-xs">+ Pipe</button>
                             <button onClick={() => addNode('outlet')} className="btn btn-sm btn-primary text-xs">+ Outlet (Consumer)</button>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {nodes.map((node, idx) => {
                            const res = getResult(node.id);
                            return (
                                <div key={node.id} className="group relative flex items-center gap-4 bg-card/50 border border-border/40 p-4 rounded-xl hover:border-primary/30 transition-all">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted-foreground/20 rounded-l-xl group-hover:bg-primary/50 transition-colors" />
                                    
                                    {/* Index */}
                                    <span className="text-xs font-mono text-muted-foreground/50 w-6">{String(idx).padStart(2, '0')}</span>

                                    {/* Icon / Type */}
                                    <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                                        {node.type === 'inlet' && <ArrowRight className="w-5 h-5 text-primary" />}
                                        {node.fittingType === 'elbow_90' && <div className="text-lg">⤵️</div>}
                                        {node.fittingType === 'tee_branch' && <div className="text-lg">┣</div>}
                                        {node.fittingType === 'tee_flow' && <div className="text-lg">═</div>}
                                        {node.fittingType === 'valve_butterfly' && <div className="text-lg">⧖</div>}
                                        {node.type === 'outlet' && <ArrowRight className="w-5 h-5 text-orange-500 rotate-90" />}
                                        {node.type === 'pipe' && <div className="w-6 h-1 bg-muted-foreground/50 rounded-full" />}
                                    </div>

                                    {/* Inputs */}
                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                        <div className="col-span-2">
                                            <span className="text-xs font-semibold block text-foreground">
                                                {node.type === 'inlet' ? 'Inlet Connection' : 
                                                 node.type === 'outlet' ? 'Consumer Extraction' :
                                                 node.type === 'pipe' ? 'Pipe Segment' :
                                                 FITTING_LABELS[node.fittingType!] || 'Fitting'}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">{node.dn}</span>
                                        </div>

                                        {node.type === 'pipe' && (
                                            <div className="col-span-1">
                                                <NumberInput 
                                                    value={node.length || 0} 
                                                    onChange={v => updateNode(node.id, { length: v })} 
                                                    min={0.1}
                                                    endAdornment="m"
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        )}

                                        {node.type === 'outlet' && (
                                            <div className="col-span-1">
                                                <NumberInput 
                                                    value={node.flowExtract || 0} 
                                                    onChange={v => updateNode(node.id, { flowExtract: v })} 
                                                    min={0}
                                                    endAdornment="m³/h"
                                                    className="h-8 text-xs border-orange-500/30 text-orange-600"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Results Mini-Dashboard */}
                                    {res && (
                                        <div className="flex items-center gap-6 pr-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <div className="text-right">
                                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Pressure</span>
                                                <span className="text-xs font-mono font-bold text-red-500">-{res.pressureDropPa.toFixed(0)} Pa</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Temp</span>
                                                <span className="text-xs font-mono font-medium text-blue-500">{res.temp.toFixed(2)} °C</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {node.type !== 'inlet' && (
                                        <button 
                                            onClick={() => removeNode(node.id)}
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Live Results Panel (Right) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card/30 border border-border/40 rounded-xl p-6 backdrop-blur-sm">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Simulation Analysis</h4>
                        
                        <div className="space-y-6">
                            {/* Exit Params */}
                            <div className="flex items-center justify-between border-b border-border/20 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Thermometer className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Exit Temperature</span>
                                        <span className="text-lg font-mono font-bold">{results[results.length-1]?.temp.toFixed(2)} °C</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-muted-foreground block">Loss</span>
                                    <span className="text-sm font-mono text-red-400">
                                        -{(inletTemp - (results[results.length-1]?.temp || inletTemp)).toFixed(2)} °C
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-b border-border/20 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                        <Gauge className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Exit Flow</span>
                                        <span className="text-lg font-mono font-bold">{results[results.length-1]?.flowRate.toFixed(1)} m³/h</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Flow Regime Warning */}
                            {results.some(r => r.velocity > 3.0) && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                                    <Info className="w-4 h-4 text-red-500 mt-0.5" />
                                    <p className="text-xs text-red-500">High velocity detected (&gt;3.0 m/s). Consider increasing DN or reducing flow.</p>
                                </div>
                            )}

                             {/* Thermal Warning */}
                             {results.some(r => r.temp < 4.0) && inletTemp > 5 && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-3">
                                    <Thermometer className="w-4 h-4 text-blue-500 mt-0.5" />
                                    <p className="text-xs text-blue-500">Temperature dropped below 4°C. Risk of freezing/crystallization if water.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-xl text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground block mb-2">Engineering Notes:</strong>
                        Calculations use Zeta values (K-factors) for fittings and Darcy-Weisbach equation. 
                        Thermal loss assumes uninsulated components (worst case) or standard insulation if configured. 
                        Results are 1D steady-state approximations suitable for sizing.
                    </div>
                </div>
             </div>
        </div>
    );
};
