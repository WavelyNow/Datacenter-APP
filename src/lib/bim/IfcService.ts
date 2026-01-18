// IfcService.ts - Client Wrapper for Web Worker



/**
 * Service to handle IFC file parsing and data extraction.
 * Uses a Web Worker to prevent UI freezing.
 */
export class IfcService {
    private worker: Worker | null = null;

    constructor() { }

    /**
     * Initialize the Worker and WASM
     */
    async init() {
        if (typeof window === 'undefined') return;

        // Initialize Worker
        this.worker = new Worker(new URL('./ifc.worker.ts', import.meta.url));

        // Wait for worker to be ready (optional, but good practice if WASM init takes time)
        return new Promise<void>((resolve, reject) => {
            if (!this.worker) return reject('Worker failed to init');

            const handler = (e: MessageEvent) => {
                const { type, error, id } = e.data;
                if (type === 'response' && id === 'init') {
                    cleanup();
                    resolve();
                } else if (type === 'error' && id === 'init') {
                    cleanup();
                    reject(error);
                }
            };

            const errorHandler = (e: ErrorEvent) => {
                cleanup();
                reject(new Error(`Worker script failed to load: ${e.message}`));
            };

            const cleanup = () => {
                this.worker?.removeEventListener('message', handler);
                this.worker?.removeEventListener('error', errorHandler);
            };

            this.worker.addEventListener('message', handler);
            this.worker.addEventListener('error', errorHandler);

            this.worker.postMessage({ action: 'INIT', id: 'init', payload: { wasmPath: '/wasm/' } });
        });
    }

    /**
     * Load an IFC file and extract data
     * This replaces both loadFile and extractBimObjects in one flow for simplicity in Worker
     */
    async extractBimObjects(): Promise<unknown[]> {
        throw new Error("Use processIfcBuffer via Worker instead");
    }

    /**
     * The main entry point now.
     * Starts the worker job.
     */
    public async processIfcBuffer(buffer: ArrayBuffer, onProgress?: (msg: string, percent: number) => void): Promise<unknown[]> {
        if (!this.worker) throw new Error('Worker not initialized');

        return new Promise((resolve, reject) => {
            if (!this.worker) return reject('Worker gone');

            const handler = (e: MessageEvent) => {
                const { type, data, error, message, progress } = e.data;

                if (type === 'progress') {
                    if (onProgress) onProgress(message, progress);
                } else if (type === 'response') {
                    // Success
                    this.worker?.removeEventListener('message', handler);
                    resolve(data);
                } else if (type === 'error') {
                    this.worker?.removeEventListener('message', handler);
                    reject(new Error(error));
                }
            };
            this.worker.addEventListener('message', handler);

            // Send buffer (transferable) to avoid copy overhead
            this.worker.postMessage(
                { action: 'LOAD_AND_EXTRACT', payload: { buffer } },
                [buffer] // Transfer the buffer
            );
        });
    }

    // Legacy method signatures if needed, but we should update BimPage to use processIfcBuffer.
    // For compatibility with existing BimPage structure:
    async loadFile(_buffer: Uint8Array): Promise<void> {
        // No-op in worker client
        return;
    }

    dispose() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}
