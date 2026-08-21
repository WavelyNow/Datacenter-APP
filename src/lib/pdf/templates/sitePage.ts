import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { drawTable } from './tableDrawer';
import { drawSectionTitle } from './common';
import { sanitizePdfText } from '../utils';

/**
 * PAGINA 1 — DATE SITE & PROIECT
 * (site-ul de datacenter pentru care se dă comanda — minimal & premium)
 */
export async function generateSitePage(ctx: PDFContext, data: PdfData) {
    const { width, theme, fontBold, fontRegular, currentPage } = ctx;
    const pd = data.projectDetails;

    await ctx.checkSpace(340);
    const M = 50;

    // Titlu principal
    ctx.currentY = drawSectionTitle(currentPage, fontBold, M, ctx.currentY, 'RAPORT DE COMANDA', theme);

    // Nume proiect
    const projectName = sanitizePdfText(pd.projectName || 'Proiect');
    currentPage.drawText(projectName, { x: M, y: ctx.currentY, size: 19, font: fontBold, color: theme.text });
    ctx.currentY -= 28;

    // Subtitlu
    const fluidName = data.fluidType === 'ethylene' ? 'Etilen Glicol' : data.fluidType === 'propylene' ? 'Propilen Glicol' : 'Apa pura';
    currentPage.drawText(
        `Site datacenter  ·  ${sanitizePdfText(pd.location || '-')}  ·  ${sanitizePdfText(pd.date || '-')}`,
        { x: M, y: ctx.currentY, size: 10, font: fontRegular, color: theme.textLight }
    );
    ctx.currentY -= 32;

    const colW = width - M * 2;
    const drawGroup = async (label: string, rows: [string, string][]) => {
        currentPage.drawText(label.toUpperCase(), { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
        ctx.currentY -= 16;
        await drawTable(ctx, {
            x: M,
            headers: ['', ''],
            rows: rows.map(r => [sanitizePdfText(r[0]), sanitizePdfText(r[1])]),
            colWidths: [colW * 0.42, colW * 0.58],
            rowHeight: 21,
            showBorders: false,
        });
        ctx.currentY -= 14;
    };

    await drawGroup('Proiect', [
        ['Nr. proiect', pd.projectNumber || '-'],
        ['Proiectant', pd.designer || '-'],
        ['Beneficiar', pd.beneficiary || '-'],
        ['Revizie', pd.revision || '-'],
    ]);

    await drawGroup('Fluid de lucru', [
        ['Tip fluid', fluidName],
        ['Concentratie', `${data.glycolPercentage} % vol`],
        ['Marja siguranta', data.safetyMargin ? `${data.safetyMarginPercentage ?? 5} %` : '0 %'],
        ['Pierderi fittinguri (din volum teava)', `${(data.fittingsAllowancePercent ?? 5)} %`],
    ]);

    ctx.currentY -= 8;

    // Notă — discretă
    currentPage.drawText(
        'Cantitatile de mai jos (teava + glicol) sunt calculate automat din proiect, cu pierderile prin fittinguri si marja de siguranta.',
        { x: M, y: ctx.currentY, size: 8.5, font: fontRegular, color: theme.textLight }
    );
    ctx.currentY -= 18;
}
