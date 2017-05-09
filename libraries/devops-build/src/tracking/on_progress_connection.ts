import { Subscription } from 'rxjs/Subscription';
import { TrackerProcess } from './tracker_process';
import { Tracker } from './tracker';
import { TrackerConnection } from './tracker_connection';

export interface Type {
}

export class OnProgressConnection<TProgress = any> extends TrackerConnection {
    constructor(source: Tracker<TProgress>, target: Tracker, public processFactory: (process: TrackerProcess<TProgress>, progress: TProgress) => TrackerProcess | undefined) {
        super(source, target);
    }

    private subscription: Subscription;

    async connectAsync(): Promise<void> {
        this.subscription = this.source.progressed.subscribe(p => {
            let proc = this.processFactory(p.trackerProcess, p.progress);
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
