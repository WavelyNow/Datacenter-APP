
'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Check, AlertTriangle, FileBox, Loader2, ArrowRight } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { IfcViewer } from './IfcViewer';
import { IfcService } from '@/lib/bim/IfcService';
import { PipeSegment } from '@/lib/types';

interface BimImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BimImportModal: React.FC<BimImportModalProps> = ({ isOpen, onClose }) => {
    const { addSegments } = useProject();
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
            const bimObjects = await service.processIfcBuffer(buffer);

            // Convert BIM objects to PipeSegments
            const pipes: PipeSegment[] = bimObjects
                .filter((obj: any) => obj.type?.toLowerCase().includes('pipe') || obj.ifcType === 3758099475) // IfcPipeSegment
                .map((obj: any) => ({
                    id: `bim-${obj.id}`,
                    name: obj.name || 'BIM Pipe',
                    material: 'custom' as const,
                    standard: 'BIM Import',
                    size: obj.diameter || 'Unknown',
                    length: obj.length || 1,
                    customInnerDiameter: typeof obj.diameter === 'number' ? obj.diameter : undefined,
                }));

            setFoundPipes(pipes);
            setStatus('extracted');
            service.dispose();

        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMessage(err.message || 'Failed to parse IFC file');
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
                            BIM Import Wizard
                        </h2>
                        <p className="text-muted-foreground">Import pipes directly from Revit/IFC files.</p>
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
                                        className="text-xs text-red-500 hover:underline mt-2"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold text-sm">Click to Upload .IFC</p>
                                    <p className="text-xs text-muted-foreground">Supports Revit Exports</p>
                                </div>
                            )}
                        </div>

                        {/* 2. Action Button */}
                        {file && status === 'idle' && (
                            <button onClick={handleParse} className="w-full btn btn-primary py-6 text-lg shadow-lg shadow-primary/20">
                                Analyse Model <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        )}

                        {status === 'parsing' && (
                            <div className="flex flex-col items-center justify-center py-8 opacity-70">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                                <p className="text-sm font-medium">Parsing Geometry...</p>
                                <p className="text-xs text-muted-foreground">This matches local processing power.</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                                <p className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Error</p>
                                {errorMessage}
                            </div>
                        )}

                        {/* 3. Results */}
                        {status === 'extracted' && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600">
                                    <p className="font-bold text-lg flex items-center gap-2">
                                        <Check className="w-5 h-5" /> Success!
                                    </p>
                                    <p className="text-sm">Found {foundPipes.length} pipe segments.</p>
                                </div>

                                <div className="bg-background rounded-lg border border-border overflow-hidden">
                                    <div className="bg-muted px-3 py-2 text-xs font-bold uppercase text-muted-foreground border-b border-border flex justify-between">
                                        <span>Preview Data</span>
                                        <span>DN / Len</span>
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
                                <p>Load a model to see 3D Preview</p>
                            </div>
                        )}

                        {/* Footer Action */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-900/80 backdrop-blur border-t border-zinc-800 flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={status !== 'extracted' || foundPipes.length === 0}
                                className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Import {foundPipes.length} Segments
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
