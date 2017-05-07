import { ParsedCommandLine, flattenDiagnosticMessageText, Diagnostic, createProgram, getPreEmitDiagnostics, parseJsonConfigFileContent, parseConfigFileTextToJson, findConfigFile, sys } from 'typescript';
import * as path from 'path';

export class TypescriptCompiler {
    constructor(cwd?: string, config: ParsedCommandLine | string = 'tsconfig.json') {
        this.cwd = cwd || process.cwd();
        this.config = typeof config === 'string' ? this.parseTsConfig(config) : config;
    }

    cwd: string;
    config: ParsedCommandLine;

    private parseTsConfig(tsconfig: string) {
        const fileName = findConfigFile(this.cwd, sys.fileExists, tsconfig);
        if (!fileName)
            throw new Error(`couldn't find 'tsconfig.json' in ${this.cwd}`);
        const text = sys.readFile(fileName);
        const result = parseConfigFileTextToJson(fileName, text);
        if (result.error)
            throw new Error(`failed to parse ${fileName}`);
        return parseJsonConfigFileContent(result.config, sys, path.dirname(fileName), undefined, fileName);
    }

    async compileAsync(changes?: string[]) {
        let program = createProgram(this.config.fileNames, this.config.options);
        let emitResult = program.emit();
        this.logErrors(getPreEmitDiagnostics(program).concat(emitResult.diagnostics));
    }

    protected logErrors(disagnostics: Diagnostic[]) {
        for (let diagnostic of disagnostics) {
            let message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            if (diagnostic.file) {
                let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                console.log(`  Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            }
            else
                console.log(`  Error: ${message}`);
        }
    }

    dispose() {
    }
}
