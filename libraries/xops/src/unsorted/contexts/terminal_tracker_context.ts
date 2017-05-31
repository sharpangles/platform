import { Tracker } from '../tracker';
import { TrackerContext } from '../tracker_context';
import { TrackerFactory } from '../tracker_factory';
import { TrackerFactoryLoader } from '../tracker_factory_loader';
import { Subscription } from 'rxjs/Subscription';

/** A context that ends itself when a particular tracker completes. */
export class TerminalTrackerContext extends TrackerContext {
    /**
     * @param completingTrackerType The type of the trackers whose complete event causes disposal of all trackers
     * @param forceQuit In a perfect world all trackers and processes clean up their open tasks and node gracefully ends the process.  If this is unrealistic, set this to true.
     */
    constructor(trackerFactoryLoader: TrackerFactoryLoader, private trackerPredicate: (factory: TrackerFactory, tracker: Tracker) => boolean, private forceQuit?: boolean) {
        super(trackerFactoryLoader);
    }

    completingTracker: Tracker;
    private subscription: Subscription;

    onTrackersCreated(factory: TrackerFactory) {
        super.onTrackersCreated(factory);
        let tracker = factory.trackers.find(t => this.trackerPredicate(factory, t));
        if (!tracker)
            return;
        if (this.completingTracker)
            throw new Error('Already have a completing tracker of that type');
        this.completingTracker = tracker;
        this.subscription = this.completingTracker.completed.subscribe(() => this.disposeAsync());
    }

    async disposeAsync() {
        this.subscription.unsubscribe();
        await super.disposeAsync();
        if (this.forceQuit)
            process.exit();
    }
}
