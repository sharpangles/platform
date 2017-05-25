import { Description } from './description';
import { TrackerProcess } from './tracker_process';
import { Connection } from './connection';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';

/**
 * The ops environment is composed of long-lived trackers in a directional graph.
 */
export abstract class Tracker<TProcess extends TrackerProcess<TProgress, TError> = any, TConfig = any, TConnectState = any, TProgress = any, TError = any> {
    constructor(public description: Description) {
    }

    abstract get sourceConnections(): IterableIterator<Connection>;
    abstract get targetConnections(): IterableIterator<Connection>;
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

    abstract addSource(connection: Connection): void;
    abstract removeSource(connection: Connection): void;
    abstract addTarget(connection: Connection): void;
    abstract removeTarget(connection: Connection): void;

    async disposeAsync(): Promise<void> {
        for (let tc of Array.from(this.targetConnections))
            await tc.breakAsync();
        // await Promise.all(Array.from(this.targetConnections).map(t => t.breakAsync()));
        await this.onDisposeAsync();
        for (let tc of Array.from(this.sourceConnections))
            await tc.breakAsync();
        // await Promise.all(Array.from(this.sourceConnections).map(t => t.breakAsync()));
    }

    /**
     * Called after the targets have been disconnected, but before disconnecting from sources.
     * The base implementation cancels all active processes.
     */
    protected async onDisposeAsync() {
        for (let tc of Array.from(this.activeProcesses))
            await tc.cancelAsync();
        // await Promise.all(Array.from(this.activeProcesses).map(p => p.cancelAsync()));
    }

    async configureAsync(config: TConfig) {
    }

    protected abstract createProcess(state?: TConnectState): TProcess | undefined;

    runProcess(state?: TConnectState): TProcess | undefined {
        let trackerProcess = this.createProcess(state);
        if (!trackerProcess)
            return;
        // await this.flowProcessAsync(trackerProcess);
        this.startProcess(trackerProcess);
        return trackerProcess;
    }

    protected startProcess(trackerProcess: TProcess) {
        this.addProcess(trackerProcess);
        // await this.flowProcessAsync(trackerProcess);
        trackerProcess.start();
    }

    protected abstract addProcess(trackerProcess: TProcess);
    protected abstract removeProcess(trackerProcess: TProcess);
}
