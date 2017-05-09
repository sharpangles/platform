import { LoadSource } from './load_source';
import * as fs from 'fs';

export interface LoadProgress {
    position: number;
    length: number;
}

export abstract class FileLoadSource<TData> implements LoadSource<TData> {
    constructor(public file: string, chunkSize?: number) {
        this.chunkSize = chunkSize || 8192;
    }

    protected chunkSize: number;
    private fileHandle: number;
    protected bytesRead = 0;
    protected stats: fs.Stats;
    protected buffer: Buffer;

    async openAsync(): Promise<void> {
        this.fileHandle = await new Promise<number>((resolve, reject) => fs.open(this.file, 'r', (err, fileHandle) => err ? reject(err) : resolve(fileHandle)));
        this.stats = await new Promise<fs.Stats>((resolve, reject) => fs.fstat(this.fileHandle, (err, stats) => err ? reject(err) : resolve(stats)));
        this.buffer = new Buffer(this.getBufferSize());
    }

    async closeAsync(): Promise<void> {
        if (this.fileHandle != null)
            await new Promise((resolve, reject) => fs.close(this.fileHandle, err => err ? reject(err) : resolve()));
    }

    async readNextAsync(): Promise<boolean> {
        let chunkSize = this.chunkSize;
        if (this.bytesRead + this.chunkSize > this.stats.size)
            chunkSize = this.stats.size - this.bytesRead;
        if (chunkSize <= 0)
            return false;
        let offset = this.getBufferOffset();
        let bytesRead = await new Promise<number>((resolve, reject) => fs.read(this.fileHandle, this.buffer, offset, chunkSize, this.bytesRead, (err, bytesRead) => err ? reject(err) : resolve(chunkSize)));
        this.bytesRead += bytesRead;
        this.setData(offset, bytesRead);
        this.progress = { position: this.bytesRead, length: this.stats.size };
        return true;
    }

    dispose() {
    }

    data: TData;
    progress: LoadProgress;

    protected abstract setData(offset: number, bytesRead: number);
    protected abstract getBufferSize();
    protected abstract getBufferOffset();
}
