import { LibraryResolver, LibraryLoad } from './library_resolver';
import { Library } from './library';
import { ModuleResolutionContext, ModuleLoader } from '../module_loaders/module_loader';

interface BundledLibraryResolutionContext extends ModuleResolutionContext {
    inLibrary?: boolean;
}

/**
 * A library resolver that expects a library to be included with the root key.
 * Useful when rolling up the library with the package to a flat format.
 */
export class BundledLibraryResolver<TContext extends ModuleResolutionContext = ModuleResolutionContext> extends LibraryResolver<TContext> {
    constructor(public libraryExport: string) {
        super();
    }

    protected async loadLibraryAsync(libraryLoad: LibraryLoad<TContext>): Promise<{ library?: Library, module: any }> {
        let mod = await libraryLoad.next(libraryLoad.context);
        return { library: <Library>mod[this.libraryExport], module: mod };
    }
}
