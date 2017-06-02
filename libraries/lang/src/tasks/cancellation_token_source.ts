import { CancellationToken } from './cancellation_token';

export class CancellationTokenSource {
    token = new CancellationToken(this);

    /** @internal */
    isCancelled = false;

    /** @internal */
    registrations: (() => void)[];

    cancel() {
        this.isCancelled = true;
        for (let registration of this.registrations)
            registration();
    }

    static createLinkedTokenSource(...tokens: CancellationToken[]): CancellationTokenSource {
        let cancellationTokenSource = new CancellationTokenSource();
        let cancelled = false;
        for (let token of tokens) {
            token.register(() => {
                if (cancelled)
                    return;
                cancellationTokenSource.cancel();
                cancelled = true;
            });
        }
        return cancellationTokenSource;
    }
}
