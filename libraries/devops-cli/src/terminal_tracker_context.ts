import { Subscription } from 'rxjs/Subscription';
import { Tracker, TrackerContext, TrackerFactory } from '@sharpangles/devops-build';

export class TerminalTrackerContext extends TrackerContext {
    constructor(public completingTrackerType: any) {
        super();
    }

    completingTracker: Tracker;
    private subscription: Subscription;

    onTrackersCreated(factory: TrackerFactory) {
        super.onTrackersCreated(factory);
        let tracker = factory.trackers.find(t => t instanceof this.completingTrackerType);
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
    }
}
