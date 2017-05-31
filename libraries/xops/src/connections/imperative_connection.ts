import { InputConnector, OutputConnector } from './connector';
import { Connection } from './connection';
import { ImperativeTransition, Transition } from '../transitions/transition';

export class ImperativeConnection<TInput, TOutput> extends Connection<TInput, TOutput> {
    constructor(public sourceConnector: OutputConnector<TOutput>,
                public targetConnector: InputConnector<TInput>,
                protected connectTransition: Transition<any, Connection<TInput, TOutput>>,
                protected disconnectTransition: Transition<any, Connection<TInput, TOutput>>) {
        super(sourceConnector, targetConnector, connectTransition, disconnectTransition);
    }


    async connectAsync() {
        await this.runTransitionAsync(<ImperativeTransition<any>>this.connectTransition);
    }

    async disconnectAsync() {
        await this.runTransitionAsync(<ImperativeTransition<any>>this.disconnectTransition);
        this.dispose();
    }
}
