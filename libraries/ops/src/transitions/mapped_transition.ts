import { Transitive } from './transitive';
import { Observable } from 'rxjs/Observable';

export class MappedTransition<TResult, TMapped> implements Transitive<TMapped> {
    constructor(private wrapped: Transitive<TResult>, private map: (result: TResult) => TMapped) {
    }

    get transitioning(): Observable<void> {
        return this.wrapped.transitioning;
    }
    get transitioned(): Observable<TMapped> {
        return this.wrapped.transitioned.map(r => this.map(r));
    }

    get inTransition(): boolean { return this.wrapped.inTransition; }
}
