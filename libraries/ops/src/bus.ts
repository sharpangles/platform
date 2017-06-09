import { Remover, Removable } from './removable';
import { Multiplexer } from './multiplexer';
import { Splitter } from './splitter';
import { Observable } from 'rxjs/Observable';

/**
 * Dynamically connects inputs of one type through outputs of another.
 */
export class Bus<TSource = any, TTarget = any> extends Remover {
    constructor() {
        super();
        this.input = new Multiplexer<TSource>();
        this.output = new Splitter<TTarget>(this.createObservable(this.input.observable));
    }

    input: Multiplexer<TSource>;
    output: Splitter<TTarget>;

    get children(): Iterable<Removable> { return [this.input, this.output]; }

    /** The default implementation simply returns the source as the target. */
    protected createObservable(input: Observable<TSource>): Observable<TTarget> {
        return <any>input;
    }
}
