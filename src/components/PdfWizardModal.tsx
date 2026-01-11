import React, { useState, useEffect } from 'react';
import { X, FileText, Check, Printer, Scale, Anchor, Package, Camera, Eye, Download, ChevronLeft, ChevronRight, Sparkles, Zap, Layers, Settings } from 'lucide-react';
import { ProjectDetails, PipeSegment, EquipmentItem } from '@/lib/types';
import { PdfData, PdfOptions } from '@/lib/pdf/types';

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

type Preset = 'basic' | 'standard' | 'full' | 'custom';

const presets: Record<Preset, { name: string; desc: string; icon: React.ComponentType<any>; options: Partial<PdfOptions> }> = {
    basic: {
        name: 'Raport Basic',
        desc: 'Sumar volum și listă cantități esențiale',
        icon: Package,
        options: { includeVolume: true, includeBoQ: true, includeSupports: false, includeWeights: false, includePhotos: false }
    },
    standard: {
        name: 'Raport Standard',
        desc: 'Include suporturi și prinderi',
        icon: Anchor,
        options: { includeVolume: true, includeBoQ: true, includeSupports: true, includeWeights: false, includePhotos: false }
    },
    full: {
        name: 'Raport Complet',
        desc: 'Totul inclus: greutăți, fotografii și suporturi',
        icon: Layers,
        options: { includeVolume: true, includeBoQ: true, includeSupports: true, includeWeights: true, includePhotos: true }
    },
    custom: {
        name: 'Personalizat',
        desc: 'Configurare manuală a tuturor opțiunilor',
        icon: Settings,
        options: {}
    }
};

export const PdfWizardModal: React.FC<PdfWizardModalProps> = ({ isOpen, onClose, data }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPreset, setSelectedPreset] = useState<Preset>('basic');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Options State
    const [options, setOptions] = useState<PdfOptions>({
        includeVolume: true,
        includeBoQ: true,
        includeSupports: false,
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
                supportSpacing: 2.0
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleOption = (key: keyof PdfOptions) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] as boolean }));
    };

    const selectPreset = (preset: Preset) => {
        setSelectedPreset(preset);
        if (preset !== 'custom') {
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
            console.log('[DEBUG] Sending PDF data:', pdfData);
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[DEBUG] PDF generation failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error('Generation failed');
            }
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
            setCurrentStep(3); // Go to preview step
        }
    };

    const handleDownload = async () => {
        if (previewUrl) {
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = `Proiect_${data.projectDetails.projectName.replace(/\s+/g, '_')}_Rev${data.projectDetails.revision}.pdf`;
            a.click();
            onClose();
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

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Alege Tipul de Raport</h3>
                            <p className="text-slate-400">Selectează un preset sau personalizează opțiunile</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(Object.keys(presets) as Preset[]).map(preset => {
                                const { name, desc, icon: Icon } = presets[preset];
                                const isSelected = selectedPreset === preset;
                                return (
                                    <button
                                        key={preset}
                                        onClick={() => selectPreset(preset)}
                                        className={`p-6 rounded-2xl border-2 transition-all text-left ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                                                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                isSelected ? 'bg-blue-500/20' : 'bg-slate-700'
                                            }`}>
                                                <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold mb-1 ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                                                    {name}
                                                </h4>
                                                <p className="text-sm text-slate-400">{desc}</p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="mt-4 flex justify-end">
                                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Personalizează Opțiunile</h3>
                            <p className="text-slate-400">Alege ce să includă în raport</p>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.includeVolume ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                    {options.includeVolume && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.includeVolume} onChange={() => toggleOption('includeVolume')} />
                                <div>
                                    <span className="text-sm font-medium text-slate-200">Sumar & Volum</span>
                                    <p className="text-xs text-slate-500">Calcul volum total și specificații fluide</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.includeBoQ ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                    {options.includeBoQ && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.includeBoQ} onChange={() => toggleOption('includeBoQ')} />
                                <div>
                                    <span className="text-sm font-medium text-slate-200">Lista Cantități (BoQ)</span>
                                    <p className="text-xs text-slate-500">Materiale și echipamente necesare</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.includeSupports ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                    {options.includeSupports && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.includeSupports} onChange={() => toggleOption('includeSupports')} />
                                <div>
                                    <span className="text-sm font-medium text-slate-200">Suporți & Prinderi</span>
                                    <p className="text-xs text-slate-500">Calcul și specificații suporturi</p>
                                </div>
                            </label>

                            {options.includeSupports && (
                                <div className="ml-8 p-3 rounded-lg bg-slate-900/50 border border-slate-600">
                                    <span className="text-xs text-slate-400 mr-2">Distanță calcul:</span>
                                    <select
                                        value={options.supportSpacing}
                                        onChange={(e) => setOptions(prev => ({ ...prev, supportSpacing: parseFloat(e.target.value) }))}
                                        className="bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1"
                                    >
                                        <option value="1.5">1.5m</option>
                                        <option value="2.0">2.0m</option>
                                        <option value="2.5">2.5m</option>
                                    </select>
                                </div>
                            )}

                            <label className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.includeWeights ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                    {options.includeWeights && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.includeWeights} onChange={() => toggleOption('includeWeights')} />
                                <div>
                                    <span className="text-sm font-medium text-slate-200">Tabel Greutăți</span>
                                    <p className="text-xs text-slate-500">Sarcini statice echipamente</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.includePhotos ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                    {options.includePhotos && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.includePhotos} onChange={() => toggleOption('includePhotos')} />
                                <div>
                                    <span className="text-sm font-medium text-slate-200">Documentație FOTO</span>
                                    <p className="text-xs text-slate-500">Anexă cu imagini echipamente</p>
                                </div>
                            </label>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Previzualizare Raport</h3>
                            <p className="text-slate-400">Verifică conținutul înainte de descărcare</p>
                        </div>
                        {previewUrl ? (
                            <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                                <iframe src={previewUrl} className="w-full h-[600px] bg-white" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Eye className="w-16 h-16 text-slate-600 mb-4" />
                                <p className="text-slate-500">Previzualizarea nu este încă generată</p>
                                <button
                                    onClick={handlePreview}
                                    disabled={isGenerating}
                                    className="mt-4 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                                >
                                    {isGenerating ? <span className="animate-spin text-xl">•</span> : <Eye className="w-4 h-4" />}
                                    Generează Previzualizare
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Descarcă Raportul</h3>
                            <p className="text-slate-400">Raportul este gata pentru descărcare</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-8 text-center">
                            <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-white mb-2">Raport PDF Generat</h4>
                            <p className="text-slate-400 mb-6">
                                Proiect: {data.projectDetails.projectName}<br />
                                Revizia: {data.projectDetails.revision}
                            </p>
                            <button
                                onClick={handleDownload}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 mx-auto"
                            >
                                <Download className="w-5 h-5" />
                                Descarcă PDF
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-slate-900 border border-slate-700 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            Generator Raport PDF Avansat
                        </h3>
                        <p className="text-slate-400 text-sm">Pas {currentStep} din 4</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map(step => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    step <= currentStep ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-500'
                                }`}>
                                    {step}
                                </div>
                                {step < 4 && (
                                    <div className={`w-12 h-1 mx-2 rounded ${
                                        step < currentStep ? 'bg-blue-500' : 'bg-slate-700'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>Alege Preset</span>
                        <span>Personalizează</span>
                        <span>Previzualizează</span>
                        <span>Descarcă</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex justify-between items-center shrink-0">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Înapoi
                    </button>

                    <div className="flex gap-3">
                        {currentStep === 3 && !previewUrl && (
                            <button
                                onClick={handlePreview}
                                disabled={isGenerating}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                            >
                                {isGenerating ? <span className="animate-spin text-xl">•</span> : <Eye className="w-4 h-4" />}
                                Generează Previzualizare
                            </button>
                        )}
                        {currentStep === 4 && (
                            <button
                                onClick={handleDownload}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Descarcă PDF
                            </button>
                        )}
                        {currentStep < 4 && (
                            <button
                                onClick={nextStep}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                            >
                                Continuă
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};