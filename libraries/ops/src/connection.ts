import { Connector, InputConnector } from './connector';
import { MappedTransition } from './transitions/mapped_transition';
import { Transitive } from './transitions/transitive';
import { Observable } from 'rxjs/Observable';
import { Connectable, ConnectableResult } from './connectable';
import 'rxjs/add/operator/toPromise';

export interface ConnectionResult extends ConnectableResult {
    isSource: boolean;
}

/**
 * Can operate like a bus with multiple inputs and outputs.
 */
export class Connection<TSourceEvent = any, TTargetEvent = any> extends Connector<TTargetEvent> {
    constructor() {
        super();
        this.observable = this.createObservable(this.sourceConnector.observable);
    }

    sourceConnector = new InputConnector<TSourceEvent>(this);
    observable: Observable<TTargetEvent>;

    /** The base implementation assumes TSourceEvent can be cast as TTargetEvent. */
    protected createObservable(observable: Observable<TSourceEvent>): Observable<TTargetEvent> {
        return <Observable<TTargetEvent>><Observable<any>>observable;
    }

    connectSource(sourceConnectable: Connectable<TSourceEvent>, connectTransition: Transitive<boolean>) {
        this.sourceConnector.connect(sourceConnectable, connectTransition);
        sourceConnectable.connect(this.sourceConnector, connectTransition);
        this.transition(new MappedTransition<boolean, ConnectionResult>(connectTransition, result => <ConnectionResult>{ success: !!result, connect: true, observable: sourceConnectable.observable, isSource: true, connectable: sourceConnectable }));
    }

    disconnectSource(sourceConnectable: Connectable<TSourceEvent>, disconnectTransition: Transitive<boolean>) {
        this.sourceConnector.disconnect(sourceConnectable, disconnectTransition);
        sourceConnectable.disconnect(this.sourceConnector, disconnectTransition);
        this.transition(new MappedTransition<boolean, ConnectionResult>(disconnectTransition, result => <ConnectionResult>{ success: !!result, connect: false, isSource: true, connectable: sourceConnectable }));
    }

    connect(connectable: Connectable<TTargetEvent>, connectTransition: Transitive<boolean>) {
        this.transition(new MappedTransition<boolean, ConnectableResult<TTargetEvent>>(connectTransition, result => <ConnectableResult<TTargetEvent>>{ success: !!result, connect: true, connectable: connectable }));
    }

    disconnect(connectable: Connectable<TTargetEvent>, disconnectTransition: Transitive<boolean>) {
        this.transition(new MappedTransition<boolean, ConnectableResult<TTargetEvent>>(disconnectTransition, result => <ConnectableResult<TTargetEvent>>{ success: !!result, connect: false, connectable: connectable }));
    }
}
