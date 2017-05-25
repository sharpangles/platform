import { ImperativeTransition } from './imperative_transition';

export class ExplicitTransition<TSource, TState = any | undefined> extends ImperativeTransition<TSource, TState> {
    constructor(private transitioningAsync: (source: TSource) => Promise<TState | undefined>) {
        super();
    }

    protected async onTransitioningAsync(source: TSource): Promise<TState | undefined> {
        return this.transitioningAsync(source);
    }
}
