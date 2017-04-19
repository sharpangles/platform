// /// <reference path="./Dependency.ts" />
// /// <reference path="./SystemJsModule.ts" />
// /// <reference path="./DependencyBuilder.ts" />
// /// <reference path="./IFeature.ts" />
// /// <reference path="./__karma__.ts" />

// namespace __sharpangles {
//     /** @internal */
//     export class Bootstrapper {
//         constructor(public name: string, public environment: string, public app: string, public baseUrl: string = '/', public featureExportingModule?: string, public bootstrappingFeature?: string, public bootstrapper?: IFeatureBootstrapper) {
//         }

//         private _dependencyBuilder = new DependencyBuilder();

//         async runAsync(useDefaultOnBasePaths = true): Promise<any> {
//             await this._loadAsync(this);
//             await scriptTagLoader.ensureLoadedAsync();
//             var features = await this._loadModuleFeaturesAsync();
//             var appModule = await System.import(this.app);
//             var pr: Promise<any> | null = null;
//             if (this.bootstrapper)
//                 pr = this.bootstrapper(appModule, features);
//             else if (appModule.__sharpanglesBootstrap)
//                 pr = (<IModuleBootstrapper>appModule.__sharpanglesBootstrap)(features);
//             else {
//                 var bsf = this.bootstrappingFeature || this.name ? features[this.bootstrappingFeature || this.name] : null;
//                 if (bsf && bsf.__sharpanglesBootstrap)
//                     pr = (<IFeatureBootstrapper>bsf.__sharpanglesBootstrap)(appModule, features) || null;
//             }
//             if (pr && (<any>pr).next)
//                 await pr;
//         }

//         async appendAsync(dependency: IDependency): Promise<{ [name: string]: IFeature }> {
//             if (this.loads.get(dependency.name))
//                 return {};
//             var batch: any = {};
//             batch[dependency.name] = dependency;
//             await this._loadBatchAsync(batch);
//             await scriptTagLoader.ensureLoadedAsync();
//             return await this._loadModuleFeaturesAsync();
//         }

//         loads: Map<string, Promise<IDependency>> = new Map<string, Promise<IDependency>>();

//         private async _loadBatchAsync(dependencies: { [key: string]: IDependency }) {
//             regDepsOnModLoader;
//             return await Promise.all<IDependency>(Object.keys(dependencies).map(k => this._loadAsync(dependencies[k])));
//         }

//         private async _loadAsync(dependency: IDependency): Promise<IDependency> {
//             var load = this.loads.get(dependency.name);
//             if (load)
//                 return load;
//             load = this._bootstrapAsync(dependency);
//             this.loads.set(dependency.name, load);
//             return await load;
//         }

//         private async _bootstrapAsync(dependency: IDependency): Promise<IDependency> {
//             var dependents = await this._dependencyBuilder.loadDependenciesAsync(dependency, this.baseUrl, this.environment, dependency.name == this.name);
//             if (dependents && Object.keys(dependents).length > 0)
//                 await this._loadBatchAsync(dependents);
//             return dependency;
//         }

//         private async _loadModuleFeaturesAsync(): Promise<{ [name: string]: IFeature }> {
//             var featureDeps: { [key: string]: string[] } = {};
//             var features = await Promise.all<{ name: string, feature: IFeature }>(Array.from(this.loads)
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
//             var map: { [name: string]: IFeature } = {};
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
