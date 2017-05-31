import { DynamicMerge } from './transitions/dynamic_merge';
import { Interface } from './interface';
import { Connectable } from './connectable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/never';

export class Connector<T = any> extends Connectable<T> {
    constructor(public iface: Interface) {
        super();
        this.dynamicMerge = new DynamicMerge<Connectable<T>, T>();
        let neverObservable = Observable.never();
        this.dynamicMerge.set(this, neverObservable);
    }

    protected dynamicMerge: DynamicMerge<Connectable<T>, T>;
    protected connections = new Map<Connectable<T>, () => void>();

    protected async onConnectAsync(connectable: Connectable<T>): Promise<boolean> {
        if (this.connections.has(connectable))
            return false;
        let disposal = await this.createDisposalForConnectionAsync(connectable);
        if (!disposal)
            return false;
        this.connections.set(connectable, disposal);
        return true;
    }

    protected async createDisposalForConnectionAsync(connectable: Connectable<T>) {
        if (connectable.observable)
            this.dynamicMerge.set(connectable, connectable.observable);
        let transitioningSubscription = connectable.transitioning.subscribe(() => connectable.observable && this.dynamicMerge.delete(connectable));
        let transitionedSubscription = connectable.transitioned.subscribe(() => connectable.observable && this.dynamicMerge.set(connectable, connectable.observable));
        return () => {
            connectable.observable && this.dynamicMerge.delete(connectable);
            transitioningSubscription.unsubscribe();
            transitionedSubscription.unsubscribe();
        };
    }

    protected async onDisconnectAsync(connectable: Connectable<T>) {
        let dispose = this.connections.get(connectable);
        if (!dispose)
            return false;
        this.connections.delete(connectable);
        dispose();
        return true;
    }

    dispose() {
        this.dynamicMerge.dispose();
        super.dispose();
    }
}

export abstract class InputConnector<T = any> extends Connector<T> {
    constructor(iface: Interface) {
        super(iface);
        this.observable = this.dynamicMerge.observable;
    }
}

export abstract class OutputConnector<T = any> extends Connector<T> {
    constructor(iface: Interface, observable: Observable<T>) {
        super(iface);
        this.observable = observable;
    }
}
