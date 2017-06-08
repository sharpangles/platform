import { NestedValidation, CancellationToken, MessageValidation } from '@sharpangles/lang';
import { Removable } from './operational';
import { Multiplexer } from './multiplexer';
import { Splitter } from './splitter';
import { ConnectionResult } from './connectable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

/**
 * Dynamically connects inputs of one type through outputs of another.
 */
export class Bus<TSource = any, TTarget = any> implements Removable {
    constructor() {
        this.output = new Multiplexer<TSource>();
        this.input = new Splitter<TTarget>(this.createObservable(this.output.observable));
    }

    output: Multiplexer<TSource>;
    input: Splitter<TTarget>;

    private removedSubject = new Subject<void>();
    get removed(): Observable<void> { return this.removedSubject; }

    /** The default implementation simply returns the source as the target. */
    protected createObservable(input: Observable<TSource>): Observable<TTarget> {
        return <any>input;
    }

    async removeAsync(cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        let results = await Promise.all([this.output.removeAsync(cancellationToken), this.input.removeAsync(cancellationToken)]);
        let result = <ConnectionResult>{ validation: new NestedValidation(undefined, [results[0].validation, results[1].validation]) };
        let rollback = () => {
            results[0].rollback && (<Function>results[0].rollback)();
            results[1].rollback && (<Function>results[1].rollback)();
            this.removedSubject.error(new MessageValidation('Connection was rolled back.'));
        };
        if (!result.validation.isValid) {
            rollback();
            return result;
        }
        result.commit = () => {
            results[0].commit && (<Function>results[0].commit)();
            results[1].commit && (<Function>results[1].commit)();
            this.removedSubject.next();
            this.removedSubject.complete();
        };
        result.rollback = rollback;
        return result;
    }

    dispose() {
        this.output.dispose();
        this.input.dispose();
    }
}
