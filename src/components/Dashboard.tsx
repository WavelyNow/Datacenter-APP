
import React from 'react';
import { useProject } from '@/context/ProjectContext';
import {
    Clock,
    FileText,
    ArrowRight,
    TrendingUp,
    Activity,
    Zap,
    Cloud,
    FolderOpen,
    Plus,
    FileBox
} from 'lucide-react';
import { CloudBrowserAction } from './CloudBrowserAction';
import { BimImportModal } from './bim/BimImportModal';

export const Dashboard = () => {
    const {
        projectDetails,
        setProjectDetails,
        setActiveTab,
        segments,
        loadFromCloud
    } = useProject();

    const [isBimOpen, setIsBimOpen] = React.useState(false);

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-12">

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                        Engineering <span className="text-primary">Team Workspace</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">Collaborative Project Hub & Resources</p>
                </div>

                <div className="flex gap-3">

                    <button
                        onClick={() => setIsBimOpen(true)}
                        className="btn btn-secondary h-12 px-6 border-primary/20 hover:border-primary/50 gap-2 text-foreground"
                    >
                        <FileBox className="w-5 h-5 text-primary" />
                        Import BIM
                    </button>

                    <button
                        onClick={() => setActiveTab('config')}
                        className="btn btn-primary h-12 px-6 shadow-lg shadow-primary/20 gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-premium p-6 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setActiveTab('config')}>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{segments.length}</div>
                        <div className="text-sm text-muted-foreground font-medium">Active Pipe Segments</div>
                    </div>
                </div>

                <div className="card-premium p-6 flex items-center gap-4 hover:border-orange-500/50 transition-colors cursor-pointer group" onClick={() => setActiveTab('catalogs')}>
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">1,240+</div>
                        <div className="text-sm text-muted-foreground font-medium">Catalog Items Available</div>
                    </div>
                </div>

                <div className="card-premium p-6 flex items-center gap-4 hover:border-emerald-500/50 transition-colors cursor-pointer group" onClick={() => setActiveTab('config')}>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">Safe</div>
                        <div className="text-sm text-muted-foreground font-medium">System Status</div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stats & Quick Actions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Updates Section */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                What's New
                            </h3>
                            <ul className="space-y-2">
                                <li className="text-sm flex items-start gap-2">
                                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">NEW</span>
                                    <span>Hydraulic Intelligence Engine: Auto-calculate pressure drop & velocity.</span>
                                </li>
                                <li className="text-sm text-muted-foreground">
                                    • Cloud Library: Save and share your custom equipment & profiles.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal */}
            <BimImportModal isOpen={isBimOpen} onClose={() => setIsBimOpen(false)} />
        </div>
    );
};
