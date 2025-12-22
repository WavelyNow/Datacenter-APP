import React, { useRef } from 'react';
import { Download, Upload, FolderOpen, Save, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
    projectName: string;
    onProjectNameChange: (name: string) => void;
    engineerName: string;
    onEngineerNameChange: (name: string) => void;
    onSaveProject?: () => void;
    onLoadProject?: (file: File) => void;
    companyLogo?: string | null;
    onLogoUpload?: (base64: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
    projectName,
    onProjectNameChange,
    engineerName,
    onEngineerNameChange,
    onSaveProject,
    onLoadProject,
    companyLogo,
    onLogoUpload
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onLoadProject) {
            onLoadProject(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onLogoUpload) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onLogoUpload(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <header className="bg-neutral-900 border-b border-neutral-800 shadow-lg print:hidden sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                {/* Branding / Logo Upload */}
                <div className="flex items-center gap-4">
                    <div
                        className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500 cursor-pointer hover:bg-teal-500/20 transition-all relative overflow-hidden group"
                        onClick={() => logoInputRef.current?.click()}
                        title="Upload Company Logo"
                    >
                        {companyLogo ? (
                            <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <ImageIcon className="w-5 h-5" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-medium uppercase transition-opacity">
                            Upload
                        </div>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={logoInputRef}
                        onChange={handleLogoChange}
                    />

                    <div>
                        <h1 className="text-lg font-bold text-neutral-100 leading-none">HydroCalc <span className="text-teal-500">Pro</span></h1>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Engineering Suite</p>
                    </div>
                </div>

                {/* Project Inputs */}
                <div className="hidden md:flex flex-1 items-center gap-4 max-w-2xl mx-8">
                    <label className="flex-1">
                        <span className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Project Name</span>
                        <input
                            type="text"
                            placeholder="Enter Project Name..."
                            className="w-full bg-neutral-800 border-neutral-700 text-neutral-200 text-sm rounded px-3 py-1.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                            value={projectName}
                            onChange={(e) => onProjectNameChange(e.target.value)}
                        />
                    </label>
                    <label className="flex-1">
                        <span className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Engineer</span>
                        <input
                            type="text"
                            placeholder="Your Name..."
                            className="w-full bg-neutral-800 border-neutral-700 text-neutral-200 text-sm rounded px-3 py-1.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                            value={engineerName}
                            onChange={(e) => onEngineerNameChange(e.target.value)}
                        />
                    </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {onSaveProject && (
                        <button
                            onClick={onSaveProject}
                            className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-sm transition-colors border border-neutral-700 group"
                            title="Save Project"
                        >
                            <Save className="w-4 h-4 text-emerald-500 group-hover:text-emerald-400" />
                            <span className="hidden sm:inline font-medium">Save</span>
                        </button>
                    )}

                    {onLoadProject && (
                        <>
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-sm transition-colors border border-neutral-700 group"
                                title="Load Project"
                            >
                                <FolderOpen className="w-4 h-4 text-amber-500 group-hover:text-amber-400" />
                                <span className="hidden sm:inline font-medium">Load</span>
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm transition-colors font-medium shadow-lg shadow-teal-900/20 ml-2"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Print Report</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
