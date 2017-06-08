import { Interface } from './interface';
import { Surface } from './placement/surface';
import { Removable } from './operational';
import { Tracker } from './tracker';

export class System extends Tracker {
    constructor(public trackers: Surface<Tracker>, public interfaces: Surface<Interface>, public system?: System) {
        super(interfaces, system);
    }

    get children(): Iterable<Removable> { return this._children(); }
    private *_children(): Iterable<Removable> {
        for (let child of super.children)
            yield child;
        for (let tracker of this.trackers)
            yield <any>tracker;
    }
}
