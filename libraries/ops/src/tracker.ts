import { Removable } from './removable';
import { Interface } from './interface';
import { Container } from './container';
import { System } from './system';

export class Tracker extends Container<Removable> {
    constructor(public system?: System) {
        super();
    }

    get interfaces(): Iterable<Interface> { return this._interfaces(); }
    private *_interfaces() {
        for (let iface of this.children)
            if (iface instanceof Interface)
                yield iface;
    }
}
