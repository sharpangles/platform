import { Transitive } from './transitive';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

export class ConstantTransition<TSource, TState = any | undefined> implements Transitive<TSource, TState> {
    constructor(source: TSource, state: TState) {
        this.transitioning = Observable.from([{ source: source, transition: this }]);
        this.transitioned = Observable.from([{ source: source, transition: this, state: state }]);
    }

    transitioning: Observable<{ source: TSource, transition: Transitive<TSource, TState> }>;
    transitioned: Observable<{ source: TSource, transition: Transitive<TSource, TState>, state: TState }>;
    get inTransition(): boolean { return false; }
}
