import { ConfigurationConnection } from '../configuration/configuration_connection';
import { LoadProcess } from '../loading/load_process';
import { WatcherConfig, WatcherTracker } from '../loading/watcher_tracker';
import { OnProgressConnection } from '../tracking/on_progress_connection';
import { OverridingTracker } from '../tracking/overriding_tracker';
import { Tracker } from '../tracking/tracker';
import { TrackerFactory } from '../tracking/tracker_factory';
import { TypescriptConfig, TypescriptTracker } from '../typescript/typescript_tracker';
import { TsConfigLoadSource } from './tsconfig_load_source';
import * as glob from 'glob';
import { ParsedCommandLine } from 'typescript';

export interface TypescriptTrackerFactoryOptions {
    glob?: string;
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
    tsConfigLoader: OverridingTracker<LoadProcess<ParsedCommandLine>>;
    typescriptTracker: TypescriptTracker;

    /**
     * (Optional Watcher) => ParsedCommandLine Loader => Typescript Compiler
     */
    async createTrackersAsync(tracker: Tracker) {
        for (let tsConfig in await new Promise((resolve, reject) => glob(this.options.glob || 'tsconfig.json', (err, matches) => err ? reject(err) : resolve(matches)))) {
            this.tsConfigLoader = new OverridingTracker<LoadProcess<ParsedCommandLine>>(() => new LoadProcess(new TsConfigLoadSource(tsConfig)));
            this.typescriptTracker = new TypescriptTracker(this.cwd);
            await new ConfigurationConnection<ParsedCommandLine, TypescriptConfig>(this.tsConfigLoader, this.typescriptTracker, load => <TypescriptConfig>{ config: load, incremental: this.options.incremental }).connectAsync();
            if (this.options.watchConfig) {
                this.tsConfigWatcherTracker = new WatcherTracker();
                this.tsConfigWatcherTracker.configure(<WatcherConfig>{ cwd: this.cwd, patterns: [tsConfig], idleTime: this.options.tsConfigIdleTime });
                await new OnProgressConnection(this.tsConfigWatcherTracker, this.tsConfigLoader, (proc, progress) => {}).connectAsync();
            }
        }
    }

    start() {
        if (this.tsConfigWatcherTracker)
            this.tsConfigWatcherTracker.runProcess(undefined);
        else
            this.tsConfigLoader.runProcess(undefined);
    }
}
