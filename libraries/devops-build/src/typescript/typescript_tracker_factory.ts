import { LoadProcess } from '../loading/load_process';
import { WatcherConfig, WatcherTracker } from '../loading/watcher_tracker';
import { Connections } from '../tracking/connections/connections';
import { Tracker } from '../tracking/tracker';
import { TrackerContext } from '../tracking/tracker_context';
import { TrackerFactory } from '../tracking/tracker_factory';
import { OverridingTracker } from '../tracking/trackers/overriding_tracker';
import { TypescriptConfig, TypescriptTracker } from '../typescript/typescript_tracker';
import { TsConfigLoadSource } from './tsconfig_load_source';
import { ParsedCommandLine, parseJsonConfigFileContent, sys } from 'typescript';

export interface TypescriptTrackerFactoryOptions {
    tsConfig?: string | { [key: string]: any };
    watchConfig?: boolean;
    tsConfigIdleTime?: number;
    incremental?: boolean;
}

export class TypescriptTrackerFactory extends TrackerFactory {
    constructor(trackerContext: TrackerContext, public options: TypescriptTrackerFactoryOptions, private cwd?: string) {
        super(trackerContext);
    }

    tsConfigWatcherTracker?: WatcherTracker;
    tsConfigLoader?: OverridingTracker<LoadProcess<ParsedCommandLine>>;
    typescriptWatcherTracker?: WatcherTracker;
    typescriptTracker: TypescriptTracker;

    /**
     * Creates up to four trackers, wiring up the impact of any configuration changes or watch progressions.
     * (Optional tsconfig watcher) => ( Optional ParsedCommandLine loader) => (Optional ts files watcher) => Typescript (incremental) compiler
     */
    protected async onCreateTrackersAsync(tracker?: Tracker): Promise<Tracker[]> {
        this.typescriptTracker = new TypescriptTracker(this.cwd);
        if (this.options.incremental) {
            this.typescriptWatcherTracker = new WatcherTracker({ name: 'TS files watcher', description: 'Watches for changes to ts files per the provided tsconfig or inline configuration.' });
            await Connections.runOnProgress(this.typescriptWatcherTracker, this.typescriptTracker, { name: 'TS change trigger', description: 'Builds typescript due to .ts changes.' }, result => result.progress).connectAsync();
        }
        if (!this.options.tsConfig || typeof this.options.tsConfig === 'string') {
            let file = this.options.tsConfig || 'tsconfig.json';
            this.tsConfigLoader = new OverridingTracker<LoadProcess<ParsedCommandLine>>({ name: 'TSConfig loader', description: 'Reads the TSConfig file.' }, () => new LoadProcess(new TsConfigLoadSource(file)));
            await Connections.configOnSuccess<LoadProcess<ParsedCommandLine>, TypescriptConfig>(this.tsConfigLoader, this.typescriptTracker, { name: 'TSConfig trigger', description: 'Builds typescript due to a change in configuration.' }, load => <TypescriptConfig>{ config: load.result, incremental: this.options.incremental }).connectAsync();
            if (this.typescriptWatcherTracker)
                await Connections.runOnSuccess<LoadProcess<ParsedCommandLine>, WatcherConfig>(this.tsConfigLoader, this.typescriptWatcherTracker, { name: 'TS files watcher config', description: 'Resets the .ts files watcher due to a config change' }, load => <WatcherConfig>{ cwd: this.cwd, patterns: load.result.fileNames, idleTime: this.options.tsConfigIdleTime }).connectAsync();
            if (this.options.watchConfig) {
                this.tsConfigWatcherTracker = new WatcherTracker({ name: 'TSConfig watcher', description: 'Watches for TSConfig changes.' });
                await this.tsConfigWatcherTracker.configureAsync(<WatcherConfig>{ cwd: this.cwd, patterns: [file], idleTime: this.options.tsConfigIdleTime });
                await Connections.runOnProgress(this.tsConfigWatcherTracker, this.tsConfigLoader, { name: 'TSConfig watcher config', description: 'Reloads TSConfig when it changes.' }).connectAsync();
            }
        }
        else {
            await this.typescriptTracker.configureAsync(<TypescriptConfig>{ config: parseJsonConfigFileContent(this.options.tsConfig, sys, this.cwd || process.cwd()), incremental: this.options.incremental });
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
        if (!this.tsConfigLoader && this.typescriptWatcherTracker)
            this.typescriptWatcherTracker.runProcess();
        if (!this.tsConfigWatcherTracker && !this.tsConfigLoader && !this.typescriptWatcherTracker)
            this.typescriptTracker.runProcess();
    }
}
