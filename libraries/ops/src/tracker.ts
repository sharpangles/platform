import { Surface } from './placement/placement';
import { MappedTransition } from './transitions/mapped_transition';
import { Transitive } from './transitions/transitive';
import { System } from './system';
import { StateMachine } from './transitions/state_machine';
import { Interface } from './interface';

export interface TrackerResult {
    success: boolean;
    added: boolean;
    iface?: Interface;
}

export class Tracker extends StateMachine<TrackerResult> {
    constructor(public interfaces: Surface<Interface>, public system?: System) {
        super();
    }

    addInterface(iface: Interface, addTransition: Transitive<boolean>) {
        this.interfaces.place(iface);
        this.transition(new MappedTransition<boolean, TrackerResult>(addTransition, result => <TrackerResult>{ success: !!result, added: true, iface: iface }));
    }

    removeInterface(iface: Interface, removeTransition: Transitive<boolean>) {
        removeTransition.transitioned.take(1).toPromise().then(() => this.interfaces.remove(iface));
        this.transition(new MappedTransition<boolean, TrackerResult>(removeTransition, result => <TrackerResult>{ success: !!result, added: false, iface: iface }));
    }
}
