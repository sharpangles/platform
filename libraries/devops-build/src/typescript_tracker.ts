import { WatchChange, Watcher } from './watcher';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as fs from 'fs';
import * as ts from 'typescript';
import * as path from 'path';

export class TypescriptTracker {
    constructor(cwd?: string, tsconfigFileName: string = 'tsconfig.json', watch: Watcher | boolean = false) {
        this._cwd = cwd || process.cwd();
        this._watcher = watch instanceof Watcher ? watch : watch ? new Watcher([], this._cwd) : undefined;
        let tsconfig = this._parseTsConfig(tsconfigFileName);
        this.rootFileNames = tsconfig.fileNames;
        this._createLanguageService(this.rootFileNames, tsconfig.options);
        if (this._watcher)
            this._watcher.changed.subscribe(change => this.change(change));
    }

    private _cwd: string;
    services: ts.LanguageService;
    rootFileNames: string[] = [];
    files: ts.MapLike<{ version: number }> = {};
    private _watcher?: Watcher;

    private _parseTsConfig(tsconfig: string) {
        const fileName = ts.findConfigFile(this._cwd, ts.sys.fileExists, tsconfig);
        if (!fileName)
            throw new Error(`couldn't find 'tsconfig.json' in ${this._cwd}`);
        const text = ts.sys.readFile(fileName);
        const result = ts.parseConfigFileTextToJson(fileName, text);
        if (result.error)
            throw new Error(`failed to parse ${fileName}`);
        return ts.parseJsonConfigFileContent(result.config, ts.sys, path.dirname(fileName), undefined, fileName);
    }

    private _createLanguageService(rootFileNames: string[], options: ts.CompilerOptions) {
        for (let fileName of rootFileNames)
            this.files[fileName] = { version: 0 };
        const servicesHost: ts.LanguageServiceHost = {
            getScriptFileNames: () => rootFileNames,
            getScriptVersion: (fileName) => this.files[fileName] && this.files[fileName].version.toString(),
            getScriptSnapshot: (fileName) => {
                if (!fs.existsSync(fileName))
                    return undefined;
                return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
            },
            getCurrentDirectory: () => this._cwd,
            getCompilationSettings: () => options,
            getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
        };
        this.services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
    }

    get changed(): Observable<WatchChange> { return this._changed; }
    private _changed = new Subject<WatchChange>();

    change(change: WatchChange) {
        for (let fileName of change.changes) {
            // if (+curr.mtime <= +prev.mtime)
            //     return;
            fileName = path.resolve(fileName).split(path.sep).join('/');
            this.files[fileName].version++;
            this.emitFile(fileName);
        }
        this._changed.next(change);
    }

    run() {
        for (let fileName of this.rootFileNames) {
            this.emitFile(fileName);
            if (this._watcher)
                this._watcher.watcher.add(fileName);
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
