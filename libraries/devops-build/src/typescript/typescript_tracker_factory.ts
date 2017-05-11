import { ConfigurationConnection } from '../configuration/configuration_connection';
import { LoadProcess } from '../loading/load_process';
import { WatcherConfig, WatcherTracker } from '../loading/watcher_tracker';
import { OnProgressConnection } from '../tracking/on_progress_connection';
import { OverridingTracker } from '../tracking/overriding_tracker';
import { Tracker } from '../tracking/tracker';
import { TrackerFactory } from '../tracking/tracker_factory';
import { TypescriptConfig, TypescriptTracker } from '../typescript/typescript_tracker';
import { TsConfigLoadSource } from './tsconfig_load_source';
import { ParsedCommandLine, parseJsonConfigFileContent, sys } from 'typescript';

export interface TypescriptTrackerFactoryOptions {
    tsConfig?: string | { [key: string]: any };
    watchConfig?: boolean;
    tsConfigIdleTime?: number;
    incremental?: boolean;
}

export class TypescriptTrackerFactory implements TrackerFactory {
    constructor(public options: TypescriptTrackerFactoryOptions, cwd?: string) {
        this.cwd = cwd || process.cwd();
    }

    cwd: string;

    tsConfigWatcherTracker?: WatcherTracker;
    tsConfigLoader?: OverridingTracker<LoadProcess<ParsedCommandLine>>;
    typescriptWatcherTracker?: WatcherTracker;
    typescriptTracker: TypescriptTracker;

    /**
     * Creates up to four trackers, wiring up the impact of any configuration changes or watch progressions.
     * (Optional tsconfig watcher) => ( Optional ParsedCommandLine loader) => (Optional ts files watcher) => Typescript (incremental) compiler
     */
    async createTrackersAsync(tracker?: Tracker): Promise<Tracker[]> {
        this.typescriptTracker = new TypescriptTracker(this.cwd);
        if (this.options.incremental) {
            this.typescriptWatcherTracker = new WatcherTracker();
            await new OnProgressConnection<string[]>(this.typescriptWatcherTracker, this.typescriptTracker, (proc, progress) => progress).connectAsync();
        }
        if (!this.options.tsConfig || typeof this.options.tsConfig === 'string') {
            let file = this.options.tsConfig || 'tsconfig.json';
            this.tsConfigLoader = new OverridingTracker<LoadProcess<ParsedCommandLine>>(() => new LoadProcess(new TsConfigLoadSource(file)));
            await new ConfigurationConnection<ParsedCommandLine, TypescriptConfig>(this.tsConfigLoader, this.typescriptTracker, load => <TypescriptConfig>{ config: load, incremental: this.options.incremental }).connectAsync();
            if (this.typescriptWatcherTracker) // Change ts watch when tsconfig changes
                await new ConfigurationConnection<ParsedCommandLine, WatcherConfig>(this.tsConfigLoader, this.typescriptWatcherTracker, load => <WatcherConfig>{ cwd: this.cwd, patterns: load.fileNames, idleTime: this.options.tsConfigIdleTime }).connectAsync();
            if (this.options.watchConfig) {
                this.tsConfigWatcherTracker = new WatcherTracker();
                await this.tsConfigWatcherTracker.configureAsync(<WatcherConfig>{ cwd: this.cwd, patterns: [file], idleTime: this.options.tsConfigIdleTime });
                await new OnProgressConnection(this.tsConfigWatcherTracker, this.tsConfigLoader).connectAsync();
            }
        }
        else {
            await this.typescriptTracker.configureAsync(<TypescriptConfig>{ config: parseJsonConfigFileContent(this.options.tsConfig, sys, this.cwd), incremental: this.options.incremental });
            if (this.typescriptWatcherTracker)
                await this.typescriptWatcherTracker.configureAsync(<WatcherConfig>{ cwd: this.cwd, patterns: this.options.tsConfig.fileNames, idleTime: this.options.tsConfigIdleTime });
        }
        return (<Tracker[]>[this.tsConfigWatcherTracker, this.tsConfigLoader, this.typescriptWatcherTracker, this.typescriptTracker]).filter(t => t);
    }

    /**
     * Starts the watcher(s), otherwise compiles typescript based on the TSConfig loader or inlined tsconfg.
     */
    start() {
        if (this.tsConfigWatcherTracker)
            this.tsConfigWatcherTracker.runProcess();
        else if (this.tsConfigLoader)
            this.tsConfigLoader.runProcess();
        if (this.typescriptWatcherTracker)
            this.typescriptWatcherTracker.runProcess();
        if (!this.tsConfigWatcherTracker && !this.tsConfigLoader && !this.typescriptWatcherTracker)
            this.typescriptTracker.runProcess();
    }
}
