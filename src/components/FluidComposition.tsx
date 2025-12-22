import React from 'react';
import { Snowflake } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';

export const FluidComposition: React.FC = () => {
    const { glycolPercentage, setGlycolPercentage } = useProject();

    const onGlycolPercentageChange = (val: number) => {
        setGlycolPercentage(val);
    };

    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-700 print:bg-white print:border-slate-200 print:shadow-none">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2 print:border-slate-100">
                <Snowflake className="w-5 h-5 text-blue-400 print:text-blue-500" />
                <h2 className="text-xl font-semibold text-slate-100 print:text-slate-800">Fluid Composition</h2>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-400 print:text-slate-700">Glycol Concentration</label>
                    <span className="text-lg font-bold text-blue-400 bg-slate-900 px-3 py-1 rounded-md print:bg-blue-50 print:text-blue-600">
                        {glycolPercentage}%
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 print:bg-slate-200"
                    value={glycolPercentage}
                    onChange={(e) => onGlycolPercentageChange(parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-slate-500 print:text-slate-400">
                    <span>0% (Pure Water)</span>
                    <span>50%</span>
                    <span>100% (Pure Glycol)</span>
                </div>
            </div>
        </div>
    );
};

