import { CancellationTokenSource } from './cancellation_token_source';

export class CancellationToken {
    /** @internal */
    constructor(private cancellationTokenSource: CancellationTokenSource) {
    }

    get isCancelled(): boolean { return this.cancellationTokenSource.isCancelled; }

    register(callback: () => void) {
        this.cancellationTokenSource.registrations.push(callback);
    }

    asPromise() {
        if (this.isCancelled)
            return Promise.resolve();
        return new Promise<void>(resolve => this.register(() => resolve()));
    }
}
