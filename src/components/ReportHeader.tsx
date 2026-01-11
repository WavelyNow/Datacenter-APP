import React from 'react';
import Image from 'next/image';
import { FileText } from 'lucide-react';

interface ReportHeaderProps {
    companyLogo?: string | null;
    projectName: string;
    engineerName: string;
    dateStr: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
    companyLogo,
    projectName,
    engineerName,
    dateStr
}) => {
    return (
        <header className="mb-8 pb-6 border-b border-neutral-200 break-inside-avoid print:border-black">
            <div className="flex items-start justify-between">
                {/* Logo Area */}
                <div className="w-1/3">
                    {companyLogo ? (
                        <div className="relative h-16 w-full max-w-[200px]">
                            <Image
                                src={companyLogo}
                                alt="Logo"
                                fill
                                className="object-contain object-left"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-neutral-400">
                            <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-xs uppercase tracking-wider font-medium">No Logo</span>
                        </div>
                    )}
                </div>

                {/* Meta Data Area */}
                <div className="text-right">
                    <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900 leading-none mb-1">Raport Tehnic</h1>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-4">Dimensionare Instalație Hidraulică</p>

                    <div className="space-y-1">
                        <div className="flex justify-end gap-3 text-sm">
                            <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Proiect</span>
                            <span className="font-medium text-neutral-900">{projectName || '—'}</span>
                        </div>
                        <div className="flex justify-end gap-3 text-sm">
                            <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Inginer</span>
                            <span className="font-medium text-neutral-900">{engineerName || '—'}</span>
                        </div>
                        <div className="flex justify-end gap-3 text-sm">
                            <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Data</span>
                            <span className="font-medium text-neutral-900">{dateStr}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
