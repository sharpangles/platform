import { Transitive } from './transitive';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

export class ConstantTransition<TInput, TResult> implements Transitive<TInput, TResult> {
    constructor(input: TInput, result: TResult) {
        this.transitioning = Observable.from([input]);
        this.transitioned = Observable.from([result]);
    }

    transitioning: Observable<TInput>;
    transitioned: Observable<TResult>;
    get inTransition(): boolean { return false; }
}
