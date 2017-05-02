import { FeatureReference, ModuleLoader } from '../../../__artifacts/release';
import { LibraryResolver, LibraryResolutionContext } from './library_resolver';
import { Library } from './library';

/**
 * A library resolver that expects a library to be included with the root key.
 * Useful when rolling up the library with the package to a flat format.
 */
export class BundledLibraryResolver extends LibraryResolver {
    constructor(public libraryExport: string) {
        super();
        LibraryResolver.libraryResolvers.set(BundledLibraryResolver, this);
    }

    protected async loadLibraryAsync(context: LibraryResolutionContext): Promise<Library | undefined> {
        let mod = await FeatureReference.getFeature<ModuleLoader>(ModuleLoader).loadModuleAsync(context);
        return mod[this.libraryExport];
    }
}
