import { AsyncBus } from './async_bus';
import { CancellationToken } from '@sharpangles/lang';

/**
 * Dynamically connects inputs of one type through outputs of another.
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
