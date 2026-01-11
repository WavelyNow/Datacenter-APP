import React, { useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import Image from 'next/image';
import { Palette, Layout, Image as ImageIcon, Check, RefreshCw, Upload, Trash2 } from 'lucide-react';
import { BrandingConfig } from '@/lib/types';

export const BrandingManager: React.FC = () => {
    const { branding, setBranding, projectDetails, setProjectDetails } = useProject();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const themes = [
        { id: 'modern' as const, name: 'Modern Futurist', desc: 'Minimalist, dark, high contrast with glow effects.' },
        { id: 'classic' as const, name: 'Corporate Pro', desc: 'Clean, light backgrounds, traditional serif fonts.' },
        { id: 'industrial' as const, name: 'Blueprints', desc: 'Technical look, blueprint blue accents, monospace fonts.' }
    ];

    const colors = [
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Emerald', value: '#10b981' },
        { name: 'Amber', value: '#f59e0b' },
        { name: 'Rose', value: '#f43f5e' },
        { name: 'Cyan', value: '#06b6d4' }
    ];

    const updateBranding = (updates: Partial<BrandingConfig>) => {
        setBranding(updates);
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

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeLogo = () => {
        setProjectDetails({ ...projectDetails, companyLogo: undefined });
    };

    return (
        <div className="bg-card border border-border p-8 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Palette className="w-6 h-6 text-primary" />
                        Branding & Identity
                    </h2>
                    <p className="text-muted-foreground mt-1">Customize the visual appearance of your PDF reports.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Controls */}
                <div className="lg:col-span-7 space-y-8">

                    {/* PDF Theme Selection */}
                    <section>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Layout className="w-4 h-4" /> Visual Theme
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => updateBranding({ pdfTheme: theme.id })}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group relative overflow-hidden ${branding.pdfTheme === theme.id
                                            ? 'bg-primary/10 border-primary/50 shadow-md shadow-primary/10'
                                            : 'bg-muted/20 border-border hover:border-primary/20 hover:bg-muted/40'
                                        }`}
                                >
                                    <div className="relative z-10">
                                        <div className={`font-bold text-lg transition-colors ${branding.pdfTheme === theme.id ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                                            {theme.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">{theme.desc}</div>
                                    </div>
                                    {branding.pdfTheme === theme.id && (
                                        <div className="relative z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                            <Check className="w-5 h-5 text-primary-foreground" />
                                        </div>
                                    )}
                                    {branding.pdfTheme === theme.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Color Palette */}
                    <section>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Brand Colors
                        </h3>
                        <div className="bg-muted/10 p-6 rounded-xl border border-border">
                            <div className="mb-6">
                                <label className="text-xs font-medium text-muted-foreground mb-3 block">Primary Color</label>
                                <div className="flex flex-wrap gap-4">
                                    {colors.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => updateBranding({ primaryColor: c.value })}
                                            className={`w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center relative group ${branding.primaryColor === c.value
                                                    ? 'ring-2 ring-background ring-offset-2 ring-offset-foreground scale-110 shadow-lg'
                                                    : 'hover:scale-110 hover:shadow-lg opacity-80 hover:opacity-100'
                                                }`}
                                            style={{ backgroundColor: c.value, boxShadow: branding.primaryColor === c.value ? `0 0 20px ${c.value}60` : 'none' }}
                                            title={c.name}
                                        >
                                            {branding.primaryColor === c.value && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-3 block">Accent Color (Custom)</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <input
                                            type="color"
                                            value={branding.accentColor}
                                            onChange={(e) => updateBranding({ accentColor: e.target.value })}
                                            className="w-14 h-14 rounded-full overflow-hidden cursor-pointer border-0 p-0 shadow-lg transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-border pointer-events-none" />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={branding.accentColor}
                                            onChange={(e) => updateBranding({ accentColor: e.target.value })}
                                            className="w-full bg-card border border-border rounded-lg py-2 px-4 font-mono uppercase text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Logo & Preview */}
                <div className="lg:col-span-5 space-y-8">

                    {/* Logo Upload */}
                    <section>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> Company Logo
                        </h3>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            ref={fileInputRef}
                        />

                        {projectDetails.companyLogo ? (
                            <div className="relative group w-full h-48 rounded-xl overflow-hidden border border-border bg-card">
                                <div className="absolute inset-0 p-8 flex items-center justify-center">
                                    <Image
                                        src={projectDetails.companyLogo}
                                        alt="Company Logo"
                                        width={200}
                                        height={100}
                                        className="max-w-full max-h-full object-contain"
                                        unoptimized
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all backdrop-blur-sm">
                                    <button
                                        onClick={triggerFileInput}
                                        className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
                                        title="Change Logo"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={removeLogo}
                                        className="p-3 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
                                        title="Remove Logo"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={triggerFileInput}
                                className="w-full h-48 border-2 border-dashed border-border hover:border-primary/50 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all group flex flex-col items-center justify-center gap-4"
                            >
                                <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-primary/10">
                                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div className="text-center">
                                    <span className="text-sm font-bold text-foreground group-hover:text-primary block">Upload Logo</span>
                                    <span className="text-xs text-muted-foreground mt-1">PNG, JPG or SVG (max 2MB)</span>
                                </div>
                            </button>
                        )}
                    </section>

                    {/* Live Preview Card */}
                    <section>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Layout className="w-4 h-4" /> Style Preview
                        </h3>
                        {/* Preview remains simpler to keep neutral representation of report */}
                        <div
                            className="relative overflow-hidden rounded-xl border bg-card p-8 text-center shadow-lg"
                            style={{ borderColor: `${branding.primaryColor}40` }}
                        >
                            <div
                                className="absolute inset-0 opacity-10 blur-3xl"
                                style={{
                                    background: `radial-gradient(circle at center, ${branding.primaryColor}, transparent 70%)`
                                }}
                            />

                            <div className="relative z-10 space-y-4">
                                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-border bg-muted/30 text-muted-foreground">
                                    Report Header
                                </div>

                                <h4
                                    className="text-3xl font-black uppercase tracking-tighter italic"
                                    style={{ color: branding.primaryColor }}
                                >
                                    Project Report
                                </h4>

                                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-4" />

                                <p className="text-muted-foreground text-sm italic max-w-[200px] mx-auto">
                                    Sample text showing how your typography and colors will appear.
                                </p>

                                <div
                                    className="h-1.5 w-16 rounded-full mx-auto mt-6"
                                    style={{ backgroundColor: branding.accentColor }}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
