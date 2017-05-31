import { Transitive } from './transitive';
import { DynamicMerge } from './dynamic_merge';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

/** A state machine transitionable between multiple states. */
export class Stateful<TState = any> implements Transitive<Stateful<TState>, TState> {
    currentTransition?: Transitive<Stateful<TState>, TState>;

    transition(transition: Transitive<Stateful<TState>, TState>) {
        if (this.currentTransition)
            this.onExistingTransition(this.currentTransition, transition);
        this.setTransition(transition);
    }

    transitionAsync(transition: Transitive<Stateful<TState>, TState>) {
        let promise = transition.transitioned.toPromise();
        this.transition(transition);
        return promise;
    }

    /** The default implementation is that of a state machine, allowing only one transition at a time and removing the previous one. */
    protected onExistingTransition(prevTransition: Transitive<Stateful<TState>, TState>, newTransition: Transitive<Stateful<TState>, TState>) {
        if (prevTransition.inTransition)
            throw new Error('Already transitioning');
        if (prevTransition === newTransition)
            throw new Error('Same transition');
        this.deleteTransition(prevTransition);
    }

    protected setTransition(transition: Transitive<Stateful<TState>, TState>) {
        this.transitioningMerge.set(transition, transition.transitioning);
        this.transitionedMerge.set(transition, transition.transitioned);
        this.currentTransition = transition;
    }

    protected deleteTransition(transition: Transitive<Stateful<TState>, TState>) {
        this.transitioningMerge.delete(transition);
        this.transitionedMerge.delete(transition);
    }

    private transitioningMerge = new DynamicMerge<Transitive<Stateful<TState>, TState>, { source: Stateful<TState>, transition: Transitive<Stateful<TState>, TState> }>();
    private transitionedMerge = new DynamicMerge<Transitive<Stateful<TState>, TState>, { source: Stateful<TState>, transition: Transitive<Stateful<TState>, TState>, state?: TState }>();

    get transitioning(): Observable<{ source: Stateful<TState>, transition: Transitive<Stateful<TState>, TState> }> { return this.transitioningMerge.observable; }
    get transitioned(): Observable<{ source: Stateful<TState>, transition: Transitive<Stateful<TState>, TState>, state?: TState }> { return this.transitionedMerge.observable; }
    get inTransition(): boolean { return !this.currentTransition || this.currentTransition.inTransition; }
    get state(): TState | undefined { return this.currentTransition && this.currentTransition.lastState; }

    dispose() {
        if (this.currentTransition && this.currentTransition.inTransition)
            throw new Error('Cannot dispose while transitioning.');
        this.transitioningMerge.dispose();
        this.transitionedMerge.dispose();
    }
}
