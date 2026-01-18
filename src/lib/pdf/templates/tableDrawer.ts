import { PDFPage, PDFFont, RGB } from 'pdf-lib';
import { PDFContext } from './SectionGenerator';

interface TableOptions {
    x: number;
    headers: string[];
    rows: string[][];
    colWidths: number[];
    rowHeight?: number;
    align?: ('left' | 'center' | 'right')[];
    showBorders?: boolean;
    stripeColors?: (RGB | undefined)[];
}

export const drawTable = async (
    ctx: PDFContext,
    options: TableOptions
): Promise<number> => {
    const { currentPage: page, theme, fontRegular, fontBold } = ctx;
    const { x, headers, rows, colWidths, rowHeight = 25, align = [], showBorders = true } = options;

    const tableWidth = colWidths.reduce((acc, w) => acc + w, 0);

    // Helper: Wrap Text
    const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number): string[] => {
        if (!text) return [''];
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = font.widthOfTextAtSize(currentLine + " " + word, size);
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    // Helper: Draw Text with Alignment
    const drawCellText = (p: PDFPage, text: string, xPos: number, yPos: number, width: number, font: PDFFont, color: RGB, alignment: string) => {
        const textWidth = font.widthOfTextAtSize(text, 8);
        let finalX = xPos + 8;
        if (alignment === 'center') finalX = xPos + (width / 2) - (textWidth / 2);
        else if (alignment === 'right') finalX = xPos + width - textWidth - 8;

        p.drawText(text, { x: finalX, y: yPos, size: 8, font, color });
    };

    // --- 1. Draw Headers ---
    await ctx.checkSpace(rowHeight + 10);
    let startY = ctx.currentY;

    page.drawRectangle({
        x,
        y: startY - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: showBorders ? theme.primary : theme.bgLight,
    });

    let currentX = x;
    headers.forEach((header, i) => {
        const colWidth = colWidths[i];
        const alignment = align[i] || 'left';

        drawCellText(page, header, currentX, startY - (rowHeight / 2) - 4, colWidth, fontBold, showBorders ? theme.white : theme.text, alignment);

        if (showBorders) {
            page.drawLine({
                start: { x: currentX, y: startY },
                end: { x: currentX, y: startY - rowHeight },
                thickness: 0.5,
                color: theme.border
            });
        }
        currentX += colWidth;
    });

    if (showBorders) {
        page.drawLine({ start: { x: x + tableWidth, y: startY }, end: { x: x + tableWidth, y: startY - rowHeight }, thickness: 0.5, color: theme.border });
        page.drawLine({ start: { x, y: startY }, end: { x: x + tableWidth, y: startY }, thickness: 0.5, color: theme.border });
        page.drawLine({ start: { x, y: startY - rowHeight }, end: { x: x + tableWidth, y: startY - rowHeight }, thickness: 0.5, color: theme.border });
    }

    ctx.currentY = startY - rowHeight;

    // --- 2. Draw Rows ---
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const wrappedRows = row.map((cell, idx) => wrapText(cell?.toString() || '', fontRegular, 8, colWidths[idx] - 16));
        const maxLines = Math.max(...wrappedRows.map(l => l.length));
        const actualRowHeight = Math.max(rowHeight, maxLines * 11 + 10);

        await ctx.checkSpace(actualRowHeight);
        startY = ctx.currentY;

        // Striping / Custom Colors
        const customColor = options.stripeColors?.[rowIndex];
        if (customColor) {
            page.drawRectangle({
                x,
                y: startY - actualRowHeight,
                width: tableWidth,
                height: actualRowHeight,
                color: customColor
            });
        } else if (!showBorders && rowIndex % 2 === 1) {
            page.drawRectangle({ x, y: startY - actualRowHeight, width: tableWidth, height: actualRowHeight, color: theme.bgLight });
        }

        currentX = x;
        row.forEach((cell, i) => {
            const colWidth = colWidths[i];
            const alignment = align[i] || 'left';
            const lines = wrappedRows[i];

            lines.forEach((line, lineIdx) => {
                drawCellText(ctx.currentPage, line, currentX, startY - 16 - (lineIdx * 11), colWidth, fontRegular, theme.text, alignment);
            });

            if (showBorders) {
                ctx.currentPage.drawLine({
                    start: { x: currentX, y: startY },
                    end: { x: currentX, y: startY - actualRowHeight },
                    thickness: 0.5,
                    color: theme.border
                });
            }
            currentX += colWidth;
        });

        if (showBorders) {
            ctx.currentPage.drawLine({ start: { x: x + tableWidth, y: startY }, end: { x: x + tableWidth, y: startY - actualRowHeight }, thickness: 0.5, color: theme.border });
            ctx.currentPage.drawLine({ start: { x, y: startY - actualRowHeight }, end: { x: x + tableWidth, y: startY - actualRowHeight }, thickness: 0.5, color: theme.border });
        } else {
            ctx.currentPage.drawLine({ start: { x, y: startY - actualRowHeight }, end: { x: x + tableWidth, y: startY - actualRowHeight }, thickness: 0.3, color: theme.border });
        }

        ctx.currentY = startY - actualRowHeight;
    }

    return ctx.currentY;
};
