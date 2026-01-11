import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, MapPin, User, Hash, Image as ImageIcon, Settings } from 'lucide-react';
import Image from 'next/image';
import { ProjectDetails } from '@/lib/types';

interface ProjectSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectDetails: ProjectDetails;
    onProjectDetailsChange: (details: ProjectDetails) => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
    isOpen,
    onClose,
    projectDetails,
    onProjectDetailsChange,
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    const updateDetail = (field: keyof ProjectDetails, value: string) => {
        onProjectDetailsChange({ ...projectDetails, [field]: value });
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            updateDetail('companyLogo', result);
        };
        reader.readAsDataURL(file);
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300" onClick={onClose} />

            <div className="relative bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Settings className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Project Settings</h3>
                            <p className="text-[10px] text-muted-foreground">Configure project details and metadata</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Logo Upload Section */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-3 block">Company Branding</label>
                        <div className="flex items-start gap-4">
                            <label className="group relative flex-shrink-0 w-24 h-24 rounded-xl bg-muted/50 border-2 border-dashed border-border hover:border-primary/50 cursor-pointer overflow-hidden transition-all">
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                {projectDetails.companyLogo ? (
                                    <Image
                                        src={projectDetails.companyLogo}
                                        alt="Logo"
                                        fill
                                        className="object-contain p-2"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                            </label>
                            <div className="flex-1 space-y-1">
                                <h4 className="text-sm font-medium text-foreground">Company Logo</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Upload your company logo to be displayed on all generated reports and exports.
                                </p>
                                <p className="text-[10px] text-muted-foreground pt-1">
                                    Recommended: PNG or JPG, square aspect ratio.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Project Number</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={projectDetails.projectNumber}
                                        onChange={(e) => updateDetail('projectNumber', e.target.value)}
                                        className="w-full bg-muted/30 border border-border pl-9 pr-3 py-2 rounded-lg text-sm font-mono text-foreground focus:border-primary/50 focus:bg-background transition-all"
                                        placeholder="0001"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Project Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={projectDetails.projectName}
                                        onChange={(e) => updateDetail('projectName', e.target.value)}
                                        className="w-full bg-muted/30 border border-border px-3 py-2 rounded-lg text-sm text-foreground focus:border-primary/50 focus:bg-background transition-all font-medium"
                                        placeholder="Enter project name..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={projectDetails.location}
                                    onChange={(e) => updateDetail('location', e.target.value)}
                                    className="w-full bg-muted/30 border border-border pl-9 pr-3 py-2 rounded-lg text-sm text-foreground focus:border-primary/50 focus:bg-background transition-all"
                                    placeholder="City, Country..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Beneficiary</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={projectDetails.beneficiary || ''}
                                    onChange={(e) => updateDetail('beneficiary', e.target.value)}
                                    className="w-full bg-muted/30 border border-border pl-9 pr-3 py-2 rounded-lg text-sm text-foreground focus:border-primary/50 focus:bg-background transition-all"
                                    placeholder="Client Name..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="btn btn-primary btn-sm min-w-[80px]"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
