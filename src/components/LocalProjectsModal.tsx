'use client';

import React, { useState } from 'react';
import { Clock3, FolderOpen, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { listLocalProjects } from '@/lib/localProjects';
import { Modal } from '@/components/ui/Modal';

interface LocalProjectsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProjectName: string;
    currentProjectId: string | null;
    currentProjectDirty: boolean;
    onSaveAs: (name: string) => string | null;
    onLoad: (id: string) => boolean;
    onDelete: (id: string) => boolean;
}

export const LocalProjectsModal: React.FC<LocalProjectsModalProps> = ({
    isOpen,
    onClose,
    currentProjectName,
    currentProjectId,
    currentProjectDirty,
    onSaveAs,
    onLoad,
    onDelete,
}) => {
    const [projects, setProjects] = useState(() => listLocalProjects());
    const [saveName, setSaveName] = useState(currentProjectName);

    const refresh = () => setProjects(listLocalProjects());

    const handleSaveAs = (event: React.FormEvent) => {
        event.preventDefault();
        const name = saveName.trim();
        if (!name) {
            toast.error('Introdu un nume pentru proiect.');
            return;
        }

        if (!onSaveAs(name)) {
            toast.error('Proiectul nu a putut fi salvat local.');
            return;
        }

        refresh();
        toast.success(`Proiect salvat local: ${name}`);
    };

    const handleLoad = (id: string) => {
        if (id !== currentProjectId && currentProjectDirty && !window.confirm('Încărcarea va înlocui modificările nesalvate. Continuați?')) {
            return;
        }
        if (!onLoad(id)) {
            toast.error('Proiectul local nu a putut fi încărcat.');
            refresh();
            return;
        }
        toast.success('Proiect local încărcat.');
        onClose();
    };

    const handleDelete = (id: string, name: string) => {
        if (!window.confirm(`Ștergi proiectul „${name}”?`)) return;
        if (!onDelete(id)) {
            toast.error('Proiectul nu a putut fi șters.');
            return;
        }
        refresh();
        toast.success('Proiect local șters.');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Proiecte locale"
            description="Salvează copii și redeschide proiecte direct din browser."
            size="lg"
        >
            <div className="space-y-5 p-5 sm:p-6">
                <form onSubmit={handleSaveAs} className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-end">
                    <label className="min-w-0 flex-1 space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Salvează ca</span>
                        <input
                            value={saveName}
                            onChange={(event) => setSaveName(event.target.value)}
                            aria-label="Nume proiect local"
                            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Numele proiectului"
                        />
                    </label>
                    <button type="submit" className="btn btn-primary h-11 shrink-0 gap-2">
                        <Save className="h-4 w-4" />
                        Salvează copie
                    </button>
                </form>

                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h4 className="text-sm font-bold text-foreground">Biblioteca locală</h4>
                        <p className="text-xs text-muted-foreground">Datele rămân în acest browser.</p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                        {projects.length} {projects.length === 1 ? 'proiect' : 'proiecte'}
                    </span>
                </div>

                {projects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        Nu există încă proiecte salvate local.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {projects.map((project) => (
                            <div key={project.id} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 transition hover:border-primary/30 hover:bg-muted/30 sm:p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <FolderOpen className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-bold text-foreground">{project.name}</p>
                                        {project.id === currentProjectId && (
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">ACTIV</span>
                                        )}
                                    </div>
                                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                        <Clock3 className="h-3 w-3" />
                                        {new Date(project.updatedAt).toLocaleString('ro-RO')}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleLoad(project.id)}
                                        aria-label={`Deschide proiectul ${project.name}`}
                                        className="btn btn-secondary btn-sm gap-1.5"
                                    >
                                        <FolderOpen className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Deschide</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(project.id, project.name)}
                                        aria-label={`Șterge proiectul ${project.name}`}
                                        className="btn btn-ghost btn-icon h-9 w-9 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};
