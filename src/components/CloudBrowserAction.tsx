'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CloudProject } from '@/lib/types';
import { useProject } from '@/context/ProjectContext';
import { Cloud, Save, Download, Loader2, Search, Calendar, FolderOpen, AlertTriangle } from 'lucide-react';

export const CloudBrowserAction = () => {
    const { cloudProjectId, saveToCloud, loadFromCloud, projectDetails } = useProject();
    const [isOpen, setIsOpen] = useState(false);
    const [projects, setProjects] = useState<CloudProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('id, name, description, updated_at, data')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            // Map data to CloudProject interface (ignoring 'data' prop type mismatch if any - mostly matching)
            setProjects(data as any as CloudProject[] || []);
        } catch (err: any) {
            console.error('Error fetching projects:', err);
            setError(err.message || 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveToCloud();
            alert('Project saved to Cloud successfully!');
            // If browser is open, refresh
            if (isOpen) fetchProjects();
        } catch (err: any) {
            alert('Error saving: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLoad = async (id: string) => {
        if (confirm('Loading a project will replace your current work. Continue?')) {
            try {
                await loadFromCloud(id);
                setIsOpen(false);
            } catch (err: any) {
                alert('Error loading: ' + err.message);
            }
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            <div className="flex items-center gap-2">
                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    title={cloudProjectId ? "Update existing Cloud project" : "Save as new Cloud project"}
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {cloudProjectId ? 'Update Cloud' : 'Save to Cloud'}
                </button>

                {/* Browser Button */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors border border-primary/20"
                >
                    <Cloud className="w-4 h-4" />
                    Cloud Browser
                </button>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-border">
                        {/* Header */}
                        <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-background rounded-t-xl z-10">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Cloud className="w-6 h-6 text-primary" />
                                    Cloud Project Library
                                </h2>
                                <p className="text-sm text-muted-foreground">Wiki-Style: Everyone can read and write projects.</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                ✕
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 border-b border-border bg-muted/20">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <p>Loading projects from Supabase...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 text-destructive">
                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                                    <p>{error}</p>
                                    <p className="text-xs mt-2 overflow-auto max-w-md mx-auto bg-destructive/10 p-2 rounded">
                                        Hint: Ensure you ran the SQL setup script.
                                    </p>
                                </div>
                            ) : filteredProjects.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>No projects found in the cloud.</p>
                                    <p className="text-sm">Be the first to save one!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredProjects.map((project) => (
                                        <div key={project.id} className="group border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all bg-card text-card-foreground flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="font-semibold truncate pr-2 text-lg" title={project.name}>
                                                    {project.name}
                                                </div>
                                                {project.id === cloudProjectId && (
                                                    <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded border border-green-500/20 whitespace-nowrap">
                                                        Current
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                                                {project.description || 'No description'}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(project.updated_at).toLocaleDateString()}
                                                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-primary">
                                                    ID: {project.id.slice(0, 8)}...
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleLoad(project.id)}
                                                className="w-full mt-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <FolderOpen className="w-4 h-4" />
                                                Load Project
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
