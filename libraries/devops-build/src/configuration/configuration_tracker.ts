import { OverridingTracker } from '../trackers/overriding_tracker';
import { Tracker } from '../trackers/tracker';

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export class ConfigurationTracker extends OverridingTracker<string[], Error> {
    constructor(public filename?: string) {
        super();
    }

    extractConfiguration()

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
