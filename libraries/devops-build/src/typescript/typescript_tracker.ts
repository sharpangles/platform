import { TypescriptCompiler } from '../typescript/typescript_compiler';
import { TypescriptIncrementalCompiler } from '../typescript/typescript_incremental_compiler';
import { OverridingTracker } from '../tracking/overriding_tracker';
import { AsyncTrackerProcess } from '../tracking/async_tracker_process';
import { ParsedCommandLine } from 'typescript';

export interface TypescriptConfig {
    /** Providing this rebuilds the compiler each time. */
    config?: ParsedCommandLine | string;
    files?: string[];
}

export class TypescriptTracker extends OverridingTracker<AsyncTrackerProcess, TypescriptConfig> {
    constructor(cwd?: string) {
        super();
        this.cwd = cwd || process.cwd();
    }

    private cwd: string;

    createProcess(config: TypescriptConfig): AsyncTrackerProcess | undefined {
        if (config.config) {
            if (this.compiler)
                this.compiler.dispose();
            this.compiler = new TypescriptIncrementalCompiler(this.cwd, config.config);
        }
        return new AsyncTrackerProcess(() => this.compiler.compileAsync(config.files));
    }

    compiler: TypescriptCompiler;

    protected async onDisposeAsync() {
        this.compiler.dispose();
    }
}
