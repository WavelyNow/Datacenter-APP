import { PDFPage, PDFFont, PDFImage, rgb } from 'pdf-lib';
import { ProjectDetails } from '../../types';
import { PdfTheme } from '../styles';
import { sanitizePdfText } from '../utils';

/**
 * Titlu de secțiune premium: bară de accent + text caps.
 * Returnează noul Y (după titlu + spațiu).
 */
export function drawSectionTitle(
    page: PDFPage,
    fontBold: PDFFont,
    x: number,
    y: number,
    title: string,
    theme: PdfTheme
): number {
    page.drawRectangle({ x, y: y + 1, width: 3.5, height: 13, color: theme.primary });
    page.drawText(sanitizePdfText(title), { x: x + 10, y, size: 12.5, font: fontBold, color: theme.text });
    return y - 26;
}

export const drawHeader = async (
    page: PDFPage,
    fontRegular: PDFFont,
    fontBold: PDFFont,
    projectDetails: ProjectDetails,
    theme: PdfTheme,
    logoImage?: PDFImage
): Promise<number> => {
    const { width, height } = page.getSize();
    const margin = 50;

    // Logo mic dreapta (dacă există)
    if (logoImage) {
        const logoDims = logoImage.scale(1);
        let scale = 0.5;
        const maxHeight = 32;
        if (logoDims.height * scale > maxHeight) scale = maxHeight / logoDims.height;
        const logoWidth = logoDims.width * scale;
        const logoHeight = logoDims.height * scale;
        page.drawImage(logoImage, {
            x: width - margin - logoWidth,
            y: height - margin - logoHeight,
            width: logoWidth,
            height: logoHeight
        });
    }

    // Stânga: referință proiect (mic, gri)
    const refText = sanitizePdfText(`${projectDetails.projectNumber || ''}  ·  ${projectDetails.projectName || ''}`);
    page.drawText(refText.slice(0, 60), {
        x: margin,
        y: height - margin + 6,
        size: 8,
        font: fontRegular,
        color: theme.textLight,
    });

    // Hairline sub header
    page.drawLine({
        start: { x: margin, y: height - margin - 12 },
        end: { x: width - margin, y: height - margin - 12 },
        thickness: 0.6,
        color: theme.border,
    });

    return height - margin - 12;
};

export const drawFooter = (
    page: PDFPage,
    fontRegular: PDFFont,
    pageNumber: number,
    theme: PdfTheme,
    projectName?: string,
    revision?: string
): void => {
    const { width, height } = page.getSize();
    const margin = 50;

    // Hairline sus
    page.drawLine({
        start: { x: margin, y: margin - 18 },
        end: { x: width - margin, y: margin - 18 },
        thickness: 0.6,
        color: theme.border,
    });

    // Pagină — centrat, mic
    const pageText = `${pageNumber}`;
    const w = fontRegular.widthOfTextAtSize(pageText, 7.5);
    page.drawText(pageText, { x: (width - w) / 2, y: margin - 32, size: 7.5, font: fontRegular, color: theme.textLight });
};
