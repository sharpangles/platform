import { Transitive } from './transitive';
import { Observable } from 'rxjs/Observable';

export class MappedTransition<TSource, TState = any, TMapped = any> implements Transitive<TSource, TMapped> {
    constructor(private wrapped: Transitive<TSource, TState>, private map: (source: TSource, transition: Transitive<TSource, TState>, state: TState) => TMapped) {
    }

    get transitioning(): Observable<{ source: TSource, transition: Transitive<TSource, TMapped> }> {
        return this.wrapped.transitioning.map(t => <{ source: TSource, transition: Transitive<TSource, TMapped> }>{ source: t.source, transition: this });
    }
    get transitioned(): Observable<{ source: TSource, transition: Transitive<TSource, TMapped>, state: TMapped }> {
        return this.wrapped.transitioned.map(t => <{ source: TSource, transition: Transitive<TSource, TMapped>, state: TMapped }>{ source: t.source, transition: this, state: this.map(t.source, t.transition, t.state) });
    }

    get inTransition(): boolean { return this.wrapped.inTransition; }
}
