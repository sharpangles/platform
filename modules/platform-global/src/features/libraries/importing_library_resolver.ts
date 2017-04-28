import { LibraryResolutionContext } from './library_feature';
import { LibraryResolver, LibraryLoad } from './library_resolver';
import { Library } from './library';
import { ModuleResolutionContext } from '../module_loaders/module_loader';


/**
 * A library resolver that simply imports a library module first.
 * This resolver makes no assumptions about the bundling of the library with any of the actual library code.
 * For example, the library module might be bundled with code for that library.
 * However, if the library provides configuration for the module loader, the bundle must be of a type that does not trigger
 * dependency resolution of anything but the library module itself until its configuration is complete.
 */
export class ImportingLibraryResolver<TContext extends ModuleResolutionContext = ModuleResolutionContext> extends LibraryResolver<TContext> {
    /**
     * @param libraryModuleLoader Allows providing a different module loader to use for libraries.
     * @param libraryModulePath The path to append to the triggering resolution.
     */
    constructor(public libraryModulePath: string = '/library', public libraryFilter?: (context: TContext) => boolean) {
        super();
    }

    async tryGetLibraryAsync(libraryLoad: LibraryLoad<TContext>): Promise<{ library?: Library, module: any }> {
        if (this.libraryFilter && !this.libraryFilter(libraryLoad.context) || libraryLoad.context.key.endsWith(this.libraryModulePath))
            return { module: await libraryLoad.next(libraryLoad.context) };
        return super.tryGetLibraryAsync(libraryLoad);
    }

    protected async loadLibraryAsync(libraryLoad: LibraryLoad<TContext>): Promise<{ library?: Library, module: any }> {
        libraryLoad.libraryContext.key += this.libraryModulePath;
        return {
            library: <Library>await libraryLoad.libraryModuleLoader.loadModuleAsync(libraryLoad.libraryContext),
            module: await libraryLoad.next(libraryLoad.context)
        };
    }
}
