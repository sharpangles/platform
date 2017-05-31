import { Description } from '../description';
import { Observable } from 'rxjs/Rx';
import { SubscriptionConnection } from './subscription_connection';
import { Subscription } from 'rxjs/Subscription';
import { Tracker } from '../tracker';

export class RunConnection<TSub, TState = any> extends SubscriptionConnection {
    constructor(source: Tracker, target: Tracker, description: Description, private observableSelector: (source: Tracker) => Observable<TSub>, private connectionStateFactory?: (result: TSub) => TState) {
        super(source, target, description);
    }

    protected createSubscription(): Subscription {
        return this.observableSelector(this.source).subscribe(p => {
            if (!this.connectionStateFactory) {
                this.target.runProcess();
                return;
            }
            let connectionState = this.connectionStateFactory(p);
            if (connectionState)
                this.target.runProcess(connectionState);
        });
    }
}
