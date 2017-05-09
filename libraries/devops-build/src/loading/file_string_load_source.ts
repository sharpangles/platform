import { FileLoadSource } from './file_load_source';
import { StringDecoder, NodeStringDecoder } from 'string_decoder';

export class FileStringLoadSource extends FileLoadSource<string> {
    constructor(file: string, chunkSize?: number, encoding = 'utf8') {
        super(file, chunkSize);
        this.decoder = new StringDecoder(encoding);
        this.data = '';
    }

    private decoder: NodeStringDecoder;

    protected setData(offset: number, bytesRead: number) {
        if (this.bytesRead === this.stats.size)
            this.data += this.decoder.end(this.buffer);
        else
            this.data += this.decoder.write(this.buffer);
    }

    protected getBufferSize() {
        return this.chunkSize;
    }

    protected getBufferOffset() {
        return this.bytesRead;
    }
}
