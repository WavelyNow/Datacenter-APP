import React, { useState, useEffect } from 'react';
import { X, FileText, Check, Printer, Scale, Anchor, Package, Camera, Eye, Download, FileSpreadsheet, Leaf } from 'lucide-react';
import { createPortal } from 'react-dom';

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
        includeEnergy: true,
        includePhotos: false,
        supportSpacing: 2.0
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    if (!isOpen || !mounted) return null;

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
        if (previewUrl) {
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = `Proiect_${data.projectDetails.projectName.replace(/\s+/g, '_')}.pdf`;
            a.click();
            return;
        }

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

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className={`relative bg-card w-full ${previewUrl ? 'max-w-6xl h-[90vh]' : 'max-w-lg'} rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border transition-all`}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
                            <Printer className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Export Center</h3>
                            <p className="text-[10px] text-muted-foreground">Generate documentation</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                    <div className="flex p-0.5 bg-muted rounded-lg border border-border">
                        <button
                            onClick={() => setMode('pdf')}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'pdf'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                }`}
                        >
                            <FileText className="w-3.5 h-3.5" /> PDF
                        </button>
                        <button
                            onClick={() => { setMode('excel'); setPreviewUrl(null); }}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'excel'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                }`}
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-muted/10">

                    {/* Settings Panel */}
                    <div className={`p-6 space-y-6 overflow-y-auto custom-scrollbar ${previewUrl ? 'w-full md:w-80 border-r border-border shrink-0' : 'w-full'}`}>

                        {mode === 'pdf' && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Sections</h4>

                                {[
                                    { key: 'includeVolume', label: 'Summary & Volume', icon: Package },
                                    { key: 'includeBoQ', label: 'Bill of Quantities', icon: FileText },
                                    { key: 'includeSupports', label: 'Supports Configuration', icon: Anchor },
                                    { key: 'includeWeights', label: 'Weights Table', icon: Scale },
                                    { key: 'includeEnergy', label: 'Sustainability Report', icon: Leaf },
                                    { key: 'includePhotos', label: 'Documentation Photos', icon: Camera }
                                ].map((opt) => (
                                    <div key={opt.key}>
                                        <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${options[opt.key as keyof PdfOptions]
                                            ? 'bg-muted border-border'
                                            : 'bg-transparent border-transparent hover:bg-muted/50'
                                            }`}>
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${options[opt.key as keyof PdfOptions]
                                                ? 'bg-primary border-primary'
                                                : 'border-muted-foreground'
                                                }`}>
                                                {options[opt.key as keyof PdfOptions] && <Check className="w-3 h-3 text-primary-foreground" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={options[opt.key as keyof PdfOptions] as boolean}
                                                onChange={() => toggleOption(opt.key as keyof PdfOptions)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <opt.icon className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className={`text-sm font-medium ${options[opt.key as keyof PdfOptions] ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {opt.label}
                                                </span>
                                            </div>
                                        </label>

                                        {/* Special case for Supports spacing */}
                                        {opt.key === 'includeSupports' && options.includeSupports && (
                                            <div className="ml-10 mt-2 flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Spacing:</span>
                                                <select
                                                    value={options.supportSpacing}
                                                    onChange={(e) => setOptions(prev => ({ ...prev, supportSpacing: parseFloat(e.target.value) }))}
                                                    className="bg-card border border-border text-foreground text-xs rounded px-2 py-1 focus:ring-1 focus:ring-primary/20 outline-none"
                                                >
                                                    <option value="1.5">1.5m</option>
                                                    <option value="2.0">2.0m</option>
                                                    <option value="2.5">2.5m</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {mode === 'excel' && (
                            <div className="text-center py-8 space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                                    <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-foreground font-medium text-sm">Full Excel Export</h4>
                                    <p className="text-muted-foreground text-xs mx-auto max-w-[200px]">
                                        Contains structured tabs for Volume, BoQ, Equipment List, and Supports.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Area (Only for PDF) */}
                    {mode === 'pdf' && previewUrl && (
                        <div className="flex-1 bg-muted p-6 h-full relative">
                            <iframe src={previewUrl} className="w-full h-full rounded-lg bg-white shadow-xl border border-border" />
                        </div>
                    )}

                    {/* Placeholder Area when no preview */}
                    {mode === 'pdf' && !previewUrl && (
                        <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center ${previewUrl ? 'hidden' : ''}`}>
                            <div className="mb-4">
                                <Eye className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h4 className="text-foreground font-medium text-sm mb-1">Preview Report</h4>
                            <p className="text-muted-foreground text-xs mb-6 max-w-[180px]">Generate a preview to verify content before downloading.</p>
                            <button
                                onClick={handlePreview}
                                disabled={isGenerating}
                                className="btn btn-secondary btn-md gap-2"
                            >
                                {isGenerating ? <span className="animate-spin text-lg">•</span> : <Eye className="w-4 h-4" />}
                                Generate Preview
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-border bg-card flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-md text-xs"
                    >
                        Cancel
                    </button>

                    {mode === 'pdf' ? (
                        <button
                            onClick={handleDownloadPdf}
                            className="btn btn-primary btn-md gap-2 text-xs"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download PDF
                        </button>
                    ) : (
                        <button
                            onClick={handleExcelExport}
                            className="btn btn-secondary btn-md gap-2 text-xs text-white bg-emerald-600 hover:bg-emerald-500 border-emerald-600"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download Excel
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
