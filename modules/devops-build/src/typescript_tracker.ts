import * as fs from 'fs';
import * as ts from 'typescript';

export class TypescriptTracker {
    constructor(cwd: string, tsconfigFileName: string = 'tsconfig.json') {
        this._cwd = cwd || process.cwd();
        let tsconfig = this._parseTsConfig(tsconfigFileName);
        tsconfig.fileNames.
        this._createLanguageService();
    }

    private _cwd: string;
    services: ts.LanguageService;
    files: ts.MapLike<{ version: number }> = {};

    private _parseTsConfig(tsconfig: string) {
        ts.parseCommandLine()
	    const fileName = ts.findConfigFile(process.cwd(), ts.sys.fileExists, tsconfig);
	    if (!fileName)
		    throw new Error(`couldn't find 'tsconfig.json' in ${process.cwd()}`);
	    const text = ts.sys.readFile(fileName);
	    const result = ts.parseConfigFileTextToJson(fileName, text);
        if (result.error)
            throw new Error(`failed to parse ${fileName}`);
        return ts.parseJsonConfigFileContent(result.config, ts.sys, path.dirname(fileName), getOptionsOverrides(), fileName);
    }

    private _createLanguageService() {
        // initialize the list of files
        rootFileNames.forEach(fileName => {
            this.files[fileName] = { version: 0 };
        });

        // Create the language service host to allow the LS to communicate with the host
        const servicesHost: ts.LanguageServiceHost = {
            getScriptFileNames: () => rootFileNames,
            getScriptVersion: (fileName) => this.files[fileName] && this.files[fileName].version.toString(),
            getScriptSnapshot: (fileName) => {
                if (!fs.existsSync(fileName)) {
                    return undefined;
                }

                return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
            },
            getCurrentDirectory: () => process.cwd(),
            getCompilationSettings: () => options,
            getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
        };

        // Create the language service files
        this.services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
    }

    watch(rootFileNames: string[], options: ts.CompilerOptions) {

        // Now let's watch the files
        rootFileNames.forEach(fileName => {
            // First time around, emit all files
            this.emitFile(fileName);

            // Add a watch on the file to handle next change
            fs.watchFile(fileName,
                { persistent: true, interval: 250 },
                (curr, prev) => {
                    // Check timestamp
                    if (+curr.mtime <= +prev.mtime) {
                        return;
                    }

                    // Update the version to signal a change in the file
                    this.files[fileName].version++;

                    // write the changes to disk
                    this.emitFile(fileName);
                });
        });
    }

    emitFile(fileName: string) {
        let output = this.services.getEmitOutput(fileName);

        if (!output.emitSkipped) {
            console.log(`Emitting ${fileName}`);
        }
        else {
            console.log(`Emitting ${fileName} failed`);
            this._logErrors(fileName);
        }

        output.outputFiles.forEach(o => {
            fs.writeFileSync(o.name, o.text, 'utf8');
        });
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
