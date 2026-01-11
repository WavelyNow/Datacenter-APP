import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, MapPin, User, Hash, Settings, Save } from 'lucide-react';
import Image from 'next/image';
import { ProjectDetails } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSettingsSchema } from '@/lib/schemas';
import { z } from 'zod';

interface ProjectSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectDetails: ProjectDetails;
    onProjectDetailsChange: (details: ProjectDetails) => void;
}

type FormData = z.infer<typeof projectSettingsSchema>;

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
    isOpen,
    onClose,
    projectDetails,
    onProjectDetailsChange,
}) => {
    // Client-side check
    const mounted = typeof window !== 'undefined';

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
        resolver: zodResolver(projectSettingsSchema),
        defaultValues: {
            projectName: projectDetails.projectName,
            projectNumber: projectDetails.projectNumber,
            designer: projectDetails.designer,
            location: projectDetails.location,
            beneficiary: projectDetails.beneficiary,
            revision: projectDetails.revision,
        }
    });

    const companyLogo = watch('companyLogo' as any); // Type assertion for non-schema field if needed, or better add to schema as optional string

    // Reset form when modal opens or details change externally
    useEffect(() => {
        if (isOpen) {
            reset({
                projectName: projectDetails.projectName,
                projectNumber: projectDetails.projectNumber,
                designer: projectDetails.designer,
                location: projectDetails.location,
                beneficiary: projectDetails.beneficiary,
                revision: projectDetails.revision,
            });
        }
    }, [isOpen, projectDetails, reset]);

    if (!isOpen || !mounted) return null;

    const onSubmit = (data: FormData) => {
        onProjectDetailsChange({
            ...projectDetails,
            ...data
        });
        onClose();
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            // Immediate update for logo since it's hard to bind to RHF file input neatly without custom component
            onProjectDetailsChange({ ...projectDetails, companyLogo: result });
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
                            <h3 className="text-sm font-bold text-foreground">Setări Proiect</h3>
                            <p className="text-[10px] text-muted-foreground">Configurare detalii și metadate</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Project Identity */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nume Proiect</label>
                                <div className="space-y-1">
                                    <input
                                        {...register('projectName')}
                                        className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="ex. Data Center Cooling"
                                    />
                                    {errors.projectName && <p className="text-destructive text-[10px]">{errors.projectName.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Număr Proiect</label>
                                <div className="space-y-1">
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <input
                                            {...register('projectNumber')}
                                            className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="2024-001"
                                        />
                                    </div>
                                    {errors.projectNumber && <p className="text-destructive text-[10px]">{errors.projectNumber.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Beneficiar</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    {...register('beneficiary')}
                                    className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Nume Beneficiar"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Locație</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        {...register('location')}
                                        className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Oraș, Țară"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Proiectant</label>
                                <input
                                    {...register('designer')}
                                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Nume Proiectant"
                                />
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden relative group">
                                        {projectDetails.companyLogo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={projectDetails.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload className="w-5 h-5 text-muted-foreground group-hover:scale-110 transition-transform" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleLogoUpload}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium">Logo Companie</div>
                                        <div className="text-[10px] text-muted-foreground">Recomandat 200x200px PNG</div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvează
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};
