import { Transitive } from './transitive';
import { DynamicMerge } from './dynamic_merge';
import { Observable } from 'rxjs/Observable';

/** Aggregates transitions. */
export class Stateful<TSource, TState = any> implements Transitive<TSource, TState> {
    transition(transition: Transitive<TSource, TState>) {
        this.setTransition(transition);
    }

    protected setTransition(transition: Transitive<TSource, TState>) {
        this.transitioningMerge.set(transition, transition.transitioning);
        this.transitionedMerge.set(transition, transition.transitioned);
    }

    protected deleteTransition(transition: Transitive<TSource, TState>) {
        this.transitioningMerge.delete(transition);
        this.transitionedMerge.delete(transition);
    }

    private transitioningMerge = new DynamicMerge<Transitive<TSource, TState>, { source: TSource, transition: Transitive<TSource, TState> }>();
    private transitionedMerge = new DynamicMerge<Transitive<TSource, TState>, { source: TSource, transition: Transitive<TSource, TState>, state: TState }>();

    get transitioning(): Observable<{ source: TSource, transition: Transitive<TSource, TState> }> { return this.transitioningMerge.observable; }
    get transitioned(): Observable<{ source: TSource, transition: Transitive<TSource, TState>, state: TState }> { return this.transitionedMerge.observable; }
    get inTransition(): boolean { return !!Array.from(this.transitioningMerge.subscriptions.keys()).find(t => t.inTransition); }

    dispose() {
        this.transitioningMerge.dispose();
        this.transitionedMerge.dispose();
    }
}
