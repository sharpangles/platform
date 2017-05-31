import { Interface } from '../interface';
import { Connector } from '../connector';


export class StatefulInterface implements Interface {
    addTransition(transition: Transition, transitioningName: string, transitionedName: string) {
    }

    inputConnectors: Connector[];
    outputConnectors: Connector[];
}
