import { Tracker } from './tracker';
import { TrackerConnection } from './tracker_connection';
import { TrackerProcess } from './tracker_process';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

/**
 * A tracker that aggregates TrackerProcess observables through the Tracker via subjects.
 */
export class SubjectTracker<TProcess extends TrackerProcess<TProgress, TError> = TrackerProcess<TProgress, TError>, TConfig = any, TConnectState = any, TProgress = any, TError = any> extends Tracker<TProcess, TConfig, TConnectState, TProgress, TError> {
    constructor(private processFactory?: (state?: TConnectState) => TProcess | undefined) {
        super();
    }

    protected createProcess(state?: TConnectState): TProcess | undefined {
        if (!this.processFactory)
            throw new Error('Not implemented.');
        return this.processFactory(state);
    }

    get sourceConnections(): IterableIterator<TrackerConnection> { return this.sourceConnectionDisposals.keys(); }
    protected sourceConnectionDisposals = new Map<TrackerConnection, () => void>();
    get targetConnections(): IterableIterator<TrackerConnection> { return this.targetConnectionDisposals.keys(); }
    protected targetConnectionDisposals = new Map<TrackerConnection, () => void>();
    get activeProcesses(): IterableIterator<TProcess> { return this.activeProcessDisposals.keys(); }
    private activeProcessDisposals = new Map<TProcess, () => void>();

    private progressedSubject = new Subject<{ trackerProcess: TProcess, progress: TProgress }>();
    get progressed(): Observable<{ trackerProcess: TProcess, progress: TProgress }> { return this.progressedSubject; }
    private completedSubject = new Subject<{ trackerProcess: TProcess, error?: TError, cancelled?: boolean }>();
    get completed(): Observable<{ trackerProcess: TProcess, error?: TError, cancelled?: boolean }> { return this.completedSubject; }
    private cancelledSubject = new Subject<{ trackerProcess: TProcess, cancellation: Promise<boolean> }>();
    get cancelling(): Observable<{ trackerProcess: TProcess, cancellation: Promise<boolean> }> { return this.cancelledSubject; }
    private startedSubject = new Subject<TProcess>();
    get started(): Observable<TProcess> { return this.startedSubject; }

    addSource(connection: TrackerConnection, dispose?: () => void) {
        this.setDisposal<TrackerConnection>(this.sourceConnectionDisposals, connection, dispose || (() => {}));
    }

    removeSource(connection: TrackerConnection) {
        this.deleteDisposal(this.sourceConnectionDisposals, connection);
    }

    addTarget(connection: TrackerConnection, dispose?: () => void) {
        this.setDisposal(this.targetConnectionDisposals, connection, dispose || (() => {}));
    }

    removeTarget(connection: TrackerConnection) {
        this.deleteDisposal(this.targetConnectionDisposals, connection);
    }

    protected addProcess(trackerProcess: TProcess) {
        let sub1 = trackerProcess.progressed.subscribe(progress => this.progressedSubject.next({ trackerProcess: trackerProcess, progress: progress }));
        let sub2 = trackerProcess.started.subscribe(() => this.startedSubject.next(trackerProcess));
        let sub3 = trackerProcess.cancelled.subscribe(cancellation => this.cancelledSubject.next({ trackerProcess: trackerProcess, cancellation: cancellation }));
        let sub4 = trackerProcess.completed.subscribe(completion => {
            this.completedSubject.next({ trackerProcess: trackerProcess, error: completion.error, cancelled: completion.cancelled });
            this.removeProcess(trackerProcess);
        });
        this.setDisposal(this.activeProcessDisposals, trackerProcess, () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
            sub4.unsubscribe();
        });
    }

    protected removeProcess(trackerProcess: TProcess) {
        this.deleteDisposal(this.activeProcessDisposals, trackerProcess);
    }

    private deleteDisposal<T>(disposals: Map<T, () => void>, item: T) {
        let dispose = disposals.get(item);
        if (!dispose)
            throw 'Not found';
        dispose();
        disposals.delete(item);
    }

    private setDisposal<T>(disposals: Map<T, () => void>, item: T, disposal: () => void) {
        let dispose = disposals.get(item);
        if (dispose)
            throw 'Duplicate';
        disposals.set(item, disposal);
    }
}
