import { Surface } from './placement/placement';
import { Tracker } from './tracker';

export class System extends Tracker {
    constructor(public children: Surface<Tracker>, interfaces: Surface<Tracker>) {
        super(interfaces);
    }
}
