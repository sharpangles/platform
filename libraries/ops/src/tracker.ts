import { Surface } from './placement/surface';
import { Operational, Removable } from './operational';
import { Interface } from './interface';
import { System } from './system';

export class Tracker extends Operational {
    constructor(public interfaces: Surface<Interface>, public system?: System) {
        super();
    }

    get children(): Iterable<Removable> { return this.interfaces; }
}
