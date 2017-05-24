import { TypescriptTrackerFactory, TypescriptTrackerFactoryOptions } from '../typescript/typescript_tracker_factory';
import { TrackerContext } from '../tracking/tracker_context';
import { TrackerFactory } from '../tracking/tracker_factory';

export interface EntrypointTrackerFactoryOptions {
    typescriptOptions: TypescriptTrackerFactoryOptions;
}

export class EntrypointTrackerFactory extends TrackerFactory<EntrypointTrackerFactoryOptions> {
    constructor(trackerContext: TrackerContext, config: EntrypointTrackerFactoryOptions, private cwd?: string) {
        super(trackerContext, config);
    }

    typescriptTrackerFactory: TypescriptTrackerFactory;

    protected async onCreateChildFactoriesAsync(): Promise<TrackerFactory[]> {
        this.typescriptTrackerFactory = new TypescriptTrackerFactory(this.trackerContext, this.config.typescriptOptions, this.cwd);
        return [this.typescriptTrackerFactory];
    }
}
