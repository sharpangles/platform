import { Subscription } from 'rxjs/Subscription';
import { TrackerProcess } from '../processes/tracker_process';
import { Tracker } from '../trackers/tracker';
import { TrackerConnection } from './tracker_connection';

export interface Type {
}

export class OnProgressConnection extends TrackerConnection {
    constructor(source: Tracker, target: Tracker, public processFactory: (process: TrackerProcess, progress: any) => TrackerProcess) {
        super(source, target);
    }

    private subscription: Subscription;

    async connectAsync(): Promise<void> {
        this.subscription = this.source.progressed.subscribe(p => this.target.runProcessAsync(this.processFactory(p.trackerProcess, p.progress)));
    }

    async breakAsync(): Promise<void> {
        if (this.subscription)
            this.subscription.unsubscribe();
        super.breakAsync();
    }
}
