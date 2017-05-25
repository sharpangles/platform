import { TrackableBase } from './trackable';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';

export class SubjectTrackable<TSource = any, TProgress = any, TResult = any, TError = any> extends TrackableBase<TSource, TProgress, TResult, TError> {
    protected startedSubject = new Subject<TSource>();
    protected progressedSubject = new Subject<{ source: TSource, progress: TProgress }>();
    protected pausingSubject = new Subject<{ source: TSource, pause: Promise<TResult | undefined> }>();
    protected pausedSubject = new Subject<TSource>();
    protected resumingSubject = new Subject<{ source: TSource, resume: Promise<void> }>();
    protected resumedSubject = new Subject<TSource>();
    protected completedSubject = new Subject<{ source: TSource, result?: TResult, error?: TError, cancelled?: boolean }>();
    protected cancellingSubject = new Subject<{ source: TSource, cancellation: Promise<TResult | undefined> }>();

    get started(): Observable<TSource> { return this.startedSubject; }
    get progressed(): Observable<{ source: TSource, progress: TProgress }> { return this.progressedSubject; }
    get pausing(): Observable<{ source: TSource, pause: Promise<TResult | undefined> }> { return this.pausingSubject; }
    get paused(): Observable<TSource> { return this.pausedSubject; }
    get resuming(): Observable<{ source: TSource, resume: Promise<void> }> { return this.resumingSubject; }
    get resumed(): Observable<TSource> { return this.resumedSubject; }
    get completed(): Observable<{ source: TSource, result?: TResult, error?: TError, cancelled?: boolean }> { return this.completedSubject; }
    get cancelling(): Observable<{ source: TSource, cancellation: Promise<TResult | undefined> }> { return this.cancellingSubject; }
}
