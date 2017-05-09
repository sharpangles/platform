import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export class TrackerProcess<TProgress = any, TError = any> {
    /**
     * Implement this to provide a means for cancellation.
     * The base implementation waits for completion and returns true always.
     * To allow the process to get dropped silently (but still run to completion in parallel), simply resolve true here.
     */
    protected onCancelAsync(): Promise<boolean> {
         return this.isStarted ? this.completedSubject.map(i => true).toPromise() : Promise.resolve(false);
    }

    get progressed(): Observable<TProgress> { return this.progressedSubject; }

    /** Observe completion, failure, or cancellation. */
    get completed(): Observable<{ error?: TError, cancelled?: boolean }> { return this.completedSubject; }

    /** Triggers when cancellation begins, providing a promise that returns true if the process finished regardless of cancellation. */
    get cancelling(): Observable<Promise<boolean>> { return this.cancelledSubject; }

    get cancelled(): Observable<any> { return this.completedSubject.filter(c => !!c.cancelled).map(() => {}); }

    get started(): Observable<any> { return this.startedSubject; }

    get succeeded(): Observable<any> { return this.completedSubject.filter(c => !c.error && !c.cancelled).map(() => {}); }

    get failed(): Observable<TError> { return this.completedSubject.filter(c => !!c.error).map(c => c.error); }


    setProgress(progress: TProgress) {
        if (!this.isStarted || this.isFinished || this.isCancelled || this.error)
            throw new Error('Process is not running.');
        this.progress = progress;
        this.progressedSubject.next(progress);
    }

    start() {
        if (this.isStarted || this.isCancelled || this.error)
            throw new Error('Process already running or failed.');
        this.isStarted = true;
        this.startedSubject.next({});
        this.startedSubject.complete();
    }

    fail(error: TError) {
        if (this.isFinished || this.error)
            throw new Error('Process is not running.');
        this.error = error;
        this.complete(error);
        if (!this.startedSubject.isStopped)
            this.startedSubject.error(error);
    }

    succeed() {
        this.complete();
    }

    progress?: TProgress;
    isCancelled = false;
    isStarted = false;
    error?: TError;
    isFinished = false;

    async cancelAsync() {
        if (this.isFinished || this.error)
            throw new Error('TrackerProcess is already completed.');
        this.isCancelled = true;
        let cancelPromise = this.onCancelAsync();
        this.cancelledSubject.next(cancelPromise);
        this.complete(undefined, !await cancelPromise);
    }

    private complete(error?: TError, cancelled?: boolean) {
        if (this.completedSubject.isStopped)
            throw new Error('TrackerProcess is already completed.');
        this.isFinished = true;
        this.completedSubject.next({ error: error, cancelled: cancelled });
        this.cancelledSubject.next(cancelled);
        this.progressedSubject.complete();
        this.completedSubject.complete();
        this.cancelledSubject.complete();
        this.dispose();
    }

    dispose() {
    }

    private progressedSubject = new AsyncSubject<TProgress>();
    private startedSubject = new AsyncSubject();
    private completedSubject = new AsyncSubject<{ error?: TError, cancelled?: boolean }>();
    private cancelledSubject = new AsyncSubject<any>();
}
