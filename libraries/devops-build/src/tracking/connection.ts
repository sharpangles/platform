import { Description } from './description';
import { Tracker } from './tracker';

/**
 * Connections provide a context independent of trackers.
 */
export class Connection {
    constructor(public source: Tracker, public target: Tracker, public description: Description) {
        this.source.addTarget(this);
        this.target.addSource(this);
    }

    async connectAsync(): Promise<void> {
    }

    async breakAsync(): Promise<void> {
        this.source.removeSource(this);
        this.source.removeTarget(this);
    }
}
