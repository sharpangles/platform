import { Transition } from '../transitions/transition';
import { Stateful } from '../transitions/stateful';
import { InputConnector, OutputConnector } from './connector';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export class Connection<TInput, TOutput> extends Stateful {
    constructor(public sourceConnector: OutputConnector<TOutput>,
                public targetConnector: InputConnector<TInput>,
                protected connectTransition: Transition<any, Connection<TInput, TOutput>>,
                protected disconnectTransition: Transition<any, Connection<TInput, TOutput>>) {
        super();
    }

    private neverSubject = new Subject();

    get connecting(): Observable<{ source: any, transition: Transition<any, Connection<TInput, TOutput>> }> { return !this.connectTransition ? this.neverSubject : this.connectTransition.transitioning; }
    get connected() { return !this.connectTransition ? this.neverSubject : this.connectTransition.transitioned; }
    get disconnecting() { return !this.disconnectTransition ? this.neverSubject : this.disconnectTransition.transitioning; }
    get disconnected() { return !this.disconnectTransition ? this.neverSubject : this.disconnectTransition.transitioned; }

    dispose() {
        super.dispose();
        this.neverSubject.complete();
    }
}
