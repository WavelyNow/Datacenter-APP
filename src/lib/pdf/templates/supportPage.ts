import { PdfData } from '../types';
import { drawTable } from '@/lib/pdf/templates/tableDrawer';
import { calculateSupportReport } from '../../calculations';
import { PDFContext } from './SectionGenerator';

export async function generateSupportPage(
    ctx: PDFContext,
    data: PdfData
) {
    const { theme } = ctx;

    await ctx.checkSpace(150);

    // Smart Padding
    if (ctx.currentY < ctx.height - 100) {
        ctx.currentY -= 40;
    }

    // Section Header 5
    ctx.currentPage.drawText('5. DETALII SUPORȚI & PRINDERI', {
        x: 50,
        y: ctx.currentY,
        size: 12,
        font: ctx.fontBold,
        color: theme.primary,
    });

    ctx.currentY -= 25;

    // Description with spacing variable
    const spacing = data.supportConfig.spacing;
    ctx.currentPage.drawText(`Configurație: ${data.supportConfig.pipesPerSupport} ${data.supportConfig.pipesPerSupport === 1 ? 'țeavă' : 'țevi'} per suport, pas ${spacing}m.`, {
        x: 50,
        y: ctx.currentY,
        size: 9,
        font: ctx.fontRegular,
        color: theme.textLight
    });

    ctx.currentY -= 35;

    // Use supportConfig from data
    const config = data.supportConfig;
    const supportReport = calculateSupportReport(data.segments, data.glycolPercentage, config);

    if (!supportReport || supportReport.length === 0) {
        ctx.currentPage.drawText('Nu există date.', { x: 50, y: ctx.currentY, size: 10, font: ctx.fontRegular });
        ctx.currentY -= 20;
        return;
    }

    const tableData = supportReport.map(item => [
        item.description,
        `${item.pipesPerSupport} / Sup.`,
        item.loadPerPoint.toFixed(1),
        item.anchorReaction.toFixed(1),
        item.recommendedProfile?.name || 'N/A',
        `${item.mountingType === 'concrete' ? 'Beton' : 'Susp.'} (${config.height}m)`
    ]);

    const headers = ['SEGMENT', 'ȚEVI/SUP.', 'SARCINĂ (KG)', 'ANCORĂ (KG)', 'PROFIL', 'MONTAJ'];

    // Draw Table
    ctx.currentY = await drawTable(ctx, {
        x: 50,
        headers: headers,
        rows: tableData,
        colWidths: [150, 60, 80, 80, 80, 100],
        rowHeight: 30,
        align: ['left', 'center', 'right', 'right', 'center', 'left']
    });
}
