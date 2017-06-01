import { Transitive } from './transitive';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export abstract class SubjectTransition<TSource, TState = any | undefined> implements Transitive<TSource, TState> {
    private transitioningSubject = new Subject<{ source: TSource, transition: Transitive<TSource, TState> }>();
    private transitionedSubject = new Subject<{ source: TSource, transition: Transitive<TSource, TState>, state?: TState }>();

    get transitioning(): Observable<{ source: TSource, transition: Transitive<TSource, TState> }> { return this.transitioningSubject; }
    get transitioned(): Observable<{ source: TSource, transition: Transitive<TSource, TState>, state?: TState }> { return this.transitionedSubject; }

    inTransition: boolean;

    protected setTransitioning(source: TSource) {
        if (this.inTransition)
            throw new Error('Already transitioning.');
        this.inTransition = true;
        this.transitioningSubject.next({ source: source, transition: this });
    }

    protected fail(error: any) {
        if (!this.inTransition)
            this.transitioningSubject.error(error);
        this.transitionedSubject.error(error);
    }

    protected setTransitioned(source: TSource, state?: TState) {
        this.transitionedSubject.next({ source: source, transition: this, state: state });
        this.inTransition = false;
    }

    dispose() {
        this.transitioningSubject.complete();
        if (this.inTransition) {
            this.transitionedSubject.error('Transition disposed');
            return;
        }
        this.transitionedSubject.complete();
    }
}
