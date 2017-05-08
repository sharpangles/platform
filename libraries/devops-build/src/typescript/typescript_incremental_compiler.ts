import { TypescriptCompiler } from './typescript_compiler';
import { ParsedCommandLine, LanguageService, LanguageServiceHost, MapLike, ScriptSnapshot, createLanguageService, getDefaultLibFilePath, createDocumentRegistry, flattenDiagnosticMessageText, Diagnostic } from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export class TypescriptIncrementalCompiler extends TypescriptCompiler {
    constructor(cwd?: string, config: ParsedCommandLine | string = 'tsconfig.json') {
        super(cwd, config);
        this.languageService = this.createLanguageService();
    }

    files: MapLike<{ version: number }> = {};
    languageService: LanguageService;

    private createLanguageService() {
        for (let fileName of this.config.fileNames)
            this.files[fileName] = { version: 0 };
        const servicesHost: LanguageServiceHost = {
            getScriptFileNames: () => this.config.fileNames,
            getScriptVersion: (fileName) => this.files[fileName] && this.files[fileName].version.toString(),
            getScriptSnapshot: (fileName) => {
                if (!fs.existsSync(fileName))
                    return undefined;
                return ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
            },
            getCurrentDirectory: () => this.cwd,
            getCompilationSettings: () => this.config.options,
            getDefaultLibFileName: (options) => getDefaultLibFilePath(options),
        };
        return createLanguageService(servicesHost, createDocumentRegistry());
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

    async compileAsync(changes?: string[]) {
        for (let fileName of changes || this.config.fileNames) {
            fileName = path.resolve(fileName).split(path.sep).join('/');
            this.files[fileName].version++;
            let output = this.languageService.getEmitOutput(fileName);
            let promises = new Map<string, Promise<void>>();
            if (output.emitSkipped) {
                console.log(`Emitting ${fileName} failed`);
                this.logErrors(this.languageService.getCompilerOptionsDiagnostics().concat(this.languageService.getSyntacticDiagnostics(fileName)).concat(this.languageService.getSemanticDiagnostics(fileName)));
            }
            for (let outputFile of output.outputFiles) {
                if (promises.has(outputFile.name))
                    continue; // i.e. outFile, only need to write once.
                this.ensureDir(outputFile.name);
                new Promise<void>((resolve, reject) => fs.writeFile(outputFile.name, outputFile.text, 'utf8', err => err ? reject(err) : resolve()));
            }
            await Promise.all(promises);
        }
    }

    private ensureDir(filePath) {
        let dirname = path.dirname(filePath);
        if (fs.existsSync(dirname))
            return;
        this.ensureDir(dirname);
        fs.mkdirSync(dirname);
    }

    dispose() {
        this.languageService.dispose();
        super.dispose();
    }
}
