/// <reference path="./library_policy.ts" />
/// <reference path="./dependency_loader.ts" />
/// <reference path="./dependency_resolver.ts" />
/// <reference path="./polyfiller.ts" />
/// <reference path="./feature.ts" />

namespace __sharpangles {
    let entryPoint: EntryPoint<any>;

    /**
     * @export
     */
    export function loadDynamicDependencyAsync(url: string) {
        return entryPoint.dependencyLoader.addDependencyAsync(url);
    }

    export abstract class EntryPoint<TModuleLoaderConfig = any> {
        constructor(public dependencyModulePolicy: DependencyModulePolicy<TModuleLoaderConfig>, public libraryPolicy: LibraryPolicy<TModuleLoaderConfig>, features?: Feature | Feature[]) {
            this.rootFeature = Array.isArray(features) ? new Feature(features) : features;
        }

        dependencyLoader: DependencyLoader;
        moduleLoader: ModuleLoader<TModuleLoaderConfig>;
        polyfiller: Polyfiller;
        rootFeature?: Feature;

        /**
         * Start the application.
         */
        async startAsync(): Promise<void> {
            if (entryPoint) {
                throw new Error('Already started');
            }
            if (this.rootFeature) {
                let features: Feature[] = [];
                this._flatten(this.rootFeature, features);
                let ind = features.length - 1;
                // We only order the list to wire up dependencies and perform a cyclical check.  Once wired, awaiting tasks from the root is the most optimal async pattern.
                while (ind > 0) {
                    for (let pos = 0; pos < features.length; pos++) { // Still go to full length to ensure dependsOn always gets called.
                        let tries = 0;
                        if (features[pos].dependsOn(features[ind])) {
                            if (!features[pos].dependencies)
                                features[pos].dependencies = [features[ind]];
                            else if ((<any>features[pos].dependencies).indexOf(features[ind]) < 0)
                                (<any>features[pos].dependencies).push(features[ind]);
                            if (pos < ind)
                                features.splice(pos--, 0, features.splice(ind, 1)[0]);
                            tries++;
                            if (tries > features.length * 2)
                                throw new Error('Cyclical dependencies in features.');
                        }
                    }
                    ind--;
                }
            }
            await this.bootstrapAsync();
            if (this.rootFeature)
                await this.rootFeature.bootstrappedAsync(this);
            this.dependencyLoader = new DependencyLoader(this.moduleLoader, new DependencyResolver(this.moduleLoader, this.dependencyModulePolicy), this.libraryPolicy);
            await this.dependencyLoader.loadStaticDependenciesAsync();
            if (this.rootFeature)
                await this.rootFeature.startedAsync(this);
        }

        /**
         * Initializes the application prior to loading all dependencies that can be initially discovered.
         */
        protected async bootstrapAsync() {
            entryPoint = this;
            this.moduleLoader = this.createModuleLoader();
            this.moduleLoader.registerDependency(this.libraryPolicy.inferDependency()); // This connects in an inferred dependency at the app-level.
            if (this.rootFeature)
                await this.rootFeature.moduleLoaderCreatedAsync(this);
            this.polyfiller = this.createPolyfiller();
            if (this.rootFeature)
                await this.rootFeature.polyfillerCreatedAsync(this);
            await this.polyfiller.ensureAllAsync();
        }

        /**
         * Creates the module loader.  This occurs prior to the polyfiller.
         */
        protected abstract createModuleLoader(): ModuleLoader<TModuleLoaderConfig>;

        /**
         * Creates a polyfiller.  This enables loading fundamentals outside the context of dependencies.
         */
        protected createPolyfiller() {
            return new Polyfiller(this.moduleLoader);
        }

        private _flatten(feature: Feature, features: Feature[]) {
            features.push(feature);
            if (feature.dependencies) {
                for (let child of feature.dependencies)
                    this._flatten(child, features);
            }
        }
    }
}
