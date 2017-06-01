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
export class Connection<TSource = any, TSourceEvent = any, TTargetEvent = any> extends Connector<TSource, TTargetEvent> {
    constructor() {
        super();
        this.observable = this.createObservable(this.sourceConnector.observable);
    }

    sourceConnector = new InputConnector<TSource, TSourceEvent>();
    observable: Observable<TTargetEvent>;

    /** The base implementation assumes TSourceEvent can be cast as TTargetEvent. */
    protected createObservable(observable: Observable<TSourceEvent>): Observable<TTargetEvent> {
        return <Observable<TTargetEvent>><Observable<any>>observable;
    }

    connectSource(sourceConnectable: Connectable<TSource, TSourceEvent>, connectTransition: Transitive<TSource, boolean>) {
        this.sourceConnector.connect(sourceConnectable, connectTransition);
        sourceConnectable.connect(this.sourceConnector, connectTransition);
        this.transition(new MappedTransition<TSource, boolean, ConnectionResult>(connectTransition, (source, trans, state) => <ConnectionResult>{ source: source, success: !!state, connect: true, observable: sourceConnectable.observable, isSource: true, connectable: sourceConnectable }));
    }

    disconnectSource(sourceConnectable: Connectable<TSource, TSourceEvent>, disconnectTransition: Transitive<TSource, boolean>) {
        this.sourceConnector.disconnect(sourceConnectable, disconnectTransition);
        sourceConnectable.disconnect(this.sourceConnector, disconnectTransition);
        this.transition(new MappedTransition<TSource, boolean, ConnectionResult>(disconnectTransition, (source, trans, state) => <ConnectionResult>{ source: source, success: !!state, connect: false, isSource: true, connectable: sourceConnectable }));
    }

    connect(connectable: Connectable<TSource, TTargetEvent>, connectTransition: Transitive<TSource, boolean>) {
        this.transition(new MappedTransition<TSource, boolean, ConnectableResult<TSource, TTargetEvent>>(connectTransition, (source, trans, state) => <ConnectableResult<TSource, TTargetEvent>>{ source: source, success: !!state, connect: true, connectable: connectable }));
    }

    disconnect(connectable: Connectable<TSource, TTargetEvent>, disconnectTransition: Transitive<TSource, boolean>) {
        this.transition(new MappedTransition<TSource, boolean, ConnectableResult<TSource, TTargetEvent>>(disconnectTransition, (source, trans, state) => <ConnectableResult<TSource, TTargetEvent>>{ source: source, success: !!state, connect: false, connectable: connectable }));
    }
}
