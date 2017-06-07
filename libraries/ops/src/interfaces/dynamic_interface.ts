import { ExplicitTransition } from '../transitions/explicit_transition';
import { CancellationTokenSource } from '@sharpangles/lang';
import { ImperativeTransition } from '../transitions/imperative_transition';
import { Transitive } from '../transitions/transitive';
import { Interface } from '../interface';
import { InputConnector, OutputConnector } from '../connector';
import { Subscription } from 'rxjs/Subscription';

export class DynamicInterface extends Interface {
    cancellationTokenSource = new CancellationTokenSource();

    addTransition<TInput, TResult>(transition: Transitive<TInput, TResult>, transitioningName: string, transitionedName: string) {
        let input = new InputConnector(this);
        this.addConnector(input, this.getInputAdditionTransition(input, transition));
        let output = new OutputConnector<TResult>(transition.transitioned, this);
        this.addConnector(input, this.getOutputAdditionTransition(output, transition));
    }

    protected getInputAdditionTransition(input: InputConnector, transition: Transitive<any>): Transitive<boolean> {
        if (transition instanceof ImperativeTransition) {
            let subscription: Subscription;
            return new ExplicitTransition(async () => {
                subscription = input.observable.subscribe(val => );
                return true;
            });

                        // return new ExplicitTransition(() => transition.transitionAsync(this.cancellationTokenSource.token));
        }
    }

    protected getOuputAdditionTransition(output: OutputConnector, transition: Transitive<any>): Transitive<boolean> {
    }
}
