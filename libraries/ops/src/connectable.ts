import { MappedTransition } from './transitions/mapped_transition';
import { Transitive } from './transitions/transitive';
import { StateMachine } from './transitions/state_machine';
import { Observable } from 'rxjs/Observable';

export interface ConnectableResult<TSource = any, TEvent = any> {
    source: TSource;
    success: boolean;

    /** True for connect, false for disconnect */
    connect: boolean;

    /** Present when connect and success are both true. */
    connectable?: Connectable<TSource, TEvent>;
}

/**
 * A state machine with a connect and disconnect transition.
 */
export abstract class Connectable<TSource = any, TEvent = any, TResult extends ConnectableResult<TSource, TEvent> = ConnectableResult<TSource, TEvent>> extends StateMachine<TSource, ConnectableResult<TSource, TEvent>> {
    abstract get observable(): Observable<TEvent>;

    connect(connectable: Connectable<TSource, TEvent>, connectTransition: Transitive<TSource, boolean>) {
        this.transition(new MappedTransition<TSource, boolean, ConnectableResult<TSource, TEvent>>(connectTransition, (source, trans, state) => <ConnectableResult<TSource, TEvent>>{ source: source, success: !!state, connect: true, connectable: connectable }));
    }

    disconnect(connectable: Connectable<TSource, TEvent>, disconnectTransition: Transitive<TSource, boolean>) {
        this.transition(new MappedTransition<TSource, boolean, ConnectableResult<TSource, TEvent>>(disconnectTransition, (source, trans, state) => <ConnectableResult<TSource, TEvent>>{ source: source, success: !!state, connect: false, connectable: connectable }));
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
