import { Subscription } from 'rxjs/Subscription';
import { TrackerProcess } from './tracker_process';
import { Tracker } from './tracker';
import { TrackerConnection } from './tracker_connection';

export interface Type {
}

export class OnSuccessTrackerConnection extends TrackerConnection {
    constructor(source: Tracker, target: Tracker, public processFactory: (process: TrackerProcess) => TrackerProcess | undefined) {
        super(source, target);
    }

    private subscription: Subscription;

    async connectAsync(): Promise<void> {
        this.subscription = this.source.succeeded.subscribe(p => {
            let proc = this.processFactory(p);
            if (proc)
                this.target.runProcess(proc);
        });
    }

    async breakAsync(): Promise<void> {
        if (this.subscription)
            this.subscription.unsubscribe();
        super.breakAsync();
    }
}
