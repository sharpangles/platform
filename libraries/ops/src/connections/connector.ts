import { Tracker } from '../trackers/tracker';
import { Observable } from 'rxjs/Observable';

export interface Connector {
    tracker: Tracker;
}

export interface InputConnector<TIn> extends Connector {
    setInput(input: TIn);
}

export interface OutputConnector<TOut> extends Connector {
    output: Observable<TOut>;
}
