import { Task } from './task';
import { SubjectTrackable } from '../subject_trackable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';

export class ImperativeTask<TProgress = any, TResult = any, TError = any>
        extends SubjectTrackable<Task<TProgress, TResult, TError>, TProgress, TResult, TError>
        implements Task<TProgress, TResult, TError> {

    constructor() {
        super();
        this.pausingSubject.subscribe(s => s.pause.then(result => {
            if (typeof result === 'undefined')
                this.pausedSubject.next(s.source);
        }));
        this.resumingSubject.subscribe(s => s.resume.then(result => this.resumedSubject.next(s.source)));
        this.cancellingSubject.subscribe(s => s.cancellation.then(result => {
            if (typeof result === 'undefined')
                this.completedSubject.next({ source: s.source, cancelled: true });
        }));
    }

    /**
     * Implement this to provide a means for cancellation.
     * Cancellation may not occur before a result is obtained.
     * If that is the case, return the result.  Otherwise, undefined indicates a successful cancellation.
     * The base implementation waits for completion and returns the result.
     * To allow the process to get dropped silently (but still run to completion in parallel), simply resolve true here.
     */
    protected setProgress(progress: TProgress) {
        if (!this.isStarted || this.isFinished)
            throw new Error('Process is not running.');
        this.progress = progress;
        this.progressedSubject.next({ source: this, progress: progress });
    }

    start() {
        this.runAsync();
    }

    cancel() {
        this.cancelAsync();
    }

    pause() {
        this.pauseAsync();
    }

    resume() {
        this.resumeAsync();
    }

    runAsync() {
        if (!this.runPromise)
            this.runPromise = this.createRunPromise();
        return this.runPromise;
    }

    private async createRunPromise() {
        let promise = this.completed.toPromise();
        this.isStarted = true;
        this.startedSubject.next(this);
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

    async pauseAsync() {
        if (!this.isStarted)
            throw new Error('Process has never run.');
        if (this.isFinished)
            return this.result;
        if (this.cancelPromise) {
            await this.pausePromise;
            return;
        }
        this.isCancelling = true;
        this.cancelPromise = this.onCancelAsync();
        this.cancellingSubject.next({ source: this, cancellation: this.cancelPromise });
        let result = await this.cancelPromise;
        this.complete(undefined, undefined, !await this.cancelPromise);
        return result;
    }

    protected async onPauseAsync(): Promise<TResult | undefined> {
         return this.isStarted ? (await this.completedSubject.toPromise()).result : undefined;
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
    result?: TResult;
    error?: TError;

    isStarted = false;
    isFinished = false;
    isPausing = false;
    isPaused = false;
    isResuming = false;
    isResumed = false;
    isCancelling = false;
    isCancelled = false;

    private runPromise?: Promise<TResult>;
    private cancelPromise?: Promise<TResult | undefined>;
    private pausePromise?: Promise<TResult | undefined>;
    private resumePromise?: Promise<void>;

    async cancelAsync() {
        if (!this.isStarted)
            throw new Error('Process has never run.');
        if (this.isFinished)
            return this.result;
        if (this.cancelPromise) {
            await this.cancelPromise;
            return;
        }
        this.isCancelling = true;
        this.cancelPromise = this.onCancelAsync();
        this.cancellingSubject.next({ source: this, cancellation: this.cancelPromise });
        let result = await this.cancelPromise;
        this.complete(undefined, undefined, !await this.cancelPromise);
        return result;
    }

    protected async onCancelAsync(): Promise<TResult | undefined> {
         return this.isStarted ? (await this.completedSubject.toPromise()).result : undefined;
    }

    private complete(result?: TResult, error?: TError, cancelled?: boolean) {
        if (this.completedSubject.isStopped)
            throw new Error('TrackerProcess is already completed.');
        this.isFinished = true;
        this.isCancelled = this.isCancelling;
        this.isCancelling = false;
        this.onComplete(error, cancelled);
        this.completedSubject.next({ source: this, result: result, error: error, cancelled: cancelled });
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
