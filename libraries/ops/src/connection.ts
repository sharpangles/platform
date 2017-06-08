import { MessageValidation } from '../../lang/src/validation/validation';
import { Removable } from './operational';
import { CancellationToken, CancellationTokenSource, NestedValidation, Disposable } from '@sharpangles/lang';
import { Connectable, ConnectionResult } from './connectable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

/**
 * Synchronizes the connection transaction between itself and other connectables.
 * Connections are not connectables, but rather the glue between them.
 * They model the imperative act of establishing all parties in a connection transaction.
 * They are all-or-none.  The removal of any connectable should destroy this connection.
 * Use multiplexers for dynamic connection membership.
 * */
@Disposable()
export abstract class Connection implements Removable {
    constructor(connectables: Iterable<Connectable>) {
        this.connectableSet = new Set<Connectable>(connectables);
    }

    changing?: boolean;
    isConnected?: boolean;
    connectableSet: Set<Connectable>;

    private connectedSubject = new Subject<void>();
    get connected(): Observable<void> { return this.connectedSubject; }
    private disconnectedSubject = new Subject<void>();
    get disconnected(): Observable<void> { return this.disconnectedSubject; }
    private removedSubject = new Subject<void>();
    get removed(): Observable<void> { return this.removedSubject; }

    private cancellationTokenSource = new CancellationTokenSource();

    protected commitConnection() {
    }

    protected commitDisconnection() {
    }

    async connectAsync(cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        if (this.isConnected)
            throw new Error('Already connected.');
        if (this.changing)
            throw new Error('Already connecting.');
        return this.changeAsync(cancellationToken);
    }

    async disconnectAsync(cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        if (!this.isConnected)
            throw new Error('Already disconnected.');
        if (this.changing)
            throw new Error('Already disconnecting.');
        return this.changeAsync(cancellationToken);
    }

    /**
     * Cancel any connection in progress, then wait for or trigger disconnect.
     * Completes the observables.
     */
    async removeAsync(cancellationToken?: CancellationToken | undefined): Promise<ConnectionResult> {
        let rollback = () => {
            this.removedSubject.error(new MessageValidation(`The removal was rolled back.`));
        };
        let commit = () => {
            this.removedSubject.next();
            this.connectedSubject.complete();
            this.disconnectedSubject.complete();
            this.removedSubject.complete();
        };
        if (this.isConnected) {
            if (this.changing) {
                // Merge this remove with the current disconnect, but rollback or commit of the removal doesn't mess with the current disconnect.
                let cancelled = false;
                await this.disconnected.take(1).toCancellablePromise(cancellationToken, err => cancelled = !!err);
                if (cancelled)
                    return { validation: { isValid: false } };
                return {
                    validation: { isValid: true },
                    canCommit: () => !cancellationToken || !cancellationToken.isCancellationRequested,
                    commit: commit,
                    rollback: rollback
                };
            }
            else {
                // Trigger disconnect, where cancellation or rollback is tied to this disconnect operation.
                let result = await this.disconnectAsync(cancellationToken);
                if (!result.validation.isValid)
                    result.rollback && result.rollback();
                return {
                    validation: result.validation,
                    canCommit: () => (!result.canCommit || result.canCommit()) && (!cancellationToken || !cancellationToken.isCancellationRequested),
                    commit: () => { result.commit && result.commit() && commit(); },
                    rollback: result.rollback
                };
            }
        }

        if (this.changing) {
            // Its in the middle of connecting
            let promise = this.connected.take(1).toCancellablePromise(cancellationToken); // subscribe before cancel in case sync
            this.cancellationTokenSource.cancel(); // Cancel the connection process and wait for it to finish.
            await promise;
            if (this.changing) // Another task snuck in before the remove.
                return { validation: { isValid: false } };
            return this.removeAsync(cancellationToken);
        }

        // Its already disconnected
        return {
            validation: { isValid: true },
            canCommit: () => !cancellationToken || !cancellationToken.isCancellationRequested,
            commit: commit,
            rollback: rollback
        };
    }

    private async changeAsync(cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        this.changing = true;
        let isConnected = this.isConnected;
        cancellationToken = CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token;
        let connectionResults = await Promise.all(Array.from(this.connectableSet.keys()).map(c => isConnected ? c.disconnectAsync(this, cancellationToken) : c.connectAsync(this, cancellationToken)));
        let result = <ConnectionResult>{ validation: new NestedValidation(undefined, connectionResults.map(r => r.validation)) };
        let rollback = () => {
            for (let result of connectionResults)
                result.rollback && (<Function>result.rollback)();
            this.changing = false;
            if (this.isConnected)
                this.disconnectedSubject.error(result.validation);
            else
                this.connectedSubject.error(result.validation);
        };
        if (!result.validation.isValid) {
            rollback();
            return result;
        }
        result.canCommit = () => {
            if (cancellationToken && cancellationToken.isCancellationRequested)
                return false;
            if (this.isConnected !== isConnected)
                throw new Error('Invalid state');
            return !!connectionResults.find(r => !!r.canCommit && !r.canCommit());
        },
        result.commit = () => {
            for (let result of connectionResults)
                result.commit && (<Function>result.commit)();
            isConnected ? this.commitDisconnection() : this.commitConnection();
            this.isConnected = !isConnected;
            this.changing = false;
            if (this.isConnected)
                this.connectedSubject.next();
            else
                this.disconnectedSubject.next();
        };
        result.rollback = rollback;
        return result;
    }

    dispose() {
        if (this.changing)
            this.cancellationTokenSource.cancel();
    }
}
