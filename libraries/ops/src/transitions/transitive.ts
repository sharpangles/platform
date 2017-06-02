import { Observable } from 'rxjs/Observable';

/**
 * Encapsulates a task in a declarative way.
 * A transitive alone says nothing about the tasks ability to re-execute, maintain context, cancel, roll back to transitioning,
 * or even if anything imperative exists on the other side.
 */
export interface Transitive<TResult> {
    transitioning: Observable<void>;
    transitioned: Observable<TResult>;
    inTransition: boolean;
}
