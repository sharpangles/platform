import { Task } from './task';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';

export class ImperativeTask<TSource, TProgress = any, TResult = any, TError = any> extends Task<TSource, TProgress, TResult, TError> {
    private startedSubject = new Subject<TSource>();
    private progressedSubject = new Subject<{ source: TSource, progress: TProgress }>();
    private completedSubject = new Subject<{ source: TSource, result?: TResult, error?: TError, cancelled?: boolean }>();
    private cancellingSubject = new Subject<{ source: TSource, cancellation: Promise<boolean> }>();

    get started(): Observable<TSource> {
        return this.startedSubject;
    }

    get progressed(): Observable<{ source: TSource, progress: TProgress }> {
        return this.progressedSubject;
    }

    get completed(): Observable<{ source: TSource, result?: TResult, error?: TError, cancelled?: boolean }> {
        return this.completedSubject;
    }

    get cancelling(): Observable<{ source: TSource, cancellation: Promise<boolean> }> {
        return this.cancellingSubject;
    }

    /**
     * Implement this to provide a means for cancellation.
     * The base implementation waits for completion and returns true always.
     * To allow the process to get dropped silently (but still run to completion in parallel), simply resolve true here.
     */
    protected onCancelAsync(): Promise<boolean> {
         return this.isStarted ? this.completedSubject.map(i => true).toPromise() : Promise.resolve(false);
    }

    protected setProgress(source: TSource, progress: TProgress) {
        if (!this.isStarted || this.isFinished)
            throw new Error('Process is not running.');
        this.progress = progress;
        this.progressedSubject.next({ source: source, progress: progress });
    }

    start() {
        if (this.isStarted)
            throw new Error('Process already started.');
        this.isStarted = true;
        this.onStart();
        this.startedSubject.next();
        this.startedSubject.complete();
    }

    async runAsync() {
        let promise = this.completed.toPromise();
        this.start();
        let result = await promise;
        if (result.error)
            throw result.error;
        if (result.cancelled)
            throw Error('Task cancelled');
        return result.result;
    }

    protected onStart() {
    }

    fail(error: TError) {
        if (this.isFinished)
            throw new Error('Process is not running.');
        this.error = error;
        this.complete(undefined, error);
        if (!this.startedSubject.isStopped)
            this.startedSubject.error(error);
    }

    succeed(result: TResult) {
        this.complete(result);
    }

    progress?: TProgress;
    isStarted = false;
    error?: TError;
    isFinished = false;

    private cancelPromise?: Promise<boolean>;

    async cancelAsync() {
        if (!this.isStarted)
            throw new Error('Process have never run.');
        if (this.isFinished)
            throw new Error('TrackerProcess is already completed.');
        if (this.cancelPromise) {
            await this.cancelPromise;
            return;
        }
        this.cancelPromise = this.onCancelAsync();
        this.cancellingSubject.next(this.cancelPromise);
        this.complete(undefined, undefined, !await this.cancelPromise);
    }

    private complete(result?: TResult, error?: TError, cancelled?: boolean) {
        if (this.completedSubject.isStopped)
            throw new Error('TrackerProcess is already completed.');
        this.isFinished = true;
        this.onComplete(error, cancelled);
        this.completedSubject.next({ result: result, error: error, cancelled: cancelled });
        this.progressedSubject.complete();
        this.completedSubject.complete();
        this.cancellingSubject.complete();
        this.dispose();
    }

    protected onComplete(error?: TError, cancelled?: boolean) {
    }

    dispose() {
    }
}
