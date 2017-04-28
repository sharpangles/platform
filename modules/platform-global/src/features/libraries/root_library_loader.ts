import { Feature } from '../feature';
import { FeatureReference, Type } from '../feature_reference';
import { EntryPoint } from '../../entry_point';
import { LibraryFeature } from './library_feature';
import { Library } from './library';
import { ModuleLoader } from '../module_loaders/module_loader';

/**
 * Pre-loads a root library and its static dependencies.
 */
export class RootLibraryLoader extends Feature {
    constructor(public rootLibraryName: string, public rootLibrary: Library) {
        super();
    }

    dependentTypes(): Type[] {
        return [LibraryFeature];
    }

    async onInitAsync(entryPoint: EntryPoint) {
        let libraryFeature = FeatureReference.getFeature<LibraryFeature>(LibraryFeature);
        let moduleLoader = FeatureReference.getFeature<ModuleLoader>(ModuleLoader);
        await libraryFeature.libraryResolver.applyLibraryAsync({
            libraryModuleLoader: libraryFeature.libraryModuleLoader || moduleLoader,
            libraryContext: { key: this.rootLibraryName, inLibrary$: true },
            moduleLoader: moduleLoader,
            context: { key: this.rootLibraryName },
            next: () => <any>undefined
        }, this.rootLibrary);
        await super.onInitAsync(entryPoint);
    }
}
