import { CancellationToken } from '@sharpangles/lang';
import { ImperativeTransition } from './imperative_transition';

export class ExplicitTransition<TInput, TResult> extends ImperativeTransition<TInput, TResult> {
    constructor(private promiseFactory: (input: TInput, cancellationToken?: CancellationToken) => Promise<TResult>) {
        super();
    }

    protected async onTransitioningAsync(input: TInput, cancellationToken?: CancellationToken): Promise<TResult> {
        return this.promiseFactory(input, cancellationToken);
    }
}
