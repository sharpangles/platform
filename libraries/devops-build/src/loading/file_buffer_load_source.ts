import { FileLoadSource } from './file_load_source';

export class FileBufferLoadSource extends FileLoadSource<Buffer> {
    constructor(file: string, chunkSize?: number) {
        super(file, chunkSize);
    }

    protected setData(offset: number, bytesRead: number) {
        this.data = this.buffer;
    }

    protected getBufferSize() {
        this.stats.size;
    }

    protected getBufferOffset() {
        return this.bytesRead;
    }
}
