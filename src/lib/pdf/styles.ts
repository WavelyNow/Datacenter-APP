import { rgb, RGB } from 'pdf-lib';

// Helper to convert hex to PDF-lib RGB
export const hexToRgb = (hex: string): RGB => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
};

export const getTheme = (branding?: { primaryColor: string; accentColor: string }) => {
    const primary = branding ? hexToRgb(branding.primaryColor) : rgb(0.06, 0.09, 0.16);
    const accent = branding ? hexToRgb(branding.accentColor) : rgb(0.05, 0.65, 0.91);

    return {
        primary,
        accent,
        highlight: rgb(0.96, 0.25, 0.37),
        text: rgb(0.12, 0.17, 0.25),
        textLight: rgb(0.4, 0.45, 0.5),
        white: rgb(1, 1, 1),
        bgLight: rgb(0.97, 0.98, 0.99),
        border: rgb(0.9, 0.9, 0.92)
    };
};

export type PdfTheme = ReturnType<typeof getTheme>;

export const Theme = getTheme(); // Default theme

export const styles = {
    headerHeight: 40,
    margin: 50,
};
