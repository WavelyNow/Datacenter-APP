import { PdfData } from '../types';
import { drawTable } from '@/lib/pdf/templates/tableDrawer';
import { calculateSystemResources } from '@/lib/calc/resources';
import { PDFContext } from './SectionGenerator';

export async function generatePage1(
    ctx: PDFContext,
    data: PdfData
) {
    const { width, theme } = ctx;

    // Title: "RAPORT FINAL: VOLUMETRIE & MATERIALE"
    const title = 'RAPORT FINAL: VOLUMETRIE & MATERIALE';
    const titleSize = 18;
    const titleWidth = ctx.fontBold.widthOfTextAtSize(title, titleSize);

    // 1. Title Page Block (Centered)
    ctx.currentPage.drawText(title, {
        x: (width - titleWidth) / 2,
        y: ctx.currentY,
        size: titleSize,
        font: ctx.fontBold,
        color: theme.primary,
    });

    ctx.currentY -= 30;

    const subTitle = `Nume Proiect: ${data.projectDetails.projectName}`;
    const subTitleWidth = ctx.fontBold.widthOfTextAtSize(subTitle, 12);
    ctx.currentPage.drawText(subTitle, {
        x: (width - subTitleWidth) / 2,
        y: ctx.currentY,
        size: 12,
        font: ctx.fontBold,
        color: theme.text,
    });

    ctx.currentY -= 20;

    const detailsText = `Proiectant: ${data.projectDetails.designer} | Beneficiar: ${data.projectDetails.beneficiary} | Locație: ${data.projectDetails.location}`;
    const detailsWidth = ctx.fontRegular.widthOfTextAtSize(detailsText, 10);
    ctx.currentPage.drawText(detailsText, {
        x: (width - detailsWidth) / 2,
        y: ctx.currentY,
        size: 10,
        font: ctx.fontRegular,
        color: theme.textLight,
    });

    ctx.currentY -= 15;

    const statusText = `Status: Revizia ${data.projectDetails.revision || 'A'} | Data Emiterii: ${new Date().toLocaleDateString('ro-RO')}`;
    const statusWidth = ctx.fontRegular.widthOfTextAtSize(statusText, 10);
    ctx.currentPage.drawText(statusText, {
        x: (width - statusWidth) / 2,
        y: ctx.currentY,
        size: 10,
        font: ctx.fontRegular,
        color: theme.textLight,
    });

    ctx.currentY -= 60; // Space before next section

    // 2. Specificații Tehnice Fluid Table
    if (data.options?.includeVolume !== false) {
        await ctx.checkSpace(160);

        // Header for Fluid Specs
        ctx.currentPage.drawText('SPECIFICAȚII TEHNICE FLUID', {
            x: 50,
            y: ctx.currentY,
            size: 12,
            font: ctx.fontBold,
            color: theme.primary,
        });
        ctx.currentY -= 25;

        // Use centralized logic
        const resources = calculateSystemResources(
            data.segments,
            data.equipmentList,
            data.glycolPercentage,
            { enabled: data.safetyMargin, percentage: data.safetyMarginPercentage ?? 5 }
        );

        const fluidLabel = data.fluidType === 'propylene'
            ? `Soluție Propilen Glycol ${data.glycolPercentage}%`
            : `Soluție Etilen Glycol ${data.glycolPercentage}%`;

        // Table Data - Purchasing Breakdown
        const fluidHeaders = ['COMPONENTĂ SISTEM', 'MEDIU', 'VOLUM NET', 'FACTOR', 'TOTAL SOLUȚIE'];

        // Rows
        const fluidRows = [
            // Piping Row
            [
                'Rețea de Distribuție (Țevi)',
                'Apă + Glycol',
                `${resources.totalPipingVolume.toFixed(0)} L`,
                '1.0',
                `${resources.totalPipingVolume.toFixed(0)} L`
            ],
            // Equipment Row
            [
                'Echipamente Interne/Externe',
                'Apă + Glycol',
                `${resources.totalEquipmentVolume.toFixed(0)} L`,
                '1.0',
                `${resources.totalEquipmentVolume.toFixed(0)} L`
            ],
            // Safety Row
            [
                'Rezervă de Siguranță / Tehnologică',
                'Apă + Glycol',
                `${resources.baseSystemVolume.toFixed(0)} L`,
                `${resources.safetyMarginStats.percentage}%`,
                `${resources.safetyMarginVolume.toFixed(0)} L`
            ],
            // Total Row
            [
                'TOTAL GENERAL DE ACHIZIȚIE',
                fluidLabel,
                '-',
                '-',
                `${resources.totalSystemVolume.toFixed(0)} Litri`
            ]
        ];

        ctx.currentY = await drawTable(ctx, {
            x: 50,
            headers: fluidHeaders,
            rows: fluidRows,
            colWidths: [180, 100, 80, 60, 90],
            align: ['left', 'center', 'right', 'center', 'right'],
            stripeColors: [undefined, undefined, undefined, theme.bgLight] // Highlight Total row effectively
        });

        // Summary Box for Procurement
        ctx.currentY -= 15;
        const noteBoxY = ctx.currentY;

        // Background for summary
        ctx.currentPage.drawRectangle({
            x: 50,
            y: noteBoxY - 40,
            width: width - 100,
            height: 40,
            color: theme.primary,
            opacity: 0.1
        });

        ctx.currentPage.drawRectangle({
            x: 50,
            y: noteBoxY - 40,
            width: 4,
            height: 40,
            color: theme.primary
        });

        const procurementText = `CANTITATE FINALĂ:  ${resources.totalSystemVolume.toFixed(0)} Litri de ${fluidLabel} (Premix)`;

        ctx.currentPage.drawText(procurementText, {
            x: 65,
            y: noteBoxY - 20,
            size: 11,
            font: ctx.fontBold,
            color: theme.primary
        });

        ctx.currentPage.drawText('(Volum Net Sistem + Echipamente + Rezervă Siguranță)', {
            x: 65,
            y: noteBoxY - 32,
            size: 8,
            font: ctx.fontRegular,
            color: theme.textLight
        });

        ctx.currentY -= 60;
    }
    // underline and redundant project info removed per user request

    ctx.currentY -= 45;

    // --- SECTION 2: BILL OF QUANTITIES (BoQ) ---
    if (data.options?.includeBoQ !== false) {
        await ctx.checkSpace(150);

        // Futurist Section Header
        ctx.currentPage.drawText('CENTRALIZATOR MATERIALE (BoQ)', {
            x: 50,
            y: ctx.currentY,
            size: 12,
            font: ctx.fontBold,
            color: theme.text,
        });
        ctx.currentY -= 25;

        const materialSummary: Record<string, { desc: string, length: number }> = {};
        data.segments.forEach(seg => {
            if (!seg) return;
            const key = `${seg.material}-${seg.size}`;
            if (!materialSummary[key]) {
                let matName = seg.material;
                if (seg.material === 'steel_light') matName = 'Oțel (Serie Ușoară)';
                else if (seg.material === 'steel_heavy') matName = 'Oțel (Serie Grea)';
                else if (seg.material === 'stainless_304') matName = 'Inox 304';
                else if (seg.material === 'ppr_pn20') matName = 'PPR (PN20)';

                materialSummary[key] = {
                    desc: `Țeavă ${matName} - ${seg.size}`,
                    length: 0
                };
            }
            materialSummary[key].length += seg.length;
        });

        const tableData = Object.values(materialSummary).map((item, idx) => [
            (idx + 1).toString(),
            item.desc,
            `${item.length.toFixed(2)} m`
        ]);

        if (tableData.length > 0) {
            ctx.currentY = await drawTable(ctx, {
                x: 50,
                headers: ['NR.', 'DESCRIERE MATERIAL', 'CANTITATE'],
                rows: tableData,
                colWidths: [40, 360, 110], // NR, Item, Qty
                align: ['center', 'left', 'right']
            });
        } else {
            ctx.currentPage.drawText('Nu există date.', { x: 50, y: ctx.currentY, size: 10, font: ctx.fontRegular });
            ctx.currentY -= 20;
        }
    }
}
