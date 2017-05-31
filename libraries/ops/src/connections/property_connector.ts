import { Connector } from './connector';
import { Observable } from 'rxjs/Observable';

// @todo simple way to handle branching, custom observables, etc... where do we pluck a property, debounce, etc? Is it a tracker, connection, connector, or some combination?

export class PropertyConnector<TSource, TTarget> extends Connector {
}
