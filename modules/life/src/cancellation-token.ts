import { CancellationTokenSource } from './cancellation-token-source';
import { Observable } from 'rxjs/Observable';

export class CancellationToken {
    /** @internal */
    constructor(private cancellationTokenSource: CancellationTokenSource) {
    }

    get isCancellationRequested(): boolean { return this.cancellationTokenSource.isCancellationRequested; }

    get cancelled(): Observable<void> { return this.cancellationTokenSource.cancelledSubject; }
}
