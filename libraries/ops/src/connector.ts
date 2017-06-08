import { Splitter } from './splitter';
import { Multiplexer } from './multiplexer';
import { Interface } from './interface';
import { Connectable } from './connectable';
import { Observable } from 'rxjs/Observable';

export interface Connector<T = any> extends Connectable<T> {
    iface: Interface;
}

export class InputConnector<T = any> extends Multiplexer<T> implements Connector<T> {
    constructor(public iface: Interface) {
        super();
    }
}

export class OutputConnector<T = any> extends Splitter<T> implements Connector<T> {
    constructor(public iface: Interface, observable: Observable<T>) {
        super(observable);
    }
}
