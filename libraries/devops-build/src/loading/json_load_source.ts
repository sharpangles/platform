import { LoadSource } from './load_source';
import { WrappedLoadSource } from '../loading/wrapped_load_source';

export class JsonLoadSource extends WrappedLoadSource<string, { [key: string]: any }> {
    constructor(wrapped: LoadSource<string>) {
        super(wrapped);
    }

    convert(original: string): { [key: string]: any } {
        return JSON.parse(original);
    }
}
