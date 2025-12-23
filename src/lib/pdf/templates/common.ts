import { PDFPage, rgb } from 'pdf-lib';
import { ProjectDetails } from '../../types';

export const drawHeader = async (
    page: PDFPage,
    fontRegular: any,
    fontBold: any,
    projectDetails: ProjectDetails,
    theme: any,
    logoImage?: any
): Promise<number> => {
    const { width, height } = page.getSize();
    let topBandY = height - 25;

    // Draw Logo on the Right
    if (logoImage) {
        const logoDims = logoImage.scale(1);
        let scale = 0.5;
        const maxHeight = 65;
        if (logoDims.height * scale > maxHeight) {
            scale = maxHeight / logoDims.height;
        }

        const logoWidth = logoDims.width * scale;
        const logoHeight = logoDims.height * scale;

        // Subtle Logo Background (Glass/White)
        page.drawRectangle({
            x: width - 55 - logoWidth,
            y: topBandY - logoHeight - 5,
            width: logoWidth + 10,
            height: logoHeight + 10,
            color: rgb(1, 1, 1),
            opacity: 0.1,
        });

        page.drawImage(logoImage, {
            x: width - 50 - logoWidth,
            y: topBandY - logoHeight,
            width: logoWidth,
            height: logoHeight
        });
    }

    // Left Side: Project Info
    const refText = `PROIECT: ${projectDetails.projectNumber || '-'}`;
    const revText = `REVIZIE: ${projectDetails.revision || '-'}`;

    page.drawText(refText, {
        x: 50,
        y: height - 45,
        size: 8,
        font: fontRegular,
        color: theme.textLight
    });

    page.drawText(revText, {
        x: 50,
        y: height - 57,
        size: 8,
        font: fontRegular,
        color: theme.textLight
    });

    // Divider Line (Pushed further down)
    const dividerY = height - 105;
    page.drawLine({
        start: { x: 50, y: dividerY },
        end: { x: width - 50, y: dividerY },
        thickness: 0.5,
        color: theme.border
    });

    return dividerY - 40; // Ensure at least 40px air before ANY content
};

export const drawFooter = (
    page: PDFPage,
    fontRegular: any,
    pageNumber: number,
    theme: any,
    projectName: string = 'Data Center Cooling',
    revision: string = 'A'
) => {
    const { width } = page.getSize();
    const footerText = `Proiect: ${projectName} | Revizie: ${revision} | Pagina ${pageNumber}`;

    // Draw line above footer text
    page.drawLine({
        start: { x: 50, y: 40 },
        end: { x: width - 50, y: 40 },
        thickness: 0.5,
        color: theme.border
    });

    page.drawText(footerText, {
        x: 50,
        y: 25,
        size: 8,
        font: fontRegular,
        color: theme.textLight,
    });
};
