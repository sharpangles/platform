import { Surface } from './placement/placement';
import { MappedTransition } from './transitions/mapped_transition';
import { Transitive } from './transitions/transitive';
import { StateMachine } from './transitions/state_machine';
import { Tracker } from './tracker';
// import { Placement, PlacementChange, Surface } from './placement/placement';
import { Connector } from './connector';

export interface InterfaceResult {
    success: boolean;
    added: boolean;
    connector?: Connector;
}

export class Interface extends StateMachine<InterfaceResult> {
    constructor(public tracker: Tracker, public connectors: Surface<Connector>) {
        super();
    }

    addConnector(connector: Connector, addTransition: Transitive<boolean>) {
        this.connectors.place(connector);
        this.transition(new MappedTransition<boolean, InterfaceResult>(addTransition, result => <InterfaceResult>{ success: !!result, added: true, connector: connector }));
    }

    removeConnector(connector: Connector, removeTransition: Transitive<boolean>) {
        removeTransition.transitioned.take(1).toPromise().then(() => this.connectors.remove(connector));
        this.transition(new MappedTransition<boolean, InterfaceResult>(removeTransition, result => <InterfaceResult>{ success: !!result, added: false, connector: connector }));
    }
}
