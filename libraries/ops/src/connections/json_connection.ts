import { Variable } from '../decorators/variable';
import { Connection } from '../connection';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as jsonpath from 'jsonpath';

export class JsonConnection extends Connection {
    @Variable({
        displayName: 'Path',
        description: `A jsonpath expression for jsonpath.value(). (https://github.com/dchester/jsonpath)`
    })
    path: string;

    protected createObservable(observable: Observable<any>) {
        return observable.map(source => jsonpath.value(source, this.path));
    }
}
