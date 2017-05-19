import { FileTrackerFactory, FileTrackerFactoryOptions } from '../loading/file_tracker_factory';
import { TrackerContext } from '../tracking/tracker_context';
import { TrackerFactory } from '../tracking/tracker_factory';
import { TSConfigLoadSource } from './tsconfig_load_source';

export interface TSConfigTrackerFactoryOptions {
    tsConfig?: string;
    watch?: boolean;
}

export class TSConfigTrackerFactory extends TrackerFactory<TSConfigTrackerFactoryOptions> {
    static readonly factoryName = '@sharpangles/projects-tsconfig';

    constructor(trackerContext: TrackerContext, config: TSConfigTrackerFactoryOptions, private cwd?: string) {
        super(trackerContext, config);
    }

    fileTrackerFactory: FileTrackerFactory;

    protected async onCreateChildFactoriesAsync(): Promise<TrackerFactory[]> {
        let config = this.config || <TSConfigTrackerFactoryOptions>{};
        let file = config && config.tsConfig || 'tsconfig.json';
        this.fileTrackerFactory = new FileTrackerFactory(this.trackerContext, <FileTrackerFactoryOptions>{ file: file, watch: config.watch }, new TSConfigLoadSource(file), this.cwd);
        return [this.fileTrackerFactory];
    }
}
