import { Stateful } from './stateful';
import { Transitive } from './transitive';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';

/**
 * A stateful that only ever has one transition at a time.
 * Setting the transition is not synonymous with changing state, since transitions are not bound to only a single execution.
 */
export class StateMachine<TResult> extends Stateful<TResult> {
    constructor() {
        super();
        this.stateSubscription = this.transitioned.subscribe(r => this.result = r);
    }

    private stateSubscription?: Subscription;

    /** The current or last transition. */
    currentTransition?: Transitive<TResult>;

    /** The latest result. */
    result?: TResult;

    transition(transition: Transitive<TResult>) {
        if (this.currentTransition)
            this.onExistingTransition(this.currentTransition, transition);
        super.transition(transition);
    }

    transitionAsync(transition: Transitive<TResult>) {
        let promise = transition.transitioned.take(1).toPromise();
        this.transition(transition);
        return promise;
    }

    /** The default implementation is that of a state machine, allowing only one transition at a time and removing the previous one. */
    protected onExistingTransition(prevTransition: Transitive<TResult>, newTransition: Transitive<TResult>) {
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
