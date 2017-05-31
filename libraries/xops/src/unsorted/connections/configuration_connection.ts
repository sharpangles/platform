import { Description } from '../description';
import { Observable } from 'rxjs/Observable';
import { SubscriptionConnection } from './subscription_connection';
import { Subscription } from 'rxjs/Subscription';
import { Tracker } from '../tracker';

export class ConfigurationConnection<TSub, TConfig = any> extends SubscriptionConnection {
    constructor(source: Tracker, target: Tracker, description: Description, private observableSelector: (source: Tracker) => Observable<TSub>, private configFactory?: (result: TSub) => TConfig) {
        super(source, target, description);
    }

    protected createSubscription(): Subscription {
        return this.observableSelector(this.source).subscribe(p => {
            if (!this.configFactory)
                return;
            let connectionState = this.configFactory(p);
            if (connectionState)
                this.target.configureAsync(connectionState);
        });
    }
}
