// /// <reference path="./dependency.ts" />

// namespace __sharpangles {
//     /** @internal */
//     export class FeatureLoader {



//         private async _loadModuleFeaturesAsync(): Promise<{ [name: string]: Feature }> {
//             var featureDeps: { [key: string]: string[] } = {};
//             var features = await Promise.all<{ name: string, feature: Feature }>(Array.from(this.loads)
//                 .filter(v => v[0].startsWith("@scopegoeshere"))
//                 .map(async (v) => {
//                     var dependency = await v[1];
//                     var mainModule = await System.import(dependency.name == this.name ? this.featureExportingModule ? this.featureExportingModule : this.app : dependency.name);
//                     featureDeps[v[0]] = dependency.dependencies ? dependency.dependencies.filter(d => d.startsWith("@scopegoeshere")) : [];
//                     return {
//                         name: v[0],
//                         feature: mainModule.__sharpanglesFeature
//                     };
//                 }));
//             var map: { [name: string]: Feature } = {};
//             for (let f of features) {
//                 if (f.feature)
//                     map[f.name] = f.feature;
//             }
//             for (let f in map) {
//                 var feat = map[f];
//                 for (let dep of featureDeps[f]) {
//                     var depFeature = map[dep]
//                     if (depFeature) {
//                         if (!feat.dependencies)
//                             feat.dependencies = {};
//                         feat.dependencies[dep] = depFeature;
//                     }
//                 }
//             }
//             return map;
//         }
//     }
// }


// //         async runAsync(useDefaultOnBasePaths = true): Promise<any> {
// //             await this._loadAsync(this);
// //             await scriptTagLoader.ensureLoadedAsync();
// //             var features = await this._loadModuleFeaturesAsync();
// //             var appModule = await System.import(this.app);
// //             var pr: Promise<any> | null = null;
// //             if (this.bootstrapper)
// //                 pr = this.bootstrapper(appModule, features);
// //             else if (appModule.__sharpanglesBootstrap)
// //                 pr = (<IModuleBootstrapper>appModule.__sharpanglesBootstrap)(features);
// //             else {
// //                 var bsf = this.bootstrappingFeature || this.name ? features[this.bootstrappingFeature || this.name] : null;
// //                 if (bsf && bsf.__sharpanglesBootstrap)
// //                     pr = (<IFeatureBootstrapper>bsf.__sharpanglesBootstrap)(appModule, features) || null;
// //             }
// //             if (pr && (<any>pr).next)
// //                 await pr;
// //         }



// //         async appendAsync(dependency: IDependency): Promise<{ [name: string]: IFeature }> {
// //             if (this.loads.get(dependency.name))
// //                 return {};
// //             var batch: any = {};
// //             batch[dependency.name] = dependency;
// //             await this._loadBatchAsync(batch);
// //             await scriptTagLoader.ensureLoadedAsync();
// //             return await this._loadModuleFeaturesAsync();
// //         }



