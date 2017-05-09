import { TypescriptCompiler } from '../typescript/typescript_compiler';
import { TypescriptIncrementalCompiler } from '../typescript/typescript_incremental_compiler';
import { OverridingTracker } from '../tracking/overriding_tracker';
import { AsyncTrackerProcess } from '../tracking/async_tracker_process';
import { ParsedCommandLine } from 'typescript';

export interface TypescriptConfig {
    config: ParsedCommandLine | string;
    incremental?: boolean;
}

export class TypescriptTracker extends OverridingTracker<AsyncTrackerProcess, TypescriptConfig, string[] | undefined> {
    constructor(cwd?: string) {
        super();
        this.cwd = cwd || process.cwd();
    }

    private cwd: string;

    configure(config: TypescriptConfig) {
        if (this.compiler)
            this.compiler.dispose();
        this.compiler = config.incremental ? new TypescriptIncrementalCompiler(this.cwd, config.config) : new TypescriptCompiler(this.cwd, config.config);
    }

    protected createProcess(state: string[] | undefined): AsyncTrackerProcess | undefined {
        return new AsyncTrackerProcess(() => this.compiler.compileAsync(state));
    }

    compiler: TypescriptCompiler;

    protected async onDisposeAsync() {
        if (this.compiler)
            this.compiler.dispose();
    }
}
