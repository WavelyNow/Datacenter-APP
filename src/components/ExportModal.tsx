import React, { useState, useEffect } from 'react';
import { X, FileText, Check, Printer, Scale, Anchor, Package, Camera, Eye, Download, FileSpreadsheet } from 'lucide-react';
import { ProjectDetails, PipeSegment, EquipmentItem } from '@/lib/types';
import { PdfData, PdfOptions } from '@/lib/pdf/types';
import { generateExcelReport } from '@/lib/excel/generateExcel';

interface ExportModalProps {
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
            insulationThickness: number;
            insulationDensity: number;
            addLeftConsole: boolean;
            addRightConsole: boolean;
            addUpperRail: boolean;
        };
        branding: {
            primaryColor: string;
            accentColor: string;
            pdfTheme: 'modern' | 'classic' | 'industrial';
        };
    };
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data }) => {
    const [mode, setMode] = useState<'pdf' | 'excel'>('pdf');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Report Options State
    const [options, setOptions] = useState<PdfOptions>({
        includeVolume: true,
        includeBoQ: true,
        includeSupports: true,
        includeWeights: false,
        includePhotos: false,
        supportSpacing: 2.0
    });

    // Cleanup preview URL on unmount or close
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    if (!isOpen) return null;

    const toggleOption = (key: keyof PdfOptions) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] as boolean }));
    };

    const generatePdfBlob = async () => {
        setIsGenerating(true);
        try {
            const pdfData: PdfData = { ...data, options };
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfData)
            });

            if (!response.ok) throw new Error('Generation failed');
            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('PDF Error:', error);
            alert('Eroare la generare PDF');
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePreview = async () => {
        const blob = await generatePdfBlob();
        if (blob) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        }
    };

    const handleDownloadPdf = async () => {
        // If we already have a preview, use that
        if (previewUrl) {
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = `Proiect_${data.projectDetails.projectName.replace(/\s+/g, '_')}.pdf`;
            a.click();
            return;
        }

        // Otherwise generate fresh
        const blob = await generatePdfBlob();
        if (blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Proiect_${data.projectDetails.projectName.replace(/\s+/g, '_')}_Rev${data.projectDetails.revision}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            onClose();
        }
    };

    const handleExcelExport = () => {
        generateExcelReport(data);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className={`relative bg-slate-900 border border-slate-700 w-full ${previewUrl ? 'max-w-6xl h-[90vh]' : 'max-w-lg'} rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300`}>

                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Printer className="w-5 h-5 text-blue-400" />
                            Centru de Export
                        </h3>
                        <p className="text-slate-400 text-sm">Previzualizare și descărcare documentație</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-900/50 shrink-0">
                    <button
                        onClick={() => setMode('pdf')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${mode === 'pdf' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <FileText className="w-4 h-4" /> Export PDF
                    </button>
                    <button
                        onClick={() => { setMode('excel'); setPreviewUrl(null); }}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${mode === 'excel' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Export Excel
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                    {/* Settings Panel */}
                    <div className={`p-6 space-y-4 overflow-y-auto ${previewUrl ? 'w-full md:w-80 border-r border-slate-800 shrink-0' : 'w-full'}`}>

                        {mode === 'pdf' && (
                            <>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.includeVolume ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                            {options.includeVolume && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={options.includeVolume} onChange={() => toggleOption('includeVolume')} />
                                        <span className="text-sm font-medium text-slate-200">Sumar & Volum</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.includeBoQ ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                            {options.includeBoQ && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={options.includeBoQ} onChange={() => toggleOption('includeBoQ')} />
                                        <span className="text-sm font-medium text-slate-200">Lista Cantități (BoQ)</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.includeSupports ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                            {options.includeSupports && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={options.includeSupports} onChange={() => toggleOption('includeSupports')} />
                                        <span className="text-sm font-medium text-slate-200">Suporți & Prinderi</span>
                                    </label>

                                    {options.includeSupports && (
                                        <div className="pl-9">
                                            <span className="text-xs text-slate-400 mr-2">Distanță calcul:</span>
                                            <select
                                                value={options.supportSpacing}
                                                onChange={(e) => setOptions(prev => ({ ...prev, supportSpacing: parseFloat(e.target.value) }))}
                                                className="bg-slate-900 border border-slate-600 text-white text-xs rounded px-2 py-1"
                                            >
                                                <option value="1.5">1.5m</option>
                                                <option value="2.0">2.0m</option>
                                                <option value="2.5">2.5m</option>
                                            </select>
                                        </div>
                                    )}

                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.includeWeights ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                            {options.includeWeights && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={options.includeWeights} onChange={() => toggleOption('includeWeights')} />
                                        <span className="text-sm font-medium text-slate-200">Tabel Greutăți</span>
                                    </label>
                                </div>
                            </>
                        )}

                        {mode === 'excel' && (
                            <div className="text-center py-8 space-y-4">
                                <FileSpreadsheet className="w-16 h-16 text-emerald-500/20 mx-auto" />
                                <p className="text-slate-400 text-sm">
                                    Raportul Excel va conține toate datele tehnice structurate pe foi de lucru (Tabs):
                                </p>
                                <ul className="text-xs text-slate-500 text-left list-disc pl-8 space-y-1">
                                    <li>Sumar Proiect & Volume</li>
                                    <li>Lista de Cantități (BoQ)</li>
                                    <li>Listă Echipamente</li>
                                    <li>Configurație Suporți</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Preview Area (Only for PDF) */}
                    {mode === 'pdf' && previewUrl && (
                        <div className="flex-1 bg-slate-800/50 p-4 h-full">
                            <iframe src={previewUrl} className="w-full h-full rounded-lg bg-white shadow-inner" />
                        </div>
                    )}

                    {/* Placeholder Area when no preview */}
                    {mode === 'pdf' && !previewUrl && (
                        <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center ${previewUrl ? 'hidden' : ''}`}>
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Eye className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-slate-500 text-sm mb-6">Previzualizarea este disponibilă înainte de descărcare.</p>
                            <button
                                onClick={handlePreview}
                                disabled={isGenerating}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                            >
                                {isGenerating ? <span className="animate-spin text-xl">•</span> : <Eye className="w-4 h-4" />}
                                Generează Previzualizare
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white rounded-lg">
                        Închide
                    </button>

                    {mode === 'pdf' ? (
                        <button
                            onClick={handleDownloadPdf}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                    ) : (
                        <button
                            onClick={handleExcelExport}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download Excel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
