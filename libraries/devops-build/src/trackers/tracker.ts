import { TrackerProcess } from '../processes/tracker_process';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';

/**
 * Tracks an activity in an overall workflow.
 */
export abstract class Tracker<TProgress = any, TError = any> {
    abstract get sourceTrackers(): IterableIterator<Tracker>;
    abstract get targetTrackers(): IterableIterator<Tracker>;
    abstract get activeProcesses(): IterableIterator<TrackerProcess<TProgress, TError>>;

    abstract get progressed(): Observable<{ trackerProcess: TrackerProcess<TProgress, TError>, progress: TProgress }>;
    /** Observe completion, failure, or cancellation. */
    abstract get completed(): Observable<{ trackerProcess: TrackerProcess<TProgress, TError>, error?: TError, cancelled?: boolean }>;
    /** Triggers when cancellation begins, providing a promise that returns true if the process finished regardless of cancellation. */
    abstract get cancelling(): Observable<{ trackerProcess: TrackerProcess<TProgress, TError>, cancellation: Promise<boolean> }>;
    abstract get started(): Observable<TrackerProcess<TProgress, TError>>;

    get cancelled(): Observable<TrackerProcess<TProgress, TError>> { return this.completed.filter(c => !!c.cancelled).map(c => c.trackerProcess); }
    get succeeded(): Observable<TrackerProcess<TProgress, TError>> { return this.completed.filter(c => !c.error && !c.cancelled).map(c => c.trackerProcess); }
    get failed(): Observable<{ trackerProcess: TrackerProcess<TProgress, TError>, error: TError }> { return this.completed.filter(c => !!c.error).map(c => { return { trackerProcess: c.trackerProcess, error: c.error }; }); }

    protected abstract addSourceTracker(sourceTracker: Tracker): void;
    protected abstract removeSourceTracker(sourceTracker: Tracker): void;
    protected abstract addTargetTracker(targetTracker: Tracker): void;
    protected abstract removeTargetTracker(targetTracker: Tracker): void;

    async connectAsync(sourceTracker: Tracker): Promise<void> {
        this.addSourceTracker(sourceTracker);
        await sourceTracker.connectingAsync(this);
    }

    protected async connectingAsync(targetTracker: Tracker) {
        this.addTargetTracker(targetTracker);
    }

    async disconnectAsync(sourceTracker: Tracker): Promise<void> {
        this.removeSourceTracker(sourceTracker);
        await sourceTracker.disconnectingAsync(this);
    }

    protected async disconnectingAsync(targetTracker: Tracker) {
        this.removeTargetTracker(targetTracker);
    }

    async disposeAsync(): Promise<void> {
        await Promise.all(Array.from(this.targetTrackers).map(t => t.disconnectAsync(this)));
        await this.onDisposeAsync();
        await Promise.all(Array.from(this.sourceTrackers).map(t => this.disconnectAsync(t)));
    }

    /** Called after the targets have been disconnected, but before disconnecting from sources. */
    protected async onDisposeAsync() {
    }

    /**
     * Runs a new process on this tracker.
     * Returns a boolean indicating if it was accepted.
     */
    async runProcessAsync(trackerProcess: TrackerProcess<TProgress, TError>) {
        if (trackerProcess.isStarted)
            throw new Error('Process already started.');
        this.addProcess(trackerProcess);
        await this.flowProcessAsync(trackerProcess);
        trackerProcess.start();
        return true;
    }

    /**
     * Flows the process to targets.
     * Returns whether the process should start after flowing.
     * The base implementation performs work in parallel and always starts.
     */
    protected async flowProcessAsync(trackerProcess: TrackerProcess<TProgress, TError>) {
        await Promise.all(Array.from(this.targetTrackers).map(t => t.flowAsync(this, trackerProcess)));
        return true;
    }

    protected abstract addProcess(trackerProcess: TrackerProcess<TProgress, TError>);
    protected abstract removeProcess(trackerProcess: TrackerProcess<TProgress, TError>);

    /**
     * Called by a source tracker when a process is created, prior to starting.
     */
    async flowAsync(sourceTracker: Tracker<any, any>, trackerProcess: TrackerProcess) {
    }
}
