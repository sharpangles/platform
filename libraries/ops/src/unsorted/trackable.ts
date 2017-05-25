import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';

export interface Trackable<TSource = any, TProgress = any, TResult = any, TError = any> {
    started: Observable<TSource>;

    /** Emits any data, potentially including logs, processed counts, etc... */
    progressed: Observable<{ source: TSource, progress: TProgress }>;

    /** Emits when pausing begins, providing a promise that returns a result if it never pauses before completing. */
    pausing: Observable<{ source: TSource, pause: Promise<TResult | undefined> }>;
    paused: Observable<TSource>;

    resuming: Observable<{ source: TSource, resume: Promise<void> }>;
    resumed: Observable<TSource>;

    /** Observe completion, failure, or cancellation. */
    completed: Observable<{ source: TSource, result?: TResult, error?: TError, cancelled?: boolean }>;

    succeeded: Observable<{ source: TSource, result: TResult }>;

    /** Emits when cancellation begins, providing a promise that returns a result if it never cancels before completing. */
    cancelling: Observable<{ source: TSource, cancellation: Promise<TResult | undefined> }>;
    cancelled: Observable<TSource>;

    failed: Observable<{ trackerProcess: TSource, error: TError }>;
}

export abstract class TrackableBase<TSource = any, TProgress = any, TResult = any, TError = any> implements Trackable<TSource, TProgress, TResult, TError> {
    abstract get started(): Observable<TSource>;
    abstract get progressed(): Observable<{ source: TSource, progress: TProgress }>;
    abstract get pausing(): Observable<{ source: TSource, pause: Promise<TResult | undefined> }>;
    abstract get paused(): Observable<TSource>;
    abstract get resuming(): Observable<{ source: TSource, resume: Promise<void> }>;
    abstract get resumed(): Observable<TSource>;
    abstract get completed(): Observable<{ source: TSource, result?: TResult, error?: TError, cancelled?: boolean }>;

    get succeeded(): Observable<{ source: TSource, result: TResult }> {
        return this.completed.filter(c => !c.error && !c.cancelled).map(c => { return { source: c.source, result: c.result }; });
    }

    abstract get cancelling(): Observable<{ source: TSource, cancellation: Promise<TResult | undefined> }>;

    get cancelled(): Observable<TSource> {
        return this.completed.filter(c => !!c.cancelled).map(c => c.source);
    }

    get failed(): Observable<{ trackerProcess: TSource, error: TError }> {
        return this.completed.filter(c => !!c.error).map(c => { return { trackerProcess: c.source, error: c.error }; });
    }
}
