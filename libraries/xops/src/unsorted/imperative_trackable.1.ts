import { Trackable } from './trackable';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';

export class ImperativeTrackable<TSource = any, TProgress = any, TResult = any, TError = any> extends Trackable<TSource, TProgress, TResult, TError> {
    private startedSubject = new Subject<TSource>();
    private progressedSubject = new Subject<{ source: TSource, progress: TProgress }>();
    private completedSubject = new Subject<{ source: TSource, result?: TResult, error?: TError, cancelled?: boolean }>();
    private cancellingSubject = new Subject<{ source: TSource, cancellation: Promise<TResult | undefined> }>();

    get started(): Observable<TSource> { return this.startedSubject; }
    get progressed(): Observable<{ source: TSource, progress: TProgress }> { return this.progressedSubject; }
    get completed(): Observable<{ source: TSource, result?: TResult, error?: TError, cancelled?: boolean }> { return this.completedSubject; }
    get cancelling(): Observable<{ source: TSource, cancellation: Promise<TResult | undefined> }> { return this.cancellingSubject; }

    /**
     * Implement this to provide a means for cancellation.
     * Cancellation may not occur before a result is obtained.
     * If that is the case, return the result.  Otherwise, undefined indicates a successfull cancellation.
     * The base implementation waits for completion and returns the result always.
     * To allow the process to get dropped silently (but still run to completion in parallel), simply resolve true here.
     */
    protected async onCancelAsync(): Promise<TResult | undefined> {
         return this.isStarted ? (await this.completedSubject.toPromise()).result : undefined;
    }

    protected setProgress(source: TSource, progress: TProgress) {
        if (!this.isStarted || this.isFinished)
            throw new Error('Process is not running.');
        this.progress = progress;
        this.progressedSubject.next({ source: source, progress: progress });
    }

    runAsync(source: TSource) {
        if (!this.runPromise)
            this.runPromise = this.createRunPromise(source);
        return this.runPromise;
    }

    private async createRunPromise(source: TSource) {
        let promise = this.completed.toPromise();
        this.isStarted = true;
        this.startedSubject.next(source);
        this.startedSubject.complete();
        await this.onRunAsync();
        let result = await promise;
        if (result.error)
            throw result.error;
        if (result.cancelled)
            throw Error('Task cancelled');
        return <TResult>result.result;
    }

    private async onRunAsync() {
    }

    fail(source: TSource, error: TError) {
        if (this.isFinished)
            throw new Error('Process is not running.');
        this.error = error;
        this.complete(source, undefined, error);
        if (!this.startedSubject.isStopped)
            this.startedSubject.error(error);
    }

    succeed(source: TSource, result: TResult) {
        this.complete(source, result);
    }

    progress?: TProgress;
    result?: TResult;
    error?: TError;

    isStarted = false;
    isFinished = false;
    isCancelling = false;
    isCancelled = false;

    private runPromise?: Promise<TResult>;
    private cancelPromise?: Promise<TResult | undefined>;

    async cancelAsync(source: TSource) {
        if (!this.isStarted)
            throw new Error('Process has never run.');
        if (this.isFinished)
            throw new Error('TrackerProcess is already completed.');
        if (this.cancelPromise) {
            await this.cancelPromise;
            return;
        }
        this.isCancelling = true;
        this.cancelPromise = this.onCancelAsync();
        this.cancellingSubject.next({ source: source, cancellation: this.cancelPromise });
        await this.cancelPromise;
        this.complete(source, undefined, undefined, !await this.cancelPromise);
    }

    private complete(source: TSource, result?: TResult, error?: TError, cancelled?: boolean) {
        if (this.completedSubject.isStopped)
            throw new Error('TrackerProcess is already completed.');
        this.isFinished = true;
        this.isCancelled = this.isCancelling;
        this.isCancelling = false;
        this.onComplete(error, cancelled);
        this.completedSubject.next({ source: source, result: result, error: error, cancelled: cancelled });
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
