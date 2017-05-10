import * as http from 'http';
import { StreamLoadSource } from './stream_load_source';

export class HttpLoadSource extends StreamLoadSource {
    constructor(public url: string) {
        super();
    }

    contentType: string;

    protected async createStreamAsync() {
        let response = await new Promise<http.IncomingMessage>(resolve => http.get(this.url, response => resolve(response)));
        this.contentType = response.headers['content-type'];
        this.progress.length = parseInt(response.headers['content-length']);
        if (response.statusCode !== 200) {
            response.resume(); // Free up memory
            throw new Error(`${response.statusCode}: ${response.statusMessage}`);
        }
        return response;
    }

    protected destroyStream(stream: NodeJS.ReadableStream) {
        (<http.IncomingMessage>stream).destroy();
    }
}
