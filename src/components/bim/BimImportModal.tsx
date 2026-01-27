
'use client';


import dynamic from 'next/dynamic';
import React, { useState, useRef } from 'react';
import { AlertTriangle, Upload, FileBox, Loader2, Check, X, ArrowRight } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { useTranslation } from '@/context/PreferencesContext';
const IfcViewer = dynamic(() => import('./IfcViewer').then(mod => mod.IfcViewer), {
    ssr: false,
    loading: () => <div className="h-40 flex items-center justify-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading Preview...</div>
});
import { IfcService } from '@/lib/bim/IfcService';
import { PipeSegment } from '@/lib/types';
import { BimObject } from '@/lib/bim/types';

interface BimImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BimImportModal: React.FC<BimImportModalProps> = ({ isOpen, onClose }) => {
    const { addSegments } = useProject();
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'extracted' | 'error'>('idle');
    const [foundPipes, setFoundPipes] = useState<PipeSegment[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setFileUrl(URL.createObjectURL(selectedFile));
            setStatus('idle');
            setFoundPipes([]);
        }
    };

    const handleParse = async () => {
        if (!file) return;

        setStatus('parsing');
        try {
            const buffer = await file.arrayBuffer();
            const service = new IfcService();

            await service.init();
            // Use processIfcBuffer which handles both loading and extraction
            const bimObjects = await service.processIfcBuffer(buffer) as BimObject[];

            const pipes: PipeSegment[] = bimObjects
                .filter(obj => obj.type?.toLowerCase().includes('pipe') || obj.ifcType === 3758099475) // IfcPipeSegment
                .map(obj => ({
                    id: `bim-${obj.id}`,
                    name: obj.name || 'BIM Pipe',
                    material: 'custom' as const,
                    standard: 'BIM Import',
                    size: String(obj.diameter) || 'Unknown',
                    length: obj.length || 1,
                    customInnerDiameter: undefined, // Or handle as needed
                }));

            setFoundPipes(pipes);
            setStatus('extracted');
            service.dispose();

        } catch (err: unknown) {
            console.error(err);
            setStatus('error');
            const msg = err instanceof Error ? err.message : 'Failed to parse IFC file';
            setErrorMessage(msg);
        }
    };

    const handleImport = () => {
        if (foundPipes.length > 0) {
            addSegments(foundPipes);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-border">

                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <FileBox className="w-6 h-6 text-primary" />
                            {t('bim.title')}
                        </h2>
                        <p className="text-muted-foreground">{t('bim.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

                    {/* Left Panel: Upload & Data */}
                    <div className="w-full lg:w-1/3 p-6 border-r border-border overflow-y-auto bg-muted/5 space-y-6">

                        {/* 1. Select File */}
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 cursor-pointer'}`}
                            onClick={() => !file && fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept=".ifc"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {file ? (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto">
                                        <FileBox className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold text-sm truncate px-4">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); setFileUrl(null); setStatus('idle'); }}
                                        className="text-xs text-destructive hover:underline mt-2"
                                    >
                                        {t('bim.remove')}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold text-sm">{t('bim.uploadTitle')}</p>
                                    <p className="text-xs text-muted-foreground">{t('bim.uploadSubtitle')}</p>
                                </div>
                            )}
                        </div>

                        {/* 2. Action Button */}
                        {file && status === 'idle' && (
                            <button onClick={handleParse} className="w-full btn btn-primary py-6 text-lg shadow-lg shadow-primary/20">
                                {t('bim.analyze')} <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        )}

                        {status === 'parsing' && (
                            <div className="flex flex-col items-center justify-center py-8 opacity-70">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                                <p className="text-sm font-medium">{t('bim.parsing')}</p>
                                <p className="text-xs text-muted-foreground">{t('bim.parsingDesc')}</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                <p className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {t('bim.error')}</p>
                                {errorMessage}
                            </div>
                        )}

                        {/* 3. Results */}
                        {status === 'extracted' && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary">
                                    <p className="font-bold text-lg flex items-center gap-2">
                                        <Check className="w-5 h-5" /> {t('bim.successTitle')}
                                    </p>
                                    <p className="text-sm">{t('bim.successDesc').replace('{count}', String(foundPipes.length))}</p>
                                </div>

                                <div className="bg-background rounded-lg border border-border overflow-hidden">
                                    <div className="bg-muted px-3 py-2 text-xs font-bold uppercase text-muted-foreground border-b border-border flex justify-between">
                                        <span>{t('bim.preview')}</span>
                                        <span>{t('bim.previewCols')}</span>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto divide-y divide-border/50">
                                        {foundPipes.map((pipe, i) => (
                                            <div key={i} className="px-3 py-2 text-xs flex justify-between hover:bg-muted/50">
                                                <span>{pipe.material !== 'custom' ? pipe.material : 'Custom'}</span>
                                                <span className="font-mono text-primary">{pipe.size} / {pipe.length.toFixed(1)}m</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Panel: 3D Preview */}
                    <div className="w-full lg:w-2/3 bg-zinc-950 flex flex-col relative">
                        {fileUrl ? (
                            <IfcViewer fileUrl={fileUrl} />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 space-y-4">
                                <FileBox className="w-24 h-24 opacity-20" />
                                <p>{t('bim.noModel')}</p>
                            </div>
                        )}

                        {/* Footer Action */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-900/80 backdrop-blur border-t border-zinc-800 flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                {t('bim.cancel')}
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={status !== 'extracted' || foundPipes.length === 0}
                                className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {t('bim.importBtn').replace('{count}', String(foundPipes.length))}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
