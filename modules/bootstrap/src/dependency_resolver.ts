/// <reference path="./dependency.ts" />
/// <reference path="./dependency_policy.ts" />

namespace __sharpangles {
    export class DependencyResolver<TModuleLoaderConfig> {
        constructor(private _moduleLoader: ModuleLoader<TModuleLoaderConfig>, private _dependencyPolicy: DependencyPolicy<TModuleLoaderConfig>) {
        }

        protected getMetadataForEnvironmentFromModule(depsModule: any): { [key: string]: Dependency<TModuleLoaderConfig> } {
            return this._dependencyPolicy.dependencyModuleExport ? depsModule[this._dependencyPolicy.dependencyModuleExport] : depsModule.default;
        }

        async resolveChildDependenciesAsync(dependency: Dependency<TModuleLoaderConfig>): Promise<{ [key: string]: Dependency<TModuleLoaderConfig> }> {
            if (dependency.knownDependencies || !this._dependencyPolicy.isDependencyParticipant(dependency.name)) {
                return this._getAllDependencies({}, dependency.knownDependencies ? dependency.knownDependencies : {});
            }
            let depsModule = await this._moduleLoader.loadModuleAsync(this._dependencyPolicy.resolveDependencyModuleName(dependency.name));
            if (!depsModule)
                return {};
            let metadata = this.getMetadataForEnvironmentFromModule(depsModule);
            if (!metadata)
                return {};

            for (let name in metadata) {
                metadata[name].name = name;
                if (!dependency.dependencies)
                    dependency.dependencies = [];
                dependency.dependencies.push(name);
            }
            return metadata;
        }

        private _getAllDependencies(deps: { [key: string]: Dependency<TModuleLoaderConfig> }, childDeps: { [key: string]: Dependency<TModuleLoaderConfig> }): { [key: string]: Dependency<TModuleLoaderConfig> } {
            if (!childDeps)
                return {};
            for (let name of Object.keys(childDeps)) {
                let child = childDeps[name];
                deps[name] = child;
                this._getAllDependencies(deps, child.knownDependencies ? child.knownDependencies : {});
            }
            return deps;
        }
    }
}
