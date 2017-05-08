import { OverridingTracker } from '../trackers/overriding_tracker';
import { Tracker } from '../trackers/tracker';
import { Observable } from 'rxjs/Observable';
import * as chokidar from 'chokidar';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/buffer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounce';

export interface WatcherConfig {
    cwd?: string;
    patterns?: string[];

    /** Idle time required between changes to trigger a progress event. */
    idleTime?: number;
}

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export class WatcherTracker extends OverridingTracker<string[], Error> {
    constructor(public extractConfig: (config: any) => WatcherConfig) {
        super();
    }

    protected addSourceTracker(sourceTracker: Tracker, dispose?: () => void) {
        if (sourceTracker instanceof ConfigurationTracker) {
            let sub = sourceTracker.succeeded.subscribe((config: any) => {
                let watcherConfig = this.extractConfig(config.config);
                this.runProcessAsync(new WatcherProcess(watcherConfig));
            });
            super.addSourceTracker(sourceTracker, () => {
                sub.unsubscribe();
                if (dispose)
                    dispose();
            });
            return;
        }
        throw new Error('Unknown source type.');
    }
}
