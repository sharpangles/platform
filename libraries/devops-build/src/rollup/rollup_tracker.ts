import { RollupCompiler, RollupConfig } from './rollup_compiler';
import { OverridingTracker } from '../tracking/trackers/overriding_tracker';
import { AsyncTrackerProcess } from '../tracking/processes/async_tracker_process';

export class RollupTracker extends OverridingTracker<AsyncTrackerProcess, RollupConfig> {
    constructor(private cwd?: string) {
        super({
            name: 'Rollup Compiler',
            description: 'Rolls up existing es6 build output to a single file.'
        });
    }

    async configureAsync(config: RollupConfig) {
        this.compiler = new RollupCompiler(config, undefined, this.cwd);
        this.runProcess();
    }

    protected createProcess(state?: string[]): AsyncTrackerProcess | undefined {
        return AsyncTrackerProcess.create(() => this.compiler.rollupAsync());
    }

    compiler: RollupCompiler;
}
