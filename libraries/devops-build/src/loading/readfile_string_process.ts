import { ReadfileProcess } from './readfile_process';
import { StringDecoder, NodeStringDecoder } from 'string_decoder';

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export class ReadfileStringProcess extends ReadfileProcess {
    constructor(file: string, chunkSize?: number, encoding = 'utf8') {
        super(file, chunkSize);
        this.decoder = new StringDecoder(encoding);
    }

    fileContents: string = '';

    private decoder: NodeStringDecoder;

    protected applyBuffer(buffer: Buffer, offset: number, bytesRead: number) {
        if (this.bytesRead === this.stats.size)
            this.fileContents += this.decoder.end(buffer);
        else
            this.fileContents += this.decoder.write(buffer);
    }

    protected getBufferSize() {
        return this.chunkSize;
    }

    protected getBufferOffset() {
        return this.bytesRead;
    }
}
