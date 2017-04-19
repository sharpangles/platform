/// <reference path="./dependency.ts" />
/// <reference path="./module_loader.ts" />
/// <reference path="./task_map.ts" />

namespace __sharpangles {
    /** @internal */
    export class DependencyLoader<TModuleLoaderConfig> {
        constructor(
            private _moduleLoader: ModuleLoader<TModuleLoaderConfig>,
            public name: string,
            dependencyPolicy: DependencyPolicy<TModuleLoaderConfig>) {
                this.dependencyResolver = new DependencyResolver<TModuleLoaderConfig>(this._moduleLoader, dependencyPolicy);
        }

        dependencyResolver: DependencyResolver<TModuleLoaderConfig>;

        async loadStaticDependenciesAsync(): Promise<void> {
            await this._taskMap.ensureOrCreateAsync(this.name, <Dependency<TModuleLoaderConfig>>{ name: this.name });
            await this._moduleLoader.ensureAllLoadedAsync();
        }

        async addDependencyAsync(dependency: Dependency<TModuleLoaderConfig>): Promise<void> {
            await this._taskMap.ensureOrCreateAsync(dependency.name, dependency);
            if (this._taskMap.tryGetSource(dependency.name)) {
                await this._taskMap.ensureAsync(dependency.name);
                return;
            }
            var batch: any = {};
            batch[dependency.name] = dependency;
            await this._loadBatchAsync(batch);
            await this._moduleLoader.ensureAllLoadedAsync();
        }

        private _taskMap = new TaskMap<string, Dependency<TModuleLoaderConfig>, { [key: string]: Dependency<TModuleLoaderConfig> }>((key: string, source: Dependency<TModuleLoaderConfig>) => new Task<any>(() => this._loadChildDependenciesAsync(source)));

        private async _loadBatchAsync(dependencies: { [key: string]: Dependency<TModuleLoaderConfig> }) {
            this._moduleLoader.registerDependencies(dependencies);
            await Promise.all(Object.keys(dependencies).map(k => this._taskMap.ensureOrCreateAsync(k, dependencies[k])));
        }

        private async _loadChildDependenciesAsync(dependency: Dependency<TModuleLoaderConfig>) {
            var dependents = await this.dependencyResolver.resolveChildDependenciesAsync(dependency);
            if (dependents && Object.keys(dependents).length > 0) {
                await this._loadBatchAsync(dependents);
            }
            return dependents;
        }
    }
}
