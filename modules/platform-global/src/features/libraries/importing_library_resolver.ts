import { LibraryResolver, LibraryResolutionContext } from './library_resolver';
import { Library } from './library';
import { ModuleLoader, ModuleResolutionContext } from '../module_loaders/module_loader';
import { FeatureReference } from '../feature_reference';


/**
 * A library resolver that simply imports a library module first.
 * This resolver makes no assumptions about the bundling of the library with any of the actual library code.
 * For example, the library module might be bundled with code for that library.
 * However, if the library provides configuration for the module loader, the bundle must be of a type that does not trigger
 * dependency resolution of anything but the library module itself until its configuration is complete.
 */
export class ImportingLibraryResolver extends LibraryResolver {
    /**
     * @param libraryModuleLoader Allows providing a different module loader to use for libraries.
     * @param libraryModulePath The path to append to the triggering resolution.
     */
    constructor(public libraryModuleExport = 'default', public libraryModulePath: string = '/library', public libraryFilter?: (context: ModuleResolutionContext) => boolean) {
        super(true);
        LibraryResolver.libraryResolvers.set(ImportingLibraryResolver, this);
    }

    protected async tryGetLibraryAsync(context: ModuleResolutionContext): Promise<Library | undefined> {
        if (this.libraryFilter && !this.libraryFilter(context))
            return;
        return super.tryGetLibraryAsync(context);
    }

    protected async loadLibraryAsync(context: LibraryResolutionContext): Promise<Library | undefined> {
        let ctx = new LibraryResolutionContext(context.originalContext);
        ctx.key += this.libraryModulePath;
        let mod = await FeatureReference.getFeature<ModuleLoader>(ModuleLoader).loadModuleAsync(ctx);
        return mod[this.libraryModuleExport];
    }
}
