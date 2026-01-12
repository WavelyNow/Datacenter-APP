'use client';

import { supabase } from '@/lib/supabase';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FileUp, Box, Layers, Filter, Maximize2, RotateCcw, Save, Trash2, FileText, Settings, AlertTriangle, ArrowRight, Database, Upload, FileBox, Loader2, Check, MousePointer2 } from 'lucide-react';
import { HelpBeacon } from './help/HelpBeacon';
import { useProject } from '@/context/ProjectContext';
import { IfcViewer } from './bim/IfcViewer'; // Reusing existing viewer
import { IfcService } from '@/lib/bim/IfcService';
import { PipeSegment, EquipmentItem } from '@/lib/types';
import { BimMappingWizard } from './bim/BimMappingWizard';
import { BimObjectEditor } from './bim/BimObjectEditor';

export const BimPage = () => {
    const { addSegments, setEquipmentList, ifcModelUrl, setIfcModelUrl, saveToCloud } = useProject();
    const [selectedObject, setSelectedObject] = useState<any | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'3d' | 'table'>('3d');
    const [showInstructions, setShowInstructions] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'extracted' | 'error'>('idle');
    const [foundPipes, setFoundPipes] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'All' | 'Pipe' | 'Fitting' | 'Equipment'>('All');

    // Filter Logic
    const filteredPipes = useMemo(() => {
        if (activeTab === 'All') return foundPipes;
        if (activeTab === 'Pipe') return foundPipes.filter(p => p.type === 'Pipe');
        if (activeTab === 'Fitting') return foundPipes.filter(p => ['Elbow', 'Tee', 'Reducer', 'Cap', 'Fitting'].includes(p.type));
        if (activeTab === 'Equipment') return foundPipes.filter(p => ['Pump', 'Valve', 'Equipment'].includes(p.type));
        return foundPipes;
    }, [foundPipes, activeTab]);

    // Debug log to ensure state is updating
    console.log('BimPage Render:', { status, found: foundPipes.length, tab: activeTab });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load from Cloud if available
    React.useEffect(() => {
        if (ifcModelUrl && !fileUrl) {
            setFileUrl(ifcModelUrl);
        }
    }, [ifcModelUrl, fileUrl]);


    const uploadToSupabase = async (fileToUpload: File) => {
        try {
            // Supabase Free Tier Limit Check (50MB)
            const MAX_SIZE_MB = 50;
            if (fileToUpload.size > MAX_SIZE_MB * 1024 * 1024) {
                console.warn("File too large for cloud sync (Supabase Free Tier limit)");
                return 'too_large';
            }

            setStatus('uploading');
            const fileExt = fileToUpload.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('bim-files')
                .upload(filePath, fileToUpload);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('bim-files')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            console.error('Upload failed:', error);
            throw new Error(error.message || 'Failed to upload to cloud');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setFoundPipes([]);

            // Immediate local preview
            const localUrl = URL.createObjectURL(selectedFile);
            setFileUrl(localUrl);

            try {
                // Upload to Supabase for persistence
                const publicUrl = await uploadToSupabase(selectedFile);

                if (publicUrl === 'too_large') {
                    setErrorMessage("File exceeds 50MB cloud limit. Loaded locally only - will not be synced.");
                    setStatus('idle');
                    // Don't set IfcModelUrl for cloud, just keep localUrl
                } else if (publicUrl) {
                    setIfcModelUrl(publicUrl);
                    // Auto-save project to persist the URL
                    await saveToCloud();
                    setStatus('idle');
                }
            } catch (err: any) {
                console.error("Cloud upload failed, continuing locally:", err);
                setErrorMessage("Cloud upload failed, but you can still view locally. " + err.message);
                setStatus('idle');
            }
        }
    };

    const handleParse = async () => {
        setStatus('parsing');
        try {
            let buffer: ArrayBuffer;

            if (file) {
                buffer = await file.arrayBuffer();
            } else if (ifcModelUrl) {
                // Fetch from URL if no local file (e.g. page reload)
                const response = await fetch(ifcModelUrl);
                buffer = await response.arrayBuffer();
            } else {
                return;
            }

            const service = new IfcService();

            await service.init();
            await service.loadFile(new Uint8Array(buffer));

            // Extract all types of objects
            console.log('Starting extraction...');
            const objects = await service.extractBimObjects();
            console.log('Extraction complete. Items found:', objects.length);

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
        // 1. Process Pipes
        const pipes = foundPipes.filter(p => p.type === 'Pipe');
        if (pipes.length > 0) {
            const mappedPipes: PipeSegment[] = pipes.map(p => ({
                id: crypto.randomUUID(),
                name: p.name || 'Imported Pipe',
                // Use the material set by the Editor, or default to Steel
                material: (p.material as any) || 'Steel - Carbon',
                fluid: 'water',
                temperature: 15,
                flowRate: 0,
                length: 5, // Ideally use p.length from IFC if available
                diameter: 114.3, // Ideally use p.diameter
                standard: 'EN 10255',
                size: 'DN100', // Placeholder
                fittings: []
            }));
            addSegments(mappedPipes);
        }

        // 2. Process Components (Valves, Fittings, Pumps)
        const components = foundPipes.filter(p => ['Valve', 'Pump', 'Fitting', 'Elbow', 'Tee', 'Reducer', 'Cap'].includes(p.type));
        if (components.length > 0) {
            const mappedEquipment: EquipmentItem[] = components.map(c => ({
                id: crypto.randomUUID(),
                name: c.name || `${c.type} (BIM)`,
                type: c.type,
                manufacturer: 'Generic BIM',
                model: 'Standard',
                power: 0,
                weight: c.type === 'Valve' ? 15 : 2, // Estimated weights
                volume: c.type === 'Valve' ? 5 : 0.5, // Estimated volume (Liters) for Glycol Calc
                dimensions: { length: 0, width: 0, height: 0 },
                price: 0,
                // Store original BIM ID
                notes: `Imported from BIM (GlobalId: ${c.globalId})`
            }));

            // Add to equipment list
            setEquipmentList(prev => [...prev, ...mappedEquipment]);
        }

        alert(`Imported ${pipes.length} pipes and ${components.length} components (valves, fittings) to the project.\n\nGlycol volume will now be calculated automatically based on these items.`);
    };

    const handleExportBOM = () => {
        if (foundPipes.length === 0) {
            alert("No data to export. Please load an IFC file first.");
            return;
        }

        // Create CSV Header
        const headers = ["Global ID", "Name", "Type", "System", "Connected To"];

        // Map data to CSV rows
        const rows = foundPipes.map(obj => [
            obj.globalId,
            `"${obj.name}"`, // Escape quotes
            obj.type,
            obj.system,
            obj.connectedTo.length > 0 ? "Yes" : "No"
        ]);

        // Combine header and rows
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        // Create Blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bim_bom_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start shrink-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <FileBox className="w-6 h-6 text-indigo-500" />
                        BIM Model Viewer
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Visualize IFC models, inspect pumps/valves, and import engineering data.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="btn btn-ghost border border-border gap-2"
                    >
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        {showInstructions ? 'Hide Guide' : 'Export Guide'}
                    </button>

                    {foundPipes.length > 0 && (
                        <button
                            onClick={handleExportBOM}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <FileText className="w-4 h-4" />
                            Export BOM
                        </button>
                    )}

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
                            // Empty State / Upload
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-muted/5 rounded-2xl border-2 border-dashed border-border relative">
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
                        <div className="h-[400px] bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-lg animate-in slide-in-from-bottom-10">
                            {/* Tabs Header */}
                            <div className="px-4 py-2 border-b border-border bg-muted/30 flex justify-between items-center">
                                <div className="flex gap-2">
                                    {(['All', 'Pipe', 'Fitting', 'Equipment'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === tab
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'hover:bg-muted text-muted-foreground'}`}
                                        >
                                            {tab === 'All' ? 'All Objects' : tab + 's'}
                                        </button>
                                    ))}
                                </div>
                                <span className="text-xs font-mono bg-background border border-border px-2 py-1 rounded">
                                    Count: {filteredPipes.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-sm text-left relative">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 backdrop-blur z-10">
                                        <tr>
                                            <th className="px-4 py-3 font-medium w-[100px]">Type</th>
                                            <th className="px-4 py-3 font-medium">Name</th>

                                            {/* Dynamic Columns based on Tab */}
                                            {activeTab === 'Pipe' && (
                                                <>
                                                    <th className="px-4 py-3 font-medium">Diameter</th>
                                                    <th className="px-4 py-3 font-medium">Length (m)</th>
                                                    <th className="px-4 py-3 font-medium">Material</th>
                                                </>
                                            )}
                                            {activeTab === 'Fitting' && (
                                                <th className="px-4 py-3 font-medium">Size</th>
                                            )}

                                            <th className="px-4 py-3 font-medium">System</th>
                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredPipes.map((obj, i) => (
                                            <tr key={obj.id} className="hover:bg-muted/50 transition-colors group">
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${obj.type === 'Pipe' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                                        obj.type === 'Pump' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                                            obj.type === 'Valve' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                                ['Elbow', 'Tee', 'Reducer', 'Cap', 'Fitting'].includes(obj.type) ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                                                                    'bg-slate-500/10 text-slate-600 border-slate-500/20'
                                                        }`}>
                                                        {obj.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 font-medium max-w-[200px] truncate" title={obj.name}>
                                                    {obj.name}
                                                </td>

                                                {/* Pipe Specific Columns */}
                                                {activeTab === 'Pipe' && (
                                                    <>
                                                        <td className="px-4 py-2 font-mono text-xs">{obj.diameter || '-'}</td>
                                                        <td className="px-4 py-2 font-mono text-xs">{obj.length ? obj.length.toFixed(2) : '-'}</td>
                                                        <td className="px-4 py-2 text-xs text-muted-foreground">{obj.material || 'Generic'}</td>
                                                    </>
                                                )}
                                                {/* Fitting Columns */}
                                                {activeTab === 'Fitting' && (
                                                    <td className="px-4 py-2 font-mono text-xs">{obj.diameter || '-'}</td>
                                                )}

                                                <td className="px-4 py-2 font-mono text-xs text-muted-foreground max-w-[150px] truncate">{obj.system || '-'}</td>

                                                <td className="px-4 py-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="text-xs text-indigo-500 hover:underline font-bold"
                                                        onClick={() => {
                                                            setSelectedObject(obj);
                                                            setIsEditorOpen(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredPipes.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                                                    No {activeTab.toLowerCase()} objects found in this view.
                                                </td>
                                            </tr>
                                        )}
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
                    const mappedItem: EquipmentItem = {
                        id: data.mappedProduct.id,
                        name: `${data.name} (${data.mappedProduct.model})`,
                        type: 'Pump',
                        manufacturer: data.mappedProduct.manufacturer,
                        model: data.mappedProduct.model,
                        power: data.mappedProduct.power,
                        weight: data.mappedProduct.weight || 100,
                        dimensions: { length: 0, width: 0, height: 0 },
                        price: data.mappedProduct.price || 0,
                        proofImage: data.mappedProduct.imageUrl,
                        // Custom fields
                        flowRate: data.flowRate,
                        head: data.headPressure,
                        volume: 10 // default
                    };

                    setEquipmentList(prev => [...prev, mappedItem]);
                    setIsWizardOpen(false);
                    alert(`Successfully imported and mapped: ${mappedItem.name}`);
                }}
            />

            <BimObjectEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                bimObject={selectedObject}
                onSave={(updates) => {
                    if (updates.applyToAll) {
                        // Batch Update
                        setFoundPipes(prev => prev.map(item => {
                            if (item.type === selectedObject.type && item.system === selectedObject.system) {
                                return { ...item, name: updates.name, material: updates.material };
                            }
                            return item;
                        }));
                        alert(`Updated all ${selectedObject.type}s in system ${selectedObject.system}`);
                    } else {
                        // Single Update
                        setFoundPipes(prev => prev.map(item => {
                            if (item.id === selectedObject.id) {
                                return { ...item, name: updates.name, material: updates.material };
                            }
                            return item;
                        }));
                    }
                    setIsEditorOpen(false);
                }}
            />
        </div>
    );
};
