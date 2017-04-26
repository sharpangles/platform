import { FeatureReference, Feature } from '../feature';
import { EntryPoint } from '../../entry_point';
import { ModuleLoader, ModuleResolutionContext } from '../module_loaders/module_loader';
import { LibraryResolver } from './library_resolver';

export class LibraryFeature extends Feature {
    static create(libraryResolver: LibraryResolver): FeatureReference {
        return new FeatureReference(LibraryFeature, () => new LibraryFeature(libraryResolver)).withDependency(ModuleLoader);
    }

    protected constructor(public libraryResolver: LibraryResolver) {
        super();
    }

    async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let moduleLoader = FeatureReference.getFeature<ModuleLoader>(ModuleLoader);
        moduleLoader.registerResolver((c, n) => this.resolveAsync(moduleLoader, c, n));
    }

    async resolveAsync(moduleLoader: ModuleLoader, context: ModuleResolutionContext, next: (context: ModuleResolutionContext) => Promise<any>): Promise<any> {
        let library = await this.libraryResolver.tryGetLibraryAsync(moduleLoader, context);
        if (library)
            await this.libraryResolver.applyCapabilitiesAsync(context.key, moduleLoader, context, library);
        return await next(context);
    }
}
