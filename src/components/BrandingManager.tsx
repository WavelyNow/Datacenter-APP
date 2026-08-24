'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { useTranslation } from '@/context/PreferencesContext';
import Image from 'next/image';
import {
    Layout, Eye, Trash2, RefreshCw,
    Image as ImageIcon, Loader2, RefreshCcw
} from 'lucide-react';
import { PDFSection, PDFSectionId, PDFAlignment } from '@/lib/types';
import { PdfData, PdfOptions } from '@/lib/pdf/types';
import { validateUploadFile } from '@/lib/validation';
import { DocumentSkeleton } from '@/components/ui/Skeleton';

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
    const { t } = useTranslation();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sections, setSections] = useState<PDFSection[]>(DEFAULT_SECTIONS);

    // PDF Preview State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);
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
            includeEnergy: false,
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

            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
            const url = URL.createObjectURL(blob);
            previewUrlRef.current = url;
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
            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const err = validateUploadFile(file, 2);
        if (err) { alert(err); return; }
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
                        <h2 className="text-xl font-bold text-foreground">{t('branding.title')}</h2>
                        <p className="text-sm text-muted-foreground">{t('branding.subtitle')}</p>
                    </div>
                </div>
                <button
                    onClick={generatePreview}
                    disabled={isGenerating}
                    className="btn btn-primary btn-md"
                >
                    {isGenerating ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t('branding.generating')}</>
                    ) : (
                        <><RefreshCcw className="w-4 h-4 mr-2" /> {t('branding.refresh')}</>
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
                            <span className="text-sm font-medium text-foreground">{t('branding.logo')}</span>
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
                            <button onClick={triggerFileInput} className="text-xs text-primary hover:underline">{t('branding.upload')}</button>
                        )}
                    </div>

                    {/* Raport de comanda — sectiunile sunt fixe (Site → Teava → Comanda → Greutati) */}
                    <div className="space-y-1.5">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Continutul raportului</h3>
                        {['Date site & proiect', 'Cantitate teava', 'Lista de cumparat (glicol + fittinguri)', 'Greutati estimative'].map(label => (
                            <div key={label} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
                                <Eye className="w-3.5 h-3.5 text-primary" />
                                <span className="flex-1 text-xs font-medium text-foreground">{label}</span>
                                <span className="text-[9px] text-muted-foreground">mereu inclus</span>
                            </div>
                        ))}
                        <p className="text-[10px] text-muted-foreground pt-1">
                            Raportul de comanda este fix si minimal — sectiunile nu se pot dezactiva.
                        </p>
                    </div>

                </div>

                {/* Right: Real PDF Preview */}
                <div className="lg:col-span-7">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('branding.livePreview')}</h3>
                    <div className="bg-muted/20 rounded-xl border border-border overflow-hidden" style={{ height: '600px' }}>
                        {isGenerating ? (
                            <div className="w-full h-full bg-white">
                                <DocumentSkeleton />
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
                                <span className="text-sm text-muted-foreground">{t('branding.clickToGenerate')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
