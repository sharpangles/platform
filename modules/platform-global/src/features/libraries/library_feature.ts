import { Feature } from '../feature';
import { FeatureReference, Type } from '../feature_reference';
import { EntryPoint } from '../../entry_point';
import { ModuleLoader, ModuleResolutionContext } from '../module_loaders/module_loader';
import { LibraryResolver, LibraryResolutionContext } from './library_resolver';

export class LibraryFeature extends Feature {
    constructor(public libraryResolver: LibraryResolver) {
        super();
    }

    dependentTypes(): Type[] {
        return [ModuleLoader];
    }

    async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let moduleLoader = FeatureReference.getFeature<ModuleLoader>(ModuleLoader);
        moduleLoader.registerResolver((c, n) => this.resolveAsync(moduleLoader, c, n));
    }

    async resolveAsync(moduleLoader: ModuleLoader, context: ModuleResolutionContext, next: (context: ModuleResolutionContext) => Promise<any>): Promise<any> {
        if (!(context instanceof LibraryResolutionContext))
            await this.libraryResolver.resolveAsync(context);
        return await next(context);
    }
}
