'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CloudProject } from '@/lib/types';
import { useProject } from '@/context/ProjectContext';
import { Cloud, Save, Loader2, Search, Calendar, FolderOpen, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

export const CloudBrowserAction = () => {
    const { cloudProjectId, saveToCloud, loadFromCloud } = useProject();
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
            if (!supabase) {
                throw new Error('Cloud disabled — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars');
            }
            const { data, error } = await supabase
                .from('projects')
                .select('id, name, description, updated_at, data')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            // Map data to CloudProject interface
            setProjects((data as unknown as CloudProject[]) || []);
        } catch (err: unknown) {
            console.error('Error fetching projects:', err);
            const msg = err instanceof Error ? err.message : 'Failed to fetch projects';
            setError(msg);
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
            toast.success('Proiect salvat în cloud');
            // If browser is open, refresh
            if (isOpen) fetchProjects();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Eroare necunoscută';
            toast.error('Salvare eșuată: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    const handleLoad = async (id: string) => {
        if (confirm('Încărcarea unui proiect va înlocui munca curentă. Continuați?')) {
            try {
                await loadFromCloud(id);
                setIsOpen(false);
                toast.success('Proiect încărcat din cloud');
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Eroare necunoscută';
                toast.error('Încărcare eșuată: ' + msg);
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
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
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
                <div className="fixed inset-0 z-100 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-border relative">
                        {/* Header */}
                        <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-background rounded-t-xl z-10">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Cloud className="w-6 h-6 text-primary" />
                                    Cloud Project Library
                                </h2>
                                <p className="text-sm text-muted-foreground">Wiki-Style: Everyone can read and write projects.</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5" />
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
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
                                        <div key={project.id} className="group flex flex-col gap-3 p-5 rounded-xl border border-secondary bg-secondary/10 hover:bg-secondary/20 hover:border-primary/30 transition-all relative">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="font-bold text-lg text-zinc-100 wrap-break-word leading-tight" title={project.name}>
                                                    {(project.name && project.name.trim().length > 0) ? project.name : 'Untitled Project'}
                                                </div>
                                                {project.id === cloudProjectId && (
                                                    <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-sm text-zinc-400 line-clamp-2 min-h-[2.5em]">
                                                {project.description || 'No description provided.'}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/10">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(project.updated_at).toLocaleDateString()}
                                                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-primary/70">
                                                    #{project.id.slice(0, 6)}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleLoad(project.id)}
                                                className="w-full mt-2 btn btn-secondary hover:bg-primary hover:text-primary-foreground border-primary/20 transition-all flex items-center justify-center gap-2 py-2 text-sm font-bold"
                                            >
                                                <FolderOpen className="w-4 h-4" />
                                                Open Project
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            )}
        </>
    );
};
