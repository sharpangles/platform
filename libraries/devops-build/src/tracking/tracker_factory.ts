import { TrackerContext } from './tracker_context';
import { Tracker } from './tracker';

export abstract class TrackerFactory {
    constructor(protected trackerContext: TrackerContext) {
    }

    async createTrackersAsync(tracker?: Tracker) {
        this.trackers = await this.onCreateTrackersAsync(tracker);
        this.trackerContext.onTrackersCreated(this);
        return this.trackers;
    }

    trackers: Tracker[];

    protected abstract onCreateTrackersAsync(tracker?: Tracker): Promise<Tracker[]>;

    abstract start(): void;

    async disposeAsync() {
        for (let t of this.trackers)
            await t.disposeAsync();

        // await Promise.all(this.trackers.map(t => t.disposeAsync()));
    }
}
