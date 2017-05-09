import { Subscription } from 'rxjs/Subscription';
import { TrackerProcess } from '../processes/tracker_process';
import { Tracker } from '../trackers/tracker';
import { TrackerConnection } from './tracker_connection';

export interface Type {
}

export class OnSuccessTrackerConnection extends TrackerConnection {
    constructor(source: Tracker, target: Tracker, public processFactory: (process: TrackerProcess) => TrackerProcess) {
        super(source, target);
    }

    private subscription: Subscription;

    async connectAsync(): Promise<void> {
        this.subscription = this.source.succeeded.subscribe(p => this.target.runProcessAsync(this.processFactory(p)));
    }

    async breakAsync(): Promise<void> {
        if (this.subscription)
            this.subscription.unsubscribe();
        super.breakAsync();
    }
}
