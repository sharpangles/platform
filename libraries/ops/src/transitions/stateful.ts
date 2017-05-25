import { ImperativeTransition, Transition } from './transition';
import { DynamicMerge } from './dynamic_merge';
import { Observable } from 'rxjs/Observable';

/** Something transitionable between multiple states. */
export class Stateful<TState = any> implements Transition<Stateful<TState>, TState> {
    currentTransition?: Transition<Stateful<TState>, TState>;

    transition(transition: Transition<Stateful<TState>, TState>) {
        if (this.currentTransition)
            this.onExistingTransition(this.currentTransition, transition);
        this.setTransition(transition);
    }

    protected onExistingTransition(prevTransition: Transition<Stateful<TState>, TState>, newTransition: Transition<Stateful<TState>, TState>) {
        if (prevTransition.inTransition)
            throw new Error('Already transitioning');
        if (prevTransition === newTransition)
            throw new Error('Same transition');
        this.deleteTransition(prevTransition);
    }

    protected async runTransitionAsync(transition: ImperativeTransition<Stateful<TState>, TState>) {
        this.setTransition(transition);
        let promise = transition.transitioned.toPromise();
        transition.transition(this);
        await promise;
    }

    protected setTransition(transition: Transition<Stateful<TState>, TState>) {
        this.transitioningMerge.set(transition, transition.transitioning);
        this.transitionedMerge.set(transition, transition.transitioned);
        this.currentTransition = transition;
    }

    protected deleteTransition(transition: Transition<Stateful<TState>, TState>) {
        this.transitioningMerge.delete(transition);
        this.transitionedMerge.delete(transition);
    }

    private transitioningMerge = new DynamicMerge<Transition<Stateful<TState>, TState>, { source: Stateful<TState>, transition: Transition<Stateful<TState>, TState> }>();
    private transitionedMerge = new DynamicMerge<Transition<Stateful<TState>, TState>, { source: Stateful<TState>, transition: Transition<Stateful<TState>, TState>, state?: TState }>();

    get transitioning(): Observable<{ source: Stateful<TState>, transition: Transition<Stateful<TState>, TState> }> { return this.transitioningMerge.observable; }
    get transitioned(): Observable<{ source: Stateful<TState>, transition: Transition<Stateful<TState>, TState>, state?: TState }> { return this.transitionedMerge.observable; }
    get inTransition(): boolean { return !this.currentTransition || this.currentTransition.inTransition; }
    get state(): TState | undefined { return this.currentTransition && this.currentTransition.lastState; }

    dispose() {
        if (this.currentTransition && this.currentTransition.inTransition)
            throw new Error('Cannot dispose while transitioning.');
        this.transitioningMerge.dispose();
        this.transitionedMerge.dispose();
    }
}
