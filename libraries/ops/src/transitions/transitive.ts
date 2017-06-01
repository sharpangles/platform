import { Observable } from 'rxjs/Observable';

/**
 * Transition implementations must present a consistent set of events.
 * They may be hot or cold observables, imperative async wrappers, or constants.
 * @todo Consider if/where to use things like observeOn().  If a transition is cold, it might fire on a subscription, but multiple connectables may care about the event (i.e. in connection where the transition gets used by two connectors).
 */
export interface Transitive<TSource, TState = any> {
    transitioning: Observable<{ source: TSource, transition: Transitive<TSource, TState> }>;
    transitioned: Observable<{ source: TSource, transition: Transitive<TSource, TState>, state: TState }>;
    inTransition: boolean;
}
