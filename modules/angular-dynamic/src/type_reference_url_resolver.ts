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

export class BootstrapTypeReferenceResolver {
    getUrl(typeReference: TypeReference): Promise<string> {
        if (url && url.startsWith('@abcoa/'))
    await __AbcLoader.ensureModuleAsync(url.substr(0, url.indexOf('/', 7)));
    }
}
