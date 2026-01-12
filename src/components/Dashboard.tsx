
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
    Plus
} from 'lucide-react';
import { CloudBrowserAction } from './CloudBrowserAction';

export const Dashboard = () => {
    const {
        projectDetails,
        setProjectDetails,
        setActiveTab,
        segments,
        loadFromCloud
    } = useProject();

    // Mock Recent Projects (In real app, fetch from local storage or cloud)
    const recentProjects = [
        { id: '1', name: 'Data Center Cooling A1', location: 'Bucharest', date: '2 hrs ago', status: 'Draft' },
        { id: '2', name: 'Office Building HVAC', location: 'Cluj-Napoca', date: '1 day ago', status: 'Review' },
        { id: '3', name: 'Industrial Plant Piping', location: 'Timisoara', date: '3 days ago', status: 'Approved' },
    ];

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

            {/* Recent & News */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Projects */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            Recent Projects
                        </h3>
                        <button className="text-sm text-primary font-medium hover:underline">View All</button>
                    </div>

                    <div className="grid gap-4">
                        {recentProjects.map((project) => (
                            <div key={project.id} className="group bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all hover:border-primary/30 flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{project.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{project.location}</span>
                                            <span>•</span>
                                            <span>{project.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${project.status === 'Draft' ? 'bg-secondary text-muted-foreground border-border' :
                                        project.status === 'Review' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        }`}>
                                        {project.status}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* News / Updates */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-muted-foreground" />
                        Updates
                    </h3>

                    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-xl p-6 relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">NEW FEATURE</span>
                            <h4 className="text-lg font-bold text-foreground">Hydraulic Intelligence Engine 🚀</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Introduce flow rates and let the system calculate pressure drops and velocities automatically. Use the new Smart Sizing wizard to optimize pipe diameters.
                            </p>
                            <button
                                onClick={() => setActiveTab('config')}
                                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                Try it now <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
