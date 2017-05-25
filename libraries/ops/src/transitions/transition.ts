import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export interface Transition<TSource, TState = any | undefined> {
    transitioning: Observable<{ source: TSource, transition: Transition<TSource, TState> }>;
    transitioned: Observable<{ source: TSource, transition: Transition<TSource, TState>, state?: TState }>;
    inTransition: boolean;
    lastState?: TState;
}

export abstract class ImperativeTransition<TSource, TState = any | undefined> implements Transition<TSource, TState> {
    private transitioningSubject = new Subject<{ source: TSource, transition: Transition<TSource, TState> }>();
    private transitionedSubject = new Subject<{ source: TSource, transition: Transition<TSource, TState>, state?: TState }>();

    get transitioning(): Observable<{ source: TSource, transition: Transition<TSource, TState> }> { return this.transitioningSubject; }
    get transitioned(): Observable<{ source: TSource, transition: Transition<TSource, TState>, state?: TState }> { return this.transitionedSubject; }

    get inTransition(): boolean { return !!this.promise; }

    transition(source: TSource) {
        this.promise = this.createTransitionPromise(source);
    }

    promise?: Promise<{ source: TSource, state: TState }>;
    lastState?: TState;

    async createTransitionPromise(source: TSource): Promise<{ source: TSource, state?: TState }> {
        if (this.promise)
            throw new Error('Already transitioning.');
        this.transitioningSubject.next({ source: source, transition: this });
        let state: TState | undefined;
        try {
            this.lastState = await this.onTransitioningAsync(source);
        }
        catch (err) {
            this.transitionedSubject.error(err);
            throw err;
        }
        finally {
            delete this.promise;
        }
        this.transitionedSubject.next({ source: source, transition: this, state: state });
        return { source: source, state: state };
    }

    protected async onTransitioningAsync(source: TSource): Promise<TState | undefined> {
        return;
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

export class ExplicitTransition<TSource, TState = any | undefined> extends ImperativeTransition<TSource, TState> {
    constructor(private transitioningAsync: (source: TSource) => Promise<TState | undefined>) {
        super();
    }

    protected async onTransitioningAsync(source: TSource): Promise<TState | undefined> {
        return this.transitioningAsync(source);
    }
}
