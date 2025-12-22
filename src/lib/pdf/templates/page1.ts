
import { PdfData, ReportSummary } from '../types';
import { PIPE_DATABASE, PipeMaterial } from '@/lib/constants';

export const generatePage1 = (data: PdfData, summary: ReportSummary) => {
    const { projectDetails, segments, fluidType, glycolPercentage } = data;

    // --- Helper Logic for BoQ ---
    const materialSummary: Record<string, { desc: string, length: number }> = {};

    segments.forEach(seg => {
        let key = '';
        let desc = '';

        if (seg.material === 'custom') {
            key = `custom-${seg.customInnerDiameter}`;
            desc = `Țeavă Custom (ID ${seg.customInnerDiameter}mm)`;
        } else {
            key = `${seg.material}-${seg.standard}-${seg.size}`;
            // Simplify material names
            const matName = seg.material.includes('Stainless') ? 'Oțel Inoxidabil' :
                seg.material.includes('Carbon') ? 'Oțel Carbon' :
                    seg.material.includes('PPR') ? 'PPR' : seg.material;
            desc = `Țeavă ${matName} - ${seg.size}`;
        }

        if (!materialSummary[key]) {
            materialSummary[key] = { desc, length: 0 };
        }
        materialSummary[key].length += seg.length;
    });

    const boqRows = Object.values(materialSummary).map((item, idx) => `
        <tr>
            <td class="text-center">${idx + 1}</td>
            <td>${item.desc}</td>
            <td class="text-right mono">${item.length.toFixed(2)} m</td>
        </tr>
    `).join('');

    // --- HTML Content ---
    // --- Helper for formatting numbers ---
    const fmt = (n: number) => n.toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const generateBoQRows = (data: PdfData) => {
        // This function needs to be defined or the boqRows variable used directly.
        // Assuming the original boqRows is intended to be used here.
        return boqRows;
    };

    return `
    <div class="report-container">
        <!-- Title -->
        <h1>RAPORT FINAL: VOLUMETRIE & MATERIALE</h1>
        
        <div class="project-info">
            <strong>Proiect:</strong> ${data.projectDetails.projectName} (${data.projectDetails.projectNumber})<br>
            <strong>Locație:</strong> ${data.projectDetails.location}<br>
            <strong>Data:</strong> ${data.projectDetails.date} | <strong>Rev:</strong> ${data.projectDetails.revision}
        </div>

        <!-- 1. Summary -->
        <div class="section-title">1. Sumar General</div>
        <table class="summary-table">
            <tr>
                <td><strong>Tip Fluid</strong></td>
                <td>${data.fluidType === 'ethylene' ? 'Etilen Glicol' : 'Propilen Glicol'} ${data.glycolPercentage}%</td>
            </tr>
            <tr>
                <td><strong>Volum Total Sistem</strong></td>
                <td>${fmt(summary.totalVolumeLitres)} litri</td>
            </tr>
            <tr>
                <td><strong>Greutate Totală Fluid + Instalație</strong></td>
                <td>${fmt(summary.totalWeightKg)} kg</td>
            </tr>
        </table>

        <!-- 2. BoQ -->
        <div class="section-title">2. Centralizator Materiale (BoQ)</div>
        <table class="boq-table">
            <thead>
                <tr>
                    <th style="width: 50px;">NR.</th>
                    <th>DESCRIERE MATERIAL</th>
                    <th style="width: 100px;">CANTITATE</th>
                </tr>
            </thead>
            <tbody>
                ${generateBoQRows(data)}
            </tbody>
        </table>
        
        <!-- Signatures -->
        <div class="signatures">
            <div class="sig-block">
                <strong>Întocmit,</strong><br>
                ${data.projectDetails.designer}
            </div>
            <div class="sig-block">
                <strong>Verificat,</strong><br>
                -
            </div>
        </div>
    </div>
    `;
};
```
