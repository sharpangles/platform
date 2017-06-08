import { Bus } from '@sharpangles/ops';
import { Variable } from '../decorators/variable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as jsonpath from 'jsonpath';

export class JsonBus<TProperty> extends Bus<any, TProperty> {
    @Variable({
        displayName: 'Path',
        description: `A jsonpath expression for jsonpath.value(). (https://github.com/dchester/jsonpath)`
    })
    path: string;

    protected createObservable(input: Observable<any>): Observable<TProperty> {
        return input.map(source => jsonpath.value(source, this.path));
    }
}
