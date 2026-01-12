
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
    FileBox,
    Package,
    Leaf
} from 'lucide-react';
import { CloudBrowserAction } from './CloudBrowserAction';
import { BimImportModal } from './bim/BimImportModal';
import { HelpBeacon } from './help/HelpBeacon';
import { PueGauge, EnergyConsumptionChart } from './EnergyWidgets';

export const Dashboard = () => {
    const {
        projectDetails,
        setProjectDetails,
        setActiveTab,
        segments,
        equipmentList,
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

                <div className="card-premium p-6 flex items-center gap-4 hover:border-emerald-500/50 transition-colors cursor-pointer group relative" onClick={() => setActiveTab('config')}>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">Safe</div>
                        <div className="text-sm text-muted-foreground font-medium">System Status</div>
                    </div>
                </div>

                <div className="card-premium p-6 flex items-center gap-4 hover:border-emerald-500/50 transition-colors cursor-pointer group relative overflow-hidden" onClick={() => setActiveTab('energy')}>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full animate-pulse">NEW</div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <Leaf className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-600">1.42</div>
                        <div className="text-sm text-muted-foreground font-medium">Auto-Calc PUE</div>
                    </div>
                </div>
            </div>

            {/* Content Grid (Below Stats) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Project Overview & Stats */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Getting Started Guide (Show if project is empty-ish) */}
                    {segments.length === 0 && equipmentList.length === 0 && (
                        <div className="bg-muted/30 border border-border rounded-2xl p-6">
                            <h3 className="font-bold text-lg mb-4">Getting Started Checklist</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border/50">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">1</div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">Configure Fluid</p>
                                        <p className="text-xs text-muted-foreground">Set your glycol type and concentration.</p>
                                    </div>
                                    <button onClick={() => setActiveTab('config')} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md font-bold hover:bg-primary/20 transition-colors">Go to Config</button>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border/50">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">2</div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">Import BIM Model</p>
                                        <p className="text-xs text-muted-foreground">Load an IFC file to auto-detect pipes.</p>
                                    </div>
                                    <button onClick={() => setActiveTab('bim')} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md font-bold hover:bg-primary/20 transition-colors">Go to BIM</button>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border/50">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300">3</div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">Add Equipment</p>
                                        <p className="text-xs text-muted-foreground">Define pumps, chillers, and consumers.</p>
                                    </div>
                                    <button onClick={() => setActiveTab('weights')} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md font-bold hover:bg-primary/20 transition-colors">Go to Weights</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Real Project Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 text-muted-foreground mb-2">
                                <Package className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Pipe Segments</span>
                            </div>
                            <p className="text-3xl font-mono font-bold text-foreground">{segments.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {segments.length === 0 ? 'No pipes defined' : 'Active active segments'}
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 text-muted-foreground mb-2">
                                <Zap className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Equipment</span>
                            </div>
                            <p className="text-3xl font-mono font-bold text-foreground">{equipmentList.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">Consumers & pumps</p>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 text-muted-foreground mb-2">
                                <Cloud className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Project Cloud</span>
                            </div>
                            <p className="text-3xl font-mono font-bold text-foreground">
                                {projectDetails.projectNumber ? 'Synced' : 'Local'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {projectDetails.projectNumber || 'Not saved to cloud'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Updates */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10 relative overflow-hidden h-full">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                What's New
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                                        <span className="font-bold text-sm">Energy Dashboard</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Monitor PUE and Carbon Footprint in real-time.</span>
                                </li>
                                <li className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                                        <span className="font-bold text-sm">Hydraulic Engine</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Auto-calculate pressure drop & velocity for complex loops.</span>
                                </li>
                                <li className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">BETA</span>
                                        <span className="font-bold text-sm">BIM Integration</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Import IFC models, view in 3D, and extract pipe data automatically.</span>
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
