import { Connection } from './connection';
import { Multiplexer } from './multiplexer';
import { Disposable, CancellationToken } from '@sharpangles/lang';
import { Connectable, ConnectionResult } from './connectable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

/**
 * A connector that tracks multiple outbound connections.
 */
@Disposable()
export class Splitter<T = any> implements Connectable<T> {
    constructor(observable: Observable<T>) {
        this.multiplexer = new Multiplexer<T>();
        this.subscription = observable.subscribe(this.observableSubject);
    }

    private subscription: Subscription;

    private observableSubject = new Subject<T>(); // Pass observable through a subject so we can break the connection immediately on removal
    get observable(): Observable<T> { return this.observableSubject; }

    /** A splitter is basically a wrapped multiplexer with a replaced observable. */
    private multiplexer: Multiplexer<T>;
    get connections(): IterableIterator<Connection> { return this.multiplexer.connections; }
    get connected(): Observable<Connection> { return this.multiplexer.connected; }
    get disconnected(): Observable<Connection> { return this.multiplexer.disconnected; }
    get removed(): Observable<void> { return this.multiplexer.removed; }

    /** Connects an outbound connection. */
    connectAsync(connection: Connection, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        return this.multiplexer.connectAsync(connection, cancellationToken);
    }

    /** Disonnects an outbound connection. */
    disconnectAsync(connection: Connection, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        return this.multiplexer.disconnectAsync(connection, cancellationToken);
    }

    async removeAsync(cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        let result = await this.multiplexer.removeAsync(cancellationToken);
        return {
            validation: result.validation,
            canCommit: result.canCommit,
            commit: () => {
                result.commit && result.commit();
                if (this.subscription) {
                    this.subscription.unsubscribe();
                    delete this.subscription;
                }
            },
            rollback: result.rollback
        };
    }

    dispose() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            delete this.subscription;
        }
        this.multiplexer.dispose();
    }
}
