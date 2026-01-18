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
        <div className="bg-card p-6 rounded-2xl shadow-lg shadow-primary/5 border border-border/50 space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-3">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Equipment & Additions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Additional Volume Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">
                        Additional Volume (Liters)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            className="block w-full rounded-xl border-border/50 py-3 px-4 text-foreground focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm bg-secondary/30 placeholder-muted-foreground transition-all"
                            placeholder="e.g. Chillers, Buffers, Coils..."
                            value={additionalVolume || ''}
                            onChange={(e) => onAdditionalVolumeChange(parseFloat(e.target.value) || 0)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-muted-foreground text-sm">Liters</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Enter volume for equipment not included in pipes (e.g. internal volume of heat exchangers).
                    </p>
                </div>

                {/* Safety Margin Toggle */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Safety Margin (+5%)
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-xl border border-border/50">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={safetyMargin}
                                onChange={(e) => onSafetyMarginChange(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            <span className="ml-3 text-sm font-medium text-foreground">
                                {safetyMargin ? 'Enabled (+5%)' : 'Disabled'}
                            </span>
                        </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Adds a 5% safety factor to the Total System Volume calculation.
                    </p>
                </div>
            </div>
        </div>
    );
};
