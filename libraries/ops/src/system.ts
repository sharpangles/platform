import { Bus } from './bus';
import { Tracker } from './tracker';

// @todo Need DI containers here.  Systems are a lifetime scope but I cant find any JS DI packages support lifetime (scope/dispose).
// Its a todo item in inversify, but still doesn't add dispose from what I see yet.
export class System extends Tracker {
    constructor(public system?: System) {
        super(system);
    }

    get trackers(): Iterable<Tracker> { return this._trackers(); }
    private *_trackers() {
        for (let tracker of this.children)
            if (tracker instanceof Tracker)
                yield tracker;
    }

    get systems(): Iterable<Tracker> { return this._systems(); }
    private *_systems() {
        for (let system of this.children)
            if (system instanceof System)
                yield system;
    }

    get busses(): Iterable<Bus> { return this._busses(); }
    private *_busses() {
        for (let bus of this.children)
            if (bus instanceof Bus)
                yield bus;
    }
}
