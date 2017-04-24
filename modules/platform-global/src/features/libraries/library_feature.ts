import { FeatureReference, Feature } from '../feature';
import { EntryPoint } from '../../entry_point';
import { ModuleLoader, ModuleResolutionContext } from '../module_loaders/module_loader';
import { LibraryResolver } from './library_resolver';

export class LibraryFeature extends Feature {
    static create(): FeatureReference {
        return new FeatureReference(LibraryFeature).withDependency(new FeatureReference(ModuleLoader));
    }

    protected constructor(public libraryResolver: LibraryResolver) {
        super();
    }

    async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let moduleLoader = <ModuleLoader>FeatureReference.getFeature(ModuleLoader);
        moduleLoader.registerResolver(this.resolveAsync.bind(this));
    }

    async resolveAsync(moduleLoader: ModuleResolutionContext, context: ModuleResolutionContext, next: (context: ModuleResolutionContext) => Promise<any>): Promise<any> {
        let libraryModule = await this.libraryResolver.tryGetLibraryAsync(moduleLoader, context);
        if (libraryModule) {
            await this.libraryResolver.applyLibraryFeaturesAsync(moduleLoader, context);
        }
        return await next(context);
    }
}
