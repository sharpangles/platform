import { Feature } from '../feature';
import { FeatureReference, Type } from '../feature_reference';
import { EntryPoint } from '../../entry_point';
import { ModuleLoader, ModuleResolutionContext } from '../module_loaders/module_loader';
import { LibraryResolver, LibraryLoad } from './library_resolver';
import { Library } from './library';

export interface LibraryResolutionContext extends ModuleResolutionContext {
    inLibrary$?: boolean;
}

export class LibraryFeature extends Feature {
    constructor(public libraryResolver: LibraryResolver, public libraryModuleLoader?: ModuleLoader<ModuleResolutionContext>) {
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

    async resolveAsync(moduleLoader: ModuleLoader, context: ModuleResolutionContext, next: (context: ModuleResolutionContext) => Promise<any>): Promise<{ library?: Library, module: any }> {
        if ((<LibraryResolutionContext>context).inLibrary$)
            return { module: await next(context) };
        let libraryLoad = <LibraryLoad>{
            libraryModuleLoader: this.libraryModuleLoader || moduleLoader,
            moduleLoader: moduleLoader,
            libraryContext: { key: context.key, parentKey: context.parentKey, inLibrary$: true },
            context: context,
            next: next
        };
        let result = await this.libraryResolver.tryGetLibraryAsync(libraryLoad);
        if (!result.module)
            result.module = await next(context);
        return result;
    }
}
