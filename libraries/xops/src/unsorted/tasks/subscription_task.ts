import { Task } from './task';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

export abstract class SubscriptionTask<TProgress = any, TResult = any, TError = any> extends Task<TProgress, TResult, TError> {
    protected abstract createObservable(): Observable<TProgress>;

    onStart() {
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
