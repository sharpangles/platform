/// <reference path="../DependencyLoader.ts" />
/// <reference path="../DependencyResolver.ts" />

namespace __sharpangles {
    let _entryPoint: EntryPoint;

    export class EntryPoint {
        constructor(public name: string = "@scopegoeshere/bootstrap-entrypoint", public baseUrl: string = '/') {

        }

        private _dependencyLoader: DependencyLoader;
        public moduleLoader: DependencyModuleLoader;
        private _polyfiller: Polyfiller;

        protected bootstrapAsync(): Promise<void> {
            if (_entryPoint || this._dependencyLoader) {
                throw new Error("Already bootstrapped");
            }
            _entryPoint = this;
            this._dependencyLoader = this.createDependencyLoader();
            return this._dependencyLoader.runAsync();
        }

        async startAsync(): Promise<void> {
            this._polyfiller = this.createPolyfiller();
            await this._polyfiller.ensurePolyfillsAsync();
            this.moduleLoader = this.createModuleLoader();
            await this.bootstrapAsync();
            await this.runAsync();
        }

        protected runAsync(): Promise<void> {
            return Promise.resolve();
        }

        protected createDependencyLoader() {
            return new DependencyLoader(this.moduleLoader, this.name, 'test', this.baseUrl, new DependencyResolver(this.moduleLoader, this.name, 'test', 'src/dependencies'));
        }

        protected createPolyfiller() {
            return new Polyfiller(this.baseUrl);
        }

        protected createModuleLoader() {
            return new SystemJSModuleLoader(this.baseUrl);
        }

        protected async loadFeaturesAsync() {
            var features = await this._loadModuleFeaturesAsync();
            var appModule = await System.import(this.app);
            var pr: Promise<any> | null = null;
            if (this.bootstrapper)
                pr = this.bootstrapper(appModule, features);
            else if (appModule.__sharpanglesBootstrap)
                pr = (<IModuleBootstrapper>appModule.__sharpanglesBootstrap)(features);
            else {
                var bsf = this.bootstrappingFeature || this.name ? features[this.bootstrappingFeature || this.name] : null;
                if (bsf && bsf.__sharpanglesBootstrap)
                    pr = (<FeatureBootstrapper>bsf.__sharpanglesBootstrap)(appModule, features) || null;
            }
            if (pr && (<any>pr).next)
                await pr;
        }

        private async _loadModuleFeaturesAsync(): Promise<{ [name: string]: Feature }> {
            var featureDeps: { [key: string]: string[] } = {};
            var features = await Promise.all<{ name: string, feature: Feature }>(Array.from(this.loads)
                .filter(v => v[0].startsWith("@scopegoeshere"))
                .map(async (v) => {
                    var dependency = await v[1];
                    var mainModule = await System.import(dependency.name == this.name ? this.featureExportingModule ? this.featureExportingModule : this.app : dependency.name);
                    featureDeps[v[0]] = dependency.dependencies ? dependency.dependencies.filter(d => d.startsWith("@scopegoeshere")) : [];
                    return {
                        name: v[0],
                        feature: mainModule.__sharpanglesFeature
                    };
                }));
            var map: { [name: string]: Feature } = {};
            for (let f of features) {
                if (f.feature)
                    map[f.name] = f.feature;
            }
            for (let f in map) {
                var feat = map[f];
                for (let dep of featureDeps[f]) {
                    var depFeature = map[dep]
                    if (depFeature) {
                        if (!feat.dependencies)
                            feat.dependencies = {};
                        feat.dependencies[dep] = depFeature;
                    }
                }
            }
            return map;
        }
    }
}
