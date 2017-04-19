/// <reference path="./dependency.ts" />

namespace __sharpangles {
    /** @internal */
    export class DependencyLoader {
        constructor(
            private _moduleLoader: DependencyModuleLoader,
            public name: string,
            public environment: string,
            public baseUrl: string = '/',
            public dependencyResolver: DependencyResolver) {
        }

        async runAsync(useDefaultOnBasePaths = true): Promise<any> {
            await this._loadAsync(this);
            await scriptTagLoader.ensureLoadedAsync();
        }

        async ensureDependencyLoadedAsync(dependency: Dependency): Promise<void> {
            if (this._loads.get(dependency.name))
                return;
            var batch: any = {};
            batch[dependency.name] = dependency;
            await this._loadBatchAsync(batch);
            await scriptTagLoader.ensureLoadedAsync();
        }

        private _loads = new Map<string, Promise<{ [key: string]: Dependency }>>();

        private async _loadBatchAsync(dependencies: { [key: string]: Dependency }) {
            this._moduleLoader.registerDependencies(dependencies);
            await Promise.all(Object.keys(dependencies).map(k => this._loadAsync(dependencies[k])));
        }

        private _loadAsync(dependency: Dependency) {
            let load = this._loads.get(dependency.name);
            if (load)
                return load;
            load = this._loadChildDependenciesAsync(dependency);
            this._loads.set(dependency.name, load);
            return load;
        }

        private async _loadChildDependenciesAsync(dependency: Dependency) {
            var dependents = await this.dependencyResolver.resolveChildDependenciesAsync(dependency, dependency.name == this.name);
            if (dependents && Object.keys(dependents).length > 0) {
                await this._loadBatchAsync(dependents);
            }
            return dependents;
        }
    }
}
