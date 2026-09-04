import { PDFPage, PDFFont, RGB } from 'pdf-lib';
import { PDFContext } from './SectionGenerator';
import { sanitizePdfText } from '../utils';

interface TableOptions {
    x: number;
    headers: string[];
    rows: string[][];
    colWidths: number[];
    rowHeight?: number;
    align?: ('left' | 'center' | 'right')[];
    showBorders?: boolean;
    fontSize?: number;
}

export const drawTable = async (
    ctx: PDFContext,
    options: TableOptions
): Promise<number> => {
    const { theme, fontRegular, fontBold } = ctx;
    const {
        x, headers, rows, colWidths, rowHeight = 22, align = [], showBorders = false,
        fontSize = 8.5,
    } = options;

    const safeHeaders = headers.map(h => sanitizePdfText(h));
    const safeRows = rows.map(r => r.map(c => sanitizePdfText(c)));
    const tableWidth = colWidths.reduce((acc, w) => acc + w, 0);

    const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number): string[] => {
        if (!text) return [''];
        const words = sanitizePdfText(text).split(' ');
        const lines: string[] = [];
        let currentLine = words[0] ?? '';
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

    const drawCellText = (p: PDFPage, text: string, xPos: number, yPos: number, width: number, font: PDFFont, color: RGB, alignment: string) => {
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let finalX = xPos + 6;
        if (alignment === 'center') finalX = xPos + (width / 2) - (textWidth / 2);
        else if (alignment === 'right') finalX = xPos + width - textWidth - 6;
        p.drawText(text, { x: finalX, y: yPos, size: fontSize, font, color });
    };

    // Antetul tabelului — desenat la o coordonată dată (repetat la trecerea de pagină)
    const drawHeaderAt = (p: PDFPage, y: number) => {
        p.drawRectangle({ x, y: y - rowHeight, width: tableWidth, height: rowHeight, color: theme.bgLight });
        let hx = x;
        safeHeaders.forEach((h, i) => {
            drawCellText(p, h, hx, y - (rowHeight / 2) - (fontSize / 2) - 1, colWidths[i], fontBold, theme.text, align[i] || 'left');
            hx += colWidths[i];
        });
        p.drawLine({ start: { x, y: y - rowHeight }, end: { x: x + tableWidth, y: y - rowHeight }, thickness: 0.7, color: theme.border });
    };

    // Pas 1: spațiu + antet inițial
    await ctx.checkSpace(rowHeight + 14);
    let headerY = ctx.currentY;
    let headerPage: PDFPage = ctx.currentPage;
    drawHeaderAt(headerPage, headerY);
    ctx.currentY = headerY - rowHeight;

    // Pas 2: rânduri (cu antet repetat când se trece pagina)
    for (let i = 0; i < safeRows.length; i++) {
        const row = safeRows[i];
        const wrappedRows = row.map((cell, idx) => wrapText(cell || '', fontRegular, fontSize, colWidths[idx] - 12));
        const maxLines = Math.max(...wrappedRows.map(l => l.length));
        const actualRowHeight = Math.max(rowHeight, maxLines * (fontSize + 3) + 10);

        await ctx.checkSpace(actualRowHeight + rowHeight + 14);
        // Dacă s-a întrerupt pagina, redesenăm antetul (currentPage s-a schimbat)
        if (ctx.currentPage !== headerPage) {
            headerPage = ctx.currentPage;
            headerY = ctx.currentY;
            drawHeaderAt(headerPage, headerY);
            ctx.currentY = headerY - rowHeight;
        }

        const startY = ctx.currentY;

        // Zebra subtilă
        if (i % 2 === 1 && !showBorders) {
            ctx.currentPage.drawRectangle({ x, y: startY - actualRowHeight, width: tableWidth, height: actualRowHeight, color: theme.bgLight });
        }

        let currentX = x;
        row.forEach((cell, ci) => {
            const colWidth = colWidths[ci];
            const alignment = align[ci] || 'left';
            const lines = wrappedRows[ci];
            const lineHeight = fontSize + 3;
            const blockH = lines.length * lineHeight;
            // Centrăm pe verticală block-ul de text în rând
            const firstLineY = startY - 7 - (blockH - lineHeight) / 2;
            lines.forEach((line, li) => {
                drawCellText(ctx.currentPage, line, currentX, firstLineY - li * lineHeight, colWidth, fontRegular, theme.text, alignment);
            });
            currentX += colWidth;
        });

        // Linie separatoare fină
        const lineY = showBorders ? startY - actualRowHeight + 1 : startY - actualRowHeight;
        ctx.currentPage.drawLine({
            start: { x, y: lineY },
            end: { x: x + tableWidth, y: lineY },
            thickness: showBorders ? 0.7 : 0.3,
            color: theme.border,
        });

        ctx.currentY = startY - actualRowHeight;
    }

    // Spațiu după tabel
    ctx.currentY -= 10;
    return ctx.currentY;
};
