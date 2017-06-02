import { ImperativeTransition } from './imperative_transition';

export class ExplicitTransition<TResult> extends ImperativeTransition<TResult> {
    constructor(private promiseFactory: () => Promise<TResult>) {
        super();
    }

    protected async onTransitioningAsync(): Promise<TResult> {
        return this.promiseFactory();
    }
}
