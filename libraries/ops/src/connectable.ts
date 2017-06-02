import { MappedTransition } from './transitions/mapped_transition';
import { Transitive } from './transitions/transitive';
import { StateMachine } from './transitions/state_machine';
import { Observable } from 'rxjs/Observable';

export interface ConnectableResult<TEvent = any> {
    success: boolean;

    /** True for connect, false for disconnect */
    connect: boolean;

    /** Present when connect and success are both true. */
    connectable?: Connectable<TEvent>;
}

/**
 * A state machine with a connect and disconnect transition.
 */
export abstract class Connectable<TEvent = any> extends StateMachine<ConnectableResult<TEvent>> {
    abstract get observable(): Observable<TEvent>;

    connect(connectable: Connectable<TEvent>, connectTransition: Transitive<boolean>) {
        this.transition(new MappedTransition<boolean, ConnectableResult<TEvent>>(connectTransition, result => <ConnectableResult<TEvent>>{ success: !!result, connect: true, connectable: connectable }));
    }

    disconnect(connectable: Connectable<TEvent>, disconnectTransition: Transitive<boolean>) {
        this.transition(new MappedTransition<boolean, ConnectableResult<TEvent>>(disconnectTransition, result => <ConnectableResult<TEvent>>{ success: !!result, connect: false, connectable: connectable }));
    }
}

// /**
//  * Exposes an imperative asynchronous surface for wiring up systems.
//  */
// export abstract class ImperativeConnectable<TEvent = any> extends Connectable<TEvent> {
//     async connectAsync(connectable: Connectable) {
//         return (await this.transitionAsync(new ExplicitTransition<Connectable, ConnectableResult>(async s => <ConnectableResult>{ connectable: connectable, success: await this.onConnectAsync(connectable), connect: true }))).state;
//     }

//     async disconnectAsync(connectable: Connectable) {
//         return (await this.transitionAsync(new ExplicitTransition<Connectable, ConnectableResult>(async s => <ConnectableResult>{ connectable: connectable, success: await this.onDisconnectAsync(connectable), connect: false }))).state;
//     }

//     protected abstract async onConnectAsync(connectable: Connectable): Promise<boolean>;
//     protected abstract async onDisconnectAsync(connectable: Connectable): Promise<boolean>;
// }
