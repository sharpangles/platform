import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export interface Transition<TSource, TState = any | undefined> {
    transitioning: Observable<{ source: TSource, transition: Transition<TSource, TState> }>;
    transitioned: Observable<{ source: TSource, transition: Transition<TSource, TState>, state?: TState }>;
    inTransition: boolean;
    lastState?: TState;
}

// export class ProgressTransition<TSource, TState = any | undefined> implements Transition<TSource, TState> {
//     constructor(source: TSource, progress: Observable<{ continue: boolean, state?: TState }>) {
//         this.transitioningSubject.next({ source: source, transition: this });
//         this.transitioned = progress.map(p => {
//             if (p.continue)

//             return { source: source, transition: this, state: p.state };
//         });
//     }

//     private transitioningSubject = new Subject<{ source: TSource, transition: Transition<TSource, TState> }>();

//     get transitioning(): Observable<{ source: TSource, transition: Transition<TSource, TState> }> { return this.transitioningSubject; }
//     transitioned: Observable<{ source: TSource, transition: Transition<TSource, TState>, state?: TState }>;

//     inTransition: boolean;
// }
