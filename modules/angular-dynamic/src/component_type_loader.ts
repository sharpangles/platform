import { Injectable, Injector, NgModuleFactory, resolveForwardRef, NgModuleFactoryLoader, NgModule, Type, InjectionToken, Optional, Inject, getModuleFactory } from '@angular/core';
import { TypeReference } from './interfaces';

/**
 * Implementations asyncrhonously resolve the type reference to a url.
 * This gives an opportunity to involve global bootstrappers, configure a module loader, or handle internal references with moduleId (similar to UrlTree from the router or UrlResolver from the compiler),
 */
export interface TypeReferenceUrlResolver {
    getUrl(typeReference: TypeReference): Promise<string>;
}

export let TYPE_REFERENCE_URL_RESOLVER: InjectionToken<TypeReferenceUrlResolver> = new InjectionToken<TypeReferenceUrlResolver>('TypeReferenceUrlResolver');

/**
 * Creates a ComponentFactory from an ITypeMetadata.
 * @todo Keep an eye out for anything exposed on router to accomplish this.
 */
@Injectable()
export class ComponentTypeLoader {
    constructor(private moduleFactoryLoader: NgModuleFactoryLoader, @Optional() @Inject(TYPE_REFERENCE_URL_RESOLVER) private typeReferenceUrlResolver?: TypeReferenceUrlResolver) {
    }

    /**
     * @todo This method overlaps alot with the router.  At the time this was written, the router stuff wasnt very isolable.  Should reinvestigate now that its been a few major versions of ng.
     * See @angular/common location, UrlTree parsing, etc... to bring back relative module stuff. Although then we add router dependency
     */
    async resolveAsync(typeReference: TypeReference): Promise<{ module: NgModuleFactory<any>, component: Type<any> }> {
        if (!typeReference.componentTypeName) {
            throw new Error('A component name is required.');
        }
        let url = this.typeReferenceUrlResolver ? await this.typeReferenceUrlResolver.getUrl(typeReference) : typeReference.moduleName;
        let ngModuleFactory = await this.moduleFactoryLoader.load(<string>url);
        let annotations = (<any>Reflect).getMetadata('annotations', ngModuleFactory.moduleType);
        let ngModule: NgModule = annotations ? annotations.find((m: any) => m.entryComponents || m.bootstrap) : (<any>ngModuleFactory.moduleType).decorators[0].args[0];
        if (!ngModule || (!ngModule.entryComponents && !ngModule.bootstrap)) {
            throw new Error('The type was not a module with entryComponents');
        }
        let component = this.findComponent(ngModule, typeReference.componentTypeName);
        if (!component) {
            throw new Error('Component is not an entryComponent on the dynamically loaded module.');
        }
        return { module: ngModuleFactory, component: component };
    }

    private findComponent(ngModule: NgModule, componentTypeName: string): Type<any> | undefined {
        let component: Type<any> | null = null;
        let flattenedEntryComponents = this.flatten<any>(<any>ngModule.entryComponents || <any>ngModule.bootstrap);
        return flattenedEntryComponents.find(entryComponent => resolveForwardRef(entryComponent).name === componentTypeName);
    }

    /** @todo or https://github.com/angular/angular/blob/7764c5c697df8ceddf6e4a177b338ff9b9c7212a/packages/compiler/src/metadata_resolver.ts#L1056 */
    private flatten<T>(list: Array<T | T[]>): T[] {
        return list.reduce((flat: any[], item: T | T[]): T[] => (<T[]>flat).concat(Array.isArray(item) ? this.flatten(item) : item), []);
    }
}
