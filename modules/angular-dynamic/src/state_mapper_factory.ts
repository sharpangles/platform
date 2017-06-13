import { Type, Injectable, Input, Injector } from '@angular/core';
import { Stateful } from './metadata';
import { StateChange } from './interfaces';
import { StateMapper } from './state_mapper';
import { AngularReflector } from './angular_reflector';

@Injectable()
export class StateMapperFactory {
    constructor(private reflector: AngularReflector) {
    }

    private statefulsByType: Map<Type<any>, Stateful> = new Map<Type<any>, Stateful>();

    get(typeOrFunc: Type<any>) {
        let result = this.statefulsByType.get(typeOrFunc);
        if (!result)
            result = this.load(typeOrFunc);
        return result;
    }

    set(typeOrFunc: Type<any>, loader: Stateful) {
        this.statefulsByType.set(typeOrFunc, loader);
    }

    private load(typeOrFunc: Type<any>): Stateful {
        let stateful: Stateful = new AngularReflector().annotations(typeOrFunc).find(a => a.getState || a.setState);
        if (stateful)
            return stateful;
        stateful = this.createDefault(typeOrFunc);
        this.set(typeOrFunc, stateful);
        return stateful;
    }

    private stringMap(map: { [key: string]: any }, callback: /*(V, K) => void*/ Function) {
        for (let prop in map) {
            if (map.hasOwnProperty(prop))
                callback(map[prop], prop);
        }
    }

    /** @todo Overrides for default getState implementation supporting ngrx state, deep-cloning, etc... */
    protected createDefault(typeOrFunc: Type<any>) {
        let statePairs: [string, string][] = [];
        let inputPairs: [string, string][] = [];
        let propertyMetadata = new AngularReflector().propMetadata(typeOrFunc);
        let controlProp: string;

        this.stringMap(propertyMetadata, (metadata: any[], propName: string) => {
            metadata.forEach(a => {
                if (a.type === 'State')
                    statePairs.push([a.propertyName, a.bindingPropertyName || a.propertyName]);
                else if (a.type === 'Control')
                    controlProp = a.propertyName;
                else if (a instanceof Input) {
                    let statePropName = (<any>a).bindingPropertyName ? (<any>a).bindingPropertyName : propName;
                    inputPairs.push([propName, statePropName]);
                }
            });
        });

        let pairs = statePairs.length > 0 ? statePairs : inputPairs;

        return <Stateful>{
            getState: (injector: Injector, component: any) => {
                if (component instanceof StateMapper) {
                    let result = component.getState();
                    if (result != null)
                        return result;
                }
                let state: { [key: string]: any } = {};
                for (let pair of pairs) {
                    let componentValue = component[pair[1]];
                    state[pair[0]] = componentValue;
                    // state[pair[0]] = this._copier.deepCopy(componentValue);
                }
                return state;
            },
            setState: function (injector: Injector, component: any, state: any): StateChange {
                if (component instanceof StateMapper) {
                    let result = component.setState(state);
                    if (result != null)
                        return result;
                }
                for (let pair of pairs) {
                    let stateValue = state ? state[pair[1]] : null;
                    if (stateValue !== undefined)
                        component[pair[0]] = stateValue;
                }
                let stateChanged: StateChange = { state: state };
                if (controlProp)
                    stateChanged.control = component[controlProp];
                return stateChanged;
            }
        };
    }
}
