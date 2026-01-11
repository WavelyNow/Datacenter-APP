'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import Image from 'next/image';
import {
    Layout, GripVertical, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight,
    Upload, Trash2, RefreshCw, ChevronUp, ChevronDown,
    Image as ImageIcon, Loader2, RefreshCcw
} from 'lucide-react';
import { PDFSection, PDFSectionId, PDFAlignment } from '@/lib/types';
import { PdfData, PdfOptions } from '@/lib/pdf/types';

const DEFAULT_SECTIONS: PDFSection[] = [
    { id: 'header', label: 'Header & Logo', enabled: true, alignment: 'center', order: 0 },
    { id: 'volume', label: 'Volume Summary', enabled: true, alignment: 'left', order: 1 },
    { id: 'boq', label: 'Bill of Quantities', enabled: true, alignment: 'left', order: 2 },
    { id: 'weights', label: 'Weight Report', enabled: true, alignment: 'left', order: 3 },
    { id: 'supports', label: 'Support Analysis', enabled: true, alignment: 'left', order: 4 },
    { id: 'photos', label: 'Photo Annex', enabled: true, alignment: 'center', order: 5 },
];

export const BrandingManager: React.FC = () => {
    const {
        projectDetails, setProjectDetails,
        segments, equipmentList, fluidType, glycolPercentage,
        safetyMargin, safetyMarginPercentage, supportConfig, branding
    } = useProject();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sections, setSections] = useState<PDFSection[]>(DEFAULT_SECTIONS);
    const [showPageNumbers, setShowPageNumbers] = useState(true);
    const [compactMode, setCompactMode] = useState(false);

    // PDF Preview State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    const enabledSections = sortedSections.filter(s => s.enabled);

    // Generate PDF Options from sections
    const buildPdfOptions = useCallback((): PdfOptions => {
        const opts: PdfOptions = {
            includeVolume: enabledSections.some(s => s.id === 'volume'),
            includeBoQ: enabledSections.some(s => s.id === 'boq'),
            includeWeights: enabledSections.some(s => s.id === 'weights'),
            includeSupports: enabledSections.some(s => s.id === 'supports'),
            includePhotos: enabledSections.some(s => s.id === 'photos'),
            supportSpacing: supportConfig.spacing,
        };
        return opts;
    }, [enabledSections, supportConfig.spacing]);

    // Generate PDF Preview
    const generatePreview = useCallback(async () => {
        setIsGenerating(true);
        try {
            const pdfData: PdfData = {
                projectDetails,
                segments,
                equipmentList,
                fluidType,
                glycolPercentage,
                safetyMargin,
                safetyMarginPercentage,
                supportConfig,
                branding,
                options: buildPdfOptions()
            };

            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfData)
            });

            if (!response.ok) throw new Error('Generation failed');
            const blob = await response.blob();

            if (previewUrl) URL.revokeObjectURL(previewUrl);
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        } catch (error) {
            console.error('PDF Preview Error:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [projectDetails, segments, equipmentList, fluidType, glycolPercentage, safetyMargin, safetyMarginPercentage, supportConfig, branding, buildPdfOptions, previewUrl]);

    // Generate on mount
    useEffect(() => {
        generatePreview();
        // Cleanup
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleSection = (id: PDFSectionId) => {
        setSections(prev => prev.map(s =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
        ));
    };

    const setAlignment = (id: PDFSectionId, alignment: PDFAlignment) => {
        setSections(prev => prev.map(s =>
            s.id === id ? { ...s, alignment } : s
        ));
    };

    const moveSection = (id: PDFSectionId, direction: 'up' | 'down') => {
        setSections(prev => {
            const sorted = [...prev].sort((a, b) => a.order - b.order);
            const index = sorted.findIndex(s => s.id === id);
            if (index === -1) return prev;
            if (direction === 'up' && index === 0) return prev;
            if (direction === 'down' && index === sorted.length - 1) return prev;

            const swapIndex = direction === 'up' ? index - 1 : index + 1;
            return sorted.map((s, i) => {
                if (i === index) return { ...s, order: sorted[swapIndex].order };
                if (i === swapIndex) return { ...s, order: sorted[index].order };
                return s;
            });
        });
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setProjectDetails({ ...projectDetails, companyLogo: result });
        };
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => fileInputRef.current?.click();
    const removeLogo = () => setProjectDetails({ ...projectDetails, companyLogo: undefined });

    return (
        <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Layout className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">PDF Layout Designer</h2>
                        <p className="text-sm text-muted-foreground">Customize your PDF report with live preview</p>
                    </div>
                </div>
                <button
                    onClick={generatePreview}
                    disabled={isGenerating}
                    className="btn btn-primary btn-md"
                >
                    {isGenerating ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
                    ) : (
                        <><RefreshCcw className="w-4 h-4 mr-2" /> Refresh Preview</>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Section Manager */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Logo Upload */}
                    <div className="bg-muted/20 p-3 rounded-xl border border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Logo</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" ref={fileInputRef} />
                        {projectDetails.companyLogo ? (
                            <div className="flex items-center gap-1">
                                <div className="w-8 h-8 rounded border border-border overflow-hidden bg-card">
                                    <Image src={projectDetails.companyLogo} alt="Logo" width={32} height={32} className="object-contain w-full h-full" unoptimized />
                                </div>
                                <button onClick={triggerFileInput} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><RefreshCw className="w-3.5 h-3.5" /></button>
                                <button onClick={removeLogo} className="p-1.5 rounded hover:bg-destructive/20 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        ) : (
                            <button onClick={triggerFileInput} className="text-xs text-primary hover:underline">Upload</button>
                        )}
                    </div>

                    {/* Section List */}
                    <div className="space-y-1.5">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Sections</h3>
                        {sortedSections.map((section, idx) => (
                            <div
                                key={section.id}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${section.enabled ? 'bg-card border-border' : 'bg-muted/10 border-transparent opacity-40'
                                    }`}
                            >
                                <GripVertical className="w-3 h-3 text-muted-foreground/30" />
                                <button onClick={() => toggleSection(section.id)} className={`p-1 rounded ${section.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <span className={`flex-1 text-xs font-medium ${section.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{section.label}</span>
                                {section.enabled && (
                                    <div className="flex items-center gap-0.5 bg-muted/20 rounded p-0.5">
                                        {(['left', 'center', 'right'] as PDFAlignment[]).map(align => (
                                            <button
                                                key={align}
                                                onClick={() => setAlignment(section.id, align)}
                                                className={`p-1 rounded ${section.alignment === align ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                                            >
                                                {align === 'left' && <AlignLeft className="w-3 h-3" />}
                                                {align === 'center' && <AlignCenter className="w-3 h-3" />}
                                                {align === 'right' && <AlignRight className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-0.5">
                                    <button onClick={() => moveSection(section.id, 'up')} disabled={idx === 0} className="p-0.5 text-muted-foreground disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => moveSection(section.id, 'down')} disabled={idx === sortedSections.length - 1} className="p-0.5 text-muted-foreground disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Options */}
                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
                            <input type="checkbox" checked={showPageNumbers} onChange={(e) => setShowPageNumbers(e.target.checked)} className="w-3.5 h-3.5 rounded" />
                            Page #
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
                            <input type="checkbox" checked={compactMode} onChange={(e) => setCompactMode(e.target.checked)} className="w-3.5 h-3.5 rounded" />
                            Compact
                        </label>
                    </div>
                </div>

                {/* Right: Real PDF Preview */}
                <div className="lg:col-span-7">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Live PDF Preview</h3>
                    <div className="bg-muted/20 rounded-xl border border-border overflow-hidden" style={{ height: '600px' }}>
                        {isGenerating ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <span className="text-sm text-muted-foreground">Generating PDF...</span>
                            </div>
                        ) : previewUrl ? (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full"
                                title="PDF Preview"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                <Layout className="w-8 h-8 text-muted-foreground/30" />
                                <span className="text-sm text-muted-foreground">Click &quot;Refresh Preview&quot; to generate</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
