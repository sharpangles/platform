import { Trackable } from './trackable';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

export abstract class ObservableTrackable<TSource = any, TProgress = any, TResult = any, TError = any> extends Trackable<TSource, TProgress, TResult, TError> {
    protected abstract createObservable(): Observable<TProgress>;
    protected abstract getSource(progress?: TProgress, result?: TResult, error?: TError, cancelled?: boolean): TSource;

    private startedSubject = new Subject<TSource>();
    private cancellingSubject = new Subject<{ source: TSource, cancellation: Promise<TResult | undefined> }>();

    get started(): Observable<TSource> { return this.startedSubject; }
    get progressed(): Observable<{ source: TSource, progress: TProgress }> { return this.observable; }
    get completed(): Observable<{ source: TSource, result?: TResult, error?: TError, cancelled?: boolean }> { return this.completedSubject; }
    get cancelling(): Observable<{ source: TSource, cancellation: Promise<TResult | undefined> }> { return this.cancellingSubject; }



    private observable: Observable<TProgress>;

    start() {
        this.subscription = this.createObservable().subscribe(changes => this.setProgress(changes), error => this.fail(error), () => this.succeed(this.getResult()));
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
