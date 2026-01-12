
'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileBox, Loader2, Check, AlertTriangle, ArrowRight, MousePointer2, Layers } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { IfcViewer } from './bim/IfcViewer'; // Reusing existing viewer
import { IfcService } from '@/lib/bim/IfcService';
import { PipeSegment } from '@/lib/types';

export const BimPage = () => {
    const { addSegments } = useProject();
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'extracted' | 'error'>('idle');
    const [foundPipes, setFoundPipes] = useState<PipeSegment[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

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
            await service.loadFile(new Uint8Array(buffer));

            // In the future, we can extract more types (Pumps, Valves) here
            const pipes = await service.extractPipes();

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
            // Optionally show success toast
            alert(`Imported ${foundPipes.length} pipe segments to your configuration.`);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">BIM Viewer & Import</h1>
                    <p className="text-muted-foreground mt-1">
                        Visualize IFC models and extract engineering data for calculations.
                    </p>
                </div>

                {status === 'extracted' && (
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 text-sm font-bold flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Ready to Import
                        </div>
                        <button
                            onClick={handleImport}
                            className="btn btn-primary shadow-lg shadow-primary/20 gap-2"
                        >
                            <Layers className="w-4 h-4" />
                            Import {foundPipes.length} Objects
                        </button>
                    </div>
                )}
            </div>

            {/* Main Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

                {/* Left Sidebar: Controls & Data */}
                <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-4 flex flex-col gap-6 overflow-y-auto">

                    {/* Upload Card */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative overflow-hidden group ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                    >
                        <input
                            type="file"
                            accept=".ifc"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <div className="relative z-10 transition-transform group-hover:scale-105">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${file ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <FileBox className="w-6 h-6" />
                            </div>
                            {file ? (
                                <div>
                                    <p className="font-bold text-sm truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <p className="text-xs text-primary mt-2">Click to replace</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-bold text-sm">Upload IFC File</p>
                                    <p className="text-xs text-muted-foreground mt-1">Revit, ArchiCAD, Tekla</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analysis Control */}
                    {file && status === 'idle' && (
                        <button
                            onClick={handleParse}
                            className="btn btn-primary w-full py-4 text-sm font-bold shadow-lg shadow-primary/10"
                        >
                            Analyze Geometry <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    )}

                    {status === 'parsing' && (
                        <div className="flex flex-col items-center justify-center py-8 opacity-70 border border-border rounded-xl bg-muted/20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                            <p className="text-sm font-medium">Processing Model...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                            <p className="font-bold flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4" /> Error
                            </p>
                            {errorMessage}
                        </div>
                    )}

                    {/* Extracted Data List */}
                    {status === 'extracted' && (
                        <div className="flex-1 flex flex-col min-h-0 border border-border rounded-xl bg-background overflow-hidden">
                            <div className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center">
                                <span className="text-xs font-bold uppercase text-muted-foreground">Found Objects</span>
                                <span className="bg-primary/10 text-primary text-xs font-mono px-2 py-0.5 rounded">{foundPipes.length}</span>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-1">
                                {foundPipes.map((pipe, i) => (
                                    <div key={i} className="px-3 py-2 text-xs rounded hover:bg-muted transition-colors flex justify-between items-center border border-transparent hover:border-border">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="font-medium text-foreground">{pipe.material}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-primary font-bold">{pipe.size}</p>
                                            <p className="text-muted-foreground">{pipe.length.toFixed(1)}m</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Information / Instructions */}
                    <div className="mt-auto bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                        <h4 className="font-bold text-blue-500 text-xs uppercase mb-2 flex items-center gap-2">
                            <MousePointer2 className="w-3 h-3" /> Hints
                        </h4>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Left Click + Drag to Rotate</li>
                            <li>Right Click + Drag to Pan</li>
                            <li>Scroll to Zoom</li>
                            <li>Double Click to Reset View</li>
                        </ul>
                    </div>
                </div>

                {/* Main Content: 3D Viewer */}
                <div className="lg:col-span-3 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative flex flex-col">
                    {fileUrl ? (
                        <>
                            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 flex items-center gap-2">
                                <Layers className="w-3 h-3 text-primary" />
                                {file?.name}
                            </div>
                            <div className="flex-1 w-full h-full">
                                {/* We reuse IfcViewer but ensure it fits the container */}
                                {/* Note: IfcViewer has fixed height in previous implementation, we should probably make it responsive or use styling here */}
                                {/* I'll check IfcViewer implementation details. It has w-full h-[500px]. I should likely modify it to h-full for this page. */}
                                {/* For now, I'll style the container to force override or edit IfcViewer to accept className/style? */}
                                {/* I'll wrap it in a div that might strictly control it, but updating IfcViewer to take 'className' is cleaner. */}
                                {/* Actually, standard IfcViewer had `h-[500px]`, effectively hardcoded. I should modify IfcViewer to be flexible first. */}
                                <IfcViewer fileUrl={fileUrl} />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 p-12">
                            <div className="w-24 h-24 rounded-3xl bg-zinc-900 flex items-center justify-center mb-6 shadow-inner border border-zinc-800">
                                <FileBox className="w-10 h-10 opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-500">No Model Loaded</h3>
                            <p className="text-zinc-600 max-w-sm text-center mt-2">
                                Upload an industry standard .IFC file from the left panel to verify your installation in 3D.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
