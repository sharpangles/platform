import { AsyncBus } from './async_bus';
import { CancellationToken } from '@sharpangles/lang';

/**
 * A bus that performs async work on events before emitting the output, waiting for each result one at a time.
 */
export class AsyncQueueBus<TTarget = any> extends AsyncBus<TTarget> {
    constructor() {
        super();
    }

    private currentPromise?: Promise<TTarget>;

    protected async runPromise(promiseFactory: (cancellationToken: CancellationToken) => Promise<TTarget>) {
        while (this.currentPromise)
            await this.currentPromise;
        let promise = super.runPromise(promiseFactory);
        this.currentPromise = promise;
        let result = await promise;
        if (this.currentPromise === promise)
            delete this.currentPromise;
        return result;
    }
}
