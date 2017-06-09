import { Remover } from './removable';
import { Removable } from './removable';
import { Connection } from './connection';
import { Connectable, ConnectionResult } from './connectable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { CancellationToken, CancellationTokenSource, Validation, MessageValidation, DynamicMerge } from '@sharpangles/lang';
import 'rxjs/add/observable/merge';

/**
 * A connectable whose observable is the result of dynamic multiplexed inputs.
 */
export class Multiplexer<T> extends Remover implements Connectable<T> {
    constructor() {
        super();
        let subscription = this.dynamicMerge.observable.subscribe(this.observableSubject);
        this.registerRemoval(() => subscription.unsubscribe());
        this.registerRemoval(() => this.dynamicMerge.dispose());
    }

    private dynamicMerge = new DynamicMerge<Connection, T>();

    private observableSubject = new Subject<T>(); // Pass observable through a subject so we can break the connection immediately on removal
    get observable(): Observable<T> { return this.observableSubject; }

    get children(): IterableIterator<Removable> { return this.connections; }
    get connections(): IterableIterator<Connection> { return this.dynamicMerge.subscriptions.keys(); }

    private connectedSubject = new Subject<Connection>();
    get connected(): Observable<Connection> { return this.connectedSubject; }
    private disconnectedSubject = new Subject<Connection>();
    get disconnected(): Observable<Connection> { return this.disconnectedSubject; }

    /** Connects an inbound connection. */
    async connectAsync(connection: Connection, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        cancellationToken = CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token;
        return <ConnectionResult>{
            validation: <Validation>{ isValid: true },
            commit: () => {
                this.dynamicMerge.set(connection, Observable.merge(...Array.from(connection.connectableSet).filter(c => c !== this).map(c => <Observable<T>>c.observable)));
                this.connectedSubject.next(connection);
            },
            rollback: () => {
                this.connectedSubject.error(new MessageValidation('Connection was rolled back.'));
            }
        };
    }

    /** Connects an inbound connection. */
    async disconnectAsync(connection: Connection, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        cancellationToken = CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token;
        return <ConnectionResult>{
            validation: <Validation>{ isValid: true },
            commit: () => {
                this.dynamicMerge.delete(connection);
                this.disconnectedSubject.next(connection);
            },
            rollback: () => {
                this.disconnectedSubject.error(new MessageValidation('Connection was rolled back.'));
            }
        };
    }

    protected commitRemoval(removalResults: ConnectionResult[]) {
        super.commitRemoval(removalResults);
        this.connectedSubject.complete();
        this.disconnectedSubject.complete();
    }
}
