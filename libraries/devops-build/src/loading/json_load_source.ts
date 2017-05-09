import { WrappedLoadSource } from '../loading/wrapped_load_source';
import { FileStringLoadSource } from '../loading/file_string_load_source';

export class JsonLoadSource extends WrappedLoadSource<string, { [key: string]: any }> {
    constructor(public file: string = 'tsconfig.json') {
        super(new FileStringLoadSource(file));
    }

    convert(original: string): { [key: string]: any } {
        return JSON.parse(original);
    }
}
