import { Stateful } from './transitions/stateful';
import { ExplicitTransition } from './transitions/explicit_transition';
import { Observable } from 'rxjs/Observable';

/** Handles the imperative act of connecting. */
export abstract class Connectable<TEvent = any> extends Stateful<boolean> {
    /** The effective observable for the connection. */
    observable?: Observable<TEvent>;

    async connectAsync(connectable: Connectable) {
        return !!(await this.transitionAsync(new ExplicitTransition<Connectable, boolean>(s => this.onConnectAsync(connectable)))).state;
    }

    async disconnectAsync(connectable: Connectable) {
        return !!(await this.transitionAsync(new ExplicitTransition<Connectable, boolean>(s => this.onDisconnectAsync(connectable)))).state;
    }

    protected abstract async onConnectAsync(connectable: Connectable): Promise<boolean>;
    protected abstract async onDisconnectAsync(connectable: Connectable): Promise<boolean>;
}
