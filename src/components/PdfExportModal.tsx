
import React, { useState } from 'react';
import { X, FileText, Check, Printer, Scale, Anchor, Package, Camera } from 'lucide-react';
import { ProjectDetails, PipeSegment, EquipmentItem } from '@/lib/types';
import { PdfData, PdfOptions } from '@/lib/pdf/types';

interface PdfExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        projectDetails: ProjectDetails;
        segments: PipeSegment[];
        equipmentList: EquipmentItem[];
        fluidType: string;
        glycolPercentage: number;
        safetyMargin: boolean;
        safetyMarginPercentage: number;
        supportConfig: {
            spacing: number;
            mountingType: 'concrete' | 'suspended';
            height: number;
            pipesPerSupport: number;
        };
        branding: {
            primaryColor: string;
            accentColor: string;
            pdfTheme: 'modern' | 'classic' | 'industrial';
        };
    };
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose, data }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    // Report Options State
    const [options, setOptions] = useState<PdfOptions>({
        includeVolume: true,
        includeBoQ: true,
        includeSupports: true,
        includeWeights: false,
        includePhotos: false,
        supportSpacing: 2.0 // Default spacing for support calc in PDF
    });

    if (!isOpen) return null;

    const toggleOption = (key: keyof PdfOptions) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] as boolean }));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const pdfData: PdfData = {
                ...data,
                options
            };

            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Generation failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Proiect_${data.projectDetails.projectName.replace(/\s+/g, '_')}_Rev${data.projectDetails.revision}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            onClose();
        } catch (error: any) {
            console.error('PDF Download Error:', error);
            alert(`Eroare la generare PDF: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Printer className="w-5 h-5 text-blue-400" />
                            Configurare Raport PDF
                        </h3>
                        <p className="text-slate-400 text-sm">Selectați secțiunile de inclus în raport</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    {/* Option: Volume & Specs */}
                    <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-700 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors group">
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${options.includeVolume ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-800'}`}>
                            {options.includeVolume && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={options.includeVolume} onChange={() => toggleOption('includeVolume')} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 font-bold text-slate-200 group-hover:text-white">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Sumar Executiv & Volum
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Date proiect, calcul volum total lichid, specificații glicol.</p>
                        </div>
                    </label>

                    {/* Option: BoQ */}
                    <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-700 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors group">
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${options.includeBoQ ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-800'}`}>
                            {options.includeBoQ && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={options.includeBoQ} onChange={() => toggleOption('includeBoQ')} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 font-bold text-slate-200 group-hover:text-white">
                                <Package className="w-4 h-4 text-slate-400" />
                                Lista de Cantități (BoQ)
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Necesar țeavă "De Comandat" (cu rezerve incluse).</p>
                        </div>
                    </label>

                    {/* Option: Supports */}
                    <div className="rounded-xl border border-slate-700 bg-slate-800/30 overflow-hidden">
                        <label className="flex items-start gap-4 p-4 cursor-pointer hover:bg-slate-800/50 transition-colors group">
                            <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${options.includeSupports ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-800'}`}>
                                {options.includeSupports && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={options.includeSupports} onChange={() => toggleOption('includeSupports')} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 font-bold text-slate-200 group-hover:text-white">
                                    <Anchor className="w-4 h-4 text-slate-400" />
                                    Raport Suporți & Prinderi
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Calcul automat profile necesare (US5/US7) și cantități.</p>
                            </div>
                        </label>

                        {/* Sub-option: Spacing */}
                        {options.includeSupports && (
                            <div className="px-12 pb-4 pt-0 transition-all animate-in slide-in-from-top-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400">Distanța de calcul:</span>
                                    <select
                                        value={options.supportSpacing}
                                        onChange={(e) => setOptions(prev => ({ ...prev, supportSpacing: parseFloat(e.target.value) }))}
                                        className="bg-slate-900 border border-slate-600 text-white text-xs rounded px-2 py-1 focus:border-blue-500 outline-none"
                                    >
                                        <option value="1.5">1.5m</option>
                                        <option value="2.0">2.0m</option>
                                        <option value="2.5">2.5m</option>
                                        <option value="3.0">3.0m</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Option: Weights */}
                    <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-700 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors group">
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${options.includeWeights ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-800'}`}>
                            {options.includeWeights && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={options.includeWeights} onChange={() => toggleOption('includeWeights')} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 font-bold text-slate-200 group-hover:text-white">
                                <Scale className="w-4 h-4 text-slate-400" />
                                Detaliere Greutăți Statice
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Tabel detaliat (Țeavă goală vs Plină) pentru structuriști.</p>
                        </div>
                    </label>

                    {/* Option: Photos */}
                    <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-700 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors group opacity-70">
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${options.includePhotos ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-800'}`}>
                            {options.includePhotos && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={options.includePhotos} onChange={() => toggleOption('includePhotos')} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 font-bold text-slate-200 group-hover:text-white">
                                <Camera className="w-4 h-4 text-slate-400" />
                                Documentație Foto
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Include imaginile atașate echipamentelor (Experimental).</p>
                        </div>
                    </label>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Anulează
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Generare...
                            </>
                        ) : (
                            <>
                                <Printer className="w-4 h-4" />
                                Generează PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
