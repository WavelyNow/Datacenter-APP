
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
    return `
        <div class="page-break">
            <h1>Raport Final: Volumetrie &amp; Materiale</h1>
            
            <div class="mb-4">
                <strong>Proiect:</strong> ${projectDetails.projectName} (${projectDetails.projectNumber})<br>
                <strong>Locație:</strong> ${projectDetails.location}<br>
                <strong>Data:</strong> ${projectDetails.date} | <strong>Rev:</strong> ${projectDetails.revision}
            </div>

            <h2>1. Sumar General</h2>
            <table>
                <tbody>
                    <tr>
                        <td><strong>Tip Fluid</strong></td>
                        <td>${fluidType === 'ethylene' ? 'Etilen Glicol' : fluidType === 'propylene' ? 'Propilen Glicol' : 'Apă'} ${glycolPercentage}%</td>
                    </tr>
                    <tr>
                        <td><strong>Volum Total Sistem</strong></td>
                        <td class="mono"><strong>${summary.totalVolumeLitres.toFixed(1)} litri</strong></td>
                    </tr>
                    <tr>
                        <td>Volum Glicol (Necesar)</td>
                        <td class="mono">${summary.glycolVol.toFixed(1)} litri</td>
                    </tr>
                    <tr>
                        <td>Volum Apă</td>
                        <td class="mono">${summary.waterVol.toFixed(1)} litri</td>
                    </tr>
                    <tr>
                        <td><strong>Greutate Totală Fluid</strong></td>
                        <td class="mono"><strong>${summary.totalWeightKg.toFixed(1)} kg</strong></td>
                    </tr>
                </tbody>
            </table>

            <h2>2. Centralizator Materiale (BoQ)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 10%;">Nr.</th>
                        <th>Descriere Material</th>
                        <th style="width: 20%;">Cantitate</th>
                    </tr>
                </thead>
                <tbody>
                    ${boqRows}
                </tbody>
            </table>

            <div class="signatures">
                <div class="signature-box">
                    <strong>Întocmit,</strong><br>
                    ${projectDetails.designer}
                </div>
                <div class="signature-box">
                    <strong>Verificat,</strong><br>
                    -
                </div>
            </div>
        </div>
    `;
};
