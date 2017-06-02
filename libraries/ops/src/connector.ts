import { Connection } from './connection';
import { Interface } from './interface';
import { Transitive } from './transitions/transitive';
import { DynamicMerge } from './transitions/dynamic_merge';
import { Connectable } from './connectable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/never';

export abstract class Connector<TEvent = any> extends Connectable<TEvent> {
    constructor(public parent?: Interface | Connection) {
        super();
        this.dynamicMerge = new DynamicMerge<Connectable<TEvent>, TEvent>();
        let neverObservable = Observable.never();
        this.dynamicMerge.set(this, neverObservable);
    }

    protected dynamicMerge: DynamicMerge<Connectable<TEvent>, TEvent>;
    protected connections = new Map<Connectable<TEvent>, () => void>();

    connect(connectable: Connectable<TEvent>, connectTransition: Transitive<boolean>) {
        if (this.connections.has(connectable))
            throw new Error('Connectable already attached.');
        let transitioningSubscription = connectable.transitioning.subscribe(() => this.dynamicMerge.delete(connectable)); // If it reenters transitioning, ensure its deleted
        let transitionedSubscription = connectable.transitioned.subscribe(() => this.dynamicMerge.set(connectable, connectable.observable)); // Only add after fully connected
        let disposal = () => {
            this.dynamicMerge.delete(connectable);
            transitioningSubscription.unsubscribe();
            transitionedSubscription.unsubscribe();
        };
        this.connections.set(connectable, disposal);
        super.connect(connectable, connectTransition);
    }

    disconnect(connectable: Connectable<TEvent>, disconnectTransition: Transitive<boolean>) {
        let disposal = this.connections.get(connectable);
        if (!disposal)
            throw new Error('Connectable not attached.');
        disposal();
        super.disconnect(connectable, disconnectTransition);
    }

    dispose() {
        for (let disposal of this.connections.values())
            disposal();
        this.connections.clear();
        this.dynamicMerge.dispose();
        super.dispose();
    }
}

export class InputConnector<TEvent = any> extends Connector<TEvent> {
    constructor(parent?: Interface | Connection) {
        super(parent);
    }

    get observable(): Observable<TEvent> { return this.dynamicMerge.observable; }
}

export class OutputConnector<TEvent = any> extends Connector<TEvent> {
    constructor(public observable: Observable<TEvent>, parent: Interface | Connection) {
        super(parent);
    }
}
