import { Transitive } from './transitive';
import { Observable } from 'rxjs/Observable';

export class MappedTransition<TInput, TResult, TMappedInput, TMappedResult> implements Transitive<TMappedInput, TMappedResult> {
    constructor(private wrapped: Transitive<TInput, TResult>, private mapInput?: (input: TInput) => TMappedInput, private mapResult?: (result: TResult) => TMappedResult) {
    }

    get transitioning(): Observable<TMappedInput> {
        return this.mapInput ? this.wrapped.transitioning.map(r => (<any>this.mapInput)(r)) : <any>this.wrapped.transitioning;
    }
    get transitioned(): Observable<TMappedResult> {
        return this.mapResult ? this.wrapped.transitioned.map(r => (<any>this.mapResult)(r)) : <any>this.wrapped.transitioned;
    }

    get inTransition(): boolean { return this.wrapped.inTransition; }

    dispose() {
        this.wrapped.dispose();
    }
}
