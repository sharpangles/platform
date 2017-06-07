import { Connection } from './connection';
import { Multiplexer } from './multiplexer';
import { Disposable, CancellationToken, Validation } from '@sharpangles/lang';
import { Interface } from './interface';
import { Connectable, ConnectionResult } from './connectable';
import { Observable } from 'rxjs/Observable';

export interface Connector<T = any> extends Connectable<T> {
    connections: IterableIterator<Connection>;
}

export class InputConnector<T = any> extends Multiplexer<T> implements Connector<T> {
    constructor(public iface: Interface) {
        super();
    }
}

@Disposable()
export class OutputConnector<TEvent = any> implements Connector<TEvent>, Disposable {
    constructor(public iface: Interface) {
    }

    private connectionSet = new Set<Connectable>();
    get connections(): IterableIterator<Connectable> { return this.connectionSet.keys(); }

    async connectAsync(connectable: Connectable, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        return <ConnectionResult>{ validation: <Validation>{ isValid: true }, commit: () => { this.connectionSet.delete(connectable); } };
    }

    async disconnectAsync(connectable: Connectable, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        if (!this.connectionSet.has(connectable))
            return <ConnectionResult>{ validation: <Validation>{ isValid: false } };
        return <ConnectionResult>{ validation: <Validation>{ isValid: true }, commit: () => { this.connectionSet.delete(connectable); } };
    }

    dispose() {
        this.input.dispose();
    }
}
