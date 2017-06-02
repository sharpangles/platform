import { Transitive } from './transitive';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export abstract class SubjectTransition<TResult> implements Transitive<TResult> {
    private transitioningSubject = new Subject<void>();
    private transitionedSubject = new Subject<TResult>();

    get transitioning(): Observable<void> { return this.transitioningSubject; }
    get transitioned(): Observable<TResult> { return this.transitionedSubject; }

    inTransition: boolean;

    protected setTransitioning() {
        if (this.inTransition)
            throw new Error('Already transitioning.');
        this.inTransition = true;
        this.transitioningSubject.next();
    }

    protected fail(error: any) {
        if (!this.inTransition)
            this.transitioningSubject.error(error);
        this.transitionedSubject.error(error);
    }

    protected setTransitioned(result: TResult) {
        this.transitionedSubject.next(result);
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
