// import { Feature } from '../feature';
// import { rootFeature } from '../../entry_point';
// import { FeatureReference, Type } from '../feature_reference';
// import { EntryPoint } from '../../entry_point';
// import { LibraryFeature } from './library_feature';
// import { Library } from './library';
// import { ModuleLoader } from '../module_loaders/module_loader';

// /**
//  * Pre-loads a root library and its static dependencies.
//  * If a root library is provided, its features are added on initialization.
//  */
// export class RootLibraryLoader extends Feature {
//     constructor(public rootLibraryName: string, public rootLibrary?: Library) {
//         super();
//     }

//     dependentTypes(): Type[] {
//         return [LibraryFeature];
//     }

//     dependsOn(feature: Feature) {
//         return true;
//     }

//     async onInitAsync(entryPoint: EntryPoint) {
//         await FeatureReference.getFeature<LibraryFeature>(LibraryFeature).libraryResolver.applyLibraryAsync({ key: this.rootLibraryName }, this.rootLibrary);
//     }
// }
