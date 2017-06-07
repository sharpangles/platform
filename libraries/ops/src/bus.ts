import { DynamicMerge } from './transitions/dynamic_merge';
import { Connectable } from './connectable';
import { Observable } from 'rxjs/Observable';

/**
 * Models an imperative and potentially transactional process of joining two connectables.
 */
export abstract class Bus<TSourceEvent = any, TTargetEvent = any> {
    protected dynamicMerge = new DynamicMerge<Connectable, TSourceEvent>();
    protected connections = new Map<Connectable, boolean>();

    get observable(): Observable<TTargetEvent> { return }

    inputConnectable: Connectable;
    outputConnectable: Connectable;




    protected async createConnectPromise(connectable: Connectable, input: ConnectableInput): Promise<ConnectableResult> {
        this.connections.set(connectable, false);
        if (this.connections.has(connectable))
            throw new Error('Connectable already attached.');
        let result = await super.createConnectPromise(connectable, input);
        this.dynamicMerge.set(connectable, connectable.observable);
        this.connections.set(connectable, true);
        return result;
    }

    protected async createDisonnectPromise(connectable: Connectable, input: ConnectableInput): Promise<ConnectableResult> {
        let wasConnected = this.connections.get(connectable);
        if (!disposal)
            throw new Error('Connectable not attached.');
        let result = await super.createDisonnectPromise(connectable, input);
        this.dynamicMerge.set(connectable, connectable.observable);
        this.connections.set(connectable, true);
        return result;
    }

    async disconnectAsync(connectable: Connectable): Promise<void> {
        let disposal = this.connections.get(connectable);
        if (!disposal)
            throw new Error('Connectable not attached.');

        if (this.connections.has(connectable))
            throw new Error('Connectable already attached.');
        this.connections.set(connectable, false);
        if (!await super.connectAsync(connectable))
            return false;
        this.dynamicMerge.set(connectable, connectable.observable);
        this.connections.set(connectable, true);
        return true;
    }




    // async connectInputAsync(input: InputConnector<TSourceEvent>, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
    // }

    // async connectOutputAsync(output: OutputConnector<TTargetEvent>, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
    // }

    // async disconnectInputAsync(input: InputConnector<TSourceEvent>, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
    // }

    // async disconnectOutputAsync(output: OutputConnector<TTargetEvent>, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
    // }
}
