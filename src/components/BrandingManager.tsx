
import React from 'react';
import { useProject } from '@/context/ProjectContext';
import { Palette, Layout, Type, Image as ImageIcon, Check, RefreshCw } from 'lucide-react';

export const BrandingManager: React.FC = () => {
    const { branding, setBranding, projectDetails, setProjectDetails } = useProject();

    const themes = [
        { id: 'modern', name: 'Modern Futurist', desc: 'Minimalist, dark, high contrast with glow effects.' },
        { id: 'classic', name: 'Corporate Pro', desc: 'Clean, light backgrounds, traditional serif fonts.' },
        { id: 'industrial', name: 'Blueprints', desc: 'Technical look, blueprint blue accents, monospace fonts.' }
    ];

    const colors = [
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Emerald', value: '#10b981' },
        { name: 'Amber', value: '#f59e0b' },
        { name: 'Rose', value: '#f43f5e' },
        { name: 'Cyan', value: '#06b6d4' }
    ];

    const updateBranding = (updates: any) => {
        setBranding({ ...branding, ...updates });
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* PDF Theme Selection */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Layout className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">PDF Visual Theme</h3>
                    </div>

                    <div className="space-y-3">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => updateBranding({ pdfTheme: theme.id })}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${branding.pdfTheme === theme.id
                                        ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                        : 'bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div>
                                    <div className={`font-bold transition-colors ${branding.pdfTheme === theme.id ? 'text-blue-400' : 'text-slate-200 group-hover:text-white'}`}>
                                        {theme.name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">{theme.desc}</div>
                                </div>
                                {branding.pdfTheme === theme.id && (
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Identity & Colors */}
                <div className="space-y-8">
                    {/* Color Palette */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Palette className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Culori Brand</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3 block">Culoare Principală</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {colors.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => updateBranding({ primaryColor: c.value })}
                                            className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${branding.primaryColor === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                            style={{ backgroundColor: c.value }}
                                        >
                                            {branding.primaryColor === c.value && <Check className="w-4 h-4 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Culoare Accent</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        value={branding.accentColor}
                                        onChange={(e) => updateBranding({ accentColor: e.target.value })}
                                        className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                                    />
                                    <span className="text-sm font-mono text-slate-400 uppercase">{branding.accentColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logo Management */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                <ImageIcon className="w-5 h-5 text-teal-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Logo Companie</h3>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group relative overflow-hidden">
                                {projectDetails.companyLogo ? (
                                    <img src={projectDetails.companyLogo} alt="Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-700" />
                                )}
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                    <RefreshCw className="w-6 h-6 text-white animate-spin-slow" />
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                </label>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-bold text-slate-200">Format Recomandat: PNG/SVG</div>
                                <div className="text-xs text-slate-500 leading-relaxed max-w-[200px]">Încarcă logo-ul firmei tale pentru a apărea în antetul rapoartelor PDF generat.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Banner */}
            <div
                className="glass-panel p-10 rounded-3xl border flex flex-col items-center justify-center text-center space-y-4 overflow-hidden relative"
                style={{ borderColor: `${branding.primaryColor}30` }}
            >
                <div
                    className="absolute inset-0 opacity-10 blur-3xl rounded-full"
                    style={{ backgroundColor: branding.primaryColor }}
                />
                <h4 className="text-2xl font-black relative z-10 uppercase tracking-tighter italic" style={{ color: branding.primaryColor }}>
                    Previzualizare Stil
                </h4>
                <p className="text-slate-400 text-sm max-w-md relative z-10 italic">
                    Iată cum vor arăta elementele vizuale în raportul PDF conform configurării actuale ({branding.pdfTheme.toUpperCase()}).
                </p>
                <div
                    className="h-1 w-24 rounded-full relative z-10"
                    style={{ backgroundColor: branding.accentColor }}
                />
            </div>
        </div>
    );
};
