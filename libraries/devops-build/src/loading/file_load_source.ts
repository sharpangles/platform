import { StreamLoadSource } from './stream_load_source';
import * as fs from 'fs';

export interface LoadProgress {
    position: number;
    length?: number;
}

export class FileLoadSource extends StreamLoadSource {
    constructor(public file: string, encoding?: string) {
        super(encoding);
    }

    protected onOpened(fileHandle: number) {
        fs.fstat(fileHandle, (err, stats) => {
            if (err) {
                if (this.reject)
                    this.reject(err);
            }
            else
                this.progress.length = stats.size;
        });
    }

    protected async createStreamAsync() {
        return fs.createReadStream(this.file, { encoding: this.encoding, flags: 'r' });
    }

    protected destroyStream(stream: NodeJS.ReadableStream) {
        (<fs.ReadStream>stream).destroy();
    }
}
