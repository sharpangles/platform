import { Stateful } from './stateful';
import { Transitive } from './transitive';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/toPromise';

/**
 * A stateful that only ever has one transition at a time.
 * Setting the transition is not synonymous with changing state, since transitions are not bound to only a single execution.
 */
export class StateMachine<TSource, TState = any> extends Stateful<TSource, TState> {
    constructor() {
        super();
        this.stateSubscription = this.transitioned.subscribe(t => this.state = t.state);
    }

    private stateSubscription?: Subscription;

    /** The current or last transition. */
    currentTransition?: Transitive<TSource, TState>;

    /** The latest state. */
    state?: TState;

    transition(transition: Transitive<TSource, TState>) {
        if (this.currentTransition)
            this.onExistingTransition(this.currentTransition, transition);
        super.transition(transition);
    }

    transitionAsync(transition: Transitive<TSource, TState>) {
        let promise = transition.transitioned.toPromise();
        this.transition(transition);
        return promise;
    }

    /** The default implementation is that of a state machine, allowing only one transition at a time and removing the previous one. */
    protected onExistingTransition(prevTransition: Transitive<TSource, TState>, newTransition: Transitive<TSource, TState>) {
        if (prevTransition.inTransition)
            throw new Error('Already transitioning');
        if (prevTransition === newTransition)
            throw new Error('Same transition');
        this.deleteTransition(prevTransition);
    }

    dispose() {
        this.stateSubscription && this.stateSubscription.unsubscribe();
        super.dispose();
    }
}
