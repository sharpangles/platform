import { StateChange } from './interfaces';

/**
 * If a component inherits from this class, the implemented get and set methods will be used.
 */
export abstract class StateMapper {
    abstract getState(): any;
    abstract setState(state: any): StateChange;
}

