import { InjectionToken } from '@angular/core';
import { TypeReference } from './interfaces';

/**
 * Implementations asyncrhonously resolve the type reference to a url.
 * This gives an opportunity to involve global bootstrappers, configure a module loader, or handle internal references with moduleId (similar to UrlTree from the router or UrlResolver from the compiler),
 */
export interface TypeReferenceUrlResolver {
    getUrl(typeReference: TypeReference): Promise<string>;
}

export let TYPE_REFERENCE_URL_RESOLVER: InjectionToken<TypeReferenceUrlResolver> = new InjectionToken<TypeReferenceUrlResolver>('TypeReferenceUrlResolver');

declare var __sharpangles: any;

export class BootstrapTypeReferenceResolver {
    async getUrl(typeReference: TypeReference): Promise<string> {
        let url = <string>typeReference.moduleName; // @todo urlresolver or router stuff to resolve module.id?
        let dep = await __sharpangles.entryPoint.moduleLoader.addDependencyAsync(url); // Ensures the module is loaded.
        return url;
    }
}
