import { TSConfigTrackerFactory } from './tsconfig_tracker_factory';
import { TerminalTrackerContext } from '../tracking/contexts/terminal_tracker_context';
import { LoadProcess } from '../loading/load_process';
import { WatcherConfig, WatcherTracker } from '../loading/watcher_tracker';
import { Connections } from '../tracking/connections/connections';
import { Tracker } from '../tracking/tracker';
import { TrackerContext } from '../tracking/tracker_context';
import { TrackerFactory } from '../tracking/tracker_factory';
import { TypescriptConfig, TypescriptTracker } from '../typescript/typescript_tracker';
import { ParsedCommandLine, parseJsonConfigFileContent, sys } from 'typescript';

export interface TypescriptTrackerFactoryOptions {
    tsConfig?: string | { [key: string]: any };
    watchConfig?: boolean;
    tsConfigIdleTime?: number;

    /** Explicitly set the typescript compiler to incremental or default.  If undefined, it is based on whether the tracker context is terminal. */
    incremental?: boolean;
}

export class TypescriptTrackerFactory extends TrackerFactory<TypescriptTrackerFactoryOptions> {
    static readonly factoryName = '@sharpangles/typescript';

    constructor(trackerContext: TrackerContext, config: TypescriptTrackerFactoryOptions, private cwd?: string) {
        super(trackerContext, config);
    }

    tsConfigTrackerFactory?: TSConfigTrackerFactory;
    typescriptWatcherTracker?: WatcherTracker;
    typescriptTracker: TypescriptTracker;

    protected async onCreateChildFactoriesAsync(): Promise<TrackerFactory[]> {
        let config = this.config || <TypescriptTrackerFactoryOptions>{};
        if (!config.tsConfig || typeof config.tsConfig === 'string') {
            this.tsConfigTrackerFactory = new TSConfigTrackerFactory(this.trackerContext, { tsConfig: config.tsConfig, watch: config.watchConfig }, this.cwd);
            return [this.tsConfigTrackerFactory];
        }
        return [];
    }

    /**
     * Creates up to four trackers, wiring up the impact of any configuration changes or watch progressions.
     * (Optional tsconfig watcher) => ( Optional ParsedCommandLine loader) => (Optional ts files watcher) => Typescript (incremental) compiler
     */
    protected async onCreateTrackersAsync(): Promise<Tracker[]> {
        this.typescriptTracker = new TypescriptTracker(this.cwd);
        let config = this.config || <TypescriptTrackerFactoryOptions>{};
        let incremental = config.incremental || config.incremental !== false && !(this.trackerContext instanceof TerminalTrackerContext);
        if (incremental) {
            this.typescriptWatcherTracker = new WatcherTracker({ name: 'TS files watcher', description: 'Watches for changes to ts files per the provided tsconfig or inline configuration.' });
            await Connections.runOnProgress(this.typescriptWatcherTracker, this.typescriptTracker, { name: 'TS change trigger', description: 'Builds typescript due to .ts changes.' }, result => result.progress).connectAsync();
        }
        if (this.tsConfigTrackerFactory) {
            await Connections.configOnSuccess<LoadProcess<ParsedCommandLine>, TypescriptConfig>(this.tsConfigTrackerFactory.fileTrackerFactory.fileLoader, this.typescriptTracker, { name: 'TSConfig trigger', description: 'Builds typescript due to a change in configuration.' }, load => <TypescriptConfig>{ config: load.result, incremental: incremental }).connectAsync();
            if (this.typescriptWatcherTracker)
                await Connections.runOnSuccess<LoadProcess<ParsedCommandLine>, WatcherConfig>(this.tsConfigTrackerFactory.fileTrackerFactory.fileLoader, this.typescriptWatcherTracker, { name: 'TS files watcher config', description: 'Resets the .ts files watcher due to a config change' }, load => <WatcherConfig>{ cwd: this.cwd, patterns: load.result.fileNames, idleTime: config && config.tsConfigIdleTime }).connectAsync();
        }
        else {
            let tsConfig = parseJsonConfigFileContent(config.tsConfig, sys, this.cwd || process.cwd());
            await this.typescriptTracker.configureAsync(<TypescriptConfig>{ config: tsConfig, incremental: incremental });
            if (this.typescriptWatcherTracker)
                await this.typescriptWatcherTracker.configureAsync(<WatcherConfig>{ cwd: this.cwd, patterns: tsConfig.fileNames, idleTime: config.tsConfigIdleTime });
        }
        return (<Tracker[]>[this.typescriptWatcherTracker, this.typescriptTracker]).filter(t => t);
    }

    /**
     * Starts the watcher(s), otherwise compiles typescript based on the TSConfig loader or inlined tsconfg.
     */
    protected onStart() {
        if (this.tsConfigTrackerFactory)
            return;
        if (this.typescriptWatcherTracker)
            this.typescriptWatcherTracker.runProcess();
        else
            this.typescriptTracker.runProcess();
    }
}
