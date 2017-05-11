import { LoadSource } from './load_source';

export interface LoadProgress {
    position: number;
    length?: number;
}

export abstract class StreamLoadSource implements LoadSource<string> {
    constructor(public encoding: string = 'utf8') {
    }

    private stream: NodeJS.ReadableStream;
    protected reject?: (val: any) => void;
    protected resolve?: (val: any) => void;

    data: string;

    progress: LoadProgress = { position: 0 };

    protected onOpened(fileHandle: number) {
    }

    protected abstract createStreamAsync(): Promise<NodeJS.ReadableStream>;
    protected abstract destroyStream(stream: NodeJS.ReadableStream);

    async readAsync(onData: (progress: LoadProgress) => any): Promise<string | undefined> {
        this.stream = await this.createStreamAsync();
        return await new Promise<string>((resolve, reject) => {
            this.resolve = val => {
                resolve(val);
                delete this.reject;
                delete this.resolve;
            };
            this.reject = val => {
                if (val.code === 'ENOENT')
                    resolve(undefined);
                else
                    reject(val);
                delete this.reject;
                delete this.resolve;
            };
            try {
                this.open(onData);
            }
            catch (ex) {
                this.reject(ex);
            }
        });
    }

    private open(onData: (progress: LoadProgress) => void) {
        this.stream.setEncoding(this.encoding);
        this.stream.on('readable', () => {
            let data = this.stream.read();
            if (!data)
                return;
            if (!this.data)
                this.data = '';
            this.data += <string>data;
            this.progress.position = this.data.length;
            onData(this.progress);
        });
        this.stream.on('open', fileHandle => this.onOpened(fileHandle));
        this.stream.on('end', () => this.resolve && this.resolve(this.data));
        this.stream.on('close', () => this.reject && this.reject('closed'));
        this.stream.on('error', err => this.reject && this.reject(err));
    }

    dispose() {
        if (this.stream)
            this.destroyStream(this.stream);
    }
}
