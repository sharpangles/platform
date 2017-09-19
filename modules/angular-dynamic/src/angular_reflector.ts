import { Type, Injectable, TypeDecorator } from '@angular/core';

/**
 * Update: this is still here for ng4.  Its better in ng5, so some of this goes away eventually.  Adapted to support ng4 and 5.
 *
 *
 * Below is adapted from the angular reflector: https://github.com/angular/angular/blob/14fd78fd85b3dd230742eaaeab65f75226f37167/packages/core/src/reflection/reflection_capabilities.ts
 * This avoids any private references to the unexported reflector, at the cost of some duplication.
 * Although it doesn't involve a private reference, it still needs to be treated and maintained as such, since the inheritence behavior and tsickle decorator treatment is still an internal implementation.
 *
 * Items work reading or that could cause changes here:
 * https://github.com/google/closure-compiler/issues/2065
 * https://github.com/angular/angular/issues/14786
 * https://github.com/Microsoft/TypeScript/issues/11435
 *
 * Note: these changes would affect any library with decorators that want to use closure compiler, so a reflector like this would be needed even for non-angular cases.
 * Since this reflection stuff is affected by TS design issues (https://github.com/Microsoft/TypeScript/issues/11435), is useful for all custom decorators, etc...
 * it would be awesome if angular would expose this as part of the public API.
 *
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
@Injectable()
export class AngularReflector {
    private _ownAnnotations(typeOrFunc: Type<any>, parentCtor: any): any[] | null {
        // Prefer the direct API.
        if ((<any>typeOrFunc).annotations && (<any>typeOrFunc).annotations !== parentCtor.annotations) {
            let annotations = (<any>typeOrFunc).annotations;
            if (typeof annotations === 'function' && annotations.annotations) {
                annotations = annotations.annotations;
            }
            return annotations;
        }

        // API of tsickle for lowering decorators to properties on the class.
        if ((<any>typeOrFunc).decorators && (<any>typeOrFunc).decorators !== parentCtor.decorators) {
            return convertTsickleDecoratorIntoMetadata((<any>typeOrFunc).decorators);
        }

        let ng5results: any[] | undefined;

        // NG5 API for metadata created by invoking the decorators.
        if (typeOrFunc.hasOwnProperty(ANNOTATIONS)) {
            ng5results = (typeOrFunc as any)[ANNOTATIONS];
        }

        // NG4 API for metadata created by invoking the decorators.
        if (Reflect && (<any>Reflect).getOwnMetadata) {
            const ng4Results = (<any>Reflect).getOwnMetadata('annotations', typeOrFunc);
            return ng5results ? ng4Results ? ng5results.concat(ng4Results) : ng5results : ng4Results;
        }

        return null;
    }

    annotations(typeOrFunc: Type<any>): any[] {
        if (typeof typeOrFunc !== 'function') {
            return [];
        }
        const parentCtor = getParentCtor(typeOrFunc);
        const ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];
        const parentAnnotations = parentCtor !== Object ? this.annotations(parentCtor) : [];
        return parentAnnotations.concat(ownAnnotations);
    }

    private _ownPropMetadata(typeOrFunc: any, parentCtor: any): { [key: string]: any[] } | null {
        // Prefer the direct API.
        if ((<any>typeOrFunc).propMetadata &&
            (<any>typeOrFunc).propMetadata !== parentCtor.propMetadata) {
            let propMetadata = (<any>typeOrFunc).propMetadata;
            if (typeof propMetadata === 'function' && propMetadata.propMetadata) {
                propMetadata = propMetadata.propMetadata;
            }
            return propMetadata;
        }


        // API of tsickle for lowering decorators to properties on the class.
        if ((<any>typeOrFunc).propDecorators &&
            (<any>typeOrFunc).propDecorators !== parentCtor.propDecorators) {
            const propDecorators = (<any>typeOrFunc).propDecorators;
            const propMetadata = <{ [key: string]: any[] }>{};
            Object.keys(propDecorators).forEach(prop => {
                propMetadata[prop] = convertTsickleDecoratorIntoMetadata(propDecorators[prop]);
            });
            return propMetadata;
        }

        let ng5results: any[] | undefined;

        // NG5 API for metadata created by invoking the decorators.
        if (typeOrFunc.hasOwnProperty(PROP_METADATA)) {
            ng5results = (typeOrFunc as any)[PROP_METADATA];
        }

        // NG4 API for metadata created by invoking the decorators.
        if (Reflect && (<any>Reflect).getOwnMetadata) {
            const ng4Results = (<any>Reflect).getOwnMetadata('propMetadata', typeOrFunc);
            return ng5results ? ng4Results ? ng5results.concat(ng4Results) : ng5results : ng4Results;
        }
        return null;
    }

    propMetadata(typeOrFunc: any): { [key: string]: any[] } {
        if (typeof typeOrFunc !== 'function') {
            return {};
        }
        const parentCtor = getParentCtor(typeOrFunc);
        const propMetadata: { [key: string]: any[] } = {};
        if (parentCtor !== Object) {
            const parentPropMetadata = this.propMetadata(parentCtor);
            Object.keys(parentPropMetadata).forEach((propName) => {
                propMetadata[propName] = parentPropMetadata[propName];
            });
        }
        const ownPropMetadata = this._ownPropMetadata(typeOrFunc, parentCtor);
        if (ownPropMetadata) {
            Object.keys(ownPropMetadata).forEach((propName) => {
                const decorators: any[] = [];
                if (propMetadata.hasOwnProperty(propName)) {
                    decorators.push(...propMetadata[propName]);
                }
                decorators.push(...ownPropMetadata[propName]);
                propMetadata[propName] = decorators;
            });
        }
        return propMetadata;
    }
}

function getParentCtor(ctor: Function): Type<any> {
    const parentProto = Object.getPrototypeOf(ctor.prototype);
    const parentCtor = parentProto ? parentProto.constructor : null;
    // Note: We always use `Object` as the null value
    // to simplify checking later on.
    return parentCtor || Object;
}

function convertTsickleDecoratorIntoMetadata(decoratorInvocations: any[]): any[] {
    if (!decoratorInvocations) {
        return [];
    }
    return decoratorInvocations.map(decoratorInvocation => {
        const decoratorType = decoratorInvocation.type;
        const annotationCls = decoratorType.annotationCls;
        const annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
        return new annotationCls(...annotationArgs);
    });
}



export const ANNOTATIONS = '__annotations__';
export const PARAMETERS = '__paramaters__';
export const PROP_METADATA = '__prop__metadata__';

/**
 * @suppress {globalThis}
 */
export function makeDecorator(
    name: string, props?: (...args: any[]) => any, parentClass?: any,
    chainFn?: (fn: Function) => void):
    { new(...args: any[]): any; (...args: any[]): any; (...args: any[]): (cls: any) => any; } {
    const metaCtor = makeMetadataCtor(props);

    function DecoratorFactory(objOrType: any): (cls: any) => any {
        if (this instanceof DecoratorFactory) {
            metaCtor.call(this, objOrType);
            return this;
        }

        const annotationInstance = new (<any>DecoratorFactory)(objOrType);
        const TypeDecorator: TypeDecorator = <TypeDecorator>function TypeDecorator(cls: Type<any>) {
            // Use of Object.defineProperty is important since it creates non-enumerable property which
            // prevents the property is copied during subclassing.
            const annotations = cls.hasOwnProperty(ANNOTATIONS) ?
                (cls as any)[ANNOTATIONS] :
                Object.defineProperty(cls, ANNOTATIONS, { value: [] })[ANNOTATIONS];
            annotations.push(annotationInstance);
            return cls;
        };
        if (chainFn) chainFn(TypeDecorator);
        return TypeDecorator;
    }

    if (parentClass) {
        DecoratorFactory.prototype = Object.create(parentClass.prototype);
    }

    DecoratorFactory.prototype.ngMetadataName = name;
    (<any>DecoratorFactory).annotationCls = DecoratorFactory;
    return DecoratorFactory as any;
}

function makeMetadataCtor(props?: (...args: any[]) => any): any {
    return function ctor(...args: any[]) {
        if (props) {
            const values = props(...args);
            for (const propName in values) {
                this[propName] = values[propName];
            }
        }
    };
}

export function makeParamDecorator(
    name: string, props?: (...args: any[]) => any, parentClass?: any): any {
    const metaCtor = makeMetadataCtor(props);
    function ParamDecoratorFactory(...args: any[]): any {
        if (this instanceof ParamDecoratorFactory) {
            metaCtor.apply(this, args);
            return this;
        }
        const annotationInstance = new (<any>ParamDecoratorFactory)(...args);

        (<any>ParamDecorator).annotation = annotationInstance;
        return ParamDecorator;

        function ParamDecorator(cls: any, unusedKey: any, index: number): any {
            // Use of Object.defineProperty is important since it creates non-enumerable property which
            // prevents the property is copied during subclassing.
            const parameters = cls.hasOwnProperty(PARAMETERS) ?
                (cls as any)[PARAMETERS] :
                Object.defineProperty(cls, PARAMETERS, { value: [] })[PARAMETERS];

            // there might be gaps if some in between parameters do not have annotations.
            // we pad with nulls.
            while (parameters.length <= index) {
                parameters.push(null);
            }

            (parameters[index] = parameters[index] || []).push(annotationInstance);
            return cls;
        }
    }
    if (parentClass) {
        ParamDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    ParamDecoratorFactory.prototype.ngMetadataName = name;
    (<any>ParamDecoratorFactory).annotationCls = ParamDecoratorFactory;
    return ParamDecoratorFactory;
}

export function makePropDecorator(
    name: string, props?: (...args: any[]) => any, parentClass?: any): any {
    const metaCtor = makeMetadataCtor(props);

    function PropDecoratorFactory(...args: any[]): any {
        if (this instanceof PropDecoratorFactory) {
            metaCtor.apply(this, args);
            return this;
        }

        const decoratorInstance = new (<any>PropDecoratorFactory)(...args);

        return function PropDecorator(target: any, name: string) {
            const constructor = target.constructor;
            // Use of Object.defineProperty is important since it creates non-enumerable property which
            // prevents the property is copied during subclassing.
            const meta = constructor.hasOwnProperty(PROP_METADATA) ?
                (constructor as any)[PROP_METADATA] :
                Object.defineProperty(constructor, PROP_METADATA, { value: {} })[PROP_METADATA];
            meta[name] = meta.hasOwnProperty(name) && meta[name] || [];
            meta[name].unshift(decoratorInstance);
        };
    }

    if (parentClass) {
        PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }

    PropDecoratorFactory.prototype.ngMetadataName = name;
    (<any>PropDecoratorFactory).annotationCls = PropDecoratorFactory;
    return PropDecoratorFactory;
}
