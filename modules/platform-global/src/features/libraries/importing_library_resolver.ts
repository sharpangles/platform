import { LibraryResolver } from './library_resolver';
import { Library } from './library';
import { ModuleResolutionContext, ModuleLoader } from '../module_loaders/module_loader';

export interface LibraryResolutionContext extends ModuleResolutionContext {
    libraryName: string;
}

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
    constructor(public libraryModuleLoader?: ModuleLoader<LibraryResolutionContext>, public libraryModulePath: string = 'library', public libraryFilter?: (context: TContext) => boolean) {
        super();
    }

    async tryGetLibraryAsync(moduleLoader: ModuleLoader<TContext>, context: TContext): Promise<Library | undefined> {
        if (this.libraryFilter && !this.libraryFilter(context) || (<LibraryResolutionContext><ModuleResolutionContext>context).libraryName)
            return Promise.resolve(undefined);
        return super.tryGetLibraryAsync(moduleLoader, context);
    }

    protected async loadLibraryAsync(moduleLoader: ModuleLoader, context: TContext): Promise<Library | undefined> {
        let libraryResolutionContext = <LibraryResolutionContext>{ libraryName: context.key, key: context.key + this.libraryModulePath };
        return <Library>await (this.libraryModuleLoader || <ModuleLoader<LibraryResolutionContext>>moduleLoader).loadModuleAsync(libraryResolutionContext);
    }
}
