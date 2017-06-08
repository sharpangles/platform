import { CancellationTokenSource } from './cancellation_token_source';

export class CancellationToken {
    /** @internal */
    constructor(private cancellationTokenSource: CancellationTokenSource) {
    }

    get isCancellationRequested(): boolean { return this.cancellationTokenSource.isCancellationRequested; }

    register(callback: () => void) {
        this.cancellationTokenSource.registrations.push(callback);
    }

    asPromise() {
        if (this.isCancellationRequested)
            return Promise.resolve();
        return new Promise<void>(resolve => this.register(() => resolve()));
    }
}
