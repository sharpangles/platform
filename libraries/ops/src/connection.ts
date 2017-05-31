import { ExplicitTransition } from './transitions/explicit_transition';
import { Stateful } from './transitions/stateful';
import { Connectable } from './connectable';

/** A connectable sourced from only one other connectable. */
export class ConnectionConnectable<T> extends Connectable<T> {
    constructor(public connection: Connection<T>) {
        super();
    }

    connectable?: Connectable<T>;

    protected async onConnectAsync(connectable: Connectable<T>): Promise<boolean> {
        await this.deleteConnectableAsync();
        await connectable.connectAsync(connectable);
        this.connectable = connectable;
        return true;
    }

    protected async onDisconnectAsync(connectable: Connectable): Promise<boolean> {
        if (connectable !== this.connectable)
            return false;
        await this.deleteConnectableAsync();
        return true;
    }

    private async deleteConnectableAsync() {
        if (this.connectable) {
            let existing = this.connectable;
            delete this.connectable;
            await existing.disconnectAsync(this);
        }
    }
}

/** An aggregated Stateful of both an input and output connectable. */
export class Connection<T> extends Stateful<boolean> {
    source = new ConnectionConnectable<T>(this);
    target = new ConnectionConnectable<T>(this);

    async connectSourceAsync(connectable: Connectable): Promise<boolean> {
        return !!(await this.transitionAsync(new ExplicitTransition<Connectable, boolean>(s => this.source.connectAsync(connectable)))).state;
    }

    async disconnectSourceAsync(connectable: Connectable): Promise<boolean> {
        return !!(await this.transitionAsync(new ExplicitTransition<Connectable, boolean>(async s => this.source.connectable && await this.source.disconnectAsync(this.source.connectable)))).state;
    }

    async connectTargetAsync(connectable: Connectable): Promise<boolean> {
        return !!(await this.transitionAsync(new ExplicitTransition<Connectable, boolean>(s => this.target.connectAsync(connectable)))).state;
    }

    async disconnectTargetAsync(connectable: Connectable): Promise<boolean> {
        return !!(await this.transitionAsync(new ExplicitTransition<Connectable, boolean>(async s => this.target.connectable && await this.target.disconnectAsync(this.target.connectable)))).state;
    }
}
