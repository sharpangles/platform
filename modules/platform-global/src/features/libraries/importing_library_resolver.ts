import { LibraryResolver } from './library_resolver';
import { Library } from './library';
import { ModuleResolutionContext, ModuleLoader } from '../module_loaders/module_loader';


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
    constructor(public libraryModuleLoader?: ModuleLoader<ModuleResolutionContext>, public libraryModulePath: string = '/library', public libraryFilter?: (context: TContext) => boolean) {
        super();
    }

    async tryGetLibraryAsync(moduleLoader: ModuleLoader<TContext>, context: TContext, next: (context: ModuleResolutionContext) => Promise<any>): Promise<{ library?: Library, module: any }> {
        if (this.libraryFilter && !this.libraryFilter(context) || context.key.endsWith(this.libraryModulePath))
            return { module: await next(context) };
        return super.tryGetLibraryAsync(moduleLoader, context, next);
    }

    protected async loadLibraryAsync(moduleLoader: ModuleLoader<TContext>, context: TContext, next: (context: ModuleResolutionContext) => Promise<any>): Promise<{ library?: Library, module: any }> {
        return {
            library: <Library>await (this.libraryModuleLoader || moduleLoader).loadModuleAsync(<any>{ key: context.key + this.libraryModulePath }),
            module: await next(context)
        };
    }
}
