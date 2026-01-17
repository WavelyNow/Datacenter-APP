'use client';

import React, { useState, useMemo } from 'react';
import {
    DollarSign,
    Package,
    Wrench,
    Thermometer,
    Hammer,
    Calculator,
    Settings,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    Box,
    Zap
} from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { calculateCostEstimate, formatCurrency, CostBreakdown, CostEstimatorConfig } from '@/lib/calculations/costEstimate';

export const CostEstimator: React.FC = () => {
    const { segments, equipmentList } = useProject();

    const [config, setConfig] = useState<CostEstimatorConfig>({
        includeInsulation: true,
        insulationThicknessMm: 25,
        includeSupports: true,
        supportSpacingM: 2.5,
        laborMarkup: 15,
        materialMarkup: 10,
    });

    const [showSettings, setShowSettings] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(true);

    const costs = useMemo(() => {
        return calculateCostEstimate(segments, equipmentList, config);
    }, [segments, equipmentList, config]);

    const totalPipeLength = segments.reduce((sum, seg) => sum + seg.length, 0);

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Calculator className="w-6 h-6 text-indigo-500" />
                        Cost Estimator
                    </h2>
                    <p className="text-muted-foreground mt-1">Project budget estimation based on materials and labor</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="btn btn-secondary gap-2"
                >
                    <Settings className="w-4 h-4" />
                    Settings
                    {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-muted/20 border border-border rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Insulation */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={config.includeInsulation}
                                    onChange={e => setConfig({ ...config, includeInsulation: e.target.checked })}
                                    className="w-4 h-4 rounded border-border"
                                />
                                <span className="text-sm font-medium">Include Insulation</span>
                            </label>
                            {config.includeInsulation && (
                                <div>
                                    <label className="text-xs text-muted-foreground">Thickness (mm)</label>
                                    <input
                                        type="number"
                                        value={config.insulationThicknessMm}
                                        onChange={e => setConfig({ ...config, insulationThicknessMm: parseInt(e.target.value) || 25 })}
                                        className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Supports */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={config.includeSupports}
                                    onChange={e => setConfig({ ...config, includeSupports: e.target.checked })}
                                    className="w-4 h-4 rounded border-border"
                                />
                                <span className="text-sm font-medium">Include Supports</span>
                            </label>
                            {config.includeSupports && (
                                <div>
                                    <label className="text-xs text-muted-foreground">Spacing (m)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={config.supportSpacingM}
                                        onChange={e => setConfig({ ...config, supportSpacingM: parseFloat(e.target.value) || 2.5 })}
                                        className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Markups */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-muted-foreground">Material Markup (%)</label>
                                <input
                                    type="number"
                                    value={config.materialMarkup}
                                    onChange={e => setConfig({ ...config, materialMarkup: parseInt(e.target.value) || 0 })}
                                    className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Labor Markup (%)</label>
                                <input
                                    type="number"
                                    value={config.laborMarkup}
                                    onChange={e => setConfig({ ...config, laborMarkup: parseInt(e.target.value) || 0 })}
                                    className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grand Total Card */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-8 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">
                            <DollarSign className="w-5 h-5" />
                            Estimated Total Cost
                        </div>
                        <div className="text-5xl font-black text-foreground tracking-tight">
                            {formatCurrency(costs.grandTotal)}
                        </div>
                        <p className="text-muted-foreground text-sm mt-2">
                            Based on {segments.length} pipe segments and {equipmentList.length} equipment items
                        </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="flex gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-foreground">{formatCurrency(costs.costPerMeter)}</div>
                            <div className="text-xs text-muted-foreground">per meter</div>
                        </div>
                        {costs.costPerKwCooling > 0 && (
                            <div className="text-center">
                                <div className="text-2xl font-bold text-foreground">{formatCurrency(costs.costPerKwCooling)}</div>
                                <div className="text-xs text-muted-foreground">per kW cooling</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Materials */}
                <div className="card-premium p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-muted-foreground uppercase">Materials</div>
                            <div className="text-xl font-bold text-foreground">{formatCurrency(costs.totalMaterials)}</div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Pipes, fittings, insulation, supports
                    </div>
                </div>

                {/* Equipment */}
                <div className="card-premium p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
                            <Box className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-muted-foreground uppercase">Equipment</div>
                            <div className="text-xl font-bold text-foreground">{formatCurrency(costs.equipmentPurchase)}</div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Chillers, pumps, CDUs, buffers
                    </div>
                </div>

                {/* Labor */}
                <div className="card-premium p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-400/10 flex items-center justify-center">
                            <Hammer className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-muted-foreground uppercase">Labor</div>
                            <div className="text-xl font-bold text-foreground">{formatCurrency(costs.totalLabor)}</div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Installation, testing, commissioning
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="card-premium">
                <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full p-6 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        <span className="font-bold">Detailed Breakdown</span>
                    </div>
                    {showBreakdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showBreakdown && (
                    <div className="px-6 pb-6 border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                            {/* Materials Breakdown */}
                            <div>
                                <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-indigo-500" />
                                    Materials Breakdown
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Pipe Materials</span>
                                        <span className="font-mono">{formatCurrency(costs.pipeMaterials)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Fittings (~30%)</span>
                                        <span className="font-mono">{formatCurrency(costs.fittings)}</span>
                                    </div>
                                    {config.includeInsulation && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Insulation</span>
                                            <span className="font-mono">{formatCurrency(costs.insulation)}</span>
                                        </div>
                                    )}
                                    {config.includeSupports && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Support Hardware</span>
                                            <span className="font-mono">{formatCurrency(costs.supports)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm pt-2 border-t border-border font-bold">
                                        <span>Subtotal (with {config.materialMarkup}% markup)</span>
                                        <span className="font-mono">{formatCurrency(costs.totalMaterials)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Labor Breakdown */}
                            <div>
                                <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                    <Hammer className="w-4 h-4 text-slate-400" />
                                    Labor Breakdown
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Pipe Installation</span>
                                        <span className="font-mono">{formatCurrency(costs.pipeInstallation)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Equipment Installation</span>
                                        <span className="font-mono">{formatCurrency(costs.equipmentInstallation)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Pressure Testing</span>
                                        <span className="font-mono">{formatCurrency(costs.testing)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Commissioning</span>
                                        <span className="font-mono">{formatCurrency(costs.commissioning)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-border font-bold">
                                        <span>Subtotal (with {config.laborMarkup}% markup)</span>
                                        <span className="font-mono">{formatCurrency(costs.totalLabor)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {segments.length === 0 && equipmentList.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No items to estimate</p>
                    <p className="text-sm">Add pipe segments and equipment to see cost estimates.</p>
                </div>
            )}

            {/* Disclaimer */}
            <div className="text-xs text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border">
                <strong>Disclaimer:</strong> This is an approximate estimate based on typical market prices.
                Actual costs may vary based on location, supplier quotes, project complexity, and market conditions.
                Equipment prices are rough estimates and should be replaced with actual quotes for budgeting.
            </div>
        </div>
    );
};
