import { PdfData } from '../types';
import { calculatePurchaseSummary } from '../../calculations/purchase';
import { PDFContext } from './SectionGenerator';
import { drawTable } from './tableDrawer';
import { beginSection } from './common';
import { sanitizePdfText } from '../utils';

/**
 * PAGINA 1 — DATE SITE & PROIECT
 */
export async function generateSitePage(ctx: PDFContext, data: PdfData) {
    const { width, theme, fontBold, fontRegular, currentPage } = ctx;
    const pd = data.projectDetails;
    const M = 50;
    const colW = width - M * 2;

    await beginSection(ctx, 'RAPORT DE COMANDA');

    // Nume proiect (trunchiat cu grija — fără depășire)
    const projectName = sanitizePdfText(pd.projectName || 'Proiect');
    const maxNameW = colW - 20;
    let name = projectName;
    while (fontBold.widthOfTextAtSize(name, 19) > maxNameW && name.length > 6) name = name.slice(0, -1);
    if (name !== projectName) name += '...';
    currentPage.drawText(name, { x: M, y: ctx.currentY, size: 19, font: fontBold, color: theme.text });
    ctx.currentY -= 26;

    // Subtitlu
    currentPage.drawText(
        `Site datacenter  ·  ${sanitizePdfText(pd.location || '-')}  ·  ${sanitizePdfText(pd.date || '-')}`,
        { x: M, y: ctx.currentY, size: 10, font: fontRegular, color: theme.textLight }
    );
    ctx.currentY -= 30;

    const drawGroup = async (label: string, rows: [string, string][]) => {
        await ctx.checkSpace(70);
        currentPage.drawText(label.toUpperCase(), { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
        ctx.currentY -= 15;
        await drawTable(ctx, {
            x: M,
            headers: ['', ''],
            rows: rows.map(r => [sanitizePdfText(r[0]), sanitizePdfText(r[1])]),
            colWidths: [colW * 0.42, colW * 0.58],
            rowHeight: 21,
            showBorders: false,
        });
        ctx.currentY -= 12;
    };

    await drawGroup('Proiect', [
        ['Nr. proiect', pd.projectNumber || '-'],
        ['Proiectant', pd.designer || '-'],
        ['Beneficiar', pd.beneficiary || '-'],
        ['Revizie', pd.revision || '-'],
    ]);

    const purchase = calculatePurchaseSummary(
        data.segments, data.equipmentList, data.glycolPercentage,
        (data.fluidType as 'ethylene' | 'propylene' | 'water') || 'ethylene',
        data.safetyMargin, data.safetyMarginPercentage ?? 5, data.fittingItems ?? []
    );
    await drawGroup('Fluid de lucru', [
        ['Tip fluid', data.fluidType === 'ethylene' ? 'Etilen Glicol' : data.fluidType === 'propylene' ? 'Propilen Glicol' : 'Apa pura'],
        ['Concentratie', `${data.glycolPercentage} % vol`],
        ['Marja de siguranta (configurata de utilizator)', purchase.marginPercent > 0 ? `${purchase.marginPercent} %` : '0 % (dezactivata)'],
    ]);

    await ctx.checkSpace(30);
    currentPage.drawText(
        'Cantitatile sunt calculate automat: volum teava di interior real + volum fittinguri din numarul introdus + apa echipamente, apoi marja de siguranta.',
        { x: M, y: ctx.currentY, size: 8.5, font: fontRegular, color: theme.textLight }
    );
    ctx.currentY -= 18;
}
