import { TrackerProcess } from './tracker_process';
import { TrackerConnection } from './tracker_connection';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';

/**
 * The devops environment is composed of long-lived trackers in a directional graph.
 */
export abstract class Tracker<TProcess extends TrackerProcess<TProgress, TError> = TrackerProcess<TProgress, TError>, TConfig = any, TConnectState = any, TProgress = any, TError = any> {
    abstract get sourceConnections(): IterableIterator<TrackerConnection>;
    abstract get targetConnections(): IterableIterator<TrackerConnection>;
    abstract get activeProcesses(): IterableIterator<TProcess>;

    abstract get progressed(): Observable<{ trackerProcess: TProcess, progress: TProgress }>;
    /** Observe completion, failure, or cancellation. */
    abstract get completed(): Observable<{ trackerProcess: TProcess, error?: TError, cancelled?: boolean }>;
    /** Triggers when cancellation begins, providing a promise that returns true if the process finished regardless of cancellation. */
    abstract get cancelling(): Observable<{ trackerProcess: TProcess, cancellation: Promise<boolean> }>;
    abstract get started(): Observable<TProcess>;

    get cancelled(): Observable<TProcess> { return this.completed.filter(c => !!c.cancelled).map(c => c.trackerProcess); }
    get succeeded(): Observable<TProcess> { return this.completed.filter(c => !c.error && !c.cancelled).map(c => c.trackerProcess); }
    get failed(): Observable<{ trackerProcess: TProcess, error: TError }> { return this.completed.filter(c => !!c.error).map(c => { return { trackerProcess: c.trackerProcess, error: c.error }; }); }

    abstract addSource(connection: TrackerConnection): void;
    abstract removeSource(connection: TrackerConnection): void;
    abstract addTarget(connection: TrackerConnection): void;
    abstract removeTarget(connection: TrackerConnection): void;

    async disposeAsync(): Promise<void> {
        await Promise.all(Array.from(this.targetConnections).map(t => t.breakAsync()));
        await this.onDisposeAsync();
        await Promise.all(Array.from(this.sourceConnections).map(t => t.breakAsync()));
    }

    /**
     * Called after the targets have been disconnected, but before disconnecting from sources.
     * The base implementation cancels all active processes.
     */
    protected async onDisposeAsync() {
        await Promise.all(Array.from(this.activeProcesses).map(p => p.cancelAsync()));
    }

    configure(config: TConfig) {
    }

    protected abstract createProcess(state: TConnectState): TProcess | undefined;

    runProcess(state: TConnectState): TProcess | undefined {
        let trackerProcess = this.createProcess(state);
        if (!trackerProcess)
            return;
        // await this.flowProcessAsync(trackerProcess);
        trackerProcess.start();
        return trackerProcess;
    }

    protected startProcess(trackerProcess: TProcess) {
        this.addProcess(trackerProcess);
        // await this.flowProcessAsync(trackerProcess);
        trackerProcess.start();
    }

    // /**
    //  * Flows the process to targets.
    //  * Returns whether the process should start after flowing.
    //  * The base implementation performs work in parallel and always starts.
    //  */
    // protected async flowProcessAsync(trackerProcess: TProcess) {
    //     await Promise.all(Array.from(this.targetConnections).map(t => t.flowAsync(this, trackerProcess)));
    //     return true;
    // }

    protected abstract addProcess(trackerProcess: TProcess);
    protected abstract removeProcess(trackerProcess: TProcess);

    // /**
    //  * Called by a source tracker when a process is created, prior to starting.
    //  */
    // async flowAsync(sourceTracker: Tracker<any, any>, trackerProcess: TrackerProcess) {
    // }
}
