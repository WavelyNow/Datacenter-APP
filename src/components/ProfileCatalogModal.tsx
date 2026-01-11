
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { ProfileCatalog } from './ProfileCatalog';

interface ProfileCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileCatalogModal = ({ isOpen, onClose }: ProfileCatalogModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-500" onClick={onClose} />

            <div className="relative w-full max-w-7xl h-[90vh] animate-in zoom-in-95 duration-300 flex flex-col">
                <div className="absolute -top-12 right-0 md:-right-12 md:top-0 z-50">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center backdrop-blur-md border border-border transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <ProfileCatalog />
            </div>
        </div>,
        document.body
    );
};
