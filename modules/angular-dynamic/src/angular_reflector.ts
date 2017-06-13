import { Type, Injectable, Input, Injector } from '@angular/core';
import { Stateful } from './metadata';
import { StateChange } from './interfaces';
import { StateMapper } from './state_mapper';

/**
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

        // API for metadata created by invoking the decorators.
        if (Reflect && (<any>Reflect).getOwnMetadata) {
            return (<any>Reflect).getOwnMetadata('annotations', typeOrFunc);
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


        // API for metadata created by invoking the decorators.
        if (Reflect && (<any>Reflect).getOwnMetadata) {
            return (<any>Reflect).getOwnMetadata('propMetadata', typeOrFunc);
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
