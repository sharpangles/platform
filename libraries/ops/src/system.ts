import { Interface } from './interface';
import { Connection } from './connection';
import { MappedTransition } from './transitions/mapped_transition';
import { Transitive } from './transitions/transitive';
import { Surface } from './placement/placement';
import { Tracker, TrackerResult } from './tracker';

export interface SystemResult extends TrackerResult {
    tracker?: Tracker;
    connection?: Connection;
}

export class System extends Tracker {
    constructor(public trackers: Surface<Tracker>, interfaces: Surface<Interface>, public connecions: Surface<Connection>, system?: System) {
        super(interfaces, system);
    }

    addTracker(tracker: Tracker, addTransition: Transitive<boolean>) {
        this.transition(new MappedTransition<boolean, SystemResult>(addTransition, result => <SystemResult>{ success: !!result, added: true, tracker: tracker }));
    }

    removeTracker(tracker: Tracker, removeTransition: Transitive<boolean>) {
        this.transition(new MappedTransition<boolean, SystemResult>(removeTransition, result => <SystemResult>{ success: !!result, added: false, tracker: tracker }));
    }

    addConnection(connection: Connection, addTransition: Transitive<boolean>) {
        this.transition(new MappedTransition<boolean, SystemResult>(addTransition, result => <SystemResult>{ success: !!result, added: true, connection: connection }));
    }

    removeConnection(connection: Connection, removeTransition: Transitive<boolean>) {
        this.transition(new MappedTransition<boolean, SystemResult>(removeTransition, result => <SystemResult>{ success: !!result, added: false, connection: connection }));
    }
}
