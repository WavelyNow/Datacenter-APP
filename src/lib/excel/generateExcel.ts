import * as XLSX from 'xlsx';
import { ProjectDetails, PipeSegment, EquipmentItem, SupportConfig } from '@/lib/types';
import { calculatePipeVolume } from '@/lib/calculations';

interface ExcelExportData {
    projectDetails: ProjectDetails;
    segments: PipeSegment[];
    equipmentList: EquipmentItem[];
    fluidType: string;
    glycolPercentage: number;
    supportConfig: SupportConfig;
}

export const generateExcelReport = (data: ExcelExportData) => {
    const wb = XLSX.utils.book_new();

    // --- SHEET 1: SUMAR PROIECT ---
    const summaryData = [
        ['Datacenter Engineering Suite - Raport Tehnic'],
        [''],
        ['DETALII PROIECT'],
        ['Nume Proiect', data.projectDetails.projectName],
        ['Număr Proiect', data.projectDetails.projectNumber],
        ['Beneficiar', data.projectDetails.beneficiary || '-'],
        ['Locație', data.projectDetails.location],
        ['Proiectant', data.projectDetails.designer],
        ['Data', new Date().toLocaleDateString('ro-RO')],
        [''],
        ['SPECIFICAȚII SISTEM'],
        ['Tip Fluid', data.fluidType === 'ethylene' ? 'Etilen Glicol' : data.fluidType === 'propylene' ? 'Propilen Glicol' : 'Apă'],
        ['Concentrație Glicol', `${data.glycolPercentage}%`],
    ];

    const pipesVolume = data.segments.reduce((sum, seg) => sum + (seg ? (calculatePipeVolume(seg) || 0) : 0), 0);
    const equipmentVolume = data.equipmentList.reduce((sum, item) => sum + (item.volume || 0), 0);
    const totalVolumeNet = pipesVolume + equipmentVolume;
    const totalVolumeGross = totalVolumeNet * 1.05;

    summaryData.push(
        [''],
        ['CALCUL VOLUM'],
        ['Volum Țevi', `${pipesVolume.toFixed(2)} L`],
        ['Volum Echipamente', `${equipmentVolume.toFixed(2)} L`],
        ['Volum Total Net', `${totalVolumeNet.toFixed(2)} L`],
        ['Volum Total (+5% Siguranță)', `${totalVolumeGross.toFixed(2)} L`],
        [''],
        ['NECESAR GLICOL (Pur)'],
        ['Volum Glicol', `${(totalVolumeGross * (data.glycolPercentage / 100)).toFixed(2)} L`]
    );

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Sumar & Volume");

    // --- SHEET 2: LISTA CANITATI (BoQ) ---
    // Group pipes by size/type
    const groupedPipes = data.segments.reduce((acc, seg) => {
        const key = `${seg.material} - ${seg.size}`;
        if (!acc[key]) {
            acc[key] = { material: seg.material, size: seg.size, length: 0 };
        }
        acc[key].length += seg.length;
        return acc;
    }, {} as Record<string, { material: string, size: string, length: number }>);

    const boqData = [
        ['Material', 'Dimensiune', 'Cantitate Netă (m)', 'Cantitate (+10% Rezervă) (m)'],
        ...Object.values(groupedPipes).map(p => [
            p.material.toUpperCase(),
            p.size,
            p.length.toFixed(2),
            (p.length * 1.1).toFixed(2)
        ])
    ];

    const wsBoq = XLSX.utils.aoa_to_sheet(boqData);
    XLSX.utils.book_append_sheet(wb, wsBoq, "Lista Cantitati (BoQ)");

    // --- SHEET 3: ECHIPAMENTE ---
    const eqData = [
        ['Tip', 'Model / Nume', 'Volum (L)', 'Greutate (kg)'],
        ...data.equipmentList.map(eq => [
            eq.type,
            eq.name,
            eq.volume,
            eq.weight
        ])
    ];
    const wsEq = XLSX.utils.aoa_to_sheet(eqData);
    XLSX.utils.book_append_sheet(wb, wsEq, "Echipamente");

    // --- SHEET 4: SUPORTI ---
    const supData = [
        ['CONFIGURATIE SUPORTI'],
        ['Tip Montaj', data.supportConfig.mountingType === 'concrete' ? 'Pardoseală Beton' : 'Suspendat (Tavan)'],
        ['Înălțime Montaj', `${data.supportConfig.height} m`],
        ['Distanță între suporți', `${data.supportConfig.spacing} m`],
        ['Brate Console', data.supportConfig.addLeftConsole || data.supportConfig.addRightConsole ? 'DA' : 'NU']
    ];
    const wsSup = XLSX.utils.aoa_to_sheet(supData);
    XLSX.utils.book_append_sheet(wb, wsSup, "Configuratie Suporti");

    // Export
    XLSX.writeFile(wb, `Raport_${data.projectDetails.projectName.replace(/\s+/g, '_')}.xlsx`);
};
