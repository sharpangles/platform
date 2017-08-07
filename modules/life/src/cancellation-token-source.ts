import { Disposable } from '@abcoa/extensions-typescript';
import { CancellationToken } from './cancellation-token';
import { Observable } from 'rxjs/Observable';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/merge';

@Disposable()
export class CancellationTokenSource implements Disposable {
    token = new CancellationToken(this);

    /** @internal */
    isCancellationRequested = false;

    /** @internal */
    cancelledSubject = new AsyncSubject<void>();
    private linkedSubscription?: Subscription;

    static createLinkedTokenSource(...tokens: (CancellationToken | undefined)[]): CancellationTokenSource {
        tokens = tokens.filter(t => t);
        if (tokens.length === 1)
            return (<any>tokens[0]).cancellationTokenSource;
        const cancellationTokenSource = new CancellationTokenSource();
        cancellationTokenSource.linkedSubscription = Observable.merge(tokens.map((t: CancellationToken) => t.cancelled)).take(1).subscribe(() => cancellationTokenSource.cancel());
        return cancellationTokenSource;
    }

    cancel() {
        if (this.isCancellationRequested)
            throw new Error('Already cancelled');
        this.isCancellationRequested = true;
        this.cancelledSubject.next(undefined);
        this.cancelledSubject.complete();
        if (this.linkedSubscription)
            this.linkedSubscription.unsubscribe();
    }

    dispose() {
        if (!this.isCancellationRequested)
            this.cancelledSubject.complete();
        if (this.linkedSubscription)
            this.linkedSubscription.unsubscribe();
    }
}
