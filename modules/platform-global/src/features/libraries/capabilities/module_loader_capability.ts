import { Library } from '../library';
import { LibraryCapability } from './library_capability';
import { ModuleLoader, ModuleResolutionContext } from '../../module_loaders/module_loader';

/**
 * A capability that injects itself into the module resolution process.
 */
export abstract class ModuleLoaderCapability<TModuleLoader extends ModuleLoader<TModuleResolutionContext>, TLibraryContext, TModuleResolutionContext extends ModuleResolutionContext> implements LibraryCapability<TLibraryContext, TModuleLoader> {
    get name(): string { return this.constructor.name; }
    get featureType(): any { return ModuleLoader; }

    /**
     * @param libraryContext Stored with the remotely-retrieved library.
     */
    applyAsync(libraryName: string, library: Library, libraryContext: TLibraryContext, feature: TModuleLoader): Promise<any> {
        feature.registerResolver((resolutionContext, next) => this.resolve(libraryName, library, libraryContext, feature, resolutionContext, next));
        return Promise.resolve();
    }

    abstract resolve(libraryName: string, library: Library, libraryContext: TLibraryContext, feature: TModuleLoader, resolutionContext: TModuleResolutionContext, next: (context: TModuleResolutionContext) => Promise<any>): Promise<any>;
}
