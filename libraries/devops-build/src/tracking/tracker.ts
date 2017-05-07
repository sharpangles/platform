import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';

/**
 * Optionally performs an asynchronous task on each observed event.
 */
export abstract class Tracker<TSource, TResult> {
    constructor(observable?: Observable<TSource>) {
        if (observable)
            this.subscription = observable.subscribe(source => this.runAsync(source));
    }

    private subscription: Subscription;

    attach<TTracker extends Tracker<any, any>>(trackerFactory: (observable: Observable<TResult>) => TTracker): TTracker {
        let tracker = trackerFactory(this.changedSubject);
        let stabilitySubscription = tracker.stablizedSubject.subscribe(() => this.checkStability());
        let disposedSubscription = tracker.disposedSubject.subscribe(tracker => this.detach(tracker));
        this.attached.set(tracker, [stabilitySubscription, disposedSubscription]);
        return tracker;
    }

    detach(tracker: Tracker<any, any>) {
        let subscriptions = this.attached.get(tracker);
        if (!subscriptions)
            throw new Error('That tracker is not attached.');
        for (let subscription of subscriptions)
            subscription.unsubscribe();
        this.attached.delete(tracker);
        this.checkStability();
    }

    private checkStability() {
        let shouldBeStable = true;
        for (let key of this.attached.keys()) {
            if (!key.isStable) {
                shouldBeStable = false;
                break;
            }
        }
        if (this.isRunning && shouldBeStable)
            shouldBeStable = false;
        if (this.isStable === shouldBeStable)
            return;
        this.isStable = shouldBeStable;
        this.stablizedSubject.next(this);
    }

    private isRunning = false;
    private isStable = true;

    async untilStableAsync() {
        if (this.isStable)
            return;
        let result = await Observable.merge(this.disposedSubject, this.stablizedSubject).toPromise();
        if (!result.isStable)
            throw new Error('Tracker was disposed');
    }

    protected attached = new Map<Tracker<TResult, any>, Subscription[]>();

    // get changed(): Observable<TResult> { return this.changedSubject; }
    protected changedSubject = new Subject<TResult>();
    // get stablized(): Observable<Tracker<TSource, TResult>> { return this.stablizedSubject; }
    protected stablizedSubject = new Subject<Tracker<TSource, TResult>>();
    // get disposed(): Observable<Tracker<TSource, TResult>> { return this.disposedSubject; }
    protected disposedSubject = new Subject<Tracker<TSource, TResult>>();

    /**
     * Return undefined if there is no change.
     */
    protected abstract onRunAsync(source: TSource): Promise<TResult | undefined>;

    async runAsync(source: TSource) {
        console.log(`Running ${this.constructor.name}`);
        this.isRunning = true;
        this.checkStability();
        let result = await this.onRunAsync(source);
        this.isRunning = false;
        console.log(`Finished running ${this.constructor.name}`);
        if (result !== undefined)
            this.changedSubject.next(result);
        this.checkStability();
    }

    dispose() {
        if (this.subscription)
            this.subscription.unsubscribe();
        for (let subscriptions of this.attached.values()) {
            for (let subscription of subscriptions)
                subscription.unsubscribe();
        }
    }
}
