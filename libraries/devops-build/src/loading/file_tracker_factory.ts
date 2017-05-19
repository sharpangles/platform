import { LoadSource } from './load_source';
import { Description } from '../tracking/description';
import { LoadProcess } from '../loading/load_process';
import { WatcherConfig, WatcherTracker } from '../loading/watcher_tracker';
import { Connections } from '../tracking/connections/connections';
import { Tracker } from '../tracking/tracker';
import { TrackerContext } from '../tracking/tracker_context';
import { TrackerFactory } from '../tracking/tracker_factory';
import { OverridingTracker } from '../tracking/trackers/overriding_tracker';
import { ParsedCommandLine } from 'typescript';

export interface FileTrackerFactoryOptions {
    file: string;
    watch?: boolean;
}

export class FileTrackerFactory extends TrackerFactory<FileTrackerFactoryOptions> {
    constructor(trackerContext: TrackerContext, config: FileTrackerFactoryOptions, private loadSource: LoadSource, protected cwd?: string) {
        super(trackerContext, config);
    }

    fileWatcherTracker?: WatcherTracker;
    fileLoader: OverridingTracker<LoadProcess<ParsedCommandLine>>;

    protected createLoaderDescription(file: string): Description {
        return { name: 'File Loader', description: `Loads ${file}.` };
    }

    protected createWatcherDescription(file: string): Description {
        return { name: 'File watcher', description: `Watches for changes in ${file}.` };
    }

    protected createConnectionDescription(file: string): Description {
        return { name: 'File changed', description: `Reloads ${file} when it changes.` };
    }

    protected async onCreateTrackersAsync(): Promise<Tracker[]> {
        let config = this.config || <FileTrackerFactoryOptions>{};
        this.fileLoader = new OverridingTracker<LoadProcess<ParsedCommandLine>>(this.createLoaderDescription(config.file), () => new LoadProcess(this.loadSource));
        if (config && config.watch) {
            this.fileWatcherTracker = new WatcherTracker(this.createWatcherDescription(config.file));
            await this.fileWatcherTracker.configureAsync(<WatcherConfig>{ cwd: this.cwd, patterns: [config.file] });
            await Connections.runOnProgress(this.fileWatcherTracker, this.fileLoader, this.createConnectionDescription(config.file)).connectAsync();
        }
        return (<Tracker[]>[this.fileWatcherTracker, this.fileLoader]).filter(t => t);
    }

    /**
     * Starts the watcher(s), otherwise compiles typescript based on the TSConfig loader or inlined tsconfg.
     */
    start() {
        if (this.fileWatcherTracker)
            this.fileWatcherTracker.runProcess();
        else
            this.fileLoader.runProcess();
    }
}
