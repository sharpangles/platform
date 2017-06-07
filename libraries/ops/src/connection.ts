import { CancellationToken, CancellationTokenSource, NestedValidation, Disposable } from '@sharpangles/lang';
import { Connectable, ConnectionResult } from './connectable';

/** Synchronizes the connection transaction between itself and other connectables. */
@Disposable()
export abstract class Connection implements Disposable {
    constructor(connectables: Iterable<Connectable>) {
        this.connectableSet = new Set<Connectable>(connectables);
    }

    changing?: boolean;
    isConnected?: boolean;
    connectableSet: Set<Connectable>;

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

    private async changeAsync(cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        this.changing = true;
        let isConnected = this.isConnected;
        cancellationToken = CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token;
        let connectionResults = await Promise.all(Array.from(this.connectableSet.keys()).map(c => isConnected ? c.disconnectAsync(this, cancellationToken) : c.connectAsync(this, cancellationToken)));
        let result = <ConnectionResult>{ validation: new NestedValidation(undefined, connectionResults.map(r => r.validation)) };
        if (!result.validation.isValid)
            return result;
        result.commit = () => {
            if (this.isConnected !== isConnected)
                throw new Error('Invalid state');
            for (let result of connectionResults)
                result.commit && (<Function>result.commit)();
            isConnected ? this.commitDisconnection() : this.commitConnection();
            this.isConnected = !isConnected;
            this.changing = false;
        };
        result.rollback = () => {
            this.changing = false;
        };
        return result;
    }

    dispose() {
        if (this.changing)
            this.cancellationTokenSource.cancel();
    }
}
