import { Subscription } from 'rxjs/Subscription';
import { TrackerProcess } from './tracker_process';
import { Tracker } from './tracker';
import { TrackerConnection } from './tracker_connection';

export class OnSuccessTrackerConnection extends TrackerConnection {
    constructor(source: Tracker, target: Tracker, public connectionStateFactory: (process: TrackerProcess) => any) {
        super(source, target);
    }

    private subscription: Subscription;

    async connectAsync(): Promise<void> {
        this.subscription = this.source.succeeded.subscribe(p => {
            let connectionState = this.connectionStateFactory(p);
            if (connectionState)
                this.target.runProcess(connectionState);
        });
    }

    async breakAsync(): Promise<void> {
        if (this.subscription)
            this.subscription.unsubscribe();
        super.breakAsync();
    }
}
