import { SubjectTransition } from './subject_transition';

export class ImperativeTransition<TSource, TState = any | undefined> extends SubjectTransition<TSource, TState> {
    transition(source: TSource) {
        this.promise = this.createTransitionPromise(source);
    }

    promise?: Promise<{ source: TSource, state: TState }>;

    async createTransitionPromise(source: TSource): Promise<{ source: TSource, state?: TState }> {
        this.setTransitioning(source);
        let state: TState | undefined;
        try {
            this.lastState = await this.onTransitioningAsync(source);
        }
        catch (err) {
            this.fail(err);
            throw err;
        }
        finally {
            delete this.promise;
        }
        this.setTransitioned(source, state);
        return { source: source, state: state };
    }

    protected async onTransitioningAsync(source: TSource): Promise<TState | undefined> {
        return;
    }
}

export class ExplicitTransition<TSource, TState = any | undefined> extends ImperativeTransition<TSource, TState> {
    constructor(private transitioningAsync: (source: TSource) => Promise<TState | undefined>) {
        super();
    }

    protected async onTransitioningAsync(source: TSource): Promise<TState | undefined> {
        return this.transitioningAsync(source);
    }
}
