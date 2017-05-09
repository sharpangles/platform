import { TrackerProcess } from '../processes/tracker_process';
import * as fs from 'fs';

export interface FileProgress {
    position: number;
    length: number;
}

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export abstract class ReadfileProcess extends TrackerProcess<FileProgress, NodeJS.ErrnoException> {
    constructor(public file: string, chunkSize?: number) {
        super();
        this.chunkSize = chunkSize || 4096;
    }

    protected chunkSize: number;
    private fileHandle: number;
    protected bytesRead = 0;
    protected stats: fs.Stats;

    private cancelResolve?: () => void;

    protected onCancelAsync(): Promise<boolean> {
         if (!this.isStarted)
            return Promise.resolve(false);
        return new Promise(resolve => this.cancelResolve = resolve);
    }

    private async readChunkAsync(buffer: Buffer) {
        let chunkSize = this.chunkSize;
        if (this.bytesRead + this.chunkSize > this.stats.size)
            chunkSize = this.stats.size - this.bytesRead;
        if (chunkSize <= 0) {
            this.succeed();
            return false;
        }
        let offset = this.getBufferOffset();
        let bytesRead = await new Promise<number>((resolve, reject) => fs.read(this.fileHandle, buffer, offset, chunkSize, this.bytesRead, (err, bytesRead) => err ? reject(err) : resolve(chunkSize)));
        this.bytesRead += bytesRead;
        this.applyBuffer(buffer, offset, bytesRead);
        this.setProgress({ position: this.bytesRead, length: this.stats.size });
        return true;
    }

    protected applyBuffer(buffer: Buffer, offset: number, bytesRead: number) {
    }

    protected abstract getBufferSize();
    protected abstract getBufferOffset();

    private async readAsync() {
        try {
            this.fileHandle = await new Promise<number>((resolve, reject) => fs.open(this.file, 'r', (err, fileHandle) => err ? reject(err) : resolve(fileHandle)));
            this.stats = await new Promise<fs.Stats>((resolve, reject) => fs.fstat(this.fileHandle, (err, stats) => err ? reject(err) : resolve(stats)));
            let buffer = new Buffer(this.getBufferSize());
            while (await this.readChunkAsync(buffer)) {
                if (this.cancelResolve) {
                    this.cancelResolve();
                    return;
                }
            }
        }
        catch (err) {
            this.fail(err);
            return;
        }
        this.succeed();
    }

    start() {
        this.readAsync();
    }

    dispose() {
        if (this.fileHandle != null)
            fs.close(this.fileHandle);
    }
}
