import { TypescriptCompiler } from '../typescript/typescript_compiler';
import { TypescriptIncrementalCompiler } from '../typescript/typescript_incremental_compiler';
import { OverridingTracker } from '../tracking/trackers/overriding_tracker';
import { AsyncTrackerProcess } from '../tracking/processes/async_tracker_process';
import { ParsedCommandLine } from 'typescript';

export interface TypescriptConfig {
    config: ParsedCommandLine | string;
    incremental?: boolean;
}

export class TypescriptTracker extends OverridingTracker<AsyncTrackerProcess, TypescriptConfig, string[] | undefined> {
    constructor(private cwd?: string) {
        super({
            name: 'Typescript Compiler',
            description: 'Compiles typescript with optional incremental support.'
        });
    }

    async configureAsync(config: TypescriptConfig) {
        if (this.compiler)
            this.compiler.dispose();
        this.compiler = config.incremental ? new TypescriptIncrementalCompiler(this.cwd, config.config) : new TypescriptCompiler(this.cwd, config.config);
        this.runProcess();
    }

    protected createProcess(state?: string[]): AsyncTrackerProcess | undefined {
        return AsyncTrackerProcess.create(() => this.compiler.compileAsync(state));
    }

    compiler: TypescriptCompiler;

    protected async onDisposeAsync() {
        if (this.compiler)
            this.compiler.dispose();
    }
}
