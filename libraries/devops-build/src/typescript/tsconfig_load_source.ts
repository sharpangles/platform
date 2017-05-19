import { FileLoadSource } from '../loading/file_load_source';
import { ParsedCommandLine, sys, parseJsonConfigFileContent, parseConfigFileTextToJson } from 'typescript';
import { WrappedLoadSource } from '../loading/wrapped_load_source';
import * as path from 'path';

export class TSConfigLoadSource extends WrappedLoadSource<string, ParsedCommandLine> {
    constructor(public file: string = 'tsconfig.json') {
        super(new FileLoadSource(file));
    }

    convert(original: string) {
        const result = parseConfigFileTextToJson(this.file, original);
        if (result.error)
            throw new Error(`failed to parse ${this.file}`);
        return parseJsonConfigFileContent(result.config, sys, path.resolve(path.dirname(this.file)), undefined, this.file);
    }
}
