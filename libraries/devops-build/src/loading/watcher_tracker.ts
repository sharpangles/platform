import { Description } from '../tracking/description';
import { WatcherProcess } from './watcher_process';
import { OverridingTracker } from '../tracking/trackers/overriding_tracker';

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
export class WatcherTracker extends OverridingTracker<WatcherProcess, WatcherConfig, WatcherConfig | undefined, string[]> {
    constructor(description?: Description) {
        super(description || {
            name: 'File watcher',
            description: 'Runs a long-lived process to watch for changes'
        });
    }

    private config: WatcherConfig;

    async configureAsync(config: WatcherConfig) {
        this.config = config;
    }

    protected createProcess(state?: WatcherConfig): WatcherProcess | undefined {
        return new WatcherProcess(
            state && state.patterns || this.config && this.config.patterns,
            state && state.cwd || this.config && this.config.cwd,
            state && state.idleTime || this.config && this.config.idleTime);
    }
}
