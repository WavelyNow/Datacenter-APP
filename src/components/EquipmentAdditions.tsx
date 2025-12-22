import React from 'react';
import { Package, ShieldCheck } from 'lucide-react';

interface EquipmentAdditionsProps {
    additionalVolume: number;
    onAdditionalVolumeChange: (val: number) => void;
    safetyMargin: boolean;
    onSafetyMarginChange: (val: boolean) => void;
}

export const EquipmentAdditions: React.FC<EquipmentAdditionsProps> = ({
    additionalVolume,
    onAdditionalVolumeChange,
    safetyMargin,
    onSafetyMarginChange,
}) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-700 space-y-6 print:bg-white print:border-slate-200 print:shadow-none">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2 print:border-slate-100">
                <Package className="w-5 h-5 text-blue-400 print:text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-100 print:text-slate-800">Equipment & Additions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Additional Volume Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400 print:text-slate-700">
                        Additional Volume (Liters)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            className="block w-full rounded-md border-slate-600 py-3 px-4 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-700 placeholder-slate-400 print:bg-slate-50 print:text-slate-900 print:border-slate-200"
                            placeholder="e.g. Chillers, Buffers, Coils..."
                            value={additionalVolume || ''}
                            onChange={(e) => onAdditionalVolumeChange(parseFloat(e.target.value) || 0)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-slate-400 text-sm print:text-slate-500">Liters</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 print:text-slate-500">
                        Enter volume for equipment not included in pipes (e.g. internal volume of heat exchangers).
                    </p>
                </div>

                {/* Safety Margin Toggle */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-400 flex items-center gap-2 print:text-slate-700">
                        <ShieldCheck className="w-4 h-4 text-green-500 print:text-green-600" />
                        Safety Margin (+5%)
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700 print:bg-slate-50 print:border-slate-100">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={safetyMargin}
                                onChange={(e) => onSafetyMarginChange(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 print:bg-slate-200 print:peer-focus:ring-blue-300"></div>
                            <span className="ml-3 text-sm font-medium text-slate-300 print:text-slate-700">
                                {safetyMargin ? 'Enabled (+5%)' : 'Disabled'}
                            </span>
                        </label>
                    </div>
                    <p className="text-xs text-slate-500 print:text-slate-500">
                        Adds a 5% safety factor to the Total System Volume calculation.
                    </p>
                </div>
            </div>
        </div>
    );
};
