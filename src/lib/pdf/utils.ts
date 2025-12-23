
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
