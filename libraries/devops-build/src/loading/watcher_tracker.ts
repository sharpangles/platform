import { WatcherProcess } from './watcher_process';
import { OverridingTracker } from '../trackers/overriding_tracker';
import { Tracker } from '../trackers/tracker';

export interface WatcherConfig {
    cwd?: string;
    patterns: string[];

    /** Idle time required between changes to trigger a progress event. */
    idleTime?: number;
}

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export class WatcherTracker extends OverridingTracker<string[], Error> {
    constructor(public extractConfig: (config: any) => WatcherConfig | undefined) {
        super();
    }

    protected addSourceTracker(sourceTracker: Tracker, dispose?: () => void) {
        if (sourceTracker instanceof ConfigurationTracker) {
            let sub = sourceTracker.succeeded.subscribe((config: any) => {
                let watcherConfig = this.extractConfig(config.config);
                if (watcherConfig)
                    this.runProcessAsync(new WatcherProcess(watcherConfig.patterns, watcherConfig.cwd, watcherConfig.idleTime));
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
