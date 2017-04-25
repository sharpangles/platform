import { Library } from '../library';
import { ModuleLoaderCapability } from './module_loader_capability';
import { BrowserModuleLoader, BrowserModuleResolutionContext } from '../../module_loaders/browser_module_loader';

export interface BrowserLibraryContext {
    dependencies: BrowserModuleResolutionContext[];

    /** If true, the resolution will wait for the references to load, otherwise it will simply trigger them. */
    waitForLoad?: boolean;
}

/**
 * Loads dependencies via the browser module loader.
 */
export class BrowserModuleLoaderCapability extends ModuleLoaderCapability<BrowserModuleLoader, BrowserLibraryContext, BrowserModuleResolutionContext> {
    get featureType(): any { return BrowserModuleLoader; }

    async resolve(libraryName: string, library: Library, libraryContext: BrowserLibraryContext, feature: BrowserModuleLoader, resolutionContext: BrowserModuleResolutionContext, next: (context: BrowserModuleResolutionContext) => Promise<any>): Promise<any> {
        let promises = libraryContext.dependencies.map(d => feature.loadModuleAsync(d));
        if (libraryContext.waitForLoad)
            await Promise.all(promises);
    }
}
