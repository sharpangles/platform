import { Feature } from '../feature';
import { FeatureReference } from '../feature_reference';
import { EntryPoint } from '../../entry_point';
import { ModuleLoader, ModuleResolutionContext } from '../module_loaders/module_loader';
import { LibraryResolver } from './library_resolver';
import { Library } from './library';

interface LibraryResolutionContext extends ModuleResolutionContext {
    inLibrary$?: boolean;
}

export class LibraryFeature extends Feature {
    static create(libraryResolver: LibraryResolver, rootLibrary?: Library, rootLibraryName: string = ''): FeatureReference {
        return new FeatureReference(LibraryFeature, () => new LibraryFeature(libraryResolver)).withDependency(ModuleLoader);
    }

    protected constructor(public libraryResolver: LibraryResolver, public rootLibrary?: Library, public rootLibraryName: string = '') {
        super();
    }

    async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let moduleLoader = FeatureReference.getFeature<ModuleLoader>(ModuleLoader);
        moduleLoader.registerResolver((c, n) => this.resolveAsync(moduleLoader, c, n));
        if (this.rootLibrary)
            this.libraryResolver.applyFeaturesAsync(this.rootLibraryName, moduleLoader, { key: this.rootLibraryName }, this.rootLibrary);
    }

    async resolveAsync(moduleLoader: ModuleLoader, context: ModuleResolutionContext, next: (context: ModuleResolutionContext) => Promise<any>): Promise<{ library?: Library, module: any }> {
        if ((<LibraryResolutionContext>context).inLibrary$)
            return { module: await next(context) };
        (<LibraryResolutionContext>context).inLibrary$ = true;
        let result = await this.libraryResolver.tryGetLibraryAsync(moduleLoader, context, next);
        if (!result.module)
            result.module = await next(context);
        delete (<LibraryResolutionContext>context).inLibrary$;
        return result;
    }
}
