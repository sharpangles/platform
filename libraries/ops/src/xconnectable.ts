import { Transitive } from './transitions/transitive';
import { CancellationToken } from '@sharpangles/lang';
import { Transitionable } from './transitions/transitionable';
import { Observable } from 'rxjs/Observable';

export interface ConnectableInput {
    connectable: Connectable;
    connectedOn: Connectable;
    connecting: boolean;
}

export interface ConnectableResult {
    input: ConnectableInput;
}

/**
 * Manages connections via connect and disconnect transitions.
 * Connections can be made and broken by setting transitions on the stateful, or by calling the imperative methods.
 */
export abstract class Connectable<TEvent = any> implements Transitionable<ConnectableInput, ConnectableResult> {
    /**
     * @param stateful The stateful which manages the ongoing transitions of connections being made and broken.  All imperative actions should run through the stateful transitionAsync to give the stateful a chance to inject other process.
     */
    constructor(protected transitionable: Transitionable<ConnectableInput, ConnectableResult>) {
    }

    abstract get observable(): Observable<TEvent>;

    async connectAsync(connectable: Connectable<TEvent>, cancellationToken?: CancellationToken): Promise<void> {
        await this.transitionable.transitionAsync(<ConnectableInput>{ connectable: connectable, connectedOn: this, connecting: true }, async (i, c) => this.createConnectPromise(connectable, i, c), cancellationToken);
    }

    protected async createConnectPromise(connectable: Connectable<TEvent>, input: ConnectableInput, cancellationToken?: CancellationToken): Promise<ConnectableResult> {
        await this.onConnectAsync(connectable, input, cancellationToken);
        return <ConnectableResult>{ input: input };
    }

    protected async onConnectAsync(connectable: Connectable<TEvent>, input: ConnectableInput, cancellationToken?: CancellationToken): Promise<void> {
    }

    async disconnectAsync(connectable: Connectable<TEvent>, cancellationToken?: CancellationToken): Promise<void> {
        await this.transitionable.transitionAsync(<ConnectableInput>{ connectable: connectable, connectedOn: this, connecting: false }, async (i, c) => this.createDisconnectPromise(connectable, i, c), cancellationToken);
    }

    protected async createDisconnectPromise(connectable: Connectable<TEvent>, input: ConnectableInput, cancellationToken?: CancellationToken): Promise<ConnectableResult> {
        await this.onDisconnectAsync(connectable, input, cancellationToken);
        return <ConnectableResult>{ input: input };
    }

    protected async onDisconnectAsync(connectable: Connectable<TEvent>, input: ConnectableInput, cancellationToken?: CancellationToken): Promise<void> {
    }

    transition(transition: Transitive<ConnectableInput, ConnectableResult>) {
        this.transitionable.transition(transition);
    }

    get transitioning(): Observable<ConnectableInput> { return this.transitionable.transitioning; }
    get transitioned(): Observable<ConnectableResult> { return this.transitionable.transitioned; }
    get inTransition(): boolean { return this.transitionable.inTransition; }

    dispose() {
        this.transitionable.dispose();
    }
}
