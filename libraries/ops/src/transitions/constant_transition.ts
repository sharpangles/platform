import { Transitive } from './transitive';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

export class ConstantTransition<TResult> implements Transitive<TResult> {
    constructor(result: TResult) {
        this.transitioning = Observable.from([undefined]);
        this.transitioned = Observable.from([result]);
    }

    transitioning: Observable<void>;
    transitioned: Observable<TResult>;
    get inTransition(): boolean { return false; }
}
