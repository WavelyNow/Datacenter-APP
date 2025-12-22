import React from 'react';
import { PipeSegment, EquipmentItem } from '@/lib/types';
import { BoQItem, getDetailedWeightReport } from '@/lib/calculations';
import { ReportHeader } from './ReportHeader';

interface PrintReportProps {
    projectName: string;
    engineerName: string;
    segments: PipeSegment[];
    equipmentList: EquipmentItem[];
    boqItems: BoQItem[];
    totalSystemVolume: number;
    glycolPercentage: number;
    safetyMargin: boolean;
    companyLogo?: string | null;
}

export const PrintReport: React.FC<PrintReportProps> = ({
    projectName,
    engineerName,
    segments,
    equipmentList,
    totalSystemVolume,
    glycolPercentage,
    safetyMargin,
    companyLogo,
    boqItems
}) => {
    // Date formatting
    const dateStr = new Date().toLocaleDateString('ro-RO', {
        day: '2-digit', minute: undefined,
        month: '2-digit',
        year: 'numeric'
    });

    const detailedWeights = getDetailedWeightReport(segments, equipmentList, glycolPercentage);
    const totalWeightSum = detailedWeights.reduce((sum, item) => sum + item.totalWeight, 0);

    return (
        <div className="hidden print:block font-serif text-black leading-tight max-w-[210mm] mx-auto bg-white p-0">

            {/* ============================================= */}
            {/* PAGE 1: HYDRAULIC SUMMARY & BoQ               */}
            {/* ============================================= */}
            <div className="h-[290mm] flex flex-col relative page-break-after-always">

                <ReportHeader
                    companyLogo={companyLogo}
                    projectName={projectName}
                    engineerName={engineerName}
                    dateStr={dateStr}
                />

                <h2 className="text-xl font-bold uppercase text-center mb-6 border-b-2 border-black pb-2 mt-4">
                    RAPORT FINAL: VOLUMETRIE & MATERIALE
                </h2>

                {/* 1. INPUT SUMMARY */}
                <section className="mb-8 border border-black p-4 bg-gray-50">
                    <h3 className="font-bold border-b border-black mb-2 pb-1 uppercase text-sm">Ipoteze de Calcul</h3>
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <ul className="list-disc list-inside space-y-1">
                            <li><span className="font-bold">Fluid:</span> Glicol Premix {glycolPercentage}%</li>
                            <li><span className="font-bold">Marjă Siguranță:</span> {safetyMargin ? "Activat (+5%)" : "Inactiv (0%)"}</li>
                        </ul>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase">Volum Total Sistem</div>
                            <div className="text-3xl font-bold">{totalSystemVolume.toFixed(2)} Litri</div>
                        </div>
                    </div>
                </section>

                {/* 2. BoQ TABLE */}
                <section className="mb-4 flex-1">
                    <h3 className="font-bold uppercase text-lg mb-2">1. Centralizator Materiale (BoQ)</h3>
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border border-black px-2 py-1 text-left w-8">#</th>
                                <th className="border border-black px-2 py-1 text-left">Descriere Material</th>
                                <th className="border border-black px-2 py-1 text-center">Standard</th>
                                <th className="border border-black px-2 py-1 text-center">Diametru</th>
                                <th className="border border-black px-2 py-1 text-right">Cantitate (m)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {boqItems.map((item, idx) => (
                                <tr key={item.id} className="even:bg-gray-50">
                                    <td className="border border-black px-2 py-1 text-center">{idx + 1}</td>
                                    <td className="border border-black px-2 py-1 font-bold">{item.materialName}</td>
                                    <td className="border border-black px-2 py-1 text-center">{item.standardName}</td>
                                    <td className="border border-black px-2 py-1 text-center">{item.size}</td>
                                    <td className="border border-black px-2 py-1 text-right">{item.totalLength.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* SIGNATURES AREA (Bottom of Page 1) */}
                <div className="mt-auto pb-4">
                    <div className="grid grid-cols-3 gap-8 text-xs mb-8">
                        <div className="border-t border-black pt-2">
                            <p className="font-bold uppercase">Întocmit,</p>
                            <p>{engineerName || 'Nume Inginer'}</p>
                        </div>
                        <div className="border-t border-black pt-2">
                            <p className="font-bold uppercase">Verificat,</p>
                        </div>
                        <div className="border-t border-black pt-2">
                            <p className="font-bold uppercase">Aprobat,</p>
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 border-t border-gray-300 pt-1">
                        <span>Raport generat automat - Pagina 1/3</span>
                        <span>Engineering Suite: Hydraulic Calc</span>
                    </div>
                </div>
            </div>


            {/* ============================================= */}
            {/* PAGE 2: WEIGHT REPORT                         */}
            {/* ============================================= */}
            <div className="h-[290mm] flex flex-col relative page-break-after-always break-before-page">
                <ReportHeader
                    companyLogo={companyLogo}
                    projectName={projectName}
                    engineerName={engineerName}
                    dateStr={dateStr}
                    simple
                />

                <h2 className="text-xl font-bold uppercase text-center mb-6 border-b border-black pb-2 mt-4">
                    ANEXA 1: RAPORT DETALIAT SARCINI
                </h2>

                <div className="mb-4 text-xs italic text-gray-600 border px-2 py-1 bg-gray-50">
                    * Notă: Greutățile "Fluid" sunt calculate la o densitate estimată de 1.05 kg/L (Mix Glicol). Greutățile "Goale" pentru țevi standard sunt conform ASTM/DIN.
                </div>

                <table className="w-full border-collapse border border-black text-xs">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="border border-black px-2 py-2 text-left">Descriere Element</th>
                            <th className="border border-black px-2 py-2 text-center">Cantitate</th>
                            <th className="border border-black px-2 py-2 text-right">Greutate Goală (kg)</th>
                            <th className="border border-black px-2 py-2 text-right bg-blue-900">Greutate Fluid (kg)</th>
                            <th className="border border-black px-2 py-2 text-right font-bold w-24">TOTAL (kg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detailedWeights.map((row) => (
                            <tr key={row.id} className="even:bg-gray-100 border-b border-gray-300">
                                <td className="border border-black px-2 py-1 border-r">{row.description}</td>
                                <td className="border border-black px-2 py-1 text-center border-r">{row.quantity}</td>
                                <td className="border border-black px-2 py-1 text-right border-r">{row.emptyWeight > 0 ? row.emptyWeight.toFixed(2) : '-'}</td>
                                <td className="border border-black px-2 py-1 text-right border-r bg-blue-50/50">{row.fluidWeight.toFixed(2)}</td>
                                <td className="border border-black px-2 py-1 text-right font-bold">{row.totalWeight.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-200 border-t-2 border-black font-bold text-sm">
                        <tr>
                            <td colSpan={2} className="border border-black px-2 py-2 text-right uppercase">Total General:</td>
                            <td className="border border-black px-2 py-2 text-right">
                                {detailedWeights.reduce((s, i) => s + i.emptyWeight, 0).toFixed(2)}
                            </td>
                            <td className="border border-black px-2 py-2 text-right">
                                {detailedWeights.reduce((s, i) => s + i.fluidWeight, 0).toFixed(2)}
                            </td>
                            <td className="border border-black px-2 py-2 text-right text-base bg-yellow-100">
                                {totalWeightSum.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mt-auto pb-4">
                    <div className="flex justify-between text-[10px] text-gray-500 border-t border-gray-300 pt-1">
                        <span>Raport generat automat - Pagina 2/3</span>
                        <span>Engineering Suite: Hydraulic Calc</span>
                    </div>
                </div>
            </div>


            {/* ============================================= */}
            {/* PAGE 3: PHOTOS & DATASHEETS                   */}
            {/* ============================================= */}
            <div className="h-[290mm] flex flex-col relative break-before-page">
                <ReportHeader
                    companyLogo={companyLogo}
                    projectName={projectName}
                    engineerName={engineerName}
                    dateStr={dateStr}
                    simple
                />

                <h2 className="text-xl font-bold uppercase text-center mb-6 border-b border-black pb-2 mt-4">
                    ANEXA 2: SPECIFICAȚII TEHNICE (FOTO)
                </h2>

                <div className="grid grid-cols-1 gap-8 flex-1 content-start">
                    {equipmentList.filter(i => i.proofImage).length === 0 && (
                        <p className="text-center text-gray-500 italic mt-12">Nu au fost atașate documente sau imagini tehnice.</p>
                    )}

                    {equipmentList.filter(i => i.proofImage).map((item, idx) => (
                        <div key={item.id} className="border border-black p-4 break-inside-avoid shadow-none">
                            <div className="font-bold border-b border-black mb-2 pb-1 text-sm bg-gray-100 p-1 flex justify-between">
                                <span>{idx + 1}. {item.type}</span>
                                <span>{item.name}</span>
                            </div>
                            <div className="flex justify-center h-[90mm]">
                                <img src={item.proofImage} className="max-h-full max-w-full object-contain" alt="Technical Proof" />
                            </div>
                            <div className="mt-2 text-[10px] text-gray-600 text-center">
                                Datasheet ID: {item.id.split('-')[0]} | Volume: {item.volume}L | Weight: {item.weight}kg
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pb-4">
                    <div className="flex justify-between text-[10px] text-gray-500 border-t border-gray-300 pt-1">
                        <span>Raport generat automat - Pagina 3/3</span>
                        <span>Engineering Suite: Hydraulic Calc</span>
                    </div>
                </div>
            </div>

        </div>
    );
};
