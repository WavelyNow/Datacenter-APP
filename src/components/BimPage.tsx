'use client';

import { supabase } from '@/lib/supabase';

import dynamic from 'next/dynamic';
import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, FileText, AlertTriangle, Upload, FileBox, Loader2, Check } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';

const IfcViewer = dynamic(() => import('./bim/IfcViewer').then(mod => mod.IfcViewer), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">Loading Viewer...</div>
});
import { IfcService } from '@/lib/bim/IfcService';
import { PipeSegment, EquipmentItem } from '@/lib/types';
import { BimMappingWizard } from './bim/BimMappingWizard';
import { RevitSyncPanel } from './bim/RevitSyncPanel';
import { BimObjectEditor } from './bim/BimObjectEditor';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { BimObject, GroupedBimObject } from '@/lib/bim/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

import { useBim } from '@/context/BimContext';

export const BimPage = () => {
    const {
        addSegments, setEquipmentList, ifcModelUrl, setIfcModelUrl, saveToCloud
    } = useProject();
    
    const {
        foundPipes, setFoundPipes,
        bimStatus: status, setBimStatus: setStatus,
        setParsingProgress
    } = useBim();

    const [selectedObject, setSelectedObject] = useState<BimObject | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [bimMode, setBimMode] = useState<'ifc' | 'revit'>('ifc');

    // Local Error State
    const [activeTab, setActiveTab] = useState<'All' | 'Pipe' | 'Fitting' | 'Equipment'>('All');
    const [isGrouped, setIsGrouped] = useState(true); // Default to grouped view as requested

    // Filter Logic
    const filteredPipes = useMemo(() => {
        let items = foundPipes;
        if (activeTab === 'Pipe') items = foundPipes.filter(p => p.type === 'Pipe');
        else if (activeTab === 'Fitting') items = foundPipes.filter(p => ['Elbow', 'Tee', 'Reducer', 'Cap', 'Fitting'].includes(p.type));
        else if (activeTab === 'Equipment') items = foundPipes.filter(p => ['Pump', 'Valve', 'Equipment'].includes(p.type));

        return items;
    }, [foundPipes, activeTab]);

    // Grouping Logic (Bill of Quantities)
    const groupedPipes = useMemo(() => {
        if (!isGrouped) return [];

        const groups: Record<string, GroupedBimObject> = {};

        filteredPipes.forEach(item => {
            // Create a unique key for grouping
            const key = `${item.type}|${item.diameter || '-'}|${item.system || 'Unassigned'}|${item.material || 'Generic'}`;

            if (!groups[key]) {
                groups[key] = {
                    id: key, // Pseudo ID
                    type: item.type,
                    name: item.type === 'Pipe' ? `Pipe ${item.diameter || 'Unknown'}` : item.name, // Simplified name for group
                    diameter: item.diameter,
                    material: item.material,
                    system: item.system,
                    count: 0,
                    totalLength: 0,
                    items: []
                };
            }

            groups[key].count++;
            groups[key].totalLength += (item.length || 0);
            groups[key].items.push(item);
        });

        return Object.values(groups);
    }, [filteredPipes, isGrouped]);

    // Decide which data to show
    const displayData = isGrouped ? groupedPipes : filteredPipes;

    // Performance: Limit displayed items if we have too many and not searching?
    // For now, let's just use it as is, but memoize the row rendering if needed.
    const [displayLimit, setDisplayLimit] = useState(100);

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
            if (!supabase) {
                throw new Error('Cloud disabled — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars');
            }
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
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Upload failed:', err);
            throw new Error(err.message || 'Failed to upload to cloud');
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

                    setStatus('idle');
                    // Don't set IfcModelUrl for cloud, just keep localUrl
                } else if (publicUrl) {
                    setIfcModelUrl(publicUrl);
                    // Auto-save project to persist the URL
                    await saveToCloud();
                    setStatus('idle');
                }
            } catch (err: unknown) {
                const error = err as Error;
                console.error("Cloud upload failed, continuing locally:", error);

                setStatus('idle');
            }
        }
    };

    const handleParse = async () => {
        setStatus('parsing');
        setParsingProgress(0); // Reset progress

        try {
            let buffer: ArrayBuffer;

            if (file) {
                // Read fresh buffer
                buffer = await file.arrayBuffer();
            } else if (ifcModelUrl) {
                const response = await fetch(ifcModelUrl);
                buffer = await response.arrayBuffer();
            } else {
                return;
            }

            const service = new IfcService();
            await service.init();

            // Non-blocking Worker Execution
            // The buffer is transferred to the worker, so it's efficient.
            console.log('Starting extraction via Worker...');
            const objects = await service.processIfcBuffer(buffer, (msg, percent) => {
                setParsingProgress(percent);
            });

            console.log('Extraction complete. Items found:', objects.length);
            setFoundPipes(objects as BimObject[]);

            setStatus('extracted');
            service.dispose();

        } catch (err: unknown) {
            const error = err as Error;
            console.error("Extraction failed or partial:", error);
            setStatus('extracted');

            setFoundPipes([]);
        }
    };

    const handleImport = () => {
        // 1. Process Pipes
        const pipes = foundPipes.filter(p => p.type === 'Pipe');
        if (pipes.length > 0) {
            const mappedPipes: PipeSegment[] = pipes.map(p => {
                // Try to guess a reasonable outer diameter (OD) based on extracted DN size
                const sizeStr = p.diameter || 'DN100';
                const numSize = parseInt(sizeStr.replace(/\D/g, '')) || 100;

                // Fallback OD mapping for common DN sizes if not found precisely in standard
                const commonODs: Record<number, number> = {
                    15: 21.3, 20: 26.9, 25: 33.7, 32: 42.4, 40: 48.3,
                    50: 60.3, 65: 76.1, 80: 88.9, 100: 114.3, 125: 139.7, 150: 168.3
                };

                return {
                    id: crypto.randomUUID(),
                    name: p.name || 'Imported Pipe',
                    material: (p.material as PipeSegment['material']) || 'Steel - Carbon',
                    fluid: 'water',
                    temperature: 15,
                    flowRate: 0,
                    length: p.length || 1, // Use actual length or 1m fallback
                    diameter: commonODs[numSize] || numSize * 1.1, // Heuristic OD if not in common list
                    standard: 'EN 10255',
                    size: sizeStr,
                    fittings: []
                };
            });
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
                    <h2 data-testid="bim-page-title" className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <FileBox className="w-6 h-6 text-primary" />
                        BIM Model Viewer
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Visualize IFC models, inspect pumps/valves, and import engineering data.
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="bg-muted p-1 rounded-lg flex gap-1 mr-4">
                        <button 
                            onClick={() => setBimMode('ifc')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${bimMode === 'ifc' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            IFC Viewer
                        </button>
                        <button 
                            onClick={() => setBimMode('revit')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${bimMode === 'revit' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Revit Link
                        </button>
                    </div>

                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="btn btn-ghost border border-border gap-2"
                    >
                        <AlertTriangle className="w-4 h-4 text-primary" />
                        {showInstructions ? 'Hide Guide' : 'Export Guide'}
                    </button>

                    {foundPipes.length > 0 && (
                        <button
                            onClick={handleExportBOM}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
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
            {bimMode === 'revit' ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 overflow-y-auto"
                >
                    <RevitSyncPanel />
                </motion.div>
            ) : (
                <div className="flex-1 flex gap-6 min-h-0">
                    {/* ... existing IFC layout ... */}

                {/* LEFT: Viewer & Data */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">

                    {/* 3D Viewer Container */}
                    <div className="flex-1 bg-background rounded-2xl overflow-hidden border border-border shadow-sm relative flex flex-col min-h-[400px]">
                        {!fileUrl ? (
                            // Empty State / Upload
                            <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
                                <EmptyState
                                    icon={Upload}
                                    title="Upload IFC Model"
                                    description="Supports Revit, ArchiCAD, and Tekla exports (.ifc standard). Drag & drop or click to browse."
                                    action={{
                                        label: 'Select File',
                                        onClick: () => fileInputRef.current?.click(),
                                        variant: 'primary'
                                    }}
                                    steps={[
                                        "Export as IFC 2x3 or IFC4",
                                        "Include Property Sets for data",
                                        "Set Detail Level to Medium/High"
                                    ]}
                                    tipsLabel="Export Requirements"
                                    className="max-w-xl w-full"
                                />
                                <input
                                    type="file"
                                    accept=".ifc"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 flex items-center gap-2">
                                    <Layers className="w-3 h-3 text-primary" />
                                    {file?.name}
                                </div>
                                <div className="flex-1 relative">
                                    <ErrorBoundary componentName="3D Viewer">
                                        <IfcViewer fileUrl={fileUrl} className="h-full w-full absolute inset-0" />
                                    </ErrorBoundary>
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
                    {status === 'parsing' && (
                        <div className="h-[400px] bg-card border border-border rounded-xl p-6 shadow-lg">
                            <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing BIM Geometry...
                            </h3>
                            <TableSkeleton rows={8} />
                        </div>
                    )}

                    {(status === 'extracted' || status === 'error' || foundPipes.length > 0) && (
                        <div className="h-[400px] bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-lg animate-in slide-in-from-bottom-10">
                            {/* Tabs Header */}
                            <div className="px-4 py-2 border-b border-border bg-muted/30 flex justify-between items-center">
                                <div className="flex gap-2 items-center">
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
                                    <div className="h-4 w-px bg-border mx-2" />
                                    <button
                                        onClick={() => setIsGrouped(!isGrouped)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${isGrouped
                                            ? 'bg-accent text-accent-foreground border-accent'
                                            : 'bg-background hover:bg-muted text-muted-foreground border-border'}`}
                                    >
                                        {isGrouped ? 'Grouped (BoQ)' : 'Detailed View'}
                                    </button>
                                </div>
                                <span className="text-xs font-mono bg-background border border-border px-2 py-1 rounded">
                                    {isGrouped ? `Groups: ${groupedPipes.length}` : `Count: ${filteredPipes.length}`}
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
                                        {displayData.slice(0, displayLimit).map((obj) => (
                                            <tr key={obj.id} className="hover:bg-muted/50 transition-colors group">
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${obj.type === 'Pipe' ? 'bg-primary/10 text-primary border-primary/20' :
                                                        obj.type === 'Pump' ? 'bg-primary/10 text-primary border-primary/20' :
                                                            obj.type === 'Valve' ? 'bg-primary/10 text-primary border-primary/20' :
                                                                ['Elbow', 'Tee', 'Reducer', 'Cap', 'Fitting'].includes(obj.type) ? 'bg-primary/10 text-primary border-primary/20' :
                                                                    'bg-secondary/10 text-secondary-foreground border-secondary/20'
                                                        }`}>
                                                        {obj.type}
                                                    </span>
                                                    {isGrouped && <span className="ml-2 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded text-muted-foreground">x{(obj as GroupedBimObject).count}</span>}
                                                </td>
                                                <td className="px-4 py-2 font-medium max-w-[200px] truncate" title={obj.name}>
                                                    {isGrouped && obj.type === 'Pipe' ? (
                                                        <span className="font-bold">{obj.diameter || 'Unknown Size'} Pipe</span>
                                                    ) : obj.name}
                                                </td>

                                                {/* Pipe Specific Columns */}
                                                {activeTab === 'Pipe' && (
                                                    <>
                                                        <td className="px-4 py-2 font-mono text-xs">{obj.diameter || '-'}</td>
                                                        <td className="px-4 py-2 font-mono text-xs">
                                                            {isGrouped ? (
                                                                <span className="font-bold text-primary">
                                                                    {obj.type === 'Pipe' ? (obj as GroupedBimObject).totalLength?.toFixed(2) : '-'}
                                                                </span>
                                                            ) : (
                                                                (obj as BimObject).length ? (obj as BimObject).length!.toFixed(2) : '-'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-muted-foreground">{obj.material || 'Generic'}</td>
                                                    </>
                                                )}
                                                {/* Fitting Columns */}
                                                {activeTab === 'Fitting' && (
                                                    <td className="px-4 py-2 font-mono text-xs">{obj.diameter || '-'}</td>
                                                )}

                                                <td className="px-4 py-2 font-mono text-xs text-muted-foreground max-w-[150px] truncate">{obj.system || '-'}</td>

                                                <td className="px-4 py-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!isGrouped && (
                                                        <button
                                                            className="text-xs text-primary hover:underline font-bold"
                                                            onClick={() => {
                                                                setSelectedObject(obj as BimObject);
                                                                setIsEditorOpen(true);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {displayData.length > displayLimit && (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4 bg-muted/20">
                                                    <button
                                                        onClick={() => setDisplayLimit(prev => prev + 200)}
                                                        className="text-xs font-bold text-primary"
                                                    >
                                                        Show More ({displayData.length - displayLimit} remaining)
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
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
                            <FileBox className="w-5 h-5 text-primary" />
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
                                    Ensure <strong>&quot;Export Property Sets&quot;</strong> is CHECKED in your export settings. We need this to read flow rates, diameters, and system types.
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
                                        <Check className="w-3 h-3 text-primary" /> Pipes (IfcFlowSegment)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-primary" /> Fittings (Elbows, Tees)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-primary" /> Mechanical Equipment (Pumps)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-primary" /> Flow Controllers (Valves)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                </div>
            )}

            <BimMappingWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                bimObject={selectedObject}
                onSave={(data) => {
                    if (!data.mappedProduct) {
                        alert('No product was selected for mapping.');
                        return;
                    }
                    const mappedItem: EquipmentItem = {
                        id: data.mappedProduct.id,
                        name: `${data.name} (${data.mappedProduct.model})`,
                        type: 'Pump',
                        manufacturer: data.mappedProduct.manufacturer,
                        model: data.mappedProduct.model,
                        power: Number(data.mappedProduct.power?.replace(/[^0-9.]/g, '') || 0),
                        weight: data.mappedProduct.weight || 100,
                        dimensions: { length: 0, width: 0, height: 0 },
                        price: data.mappedProduct.price || 0,
                        proofImage: data.mappedProduct.imageUrl,
                        // Custom fields
                        flowRate: data.engineeringData.flow,
                        // Wizard head is entered in kPa (per label "Target Head (kPa)").
                        // EquipmentItem.head is defined as METERS of pressure head:
                        // convert: h [m] = ΔP [kPa] / (ρ·g) ≈ kPa / 9.81 for water.
                        head: data.engineeringData.head / 9.81,
                        volume: 10 // default water content supply — confirm with user
                    };

                    setEquipmentList(prev => [...prev, mappedItem]);
                    setIsWizardOpen(false);
                    alert(`Successfully imported and mapped: ${mappedItem.name}`);
                }}
            />

            <BimObjectEditor
                key={selectedObject?.id || 'new'}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                bimObject={selectedObject}
                onSave={(updates: { name: string, material?: string, applyToAll: boolean }) => {
                    if (!selectedObject) return;
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
        </div >
    );
};
