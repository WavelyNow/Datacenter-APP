import ExcelJS from 'exceljs';
import { ProjectDetails, PipeSegment, EquipmentItem, SupportConfig } from '@/lib/types';
import { calculatePurchaseSummary } from '@/lib/calculations/purchase';

interface ExcelExportData {
    projectDetails: ProjectDetails;
    segments: PipeSegment[];
    equipmentList: EquipmentItem[];
    fluidType: string;
    glycolPercentage: number;
    safetyMargin?: boolean;
    safetyMarginPercentage?: number;
    fittingItems?: { id: string; type: string; size: string; quantity: number; description?: string }[];
    supportConfig: SupportConfig;
    branding: {
        primaryColor: string;
        accentColor: string;
    };
}

export const generateExcelReport = async (data: ExcelExportData) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Suita de inginerie Datacenter';
    workbook.lastModifiedBy = data.projectDetails.designer;
    workbook.created = new Date();
    workbook.modified = new Date();

    // Premium "Apple-esque" Palette
    const palette = {
        text: 'FF1D1D1F',        // Nearly Black (Apple standard text)
        secondary: 'FF86868B',   // Apple gray for secondary text
        border: 'FFE5E5EA',      // Very subtle gray for dividers
        accent: 'FF0066CC',      // Clean Blue (Classic iOS blue)
        bg: 'FFFFFFFF',          // Pure White
        headerBg: 'FFF5F5F7'     // Very light gray for headers (optional, mostly using white)
    };

    const baseFont = { name: 'Arial', size: 10, color: { argb: palette.text } };
    const titleFont = { name: 'Arial', size: 20, bold: true, color: { argb: palette.text } };

    // Helper to init standard sheet
    const initSheet = (name: string) => {
        const ws = workbook.addWorksheet(name, {
            views: [{ showGridLines: false, zoomScale: 115 }] // Zoomed in slightly for readability, no grid
        });
        return ws;
    };

    // Helper for "Apple Style" Table Headers
    // Minimalist: No background, just a clean bottom border, uppercase text
    const styleTable = (ws: ExcelJS.Worksheet, startRow: number, columns: string[], dataRows: (string | number | undefined)[][]) => {
        const headerRow = ws.getRow(startRow);

        columns.forEach((col, idx) => {
            const cell = headerRow.getCell(idx + 2); // Start col B
            cell.value = col.toUpperCase();
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: palette.secondary } };
            cell.border = { bottom: { style: 'medium', color: { argb: palette.border } } }; // Slightly thicker bottom border
            cell.alignment = { vertical: 'bottom', horizontal: 'left' };
        });

        // Data Row Styles
        dataRows.forEach((rowData, rIdx) => {
            const currentRow = ws.getRow(startRow + 1 + rIdx);
            rowData.forEach((val, cIdx) => {
                const cell = currentRow.getCell(cIdx + 2);
                cell.value = val;
                cell.font = baseFont;
                cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

                // Very subtle bottom border for each row (except last)
                cell.border = { bottom: { style: 'thin', color: { argb: palette.border } } };
            });
            currentRow.height = 30; // Generous height for touch/readability
        });

        return startRow + dataRows.length + 2;
    };

    // --- SHEET 1: PROJECT OVERVIEW (Minimalist Dashboard) ---
    const wsSummary = initSheet('Sumar');

    // Title Area (Huge, Clean)
    wsSummary.mergeCells('B3:F3');
    const title = wsSummary.getCell('B3');
    title.value = data.projectDetails.projectName;
    title.font = titleFont;
    title.alignment = { horizontal: 'left' };

    wsSummary.mergeCells('B4:F4');
    const subTitle = wsSummary.getCell('B4');
    subTitle.value = `Raport tehnic. Generat la ${new Date().toLocaleDateString('ro-RO')}`;
    subTitle.font = { name: 'Arial', size: 10, color: { argb: palette.secondary } };

    // Spacer

    // Key Metrics Grid (Simulated Cards)
    const drawMetric = (row: number, col: number, label: string, value: string, unit: string) => {
        // Label
        const cellLbl = wsSummary.getCell(row, col);
        cellLbl.value = label.toUpperCase();
        cellLbl.font = { name: 'Arial', size: 8, bold: true, color: { argb: palette.secondary } };
        cellLbl.alignment = { horizontal: 'left' };

        // Value
        const cellVal = wsSummary.getCell(row + 1, col);
        cellVal.value = value;
        cellVal.font = { name: 'Arial', size: 18, bold: false, color: { argb: palette.text } };
        cellVal.alignment = { horizontal: 'left' };

        // Unit
        const cellUnit = wsSummary.getCell(row + 1, col + 1); // rough placement
        cellUnit.value = unit;
        cellUnit.font = { name: 'Arial', size: 10, color: { argb: palette.secondary } };
        cellUnit.alignment = { vertical: 'bottom', horizontal: 'left' };
    };

    // Calc Volumes — sumarul de comandă (aceleași cifre ca în PDF/Dashboard)
    const purchase = calculatePurchaseSummary(
        data.segments,
        data.equipmentList,
        data.glycolPercentage,
        (data.fluidType as 'ethylene' | 'propylene' | 'water') || 'ethylene',
        data.safetyMargin ?? false,
        data.safetyMarginPercentage ?? 5,
        data.fittingItems ?? []
    );
    const marginPct = purchase.marginPercent; // clampat 0-20 (acelasi ca PDF)
    const totalVolumeGross = purchase.rawTotalL;
    const glycol = purchase.totalGlycolL;

    // Row 7: Metrics Row 1
    drawMetric(7, 2, 'Volum total sistem', totalVolumeGross.toFixed(0), 'litri');
    drawMetric(7, 5, 'Glicol necesar', glycol.toFixed(0), 'litri');

    // Row 10: Metrics Row 2
    const fluidName = data.fluidType === 'ethylene' ? 'Etilen glicol' : data.fluidType === 'water' ? 'Apă pură' : 'Propilen glicol';
    drawMetric(10, 2, 'Tip fluid', fluidName, '');
    drawMetric(10, 5, 'Concentrație', `${data.glycolPercentage}%`, '');

    // Separator Line
    wsSummary.mergeCells('B13:F13');
    wsSummary.getCell('B13').border = { bottom: { style: 'thin', color: { argb: palette.border } } };

    // Project Details List (Clean Vertical List)
    const startDetails = 15;
    const projectInfo = [
        ['Număr proiect', data.projectDetails.projectNumber],
        ['Locație', data.projectDetails.location],
        ['Beneficiar', data.projectDetails.beneficiary || 'N/A'],
        ['Proiectant', data.projectDetails.designer],
    ];

    projectInfo.forEach((info, idx) => {
        const r = startDetails + idx;
        // Label
        const lbl = wsSummary.getCell(r, 2);
        lbl.value = info[0];
        lbl.font = { name: 'Arial', size: 10, color: { argb: palette.secondary } };

        // Value
        const val = wsSummary.getCell(r, 3);
        val.value = info[1];
        val.font = { name: 'Arial', size: 10, color: { argb: palette.text } };
        val.alignment = { horizontal: 'right' };

        // Bottom border for item
        wsSummary.getCell(r, 2).border = { bottom: { style: 'hair', color: { argb: palette.border } } };
        wsSummary.getCell(r, 3).border = { bottom: { style: 'hair', color: { argb: palette.border } } };
        wsSummary.getRow(r).height = 25;
    });

    wsSummary.getColumn(2).width = 25; // Label col
    wsSummary.getColumn(3).width = 30; // Value col
    wsSummary.getColumn(5).width = 25; // Metric 2 col


    // --- SHEET 2: BILL OF QUANTITIES ---
    const wsBoq = initSheet('Listă cantități');
    wsBoq.getColumn(2).width = 35; // Material
    wsBoq.getColumn(3).width = 15; // Size
    wsBoq.getColumn(4).width = 15; // Qty
    wsBoq.getColumn(5).width = 15; // Gross

    // Sheet Title
    const boqTitle = wsBoq.getCell('B3');
    boqTitle.value = 'Listă de materiale';
    boqTitle.font = { name: 'Arial', size: 16, bold: true, color: { argb: palette.text } };

    // Data Grouping
    const groupedPipes = data.segments.reduce((acc, seg) => {
        const key = `${seg.material}|${seg.size}`;
        if (!acc[key]) acc[key] = { material: seg.material, size: seg.size, length: 0 };
        acc[key].length += seg.length;
        return acc;
    }, {} as Record<string, { material: string, size: string, length: number }>);

    const materialLabels: Record<string, string> = {
        steel_light: 'Oțel - seria ușoară',
        steel_medium: 'Oțel - seria medie',
        steel_heavy: 'Oțel - seria grea',
        inox_press: 'Inox pentru presare',
        copper: 'Cupru',
        ppr_pn20: 'PPR PN20',
        pehd_sdr17: 'PEHD SDR17',
        pvc_u_pn16: 'PVC-U PN16',
        uponor_pexa_sdr73: 'Uponor PE-Xa SDR7.3',
        gf_coolfit_2_0: 'GF COOL-FIT 2.0',
        gf_coolfit_4_0: 'GF COOL-FIT 4.0',
        pipelife_pe100_sdr11: 'Pipelife PE100 SDR11',
        valrom_ppr_pn20: 'Valrom PPR PN20',
    };
    const boqRows = Object.values(groupedPipes)
        .sort((a, b) => a.material.localeCompare(b.material))
        .map(p => [
            materialLabels[p.material] ?? p.material.replace(/_/g, ' '),
            p.size,
            p.length.toFixed(1) + ' m',
            (p.length * (1 + marginPct / 100)).toFixed(1) + ' m'
        ]);

    styleTable(
        wsBoq,
        5,
        ['Tip material', 'Dimensiune', 'Cantitate netă', `Cantitate brută (+${marginPct}%)`],
        boqRows
    );


    // --- SHEET 3: EQUIPMENT ---
    const wsEq = initSheet('Echipamente');
    wsEq.getColumn(2).width = 25;
    wsEq.getColumn(3).width = 35;
    wsEq.getColumn(4).width = 15;
    wsEq.getColumn(5).width = 15;

    const eqTitle = wsEq.getCell('B3');
    eqTitle.value = 'Inventar echipamente';
    eqTitle.font = { name: 'Arial', size: 16, bold: true, color: { argb: palette.text } };

    const eqRows = data.equipmentList.map(eq => [
        (() => { const t = eq.type || 'Altele'; return t.charAt(0).toUpperCase() + t.slice(1); })(),
        eq.name,
        eq.volume + ' L',
        eq.weight + ' kg'
    ]);

    styleTable(
        wsEq,
        5,
        ['Categorie', 'Referință model', 'Volum', 'Greutate'],
        eqRows
    );


    // --- SHEET 4: CONFIGURATION ---
    const wsConfig = initSheet('Configurație');
    wsConfig.getColumn(2).width = 30;
    wsConfig.getColumn(3).width = 40;

    const cfgTitle = wsConfig.getCell('B3');
    cfgTitle.value = 'Specificații suporți';
    cfgTitle.font = { name: 'Arial', size: 16, bold: true, color: { argb: palette.text } };

    const cfgRows = [
        ['Tip montaj', data.supportConfig.mountingType === 'concrete' ? 'Montaj pe pardoseală (beton)' : 'Suspendat de tavan'],
        ['Înălțime instalare', `${data.supportConfig.height} metri`],
        ['Distanță între suporți', `${data.supportConfig.spacing} metri max.`],
        ['Specificație izolație', `${data.supportConfig.insulationThickness} mm / ${data.supportConfig.insulationDensity} kg/m³`],
        ['Brațe consolă', (data.supportConfig.addLeftConsole || data.supportConfig.addRightConsole) ? 'Necesare' : 'Niciuna'],
    ];

    styleTable(
        wsConfig,
        5,
        ['Parametru', 'Specificație'],
        cfgRows
    );

    // Save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Proiect_${data.projectDetails.projectName.replace(/\s+/g, '_')}_Minimal.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
};
