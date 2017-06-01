import { SubjectTransition } from './subject_transition';

export class ImperativeTransition<TSource = any, TState = any | undefined> extends SubjectTransition<TSource, TState> {
    transitionAsync(source: TSource) {
        this.promise = this.createTransitionPromise(source);
        return this.promise;
    }

    promise?: Promise<{ source: TSource, state: TState }>;

    protected async createTransitionPromise(source: TSource): Promise<{ source: TSource, state: TState }> {
        this.setTransitioning(source);
        let state: TState;
        try {
            state = await this.onTransitioningAsync(source);
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

    protected async onTransitioningAsync(source: TSource): Promise<TState> {
        return <any>undefined;
    }
}
