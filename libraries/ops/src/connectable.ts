import { Removable } from './operational';
import { Connection } from './connection';
import { CancellationToken, Validation } from '@sharpangles/lang';
import { Observable } from 'rxjs/Observable';

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
}
