import { CancellationTokenSource } from '@sharpangles/lang';
import { Transitive } from './transitive';
import { DynamicMerge } from './dynamic_merge';
import { Observable } from 'rxjs/Observable';

/** Aggregates transitions. */
export class Stateful<TResult> implements Transitive<TResult> {
    transition(transition: Transitive<TResult>) {
        this.setTransition(transition);
    }

    protected setTransition(transition: Transitive<TResult>) {
        this.transitioningMerge.set(transition, transition.transitioning);
        this.transitionedMerge.set(transition, transition.transitioned);
    }

    protected deleteTransition(transition: Transitive<TResult>) {
        this.transitioningMerge.delete(transition);
        this.transitionedMerge.delete(transition);
    }

    private transitioningMerge = new DynamicMerge<Transitive<TResult>, void>();
    private transitionedMerge = new DynamicMerge<Transitive<TResult>, TResult>();

    get transitioning(): Observable<void> { return this.transitioningMerge.observable; }
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
