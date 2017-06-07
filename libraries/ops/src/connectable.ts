import { Connection } from './connection';
import { CancellationToken, Validation } from '@sharpangles/lang';
import { Observable } from 'rxjs/Observable';

export interface ConnectionResult {
    /** If defined, the reason the connection was not permitted. */
    validation: Validation;

    /** Synchronous transactional commit of the connection.  Only supplied if the validation is successful.  */
    commit?: () => void;

    /** Synchronous transactional rollback of the connection.  Only supplied if the validation is successful. */
    rollback?: () => void;
}

/** Anything that participates in an imperative act of establishing a connection. */
export interface Connectable<T = any> {
    observable: Observable<T>;
    connectAsync(connection: Connection, cancellationToken?: CancellationToken): Promise<ConnectionResult>;
    disconnectAsync(connection: Connection, cancellationToken?: CancellationToken): Promise<ConnectionResult>;
}
