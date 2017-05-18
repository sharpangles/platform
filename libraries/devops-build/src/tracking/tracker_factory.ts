import { FactoryConfig } from './tracker_factory_loader';
import { TrackerContext } from './tracker_context';
import { Tracker } from './tracker';

/**
 * Builds and starts trackers in the tracker context.
 */
export abstract class TrackerFactory<TConfig = any> {
    constructor(protected trackerContext: TrackerContext, public config: FactoryConfig<TConfig>) {
    }

    async createTrackersAsync() {
        this.trackers = await this.onCreateTrackersAsync();
        this.trackerContext.onTrackersCreated(this);
        return this.trackers;
    }

    trackers: Tracker[];

    protected abstract onCreateTrackersAsync(): Promise<Tracker[]>;

    /** Called after all present factories have had their trackers created. */
    abstract start(): void;

    async disposeAsync() {
        for (let t of this.trackers)
            await t.disposeAsync();

        // await Promise.all(this.trackers.map(t => t.disposeAsync()));
    }
}
