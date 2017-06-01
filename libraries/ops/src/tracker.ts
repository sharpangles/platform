import { Stateful } from './transitions/stateful';
import { Surface } from './placement/placement';
import { Interface } from './interface';

export class Tracker extends Stateful<boolean> {
    constructor(public interfaces: Surface<Tracker>) {
        super();
    }

    async addInterfaceAsync(connectable: Connectable) {
        return !!(await this.transitionAsync(new ExplicitTransition<Connectable, boolean>(s => this.onConnectAsync(connectable)))).state;
    }

    async removeInterfaceAsync(connectable: Connectable) {
        return !!(await this.transitionAsync(new ExplicitTransition<Connectable, boolean>(s => this.onDisconnectAsync(connectable)))).state;
    }

    protected async onAddInterfaceAsync(interface: Interface): Promise<boolean> {
        return true;
    }

    protected async onRemoveInterfaceAsync(interface: Interface): Promise<boolean> {
        return true;
    }

    async addOutputConnector(connector: OutputConnector, placement?: Placement) {
        let changes = this.surface.place(connector, placement);
        this.connectorsChangedSubject.next(changes);
    }

    async removeOutputConnector(connector: OutputConnector) {
        let changes = this.surface.remove(connector);
        this.connectorsChangedSubject.next(changes);
    }

    private connectorsChangedSubject = new Subject<PlacementChange<Connector>[]>();

    /** Support for handling a new connector coming into existence. */
    get connectorsChanged(): Observable<PlacementChange<Connector>[]> { return this.connectorsChangedSubject; }
}
