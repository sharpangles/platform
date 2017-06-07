import { Transitive } from './transitive';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export abstract class SubjectTransition<TInput, TResult> implements Transitive<TInput, TResult> {
    private transitioningSubject = new Subject<TInput>();
    private transitionedSubject = new Subject<TResult>();

    get transitioning(): Observable<TInput> { return this.transitioningSubject; }
    get transitioned(): Observable<TResult> { return this.transitionedSubject; }

    inTransition: boolean;

    protected setTransitioning(input: TInput) {
        if (this.inTransition)
            throw new Error('Already transitioning.');
        this.inTransition = true;
        this.transitioningSubject.next(input);
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
