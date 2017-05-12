import { Description } from '../description';
import { Tracker } from '../tracker';
import { Connection } from '../connection';
import { Subscription } from 'rxjs/Subscription';

/**
 * Connections provide a context independent of trackers.
 * When a tracker is removed, it breaks its connections.
 */
export abstract class SubscriptionConnection extends Connection {
    constructor(source: Tracker, target: Tracker, public description: Description) {
        super(source, target, description);
    }

    protected abstract createSubscription(): Subscription;

    private subscription: Subscription;

    async connectAsync(): Promise<void> {
        this.subscription = this.createSubscription();
    }

    async breakAsync(): Promise<void> {
        if (this.subscription)
            this.subscription.unsubscribe();
        this.source.removeSource(this);
        this.source.removeTarget(this);
    }
}
