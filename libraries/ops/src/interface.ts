import { Container } from './container';
import { Tracker } from './tracker';
import { Connector } from './connector';

export class Interface extends Container<Connector> {
    constructor(public tracker: Tracker) {
        super();
    }
}
