import React, { useState } from 'react';
import { Settings2, ArrowRight, Search, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useProject } from '@/context/ProjectContext'; // Assuming context is available

interface BimMappingWizardProps {
    isOpen: boolean;
    onClose: () => void;
    bimObject: any; // The selected object from BIM
    onSave: (data: any) => void;
}

export const BimMappingWizard = ({ isOpen, onClose, bimObject, onSave }: BimMappingWizardProps) => {
    const [step, setStep] = useState(1);
    const [manualData, setManualData] = useState({
        flow: 0,
        head: 0,
        temp: 7
    });
    const [selectedCatalogItem, setSelectedCatalogItem] = useState<any>(null);

    // Mock Catalog Results (In real app, search catalogs)
    const mockCatalogResults = [
        { id: 'p1', manufacturer: 'Wilo', model: 'Stratos MAXO 30/0.5-12', power: '0.3kW', efficient: true },
        { id: 'p2', manufacturer: 'Grundfos', model: 'Magna3 32-120', power: '0.32kW', efficient: true },
        { id: 'p3', manufacturer: 'DAB', model: 'Evoplus 110/180', power: '0.35kW', efficient: false },
    ];

    if (!isOpen || !bimObject) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-primary" />
                            Smart Asset Mapping
                        </h2>
                        <div className="text-sm text-muted-foreground flex gap-2 mt-1">
                            Saving: <span className="font-mono text-foreground bg-background px-1 rounded border border-border">{bimObject.name}</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1.5 w-8 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto">

                    {/* Step 1: Enrich Data */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex gap-3 text-sm text-orange-700 dark:text-orange-300">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="font-bold">Missing Engineering Data</p>
                                    <p className="opacity-90">This BIM object lacks Flow Rate and Head Pressure data. Please input them manually to find a matching product.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Flow Rate (m³/h)</label>
                                    <input
                                        type="number"
                                        className="input-field w-full text-lg font-mono"
                                        value={manualData.flow}
                                        onChange={e => setManualData({ ...manualData, flow: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Head (kPa)</label>
                                    <input
                                        type="number"
                                        className="input-field w-full text-lg font-mono"
                                        value={manualData.head}
                                        onChange={e => setManualData({ ...manualData, head: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Catalog Item */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="font-bold">Recommended Products</h3>
                            <div className="space-y-2">
                                {mockCatalogResults.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedCatalogItem(item)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${selectedCatalogItem?.id === item.id ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-card border-border hover:border-primary/50'}`}
                                    >
                                        <div>
                                            <div className="font-bold flex items-center gap-2">
                                                {item.manufacturer} {item.model}
                                                {item.efficient && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] rounded-full border border-emerald-500/20 uppercase font-bold">High Eff</span>}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">Power: {item.power} • Matches operating point</div>
                                        </div>
                                        {selectedCatalogItem?.id === item.id && <CheckCircle className="w-5 h-5 text-primary" />}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground mt-4 items-center justify-center">
                                <Search className="w-3 h-3" />
                                Scanned 1,240 catalog items
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Ready to Map</h3>
                                <p className="text-muted-foreground">The BIM object will be linked to:</p>
                                <div className="mt-2 text-sm font-mono bg-muted py-1 px-3 rounded inline-block">
                                    {selectedCatalogItem?.manufacturer} {selectedCatalogItem?.model}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                    {step === 1 && (
                        <button onClick={() => setStep(2)} className="btn btn-primary">
                            Find Matches <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    )}
                    {step === 2 && (
                        <button
                            disabled={!selectedCatalogItem}
                            onClick={() => setStep(3)}
                            className="btn btn-primary disabled:opacity-50"
                        >
                            Select Product <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    )}
                    {step === 3 && (
                        <button onClick={() => onSave({ ...bimObject, mappedProduct: selectedCatalogItem, engineeringData: manualData })} className="btn btn-primary bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 ml-2" />
                            Confirm Mapping
                        </button>
                    )}
                    <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                </div>

            </div>
        </div>
    );
};
