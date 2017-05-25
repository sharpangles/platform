import { TrackerContext } from './tracker_context';
import { Tracker } from './tracker';

/**
 * Builds and starts trackers in the tracker context.
 */
export abstract class TrackerFactory<TConfig = any> {
    constructor(protected trackerContext: TrackerContext, public config: TConfig) {
    }

    /** An optional key by which to differentiate this factory from others of the same type.  If undefined, its key is its type name. */
    get key(): string | undefined { return undefined; }

    async createAsync() {
        if (this.childFactories)
            throw new Error('Trackers already created.');
        this.childFactories = await this.onCreateChildFactoriesAsync();
        for (let f of this.childFactories)
            await f.createAsync();
        this.trackers = await this.onCreateTrackersAsync();
        this.trackerContext.onTrackersCreated(this);
        return this.trackers;
    }

    trackers: Tracker[];
    childFactories: TrackerFactory[];

    /** Creates any child factories.  Any created factories can safely have their createAsync method called either in here or by the base.  It only happens once. */
    protected async onCreateChildFactoriesAsync(): Promise<TrackerFactory[]> {
        return [];
    }

    protected async onCreateTrackersAsync(): Promise<Tracker[]> {
        return [];
    }

    /** Called after all present factories have had their trackers created. */
    start(): void {
        for (let childFactory of this.childFactories)
            childFactory.start();
        this.onStart();
    }

    protected onStart(): void {
    }

    async disposeAsync() {
        for (let t of this.trackers)
            await t.disposeAsync();
        for (let f of this.childFactories)
            await f.disposeAsync();
    }
}
