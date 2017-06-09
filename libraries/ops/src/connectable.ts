import { Removable } from './operational';
import { Connection } from './connection';
import { CancellationToken, Validation, NestedValidation } from '@sharpangles/lang';
import { Observable } from 'rxjs/Observable';

/** Commits results if all canCommit, otherwise rolls them all back. */
export function tryCommitResults(...results: ConnectionResult[]): boolean {
    if (results.find(r => !!r.canCommit && !r.canCommit())) {
        for (let r of results)
            r.rollback && r.rollback();
        return false;
    }
    for (let r of results)
        r.commit && r.commit();
    return true;
}

export function createCompositeConnectionResult(results: ConnectionResult[], createRootValidation?: (isValid: boolean) => Validation | undefined) {
    let valid = !results.find(r => !r.validation.isValid);
    let result = <ConnectionResult>{
        validation: new NestedValidation(createRootValidation ? createRootValidation(valid) : undefined, results.map(v => v.validation)),
    };
    if (valid) {
        result.canCommit = () => !results.find(r => !!r.canCommit && !r.canCommit());
        result.commit = () => {
            for (let r of results)
                r.commit && r.commit();
        };
        result.rollback = () => {
            for (let r of results)
                r.rollback && r.rollback();
        };
    }
    return result;
}

export interface ConnectionResult {
    /** If defined, the reason the connection was not permitted. */
    validation: Validation;

    /**
     * Synchronous test if commit is possible, called only after the intent to commit is determined (i.e. validation.isValid).
     * All participants should have canCommit tested and commits called transactionally (in javascript, this simply means synchronously).
     * This must be supplied if commit is supplied.
     */
    canCommit?: () => boolean;

    /** Synchronous transactional commit of the connection.  Only supplied if the validation is successful.  */
    commit?: () => void;

    /** Synchronous transactional rollback of the connection.  Only supplied if the validation is successful.  Otherwise, any dependent rollbacks have already been called. */
    rollback?: () => void;
}

/** Anything that participates in an imperative act of establishing a connection. */
export interface Connectable<T = any> extends Removable {
    connections: IterableIterator<Connection>;

    observable: Observable<T>;

    /**
     * @param connection The connection calling this method.
     */
    connectAsync(connection: Connection, cancellationToken?: CancellationToken): Promise<ConnectionResult>;

    /**
     * @param connection The connection calling this method.
     */
    disconnectAsync(connection: Connection, cancellationToken?: CancellationToken): Promise<ConnectionResult>;

    connected: Observable<Connection>;
    disconnected: Observable<Connection>;
}
