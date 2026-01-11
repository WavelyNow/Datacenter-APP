
import React from 'react';
import { X, Book } from 'lucide-react';
import { PIPE_STANDARDS } from '@/lib/pipeStandards';

interface PipeCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PipeCatalogModal = ({ isOpen, onClose }: PipeCatalogModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Book className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">Catalog Tehnic - Dimensiuni Țevi</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {Object.entries(PIPE_STANDARDS).map(([key, standard]) => (
                        <div key={key} className="space-y-3">
                            <div className="border-l-4 border-blue-600 pl-3">
                                <h3 className="text-lg font-bold text-gray-800">{standard.label}</h3>
                                <p className="text-sm text-gray-500">{standard.description}</p>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 border-b">DN (Nominal)</th>
                                            <th className="px-4 py-2 border-b">Inch</th>
                                            <th className="px-4 py-2 border-b">Diametru Exterior (mm)</th>
                                            <th className="px-4 py-2 border-b">Grosime Perete (mm)</th>
                                            <th className="px-4 py-2 border-b font-bold text-blue-700 bg-blue-50">Diametru Interior (mm)</th>
                                            <th className="px-4 py-2 border-b">Greutate (kg/m)</th>
                                            <th className="px-4 py-2 border-b">Volum (l/m)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {standard.dimensions.map((pipe, idx) => {
                                            // Volume (liters) = Area (m2) * Length (1m) * 1000
                                            // ID in mm. ID/1000 = m. r = ID/2000.
                                            // V = pi * (ID/2000)^2 * 1 * 1000 => liters
                                            // Easier: Liters/m = (pi * (ID)^2) / 4000.  (Because ID^2 is mm^2. 10^6 mm2 = 1m2. so ID^2/10^6. *1000L).
                                            // (ID^2 * 3.14159) / 4000 is approx correct.
                                            // Example: ID 50mm. 2500 * 3.14 / 4000 = 1.96 L/m. Correct.

                                            // Let's use simpler: (ID_mm / 2)^2 * PI / 1000 -> This gives volume in Liters per meter for a cylinder?
                                            // 1m length. V = pi * r^2 * h.
                                            // r = pipe.id / 2 mm = pipe.id / 20 cm.
                                            // V_cm3 = pi * (id/20)^2 * 100.
                                            // V_liters = V_cm3 / 1000.
                                            const vol = (Math.PI * Math.pow(pipe.id / 20, 2) * 100) / 1000;

                                            return (
                                                <tr key={idx} className="hover:bg-gray-100 border-b border-gray-100 last:border-0 transition-colors">
                                                    <td className="px-4 py-2 font-bold text-gray-800">{pipe.dn}</td>
                                                    <td className="px-4 py-2 text-gray-800">{pipe.inch}</td>
                                                    <td className="px-4 py-2 text-gray-800">{pipe.od}</td>
                                                    <td className="px-4 py-2 text-gray-800">{pipe.thickness}</td>
                                                    <td className="px-4 py-2 font-bold text-blue-700 bg-blue-50/50">{pipe.id}</td>
                                                    <td className="px-4 py-2 text-gray-800">{pipe.weight}</td>
                                                    <td className="px-4 py-2 font-mono text-gray-700">{vol.toFixed(3)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t bg-gray-50 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors">
                        Închide Catalogul
                    </button>
                </div>
            </div>
        </div>
    );
};
