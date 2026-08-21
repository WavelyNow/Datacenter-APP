
export function base64ToUint8Array(base64: string): Uint8Array {
    try {
        const raw = base64.includes('base64,') ? base64.split('base64,')[1] : base64;
        const binaryString = Buffer.from(raw, 'base64').toString('binary');
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (err) {
        console.error('Failed to convert base64 to Uint8Array', err);
        return new Uint8Array(0);
    }
}

const DIACRITICS_MAP: Record<string, string> = {
    'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T',
    'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
    '—': '-', '–': '-', '„': '"', '”': '"', '“': '"', '…': '...',
    'Ã': 'A', 'Õ': 'O', 'Ç': 'C', 'é': 'e', 'è': 'e', 'ê': 'e',
    'à': 'a', 'á': 'a', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u',
};

/**
 * Sanitizează textul pentru fonturile PDF (WinAnsi).
 * Prevent crashes când fontul custom nu poate fi înglobat și se folosește
 * fallback-ul (Helvetica), care nu suportă diacritice.
 */
export function sanitizePdfText(input: string): string {
    if (!input) return '';
    let out = '';
    for (const ch of input) {
        out += DIACRITICS_MAP[ch] ?? ch;
    }
    return out;
}
