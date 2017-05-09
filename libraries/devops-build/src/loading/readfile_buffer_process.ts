import { ReadfileProcess } from './readfile_process';

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export class ReadfileBufferProcess extends ReadfileProcess {
    constructor(file: string, chunkSize?: number) {
        super(file, chunkSize);
    }

    protected getBufferSize() {
        return this.stats.size;
    }

    protected getBufferOffset() {
        return this.bytesRead;
    }
}
