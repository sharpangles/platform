import { Observable } from 'rxjs/Observable';

/**
 * Encapsulates a task in a declarative way.
 * A transitive alone says nothing about the tasks ability to re-execute, maintain context, cancel, roll back to transitioning,
 * or even if anything imperative exists on the other side.
 * These are used to decouple the work required to modify the system graphs from the system graphs themselves.
 */
export interface Transitive<TInput, TResult> {
    transitioning: Observable<TInput>;
    transitioned: Observable<TResult>;
    inTransition: boolean;
    dispose();
}
