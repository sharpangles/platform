import { Connector } from './connector';
import { Connection } from './connection';
import { DynamicMerge } from './transitions/dynamic_merge';
import { ConnectionResult } from './connectable';
import { Observable } from 'rxjs/Observable';
import { CancellationToken, Validation, Disposable } from '@sharpangles/lang';
import 'rxjs/add/observable/merge';

/**
 * A connectable whose observable is the result of dynamic multiplexed inputs.
 */
@Disposable()
export class Multiplexer<T> implements Connector, Disposable {
    public dynamicMerge = new DynamicMerge<Connection, T>();

    get observable(): Observable<T> { return this.dynamicMerge.observable; }
    get connections(): IterableIterator<Connection> { return this.dynamicMerge.subscriptions.keys(); }

    protected commitConnection(connection: Connection) {
         this.dynamicMerge.set(connection, Observable.merge(...Array.from(connection.connectableSet).filter(c => c !== this).map(c => <Observable<T>>c.observable)));
    }

    protected commitDisconnection(connection: Connection) {
        this.dynamicMerge.delete(connection);
    }

    async connectAsync(connection: Connection, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        return <ConnectionResult>{ validation: <Validation>{ isValid: true }, commit: () => this.commitConnection(connection) };
    }

    async disconnectAsync(connection: Connection, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        return <ConnectionResult>{ validation: <Validation>{ isValid: true }, commit: () => this.commitDisconnection(connection) };
    }

    dispose() {
        this.dynamicMerge.dispose();
    }
}
