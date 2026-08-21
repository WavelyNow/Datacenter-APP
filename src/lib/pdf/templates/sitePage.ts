import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { drawTable } from './tableDrawer';
import { sanitizePdfText } from '../utils';

/**
 * PAGINA 1 - SITE & DATE PROIECT
 * (site-ul de datacenter pentru care se da comanda)
 */
export async function generateSitePage(ctx: PDFContext, data: PdfData) {
    const { width, theme } = ctx;
    const pd = data.projectDetails;
    const S = (t: string | undefined) => sanitizePdfText(t || '—');

    await ctx.checkSpace(220);

    // Titlu
    const title = 'COMANDA - DATE SITE & PROIECT';
    const titleWidth = ctx.fontBold.widthOfTextAtSize(title, 16);
    ctx.currentPage.drawText(title, { x: (width - titleWidth) / 2, y: ctx.currentY, size: 16, font: ctx.fontBold, color: theme.primary });
    ctx.currentY -= 34;

    // Nume proiect mare
    const projectName = sanitizePdfText(pd.projectName || 'Proiect');
    const nameWidth = ctx.fontBold.widthOfTextAtSize(projectName, 20);
    ctx.currentPage.drawText(projectName, { x: (width - nameWidth) / 2, y: ctx.currentY, size: 20, font: ctx.fontBold, color: theme.text });
    ctx.currentY -= 28;

    // Info site - tabel simplu 2 coloane
    const rows: [string, string][] = [
        ['Nr. Proiect', pd.projectNumber || '-'],
        ['Proiectant', pd.designer || '-'],
        ['Beneficiar', pd.beneficiary || '-'],
        ['Locatie site datacenter', pd.location || '-'],
        ['Data', pd.date || '-'],
        ['Revizie', pd.revision || '-'],
        ['Fluid', data.fluidType === 'ethylene' ? 'Etilen Glicol' : data.fluidType === 'propylene' ? 'Propilen Glicol' : 'Apa pura'],
        ['Concentratie glicol', `${data.glycolPercentage} % vol`],
        ['Marja siguranta', data.safetyMargin ? `${data.safetyMarginPercentage ?? 5} %` : '0 %'],
    ];

    await drawTable(ctx, {
        x: 60,
                headers: ['', ''],
        rows,
        colWidths: [(width - 120) * 0.35, (width - 120) * 0.65],
        rowHeight: 24,
        showBorders: false,
    });

    ctx.currentY -= 30;

    // Nota
    const note = 'Raport de comanda - cantitatile de mai jos includ pierderile prin fittinguri si marja de siguranta.';
    ctx.currentPage.drawText(note, { x: 60, y: ctx.currentY, size: 9, font: ctx.fontRegular, color: theme.textLight });
    ctx.currentY -= 20;
}
