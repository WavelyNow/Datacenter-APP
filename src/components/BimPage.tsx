
'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileBox, Loader2, Check, AlertTriangle, ArrowRight, MousePointer2, Layers } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { IfcViewer } from './bim/IfcViewer'; // Reusing existing viewer
import { IfcService } from '@/lib/bim/IfcService';
import { PipeSegment } from '@/lib/types';

import { BimMappingWizard } from './bim/BimMappingWizard';

export const BimPage = () => {
    const { addSegments } = useProject();
    const [selectedObject, setSelectedObject] = useState<any | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'3d' | 'table'>('3d');
    const [showInstructions, setShowInstructions] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'extracted' | 'error'>('idle');
    const [foundPipes, setFoundPipes] = useState<any[]>([]);
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

            // Extract all types of objects
            const objects = await service.extractBimObjects();

            // For now, we just treat them all as potential segments or generic items
            // In a real scenario, we would map specific types to specific app entities
            // But for the visualization request "show all", we store them.
            // We map them to a generic structure for the table.
            setFoundPipes(objects as any); // Casting for now to reuse state, ideally rename state to 'foundObjects'

            setStatus('extracted');
            service.dispose();

        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMessage(err.message || 'Failed to parse IFC file');
        }
    };

    const handleImport = () => {
        // Filter only pipes for the "Import Pipes" action, or handle others
        const pipes = foundPipes.filter(p => p.type === 'Pipe');

        if (pipes.length > 0) {
            // We need to map our generic object back to PipeSegment structure expected by context
            // The service 'extractPipes' did this mapping. 'extractBimObjects' returns a cleaner generic object.
            // For this specific 'Quick Import' button, we might want to just grab pipes.
            // Let's re-run strictly pipe extraction or map carefully.

            // For V1 of this feature, let's just alert the user or map roughly.
            // Ideally we call 'addSegments' with properly formatted data.
            // We can map on the fly:
            const mappedPipes: PipeSegment[] = pipes.map(p => ({
                id: crypto.randomUUID(),
                name: p.name || 'Imported Pipe',
                fluid: 'water',
                temperature: 15,
                flowRate: 0,
                length: 5, // Default/Mock as per service v1
                diameter: 114.3,
                material: 'Steel',
                roughness: 0.045,
                standard: 'EN 10255',
                size: 'DN100',
                fittings: []
            }));

            addSegments(mappedPipes);
            alert(`Imported ${mappedPipes.length} pipe segments to your configuration.`);
        } else {
            alert('No pipes found to import directly. Use the list below to map equipment.');
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        BIM Viewer & Data
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">BETA</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Visualize IFC models, inspect pumps/valves, and import engineering data.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="btn btn-ghost border border-border gap-2"
                    >
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        {showInstructions ? 'Hide Guide' : 'Export Guide'}
                    </button>

                    {status === 'extracted' && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleImport}
                                className="btn btn-primary shadow-lg shadow-primary/20 gap-2"
                            >
                                <Layers className="w-4 h-4" />
                                Import Pipes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex gap-6 min-h-0">

                {/* LEFT: Viewer & Data */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">

                    {/* 3D Viewer Container */}
                    <div className="flex-1 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative flex flex-col min-h-[400px]">
                        {!fileUrl ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 p-12">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full max-w-md border-2 border-dashed border-zinc-800 hover:border-primary/50 hover:bg-zinc-900/50 rounded-2xl p-12 flex flex-col items-center cursor-pointer transition-all group"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-6 shadow-inner border border-zinc-800 group-hover:scale-110 transition-transform">
                                        <Upload className="w-10 h-10 text-zinc-600 group-hover:text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-400 group-hover:text-white">Upload IFC File</h3>
                                    <p className="text-zinc-600 text-center mt-2 text-sm">
                                        Supports Revit, ArchiCAD, Tekla exports (.ifc)
                                    </p>
                                    <input
                                        type="file"
                                        accept=".ifc"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 flex items-center gap-2">
                                    <Layers className="w-3 h-3 text-primary" />
                                    {file?.name}
                                </div>
                                <div className="flex-1 relative">
                                    <IfcViewer fileUrl={fileUrl} className="h-full w-full absolute inset-0" />
                                </div>

                                {/* Analysis Toolbar (Overlay) */}
                                {status === 'idle' && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                                        <button
                                            onClick={handleParse}
                                            className="btn btn-primary px-8 py-4 rounded-full shadow-2xl shadow-primary/30 animate-in slide-in-from-bottom-4"
                                        >
                                            <Loader2 className="w-5 h-5 mr-2" />
                                            Analyze Model Geometry
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Extracted Data Table */}
                    {status === 'extracted' && (
                        <div className="h-[300px] bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-lg animate-in slide-in-from-bottom-10">
                            <div className="px-4 py-3 border-b border-border bg-muted/50 flex justify-between items-center">
                                <h3 className="font-bold flex items-center gap-2 text-sm">
                                    <MousePointer2 className="w-4 h-4 text-primary" />
                                    Recognized Objects
                                </h3>
                                <div className="flex gap-2">
                                    <span className="text-xs font-mono bg-background border border-border px-2 py-1 rounded">
                                        Total: {foundPipes.length}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 backdrop-blur">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Type</th>
                                            <th className="px-4 py-3 font-medium">Name</th>
                                            <th className="px-4 py-3 font-medium">System</th>
                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {foundPipes.map((obj, i) => (
                                            <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${obj.type === 'Pipe' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                                        obj.type === 'Pump' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                                            'bg-slate-500/10 text-slate-600 border-slate-500/20'
                                                        }`}>
                                                        {obj.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 font-medium">
                                                    {obj.name}
                                                    {obj.connectedTo && obj.connectedTo.length > 0 && (
                                                        <span className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-500/20" title="Connected items">
                                                            Builds Net
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{obj.system || '-'}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <button
                                                        className="text-xs text-primary hover:underline font-bold"
                                                        onClick={() => {
                                                            setSelectedObject(obj);
                                                            setIsWizardOpen(true);
                                                        }}
                                                    >
                                                        Map to Library
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Instructions Panel */}
                {showInstructions && (
                    <div className="w-80 bg-card border border-border rounded-xl p-5 shrink-0 overflow-y-auto hidden xl:block animate-in slide-in-from-right-4">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <FileBox className="w-5 h-5 text-indigo-500" />
                            Revit Export Settings
                        </h3>

                        <div className="space-y-6 text-sm">
                            <div className="space-y-2">
                                <h4 className="font-medium text-foreground">1. Export Format</h4>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    Use <strong>IFC 2x3 Coordination View 2.0</strong>. This is the most compatible format for geometries.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium text-foreground">2. Property Sets</h4>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    Ensure <strong>"Export Property Sets"</strong> is CHECKED in your export settings. We need this to read flow rates, diameters, and system types.
                                </p>
                                <div className="p-2 bg-muted rounded border border-border text-xs font-mono">
                                    Export Revit Property Sets: ☑<br />
                                    Export Base Quantities: ☑
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium text-foreground">3. Level of Detail</h4>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    Set detail level to <strong>Medium</strong> or High. Low detail might export pipes as simple lines instead of cylinders in some versions.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-border mt-4">
                                <h4 className="font-bold mb-2">Supported Entities</h4>
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-green-500" /> Pipes (IfcFlowSegment)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-green-500" /> Fittings (Elbows, Tees)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-green-500" /> Mechanical Equipment (Pumps)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-green-500" /> Flow Controllers (Valves)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <BimMappingWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                bimObject={selectedObject}
                onSave={(data) => {
                    console.log('Saved Mapping:', data);
                    // Here we would add to ProjectContext
                    // addEquipment(data.mappedProduct)...
                    setIsWizardOpen(false);
                    alert(`Successfully mapped ${data.name} to ${data.mappedProduct.manufacturer} ${data.mappedProduct.model}`);
                }}
            />
        </div>
    );
};
