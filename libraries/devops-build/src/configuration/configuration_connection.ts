import { Subscription } from 'rxjs/Subscription';
import { TrackerProcess } from '../processes/tracker_process';
import { Tracker } from '../trackers/tracker';
import { TrackerConnection } from '../connections/tracker_connection';
import { ConfigurationTracker } from './configuration_tracker';

export interface Type {
}

export class ConfigurationConnection extends TrackerConnection {
    constructor(source: ConfigurationTracker, target: Tracker, public processFactory: () => TrackerProcess) {
        super(source, target);
    }

    private subscription: Subscription;

    async connectAsync(): Promise<void> {
        this.subscription = this.source.succeeded.subscribe(p => this.target.runProcessAsync(this.processFactory()));
    }

    async breakAsync(): Promise<void> {
        if (this.subscription)
            this.subscription.unsubscribe();
        super.breakAsync();
    }
}
