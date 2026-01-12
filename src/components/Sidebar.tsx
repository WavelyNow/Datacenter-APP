import React from 'react';
import { ProjectDetails } from '@/lib/types';
import {
    Box,
    LayoutDashboard,
    Book,
    Package,
    Scale,
    Camera,
    Anchor,
    Palette,
    Settings,
    Save,
    Upload,
    Printer
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export type TabId = 'dashboard' | 'config' | 'supports' | 'weights' | 'photos' | 'branding' | 'catalogs';

interface SidebarProps {
    activeTab: TabId;
    onTabChange: (tabId: TabId) => void;
    projectDetails: ProjectDetails;
    onSettingsOpen: () => void;
    onExportOpen: () => void;
    onSave: () => void;
    onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    onTabChange,
    projectDetails,
    onSettingsOpen,
    onExportOpen,
    onSave,
    onLoad
}) => {

    // --- Navigation Groups ---

    interface MenuItem {
        id: TabId;
        label: string;
        icon: React.ElementType;
        badge?: string;
    }

    const mainGroup: MenuItem[] = [
        { id: 'dashboard', label: 'Acasa / Dashboard', icon: LayoutDashboard },
    ];

    const engineeringGroup: MenuItem[] = [
        { id: 'config', label: 'Trasee Țevi & Hidraulică', icon: Package },
        { id: 'supports', label: 'Sisteme de Susținere', icon: Anchor },
        { id: 'weights', label: 'Calcul Încărcări', icon: Scale },
    ];

    const databaseGroup: MenuItem[] = [
        { id: 'catalogs', label: 'Bibliotecă Tehnică', icon: Book },
    ];

    const reportsGroup: MenuItem[] = [
        { id: 'photos', label: 'Galerie Foto', icon: Camera },
        { id: 'branding', label: 'Personalizare Raport', icon: Palette },
    ];

    // Helper for rendering a section
    const NavSection = ({ title, items }: { title?: string, items: MenuItem[] }) => (
        <div className="mb-6">
            {title && (
                <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 opacity-60">
                    {title}
                </p>
            )}
            <div className="space-y-1">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                                <span className="absolute right-2 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <aside className="sidebar-panel w-[280px] flex flex-col justify-between p-5 z-50 screen-only border-r border-border/40 bg-card/50 backdrop-blur-sm">

            {/* 1. Header Area: Logo & Project */}
            <div className="flex-1 overflow-y-auto no-scrollbar">

                {/* Brand */}
                <div className="flex items-center gap-3 px-2 mb-8">
                    <div className="w-9 h-9 bg-foreground text-background rounded-xl flex items-center justify-center shadow-lg">
                        <Box className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">Engineering Suite</h1>
                        <p className="text-[10px] text-muted-foreground font-mono">PRO v2.5</p>
                    </div>
                </div>

                {/* Project Selector */}
                <div
                    onClick={onSettingsOpen}
                    className="group flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border/50 cursor-pointer transition-all mb-8 mx-1"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {projectDetails.projectNumber?.slice(0, 2) || 'PR'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                                {projectDetails.projectName || 'Untitled Project'}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate">
                                Rev. {projectDetails.revision || '0'}
                            </span>
                        </div>
                    </div>
                    <Settings className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Navigation Sections */}
                <nav>
                    <NavSection items={mainGroup} />
                    <NavSection title="Proiectare & Calcul" items={engineeringGroup} />
                    <NavSection title="Resurse" items={databaseGroup} />
                    <NavSection title="Documentație" items={reportsGroup} />
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4">

                {/* Action Grid */}
                <div className="bg-secondary/30 rounded-xl p-2 grid grid-cols-2 gap-2">
                    <button onClick={onExportOpen} className="col-span-2 flex items-center justify-center gap-2 bg-foreground text-background h-9 rounded-lg text-xs font-bold shadow-sm hover:brightness-110 transition-all">
                        <Printer className="w-3.5 h-3.5" />
                        Export Raport
                    </button>

                    <button onClick={onSave} className="flex items-center justify-center h-8 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all" title="Save JSON">
                        <Save className="w-3.5 h-3.5" />
                    </button>

                    <label className="flex items-center justify-center h-8 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer" title="Load JSON">
                        <Upload className="w-3.5 h-3.5" />
                        <input type="file" accept=".json" onChange={onLoad} className="hidden" />
                    </label>
                </div>

                {/* User/Theme Footer */}
                <div className="pt-4 border-t border-border flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                            RA
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold">Admin User</span>
                            <span className="text-[10px] text-muted-foreground">Online</span>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </aside>
    );
};
