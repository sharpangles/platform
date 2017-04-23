/// <reference path="./dependency.ts" />
/// <reference path="./module_loader.ts" />
/// <reference path="./task_map.ts" />

namespace __sharpangles {
    export class DependencyLoader {
        constructor(
            private _moduleLoader: ModuleLoader<any>,
            private _dependencyResolver: DependencyResolver,
            private _libraryPolicy: LibraryPolicy) {
        }

        /**
         * Loads all dependencies that can be discovered from the root.
         * The dependency policy and module loader will be responsible for when and how web requests are made to fully load the tree.
         */
        async loadStaticDependenciesAsync(): Promise<void> {
            await this.addDependencyAsync();
        }

        /**
         * Infer a new dependency on the fly from a module name.
         * Called as runtime for dynamic loading.
         * @param dependency Either a dependency or the string name from which to infer the dependency based on the provided policy.
         * @export
         */
        async addDependencyAsync(dependency?: string | Dependency): Promise<void> {
            if (!dependency || typeof dependency === 'string')
                dependency = this._libraryPolicy.inferDependency(dependency);
            let depName = dependency.name || '';
            await this._taskMap.ensureOrCreateAsync(depName, dependency);
            if (this._taskMap.tryGetSource(depName)) {
                await this._taskMap.ensureAsync(depName);
                return;
            }
            let batch: any = {};
            batch[depName] = dependency;
            await this._loadBatchAsync(batch);
            await this._moduleLoader.ensureAllLoadedAsync();
        }

        private _taskMap = new TaskMap<string, Dependency, { [key: string]: Dependency }>((key: string, source: Dependency) => new Task<any>(() => this._loadChildDependenciesAsync(source)));

        private async _loadBatchAsync(dependencies: { [key: string]: Dependency }) {
            await Promise.all(Object.keys(dependencies).map(k => this._taskMap.ensureOrCreateAsync(k, dependencies[k])));
        }

        private async _loadChildDependenciesAsync(dependency: Dependency) {
            // @todo Abstract out these parent-child 'platform-level' capabilities better.  The module loader should be able to loop through them.
            // The traversal of dependencies to wire up systemjs for example should just be one of these capabilities.
            // Right now its living across the next two method calls.
            this._moduleLoader.registerDependency(dependency);
            let dependents = await this._dependencyResolver.resolveChildDependenciesAsync(dependency);
            if (dependents && Object.keys(dependents).length > 0) {
                await this._loadBatchAsync(dependents);
            }
            return dependents;
        }
    }
}
