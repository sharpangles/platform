import { TypeDecorator, Injector, Type } from '@angular/core';
import { StateChange } from './interfaces';
import { ANNOTATIONS } from './angular_reflector';

export interface StatefulDecorator extends TypeDecorator { }

export interface StateDecorator {
    (bindingPropertyName?: string): any;
    new (bindingPropertyName?: string): any;
}

export function State(bindingPropertyName?: string): PropertyDecorator {
    // This does not invoke all of angular annotations.  It's just enough to get StatefulMetadtaFactory to work.
    // AOT cant seem to understand makePropDecorator if copying ng metadata.Makes us use a little magic string stuff for now tokeep it simple.
    return function (target: Object, propertyKey: string | symbol) {
        const meta = (<any>Reflect).getOwnMetadata('propMetadata', target.constructor) || {};
        meta['State'] = bindingPropertyName && meta.hasOwnProperty(bindingPropertyName) && meta['State'] || [];
        meta['State'].unshift({ type: 'State', propertyName: propertyKey, bindingPropertyName: bindingPropertyName });
        (<any>Reflect).defineMetadata('propMetadata', meta, target.constructor);
    };
}


export interface ControlDecorator {
    (bindingPropertyName?: string): any;
    new (bindingPropertyName?: string): any;
}

export function Control(bindingPropertyName?: string): PropertyDecorator {
    // This does not invoke all of angular annotations.  It's just enough to get StatefulMetadtaFactory to work.
    // AOT cant seem to understand makePropDecorator if copying ng metadata.Makes us use a little magic string stuff for now tokeep it simple.
    return function (target: Object, propertyKey: string | symbol) {
        const meta = (<any>Reflect).getOwnMetadata('propMetadata', target.constructor) || {};
        meta['Control'] = bindingPropertyName && meta.hasOwnProperty(bindingPropertyName) && meta['Control'] || [];
        meta['Control'].unshift({ type: 'Control', propertyName: propertyKey, bindingPropertyName: bindingPropertyName });
        (<any>Reflect).defineMetadata('propMetadata', meta, target.constructor);
    };
}


export interface StatefulDecorator {
    (obj: Stateful): TypeDecorator;
    new (obj: Stateful): Stateful;
}

export interface Stateful {
    getState: (injector: Injector, component: any) => any;
    setState: (injector: Injector, component: any, state: any) => StateChange;
}

export function Stateful(stateful: Stateful) {
    // This does not invoke all of angular annotations.  It's just enough to get StatefulMetadtaFactory to work.
    // AOT cant seem to understand makePropDecorator if copying ng metadata.Makes us use a little magic string stuff for now tokeep it simple.
    return function TypeDecorator(cls: Type<any>) {
        // just set both for ng4 and 5.
        const annotations = (<any>Reflect).getOwnMetadata('annotations', cls) || [];
        annotations.push(stateful);
        (<any>Reflect).defineMetadata('annotations', annotations, cls);
        if (!cls[ANNOTATIONS])
            cls[ANNOTATIONS] = [];
        cls[ANNOTATIONS].push(stateful);
        return cls;
    };
}
