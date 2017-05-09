import { Tracker } from '../trackers/tracker';

export interface Type {
}

export class TrackerConnection {
    constructor(public source: Tracker, public target: Tracker) {
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
