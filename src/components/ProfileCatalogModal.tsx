
import React from 'react';
import { X } from 'lucide-react';
import { ProfileCatalog } from './ProfileCatalog';

interface ProfileCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileCatalogModal = ({ isOpen, onClose }: ProfileCatalogModalProps) => {




    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border border-white/40 ring-1 ring-slate-900/5 dark:bg-slate-900/90 dark:border-slate-800">

                {/* Close Button Header Overlay */}
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700/80 rounded-full transition-colors text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white backdrop-blur-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <ProfileCatalog />
            </div>
        </div>
    );
};
