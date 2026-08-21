import { PDFDocument, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { PdfData } from './types';
import { generateSitePage } from './templates/sitePage';
import { generatePipeQuantityPage } from './templates/pipeQuantityPage';
import { generatePurchasePage } from './templates/purchasePage';
import { PDFContext } from './templates/SectionGenerator';
import { getTheme } from './styles';
import fs from 'fs';
import path from 'path';
import { base64ToUint8Array } from './utils';

// Helper to fetch fonts from filesystem (Server-Side)
async function fetchFont(filename: string): Promise<ArrayBuffer> {
    const filePath = path.join(process.cwd(), 'public', 'fonts', filename);
    try {
        const fileBuffer = fs.readFileSync(filePath);
        return fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer;
    } catch {
        throw new Error(`Font file not found: ${filePath}`);
    }
}

/**
 * RAPORT DE COMANDA — 3 pagini, minimal & premium:
 * 1. Site & date proiect
 * 2. Cantitate teava
 * 3. Lista de cumparat (glicol cu pierderi fittinguri + marja, teava, fittinguri)
 */
export async function generatePdf(data: PdfData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load fonts (Embedded to ensure portability)
    let fontRegular;
    try {
        const fontBytes = await fetchFont('Arial.ttf');
        fontRegular = await pdfDoc.embedFont(fontBytes);
    } catch {
        console.warn('[PDF] Arial.ttf unavailable — falling back to Helvetica');
        fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
    // Reuse Regular font for Bold since we lack a Bold variant, ensuring no crash.
    const fontBold = fontRegular;

    let logoImage = undefined;
    if (data.projectDetails.companyLogo) {
        try {
            logoImage = await pdfDoc.embedJpg(base64ToUint8Array(data.projectDetails.companyLogo as string));
        } catch {
            console.warn('[PDF] Could not embed custom logo');
            logoImage = undefined;
        }
    }

    // Initialize Layout Context
    const theme = getTheme(data.branding);
    const ctx = new PDFContext(pdfDoc, fontRegular, fontBold, data.projectDetails, theme, logoImage);
    await ctx.addPage();

    // 1. Site & proiect
    await generateSitePage(ctx, data);
    // 2. Cantitate teava
    await generatePipeQuantityPage(ctx, data);
    // 3. Lista de cumparat
    await generatePurchasePage(ctx, data);

    // Footer pe ultima pagina
    ctx.finish();

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
