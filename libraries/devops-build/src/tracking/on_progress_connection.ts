import { Subscription } from 'rxjs/Subscription';
import { TrackerProcess } from './tracker_process';
import { Tracker } from './tracker';
import { TrackerConnection } from './tracker_connection';

export class OnProgressConnection<TProgress = any> extends TrackerConnection {
    constructor(source: Tracker, target: Tracker, public connectionStateFactory: (process: TrackerProcess, progress: TProgress) => any) {
        super(source, target);
    }

    private subscription: Subscription;

    async connectAsync(): Promise<void> {
        this.subscription = this.source.progressed.subscribe(p => {
            let connectionState = this.connectionStateFactory(p.trackerProcess, p.progress);
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
