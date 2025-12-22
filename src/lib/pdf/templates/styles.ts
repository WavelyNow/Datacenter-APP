
export const pdfStyles = `
    @page {
        size: A4;
        margin: 20mm 15mm 15mm 20mm; /* Top Right Bottom Left */
    }

    /* Reset & Base Fonts */
    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        padding: 0;
        font-family: "Times New Roman", Times, serif;
        font-size: 11pt;
        line-height: 1.3;
        color: #000;
        -webkit-print-color-adjust: exact;
    }

    /* Helper Classes */
    .page-break {
        page-break-before: always;
    }

    .no-break-inside {
        page-break-inside: avoid;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
    .mb-4 { margin-bottom: 4mm; }
    .mb-8 { margin-bottom: 8mm; }

    /* Typography */
    h1 {
        font-size: 16pt;
        text-transform: uppercase;
        margin-bottom: 2mm;
        border-bottom: 2px solid #000;
        padding-bottom: 1mm;
    }

    h2 {
        font-size: 14pt;
        margin-top: 6mm;
        margin-bottom: 3mm;
        border-bottom: 1px solid #aaa;
        padding-bottom: 1mm;
    }

    .mono {
        font-family: "Courier New", Courier, monospace;
    }

    /* Tables */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 5mm;
        font-size: 10pt;
    }

    th, td {
        border: 1px solid #000;
        padding: 1.5mm 2mm;
        text-align: left;
    }

    th {
        background-color: #f0f0f0;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 9pt;
    }

    tr.total-row td {
        background-color: #e0e0e0;
        font-weight: bold;
    }

    /* Header/Footer (Managed by Puppeteer usually, but keeping placeholders if needed) */
    .header-logo {
        height: 15mm;
        margin-bottom: 2mm;
    }

    /* Page 3: Photos Grid */
    .photo-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5mm;
    }

    .photo-item {
        border: 1px solid #ccc;
        padding: 2mm;
        text-align: center;
        page-break-inside: avoid;
    }

    .photo-item img {
        max-width: 100%;
        max-height: 80mm;
        object-fit: contain;
        display: block;
        margin: 0 auto 2mm;
    }

    .photo-caption {
        font-size: 9pt;
        color: #555;
    }
    
    /* Signature Block */
    .signatures {
        margin-top: 20mm;
        display: flex;
        justify-content: space-between;
    }
    
    .signature-box {
        width: 40%;
        border-top: 1px solid #000;
        padding-top: 2mm;
        text-align: center;
        font-size: 10pt;
    }
`;
