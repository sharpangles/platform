import { TrackableBase } from '../trackable';
import { Task } from './task';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

export abstract class ObservableTask<TProgress = any, TResult = any, TError = any>
        extends TrackableBase<Task<TProgress, TResult, TError>, TProgress, TResult, TError>
        implements Task<TProgress, TResult, TError> {
    protected abstract createObservable(): Observable<TProgress>;

    private startedSubject = new Subject<void>();
    private cancellingSubject = new Subject<Promise<TResult | undefined>>();

    get started(): Observable<Task<TProgress, TResult, TError>> {
        return this.startedSubject.map(() => this);
    }

    get progressed(): Observable<{ source: Task<TProgress, TResult, TError>, progress: TProgress }> {
        return this.observable.map(p => { return { source: this, progress: p }; });
    }

    get completed(): Observable<{ source: Task<TProgress, TResult, TError>, result?: TResult, error?: TError, cancelled?: boolean }> {
        return this.observable.onComplete;
    }

    get cancelling(): Observable<{ source: Task<TProgress, TResult, TError>, cancellation: Promise<TResult | undefined> }> { return this.cancellingSubject; }



    private observable: Observable<TProgress>;

    start() {
        this.observable = this.createObservable();
        this.subscription = this.observable.subscribe(changes => this.setProgress(changes), error => this.fail(error), () => this.succeed(this.getResult()));
    }

    getResult(): TResult {
        return <TResult><any>undefined;
    }

    private subscription: Subscription;

    protected async onCancelAsync(): Promise<boolean> {
        this.dispose();
        return await super.onCancelAsync();
    }

    dispose() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            delete this.subscription;
        }
    }

    static create<TProgress = any, TResult = any, TError = any>(observableFactory: () => Observable<TProgress>): SubscriptionTask<TProgress, TResult, TError> {
        return new ExplicitSubscriptionProcess<TProgress, TResult, TError>(observableFactory);
    }
}

class ExplicitSubscriptionProcess<TProgress = any, TResult = any, TError = any> extends SubscriptionTask<TProgress, TResult, TError> {
    constructor(private observableFactory: () => Observable<TProgress>) {
        super();
    }

    protected createObservable(): Observable<TProgress> {
        return this.observableFactory();
    }
}
