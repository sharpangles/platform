import { ConnectionResult } from '../connectable';
import { Bus } from '../bus';
import { CancellationToken } from '@sharpangles/lang';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

/**
 * A bus that performs async work on events before emitting the output.
 */
export class AsyncBus<TTarget = any> extends Bus<(cancellationToken: CancellationToken) => Promise<TTarget>, TTarget> {
    constructor() {
        super();
        let subscription = this.input.observable.subscribe(async promiseFactory => {
            try {
                this.asyncCompletedSubject.next(await this.runPromise(promiseFactory));
            }
            catch (err) {
                this.asyncCompletedSubject.error(err);
            }
        });
        this.registerRemoval(() => subscription.unsubscribe());
    }

    private asyncCompletedSubject = new Subject<TTarget>();

    /** The default implementation simply returns the source as the target. */
    protected createObservable(input: Observable<(cancellationToken: CancellationToken) => Promise<TTarget>>): Observable<TTarget> {
        return this.asyncCompletedSubject;
    }

    protected commitRemoval(removalResults: ConnectionResult[]) {
        super.commitRemoval(removalResults);
        this.asyncCompletedSubject.complete();
    }

    protected runPromise(promiseFactory: (cancellationToken: CancellationToken) => Promise<TTarget>) {
        return promiseFactory(this.cancellationTokenSource.token);
    }
}
