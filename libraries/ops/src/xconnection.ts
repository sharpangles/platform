import { StateMachine } from './transitions/state_machine';
import { InputConnector } from './connector';
import { MappedTransition } from './transitions/mapped_transition';
import { Transitive } from './transitions/transitive';
import { Observable } from 'rxjs/Observable';
import { Connectable, ConnectableInput, ConnectableResult } from './connectable';
import 'rxjs/add/operator/toPromise';

/**
 * Can operate like a bus with multiple inputs and outputs.
 * Input is true for source, false for target.
 */
export class Connection<TSourceEvent = any, TTargetEvent = any> extends StateMachine<boolean, boolean> {
    constructor() {
        super();
        this.observable = this.createObservable(this.sourceConnector.observable);
    }

    sourceConnector = new InputConnector<TSourceEvent>(this);
    targetConnector = new InputConnector<TTargetEvent>(this);
    observable: Observable<TTargetEvent>;

    /** The base implementation assumes TSourceEvent can be cast as TTargetEvent. */
    protected createObservable(observable: Observable<TSourceEvent>): Observable<TTargetEvent> {
        return <Observable<TTargetEvent>><Observable<any>>observable;
    }

    connectSource(sourceConnectable: Connectable<TSourceEvent>, connectTransition: Transitive<void, boolean>) {
        this.sourceConnector.connect(sourceConnectable, connectTransition);
        sourceConnectable.connect(this.sourceConnector, connectTransition);
        this.transition(new MappedTransition<void, boolean, boolean, boolean>(connectTransition, () => true, undefined));
    }

    disconnectSource(sourceConnectable: Connectable<TSourceEvent>, disconnectTransition: Transitive<void, boolean>) {
        this.sourceConnector.disconnect(sourceConnectable, disconnectTransition);
        sourceConnectable.disconnect(this.sourceConnector, disconnectTransition);
        this.transition(new MappedTransition<boolean, ConnectionResult>(
            disconnectTransition,
            input => <ConnectionInput<TSourceEvent>>{ connectOn: input.connectOn, connecting: input.connecting, isSource: true },
            result => <ConnectionResult>{ success: !!result, connect: false, isSource: true, connectable: sourceConnectable }));
    }

    connect(connectable: Connectable<TTargetEvent>, connectTransition: Transitive<ConnectableInput<TTargetEvent>, boolean>) {
        this.transition(new MappedTransition<boolean, ConnectableResult<TTargetEvent>>(connectTransition, result => <ConnectableResult<TTargetEvent>>{ success: !!result, connect: true, connectable: connectable }));
    }

    disconnect(connectable: Connectable<TTargetEvent>, disconnectTransition: Transitive<boolean>) {
        this.transition(new MappedTransition<boolean, ConnectableResult<TTargetEvent>>(disconnectTransition, result => <ConnectableResult<TTargetEvent>>{ success: !!result, connect: false, connectable: connectable }));
    }
}
