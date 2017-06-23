import { Removable } from './removable';
import { Splitter } from './splitter';
import { Tracker } from './tracker';
import { Multiplexer } from './multiplexer';
import { Connectable } from './connectable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export interface Connector<T = any> extends Connectable<T>, Removable {
    tracker: Tracker;
}

export class InputConnector<T = any> extends Multiplexer<T> implements Connector<T> {
    constructor(public tracker: Tracker) {
        super();
    }
}

export class OutputConnector<T = any> extends Splitter<T> implements Connector<T> {
    constructor(public tracker: Tracker, observable: Observable<T>) {
        super(observable);
    }
}

export class SubjectOutputConnector<T = any> extends OutputConnector<T> {
    constructor(public tracker: Tracker) {
        super(tracker, new Subject<T>());
    }

    get subject() { return <Subject<T>>this.observable; }
}

export class SubscribingInputConnector<T = any> extends InputConnector<T> {
    constructor(public tracker: Tracker, call: (t: T) => void) {
        super(tracker);
        let subscription = this.observable.subscribe(t => call(t));
        this.registerRemoval(() => subscription.unsubscribe());
    }
}
