/// <reference path="./dependency.ts" />
/// <reference path="./module_loader.ts" />
/// <reference path="./task_map.ts" />

namespace __sharpangles {
    export class DependencyLoader<TModuleLoaderConfig> {
        constructor(
            private _moduleLoader: ModuleLoader<TModuleLoaderConfig>,
            private _dependencyPolicy: DependencyPolicy<TModuleLoaderConfig>) {
                this.dependencyResolver = new DependencyResolver<TModuleLoaderConfig>(this._moduleLoader, this._dependencyPolicy);
        }

        dependencyResolver: DependencyResolver<TModuleLoaderConfig>;

        /**
         * Loads all dependencies that can be discovered from the root.
         * The dependency policy and module loader will be responsible for when and how web requests are made to fully load the tree.
         */
        async loadStaticDependenciesAsync(): Promise<void> {
            await this.addDependencyAsync(this._dependencyPolicy.rootDependency);
        }

        /**
         * Infer a new dependency on the fly from a module name.
         * Called as runtime for dynamic loading.
         * @export
         * @param dependency Either a dependency or the string name from which to infer the dependency based on the provided policy.
         */
        async addDependencyAsync(dependency: string | Dependency<TModuleLoaderConfig>): Promise<void> {
            if (typeof dependency === 'string')
                dependency = this._dependencyPolicy.createDynamicDependency(dependency);
            await this._taskMap.ensureOrCreateAsync(dependency.name, dependency);
            if (this._taskMap.tryGetSource(dependency.name)) {
                await this._taskMap.ensureAsync(dependency.name);
                return;
            }
            let batch: any = {};
            batch[dependency.name] = dependency;
            await this._loadBatchAsync(batch);
            await this._moduleLoader.ensureAllLoadedAsync();
        }

        private _taskMap = new TaskMap<string, Dependency<TModuleLoaderConfig>, { [key: string]: Dependency<TModuleLoaderConfig> }>((key: string, source: Dependency<TModuleLoaderConfig>) => new Task<any>(() => this._loadChildDependenciesAsync(source)));

        private async _loadBatchAsync(dependencies: { [key: string]: Dependency<TModuleLoaderConfig> }) {
            await Promise.all(Object.keys(dependencies).map(k => this._taskMap.ensureOrCreateAsync(k, dependencies[k])));
        }

        private async _loadChildDependenciesAsync(dependency: Dependency<TModuleLoaderConfig>) {
            this._moduleLoader.registerDependency(dependency);
            let dependents = await this.dependencyResolver.resolveChildDependenciesAsync(dependency);
            if (dependents && Object.keys(dependents).length > 0) {
                await this._loadBatchAsync(dependents);
            }
            return dependents;
        }
    }
}
