import { ExplicitTransition } from './explicit_transition';
import { CancellationTokenSource, CancellationToken } from '@sharpangles/lang';
import { Transitive } from './transitive';
import { DynamicMerge } from './dynamic_merge';
import { Observable } from 'rxjs/Observable';

/** Aggregates transitions. */
export interface Transitionable<TInput, TResult> extends Transitive<TInput, TResult> {
    transition(transition: Transitive<TInput, TResult>);
}

/** Aggregates transitions. */
export class Transitioner<TInput, TResult> implements Transitionable<TInput, TResult> {
    transition(transition: Transitive<TInput, TResult>) {
        this.setTransition(transition);
    }

    runTransitionAsync(transition: Transitive<TInput, TResult>) {
        let promise = transition.transitioned.take(1).toPromise();
        this.transition(transition);
        return promise;
    }

    transitionAsync(input: TInput, promiseFactory: (input: TInput, cancellationToken?: CancellationToken) => Promise<TResult>, cancellationToken?: CancellationToken): Promise<TResult> {
        let transition = new ExplicitTransition<TInput, TResult>((i, c) => promiseFactory(i, c));
        let pr = this.runTransitionAsync(transition);
        transition.transitionAsync(input, CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token);
        return pr;
    }

    protected setTransition(transition: Transitive<TInput, TResult>) {
        this.transitioningMerge.set(transition, transition.transitioning);
        this.transitionedMerge.set(transition, transition.transitioned);
    }

    protected deleteTransition(transition: Transitive<TInput, TResult>) {
        this.transitioningMerge.delete(transition);
        this.transitionedMerge.delete(transition);
    }

    private transitioningMerge = new DynamicMerge<Transitive<TInput, TResult>, TInput>();
    private transitionedMerge = new DynamicMerge<Transitive<TInput, TResult>, TResult>();

    get transitioning(): Observable<TInput> { return this.transitioningMerge.observable; }
    get transitioned(): Observable<TResult> { return this.transitionedMerge.observable; }
    get inTransition(): boolean { return !!Array.from(this.transitioningMerge.subscriptions.keys()).find(t => t.inTransition); }

    private cancellationTokenSource = new CancellationTokenSource();

    protected registerDisposal(disposal: () => void) {
        this.cancellationTokenSource.token.register(disposal);
    }

    dispose() {
        this.cancellationTokenSource.cancel();
        this.transitioningMerge.dispose();
        this.transitionedMerge.dispose();
    }
}
