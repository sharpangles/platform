import { Tracker } from './tracker';
import { TrackerProcess } from '../processes/tracker_process';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';

/**
 * A tracker that aggregates TrackerProcess observables through the Tracker via subjects.
 */
export class SubjectTracker<TProgress = any, TError = any> extends Tracker<TProgress, TError> {
    get sourceTrackers(): IterableIterator<Tracker> { return this.sourceTrackerDisposals.keys(); }
    protected sourceTrackerDisposals = new Map<Tracker, () => void>();
    get targetTrackers(): IterableIterator<Tracker> { return this.targetTrackerDisposals.keys(); }
    protected targetTrackerDisposals = new Map<Tracker, () => void>();
    get activeProcesses(): IterableIterator<TrackerProcess<TProgress, TError>> { return this.activeProcessDisposals.keys(); }
    private activeProcessDisposals = new Map<TrackerProcess<TProgress, TError>, () => void>();

    private progressedSubject = new Subject<{ trackerProcess: TrackerProcess<TProgress, TError>, progress: TProgress }>();
    get progressed(): Observable<{ trackerProcess: TrackerProcess<TProgress, TError>, progress: TProgress }> { return this.progressedSubject; }
    private completedSubject = new Subject<{ trackerProcess: TrackerProcess<TProgress, TError>, error?: TError, cancelled?: boolean }>();
    get completed(): Observable<{ trackerProcess: TrackerProcess<TProgress, TError>, error?: TError, cancelled?: boolean }> { return this.completedSubject; }
    private cancelledSubject = new Subject<{ trackerProcess: TrackerProcess<TProgress, TError>, cancellation: Promise<boolean> }>();
    get cancelling(): Observable<{ trackerProcess: TrackerProcess<TProgress, TError>, cancellation: Promise<boolean> }> { return this.cancelledSubject; }
    private startedSubject = new Subject<TrackerProcess<TProgress, TError>>();
    get started(): Observable<TrackerProcess<TProgress, TError>> { return this.startedSubject; }

    protected addSourceTracker(sourceTracker: Tracker, dispose?: () => void) {
        this.setDisposal(this.sourceTrackerDisposals, sourceTracker, dispose || (() => {}));
    }

    protected removeSourceTracker(sourceTracker: Tracker) {
        this.deleteDisposal(this.sourceTrackerDisposals, sourceTracker);
    }

    protected addTargetTracker(targetTracker: Tracker, dispose?: () => void) {
        this.setDisposal(this.targetTrackerDisposals, targetTracker, dispose || (() => {}));
    }

    protected removeTargetTracker(targetTracker: Tracker) {
        this.deleteDisposal(this.targetTrackerDisposals, targetTracker);
    }

    protected addProcess(trackerProcess: TrackerProcess<TProgress, TError>) {
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

    protected removeProcess(trackerProcess: TrackerProcess<TProgress, TError>) {
        this.deleteDisposal(this.activeProcessDisposals, trackerProcess);
    }

    private deleteDisposal<T>(disposals: Map<T, Function>, item: T) {
        let dispose = disposals.get(item);
        if (!dispose)
            throw 'Not found';
        dispose();
        disposals.delete(item);
    }

    private setDisposal<T>(disposals: Map<T, Function>, item: T, disposal: () => void) {
        let dispose = disposals.get(item);
        if (dispose)
            throw 'Duplicate';
        disposals.set(item, disposal);
    }
}
