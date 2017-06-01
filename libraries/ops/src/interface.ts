import { Tracker } from './tracker';
import { Placement, PlacementChange, Surface } from './placement/placement';
import { Connector, InputConnector, OutputConnector } from './connector';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export class Interface {
    constructor(public tracker: Tracker, public surface: Surface<Connector>) {
    }

    async insertInputConnector(connector: InputConnector, placement?: Placement) {
        let changes = this.surface.place(connector, placement);
        this.connectorsChangedSubject.next(changes);
    }

    async removeInputConnector(connector: InputConnector) {
        let changes = this.surface.remove(connector);
        this.connectorsChangedSubject.next(changes);
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
