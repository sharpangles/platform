import { TrackerProcess } from '../tracker_process';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

export abstract class SubscriptionProcess<TProgress = any, TError = any> extends TrackerProcess<TProgress, TError> {
    protected abstract createObservable(): Observable<TProgress>;

    onStart() {
        this.subscription = this.createObservable().subscribe(changes => this.setProgress(changes), error => this.fail(error), () => this.succeed());
    }

    private subscription: Subscription;

    dispose() {
        if (this.subscription)
            this.subscription.unsubscribe();
    }

    static create<TProgress = any, TError = any>(observableFactory: () => Observable<TProgress>): SubscriptionProcess<TProgress, TError> {
        return new ExplicitSubscriptionProcess<TProgress, TError>(observableFactory);
    }
}

class ExplicitSubscriptionProcess<TProgress = any, TError = any> extends SubscriptionProcess<TProgress, TError> {
    constructor(private observableFactory: () => Observable<TProgress>) {
        super();
    }

    protected createObservable(): Observable<TProgress> {
        return this.observableFactory();
    }
}
