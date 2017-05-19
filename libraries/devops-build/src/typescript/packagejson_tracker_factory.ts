import { FileLoadSource } from '../loading/file_load_source';
import { JsonLoadSource } from '../loading/json_load_source';
import { FileTrackerFactory, FileTrackerFactoryOptions } from '../loading/file_tracker_factory';
import { TrackerContext } from '../tracking/tracker_context';
import { TrackerFactory } from '../tracking/tracker_factory';

export interface PackageJsonTrackerFactoryOptions {
    watch?: boolean;
}

export class PackageJsonTrackerFactory extends TrackerFactory<PackageJsonTrackerFactoryOptions> {
    static readonly factoryName = '@sharpangles/projects-packagejson';

    constructor(trackerContext: TrackerContext, config: PackageJsonTrackerFactoryOptions, private cwd?: string) {
        super(trackerContext, config);
    }

    fileTrackerFactory?: FileTrackerFactory;

    protected async onCreateChildFactoriesAsync(): Promise<TrackerFactory[]> {
        this.fileTrackerFactory = new FileTrackerFactory(this.trackerContext, <FileTrackerFactoryOptions>{ file: 'package.json', watch: this.config && this.config.watch }, new JsonLoadSource(new FileLoadSource('package.json')), this.cwd);
        return [this.fileTrackerFactory];
    }
}
