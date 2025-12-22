import React from 'react';

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
        <header className="grid grid-cols-12 gap-4 border-b-2 border-black pb-4 mb-6 break-inside-avoid">
            {/* Logo Area */}
            <div className="col-span-4 h-24 flex items-center justify-start overflow-hidden">
                {companyLogo ? (
                    <img src={companyLogo} alt="Logo" className="h-full max-w-full object-contain print:block" />
                ) : (
                    <div className="w-full h-full border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <span className="text-gray-400 text-xs text-center font-sans p-2">
                            LOGO (Upload & Print)
                        </span>
                    </div>
                )}
            </div>

            {/* Meta Data Area */}
            <div className="col-span-8 flex flex-col justify-between text-right">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight">Raport Tehnic</h1>
                    <p className="text-sm font-medium text-gray-600 uppercase">Dimensionare Instalație Hidraulică</p>
                </div>

                <div className="text-sm space-y-0.5 mt-2">
                    <div className="flex justify-end gap-2">
                        <span className="font-bold text-gray-500 text-xs uppercase">Proiect:</span>
                        <span className="font-bold">{projectName || 'Nespecificat'}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <span className="font-bold text-gray-500 text-xs uppercase">Inginer:</span>
                        <span>{engineerName || 'Nespecificat'}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <span className="font-bold text-gray-500 text-xs uppercase">Data:</span>
                        <span>{dateStr}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
