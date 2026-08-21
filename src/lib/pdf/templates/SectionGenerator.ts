import { PDFDocument, PDFPage, PDFFont, PDFImage } from 'pdf-lib';
import { ProjectDetails } from '@/lib/types';
import { drawHeader, drawFooter } from './common';
import { PdfTheme } from '../styles';
import { sanitizePdfText } from '../utils';

export class PDFContext {
    pdfDoc: PDFDocument;
    fontRegular: PDFFont;
    fontBold: PDFFont;
    projectDetails: ProjectDetails;
    theme: PdfTheme;
    logoImage?: PDFImage;

    currentPage!: PDFPage;
    currentY!: number;
    width!: number;
    height!: number;
    pageNumber: number = 0;

    constructor(
        pdfDoc: PDFDocument,
        fontRegular: PDFFont,
        fontBold: PDFFont,
        projectDetails: ProjectDetails,
        theme: PdfTheme,
        logoImage?: PDFImage
    ) {
        this.pdfDoc = pdfDoc;
        this.fontRegular = fontRegular;
        this.fontBold = fontBold;
        this.projectDetails = projectDetails;
        this.theme = theme;
        this.logoImage = logoImage;

        // Note: No addPage() here because constructors cannot be async.        // We will call addPage() manually at the start of generatePdf.
    }

    async addPage() {
        this.currentPage = this.pdfDoc.addPage();
        const { width, height } = this.currentPage.getSize();
        this.width = width;
        this.height = height;
        this.pageNumber++;

        // Initial Y (will be refined by drawHeader)
        this.currentY = height - 40;
        await this.drawHeader();
    }

    async drawHeader() {
        this.currentY = await drawHeader(
            this.currentPage,
            this.fontRegular,
            this.fontBold,
            this.projectDetails,
            this.theme,
            this.logoImage
        );
    }

    async checkSpace(neededHeight: number) {
        if (this.currentY - neededHeight < 60) { // Increased bottom margin
            this.drawFooter();
            await this.addPage();
        }
    }

    drawFooter() {
        drawFooter(
            this.currentPage,
            this.fontRegular,
            this.pageNumber,
            this.theme,
            sanitizePdfText(this.projectDetails.projectName),
            sanitizePdfText(this.projectDetails.revision)
        );
    }

    // Helper to finish the document (draw footer on last page)
    finish() {
        this.drawFooter();
    }
}
