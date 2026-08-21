import React, { useState, useEffect } from 'react';
import { X, FileText, Check, Package, Eye, Download, ChevronLeft, ChevronRight, Sparkles, Settings, Wrench, LucideIcon, FileSpreadsheet } from 'lucide-react';
import { ProjectDetails, PipeSegment, EquipmentItem } from '@/lib/types';
import { PdfData, PdfOptions } from '@/lib/pdf/types';

import { generateExcelReport } from '@/lib/excel/generateExcel';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

interface PdfWizardModalProps {
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
        fittingItems?: { id: string; type: string; size: string; quantity: number; description?: string }[];
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

type Preset = 'basic' | 'standard' | 'custom' | 'excel';

const presets: Record<Preset, { name: string; desc: string; icon: LucideIcon; options: Partial<PdfOptions> }> = {
    basic: {
        name: 'Raport Comanda',
        desc: 'Site + teava + lista de cumparat (recomandat).',
        icon: Package,
        options: {}
    },
    standard: {
        name: 'Raport Comanda + Rezumat Hugraulica',
        desc: 'Raportul de comanda cu detaliile hidraulice incluse.',
        icon: Wrench,
        options: {}
    },
    excel: {
        name: 'Excel Date Export',
        desc: 'Date tabelare pentru prelucrare externa.',
        icon: FileSpreadsheet,
        options: {}
    },
    custom: {
        name: 'Personalizat',
        desc: 'Configureaza manual.',
        icon: Settings,
        options: {}
    }
};

export const PdfWizardModal: React.FC<PdfWizardModalProps> = ({ isOpen, onClose, data }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPreset, setSelectedPreset] = useState<Preset>('basic');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Options State
    const [options, setOptions] = useState<PdfOptions>({
        includeVolume: true,
        includeBoQ: true,
        includeSupports: false,
        includeWeights: false,
        includePhotos: false,
        includeEnergy: false,
        supportSpacing: 2.0
    });

    // Invalidate preview when options change — dar NU revoca blob-ul imediat
    // (revocarea instantanee omora iframe-ul — blob-ul e inlocuit la handlePreview).
    // Curatenia se face la unmount / la inlocuire.
    useEffect(() => {
        if (previewUrl) {
            setPreviewUrl(null);
        }
    }, [options, selectedPreset]);

    // Cleanup preview URL on unmount or close
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setSelectedPreset('basic');
            setPreviewUrl(null);
            setOptions({
                includeVolume: true,
                includeBoQ: true,
                includeSupports: false,
                includeWeights: false,
                includePhotos: false,
                includeEnergy: false,
                supportSpacing: 2.0
            });
        }
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const selectPreset = (preset: Preset) => {
        setSelectedPreset(preset);
        if (preset !== 'custom' && preset !== 'excel') {
            setOptions(prev => ({ ...prev, ...presets[preset].options }));
        }
    };

    const generatePdfBlob = async () => {
        setIsGenerating(true);
        try {
            // Sanitize data to ensure validity
            const sanitizedData = {
                ...data,
                equipmentList: data.equipmentList.map((item, index) => ({
                    ...item,
                    name: item.name.trim() || `Equipment ${index + 1}`
                }))
            };
            const pdfData: PdfData = { ...sanitizedData, options };
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[PDF] Generation failed:', response.status, errorText.slice(0, 300));
                toast.error('Generarea PDF-ului a esuat. Verificati datele si incercati din nou.');
                return null;
            }
            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('[PDF] Error:', error);
            toast.error('Eroare de retea la generarea PDF-ului.');
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
            setCurrentStep(3); // Go to preview step
        }
    };

    const handleDownload = async () => {
        if (previewUrl) {
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = `Project_${data.projectDetails.projectName.replace(/\s+/g, '_')}_Rev${data.projectDetails.revision}.pdf`;
            a.click();
            onClose();
            return;
        }

        const blob = await generatePdfBlob();
        if (blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Project_${data.projectDetails.projectName.replace(/\s+/g, '_')}_Rev${data.projectDetails.revision}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            onClose();
        }
    };

    const nextStep = () => {
        if (selectedPreset === 'excel' && currentStep === 1) {
            setCurrentStep(4); // Jump to download
            return;
        }
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-foreground">Select Report Type</h3>
                            <p className="text-muted-foreground">Choose a preset configuration or customize your own.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(Object.keys(presets) as Preset[]).map(preset => {
                                const { name, desc, icon: Icon } = presets[preset];
                                const isSelected = selectedPreset === preset;
                                return (
                                    <button
                                        key={preset}
                                        onClick={() => selectPreset(preset)}
                                        className={`bg-card p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${isSelected
                                            ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10'
                                            : 'border-border hover:border-primary/20 hover:bg-muted/10'
                                            }`}
                                    >
                                        <div className="relative z-10 flex items-start gap-5">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                                                }`}>
                                                <Icon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h4 className={`text-lg font-bold mb-1 transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                    {name}
                                                </h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-4 right-4">
                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                                                </div>
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-foreground">Continutul raportului</h3>
                            <p className="text-muted-foreground">Raportul de comanda este fix si minimal — 3 pagini, mereu aceleasi:</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { nr: '1', label: 'Date site', desc: 'Proiect, proiectant, beneficiar, locatie, fluid & concentratie.' },
                                { nr: '2', label: 'Cantitate teava', desc: 'Pe DN si material: lungime, volum din diametrul interior, greutate.' },
                                { nr: '3', label: 'Lista de cumparat', desc: 'Glicol (cu pierderi fittinguri + marja), teava, fittinguri.' },
                            ].map((s) => (
                                <div key={s.nr} className="p-5 rounded-xl border border-border bg-card flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                                        {s.nr}
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold block mb-1 text-foreground">{s.label}</span>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
                            Fittingurile definite in proiect (Hidraulica &gt; Pierderi Locale) apar automat in lista de cumparat. Marja de pierderi fittinguri si marja de siguranta se seteaza in proiect.
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                        <div className="text-center space-y-2 shrink-0">
                            <h3 className="text-2xl font-bold text-foreground">Preview Report</h3>
                            <p className="text-muted-foreground">Review the content before final export.</p>
                        </div>
                        <div className="flex-1 min-h-0 bg-muted/20 rounded-xl border border-border shadow-2xl overflow-hidden relative group">
                            {previewUrl ? (
                                <iframe src={previewUrl} className="w-full h-[62vh] min-h-[420px] bg-white" title="Preview PDF" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center mb-6 shadow-xl">
                                        <Eye className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground max-w-xs mb-8">Preview has not been generated yet. Click the button below to render the PDF.</p>
                                    <button
                                        onClick={handlePreview}
                                        disabled={isGenerating}
                                        className="btn btn-primary btn-lg gap-3"
                                    >
                                        {isGenerating ? <span className="animate-spin text-xl">•</span> : <Eye className="w-5 h-5" />}
                                        Generate Preview
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center h-full">
                        <div className="text-center space-y-2">
                            <h3 className="text-3xl font-bold text-foreground">Ready to Download</h3>
                            <p className="text-muted-foreground">
                                {selectedPreset === 'excel'
                                    ? 'Your Excel export is ready.'
                                    : 'Your report has been successfully generated.'}
                            </p>
                        </div>

                        <div className="bg-primary/5 p-10 rounded-3xl border border-primary/20 text-center max-w-md w-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />

                            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/40 animate-in zoom-in duration-500">
                                {selectedPreset === 'excel' ? (
                                    <FileSpreadsheet className="w-12 h-12 text-primary-foreground" />
                                ) : (
                                    <FileText className="w-12 h-12 text-primary-foreground" />
                                )}
                            </div>

                            <h4 className="text-xl font-bold text-foreground mb-2">
                                {data.projectDetails.projectName || 'Untitled Project'}
                            </h4>
                            <p className="text-muted-foreground mb-8 font-mono text-sm bg-muted py-1 px-3 rounded-full inline-block border border-border">
                                Revision {data.projectDetails.revision}
                            </p>

                            <button
                                onClick={selectedPreset === 'excel' ? async () => {
                    try {
                        await generateExcelReport(data);
                        toast.success('Excel generat');
                    } catch (e) {
                        console.error('[Excel]', e);
                        toast.error('Generarea Excel-ului a esuat.');
                    }
                } : handleDownload}
                                className="w-full btn btn-primary btn-lg gap-2 text-base shadow-xl shadow-primary/20"
                            >
                                <Download className="w-5 h-5" />
                                {selectedPreset === 'excel' ? 'Download Excel' : 'Download PDF'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-500" onClick={onClose} />

            <div className="relative bg-card w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-border animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-8 py-6 border-b border-border bg-muted/30 flex items-center justify-between shrink-0 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground leading-none">Report Wizard</h3>
                            <p className="text-xs text-muted-foreground mt-1">Step {currentStep} of 4</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-8 py-6 border-b border-border bg-muted/20 shrink-0">
                    <div className="relative flex items-center justify-between max-w-3xl mx-auto">
                        {/* Connecting Line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-10" />
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-500 -z-10"
                            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                        />

                        {[1, 2, 3, 4].map(step => {
                            const isActive = step <= currentStep;
                            const isCurrent = step === currentStep;
                            return (
                                <div key={step} className="flex flex-col items-center gap-2 bg-card px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${isActive
                                        ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]'
                                        : 'bg-card border-muted text-muted-foreground'
                                        } ${isCurrent ? 'scale-110' : ''}`}>
                                        {step}
                                    </div>
                                    <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'
                                        }`}>
                                        {step === 1 && 'Type'}
                                        {step === 2 && 'Options'}
                                        {step === 3 && 'Preview'}
                                        {step === 4 && 'Export'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto h-full">
                        {renderStepContent()}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-border bg-muted/30 flex justify-between items-center shrink-0 backdrop-blur-md">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="btn btn-ghost gap-2 pl-2 disabled:opacity-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="flex gap-4">
                        {currentStep === 3 && !previewUrl && (
                            <button
                                onClick={handlePreview}
                                disabled={isGenerating}
                                className="btn btn-secondary gap-2"
                            >
                                {isGenerating ? <span className="animate-spin">•</span> : <Eye className="w-4 h-4" />}
                                Generate Preview
                            </button>
                        )}

                        {currentStep < 4 ? (
                            <button
                                onClick={nextStep}
                                className="btn btn-primary gap-2 px-8"
                            >
                                Continue
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleDownload}
                                className="btn btn-primary gap-2 px-8 shadow-lg shadow-primary/25"
                            >
                                <Download className="w-4 h-4" />
                                Download Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
