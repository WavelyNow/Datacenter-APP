'use client';

import React, { useState } from 'react';
import { X, Server, Building, Building2, FilePlus, ChevronRight, Check, Zap, Thermometer, Box, LucideIcon } from 'lucide-react';
import { PROJECT_TEMPLATES, ProjectTemplate } from '@/lib/templates';
import { useProject } from '@/context/ProjectContext';

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

const ICONS: Record<string, LucideIcon> = {
    Server,
    Building,
    Building2,
    FilePlus,
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ isOpen, onClose }) => {
    const { projectDetails, setProjectDetails, setSegments, setEquipmentList, setGlycolPercentage, setFluidType } = useProject();
    const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleApplyTemplate = async () => {
        if (!selectedTemplate) return;

        setIsLoading(true);

        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 300));

        // Apply template data - merge with existing project details
        if (selectedTemplate.projectDetails) {
            setProjectDetails({ ...projectDetails, ...selectedTemplate.projectDetails });
        }

        // Generate fresh IDs for segments and equipment
        const segmentsWithNewIds = selectedTemplate.segments.map(seg => ({
            ...seg,
            id: `seg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));

        const equipmentWithNewIds = selectedTemplate.equipment.map(eq => ({
            ...eq,
            id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));

        setSegments(segmentsWithNewIds);
        setEquipmentList(equipmentWithNewIds);
        setGlycolPercentage(selectedTemplate.glycolPercentage);
        setFluidType(selectedTemplate.fluidType);

        setIsLoading(false);
        onClose();
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'small': return 'from-slate-400 to-slate-600';
            case 'medium': return 'from-indigo-400 to-indigo-600';
            case 'enterprise': return 'from-slate-700 to-indigo-900';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-border overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-border bg-muted/10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Quick Start Templates</h2>
                            <p className="text-muted-foreground mt-1">
                                Choose a pre-configured project to get started quickly.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Template Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PROJECT_TEMPLATES.map((template) => {
                            const Icon = ICONS[template.icon] || Server;
                            const isSelected = selectedTemplate?.id === template.id;

                            return (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    className={`
                                        group relative p-5 rounded-xl border-2 text-left transition-all duration-200
                                        ${isSelected
                                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                            : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                                        }
                                    `}
                                >
                                    {/* Selected Indicator */}
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div className={`
                                            w-14 h-14 rounded-xl bg-gradient-to-br ${getCategoryColor(template.category)} 
                                            flex items-center justify-center shrink-0 shadow-lg
                                        `}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-foreground">{template.name}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {template.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Specs */}
                                    <div className="mt-4 flex gap-3 flex-wrap">
                                        <div className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded-md">
                                            <Server className="w-3 h-3 text-muted-foreground" />
                                            <span>{template.specs.racks} racks</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded-md">
                                            <Zap className="w-3 h-3 text-muted-foreground" />
                                            <span>{template.specs.power}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded-md">
                                            <Thermometer className="w-3 h-3 text-muted-foreground" />
                                            <span>{template.specs.cooling}</span>
                                        </div>
                                    </div>

                                    {/* What's included */}
                                    {template.id !== 'custom' && (
                                        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                                            <Box className="w-3 h-3 inline mr-1" />
                                            {template.segments.length} pipe segments, {template.equipment.length} equipment items
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/10 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        {selectedTemplate ? (
                            <>
                                Selected: <span className="font-bold text-foreground">{selectedTemplate.name}</span>
                            </>
                        ) : (
                            'Select a template to continue'
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApplyTemplate}
                            disabled={!selectedTemplate || isLoading}
                            className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Applying...
                                </>
                            ) : (
                                <>
                                    Apply Template
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
