import { Observable } from 'rxjs/Observable';

export interface Transitive<TSource, TState = any | undefined> {
    transitioning: Observable<{ source: TSource, transition: Transitive<TSource, TState> }>;
    transitioned: Observable<{ source: TSource, transition: Transitive<TSource, TState>, state?: TState }>;
    inTransition: boolean;
    lastState?: TState;
}
