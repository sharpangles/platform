import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as fs from 'fs';
import * as ts from 'typescript';
import * as path from 'path';

export class TypescriptCompiler {
    constructor(cwd?: string, config: ts.ParsedCommandLine | string = 'tsconfig.json') {
        this.cwd = cwd || process.cwd();
        this.config = typeof config === 'string' ? this.parseTsConfig(config) : config;
        this.languageService = this.createLanguageService(this.config.fileNames, this.config.options);
    }

    private cwd: string;
    private config: ts.ParsedCommandLine;
    languageService: ts.LanguageService;
    files: ts.MapLike<{ version: number }> = {};

    private parseTsConfig(tsconfig: string) {
        const fileName = ts.findConfigFile(this.cwd, ts.sys.fileExists, tsconfig);
        if (!fileName)
            throw new Error(`couldn't find 'tsconfig.json' in ${this.cwd}`);
        const text = ts.sys.readFile(fileName);
        const result = ts.parseConfigFileTextToJson(fileName, text);
        if (result.error)
            throw new Error(`failed to parse ${fileName}`);
        return ts.parseJsonConfigFileContent(result.config, ts.sys, path.dirname(fileName), undefined, fileName);
    }

    protected createLanguageService() {
        for (let fileName of this.config.fileNames)
            this.files[fileName] = { version: 0 };
        const servicesHost: ts.LanguageServiceHost = {
            getScriptFileNames: () => this.config.fileNames,
            getScriptVersion: (fileName) => this.files[fileName] && this.files[fileName].version.toString(),
            getScriptSnapshot: (fileName) => {
                if (!fs.existsSync(fileName))
                    return undefined;
                return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
            },
            getCurrentDirectory: () => this.cwd,
            getCompilationSettings: () => this.config.options,
            getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
        };
        return ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
    }

    protected createCompiler() {
        let program = ts.createProgram(this.config.fileNames, this.config.options);
        let emitResult = program.emit();

        let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

        allDiagnostics.forEach(diagnostic => {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        });
    }

    get changed(): Observable<any> { return this.changed; }
    protected changedSubject = new Subject<any>();

    run() {
        for (let fileName of this.config.fileNames) {
            this.emitFile(fileName);
            if (this.watcher)
                this.watcher.watcher.add(fileName);
        }
        this._changed.next();
    }

    emitFile(fileName: string) {
        let output = this.services.getEmitOutput(fileName);
        if (output.emitSkipped) {
            console.log(`Emitting ${fileName} failed`);
            this._logErrors(fileName);
        }
        for (let outputFile of output.outputFiles) {
            this._ensureDir(outputFile.name);
            console.log(outputFile.name);
            fs.writeFileSync(outputFile.name, outputFile.text, 'utf8');
        }
    }

    private _ensureDir(filePath) {
        let dirname = path.dirname(filePath);
        if (fs.existsSync(dirname))
            return;
        this._ensureDir(dirname);
        fs.mkdirSync(dirname);
    }

    private _logErrors(fileName: string) {
        let allDiagnostics = this.services.getCompilerOptionsDiagnostics()
            .concat(this.services.getSyntacticDiagnostics(fileName))
            .concat(this.services.getSemanticDiagnostics(fileName));

        allDiagnostics.forEach(diagnostic => {
            let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            if (diagnostic.file) {
                let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                console.log(`  Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            }
            else
                console.log(`  Error: ${message}`);
        });
    }
}
