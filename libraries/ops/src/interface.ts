import { Surface } from './placement/surface';
import { Operational } from './operational';
import { Tracker } from './tracker';
import { Connector } from './connector';

export class Interface extends Operational {
    constructor(public connectors: Surface<Connector>, public tracker: Tracker) {
        super();
    }

    get children(): Iterable<Connector> { return this.connectors; }
}
