import { Feature } from '../feature';
import { rootFeature } from '../../entry_point';
import { FeatureReference, Type } from '../feature_reference';
import { EntryPoint } from '../../entry_point';
import { LibraryFeature } from './library_feature';
import { Library } from './library';
import { ModuleLoader } from '../module_loaders/module_loader';

/**
 * Pre-loads a root library and its static dependencies.
 * If a root library is provided, its features are added on initialization.
 */
export class RootLibraryLoader extends Feature {
    constructor(public rootLibraryName: string, public rootLibrary?: Library) {
        super();
    }

    dependentTypes(): Type[] {
        return [LibraryFeature];
    }

    dependsOn(feature: Feature) {
        if (this.rootLibrary && this.rootLibrary.featureReferences) {
            for (let featureRef of this.rootLibrary.featureReferences)
                rootFeature.addDependency(featureRef.findFeature());
        }
        return false;
    }

    async onInitAsync(entryPoint: EntryPoint) {
        if (!this.rootLibrary)
            return;
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

    async onRunAsync(entryPoint: EntryPoint) {
        let libraryFeature = FeatureReference.getFeature<LibraryFeature>(LibraryFeature);
        let moduleLoader = FeatureReference.getFeature<ModuleLoader>(ModuleLoader);
        libraryFeature.libraryResolver.forEachLibrary(this.rootLibraryName, this.rootLibrary, (name, lib) => {
            moduleLoader.loadModuleAsync()
        });
    }
}
