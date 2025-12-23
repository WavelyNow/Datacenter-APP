import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { PdfData } from './types';
import { generatePage1 } from './templates/page1';
import { generatePage2 } from './templates/page2';
import { generateSupportPage } from './templates/supportPage';
import { generatePage3 } from './templates/page3';
import { PDFContext } from './templates/SectionGenerator';
import { getTheme } from './styles';
import fs from 'fs';
import path from 'path';
import { base64ToUint8Array } from './utils';

// Helper to fetch fonts from filesystem (Server-Side)
async function fetchFont(filename: string): Promise<ArrayBuffer> {
    const filePath = path.join(process.cwd(), 'public', 'fonts', filename);
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer;
}


export async function generatePdf(data: PdfData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load fonts (Embedded to ensure portability)
    // Load fonts (Embedded to ensure portability)
    const fontBytes = await fetchFont('Arial.ttf');

    const fontRegular = await pdfDoc.embedFont(fontBytes);
    // Reuse Regular font for Bold since we lack a Bold variant, ensuring no crash.
    const fontBold = fontRegular;

    let logoImage = undefined;
    if (data.projectDetails.companyLogo) {
        try {
            const logoBytes = base64ToUint8Array(data.projectDetails.companyLogo);
            // Try PNG first, then JPG if it fails
            try {
                logoImage = await pdfDoc.embedPng(logoBytes);
            } catch {
                logoImage = await pdfDoc.embedJpg(logoBytes);
            }
        } catch (e) {
            console.warn('Could not embed custom logo, falling back to none.', e);
        }
    }

    // Define Page Options
    const showVolume = data.options?.includeVolume !== false;
    const showBoQ = data.options?.includeBoQ !== false;
    const showPage1 = showVolume || showBoQ;
    const showWeights = data.options?.includeWeights === true;
    const showSupports = data.options?.includeSupports === true;

    // --- PAGE GENERATION ---

    // Initialize Layout Context
    const theme = getTheme(data.branding);
    const ctx = new PDFContext(pdfDoc, fontRegular, fontBold, data.projectDetails, theme, logoImage);
    await ctx.addPage(); // Explicitly add the first page now that it's async

    // Generate Content Flow
    if (showPage1) {
        await generatePage1(ctx, data);
    }
    if (showWeights) {
        await generatePage2(ctx, data);
    }
    if (showSupports) {
        await generateSupportPage(ctx, data);
    }

    // Always check for photos Annex if weights/supports are requested
    if (showWeights || showSupports) {
        await generatePage3(ctx, data);
    }

    // Finalize (footer on last page)
    ctx.finish();

    // If no pages were added (e.g. user deselected everything), add a placeholder
    if (pdfDoc.getPageCount() === 0) {
        const page = pdfDoc.addPage();
        const { height } = page.getSize();
        page.drawText('Nu s-a selectat nicio secțiune pentru raport.', { x: 50, y: height - 100, font: fontRegular, size: 12 });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
