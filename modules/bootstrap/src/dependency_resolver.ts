/// <reference path="./dependency.ts" />
/// <reference path="./dependency_module_policy.ts" />

namespace __sharpangles {
    /**
     * Loads the dependency tree from a dependency.
     */
    export class DependencyResolver {
        constructor(private _moduleLoader: ModuleLoader, private _dependencyModulePolicy: DependencyModulePolicy) {
        }

        async resolveChildDependenciesAsync(dependency: Dependency): Promise<{ [key: string]: Dependency }> {
            if (dependency.knownDependencies || !this._dependencyModulePolicy.isDependencyParticipant(dependency.name)) {
                return this._getAllDependencies({}, dependency.knownDependencies ? dependency.knownDependencies : {});
            }
            let depsModule = await this._moduleLoader.loadModuleAsync(this._dependencyModulePolicy.resolveDependencyModuleName(dependency.name));
            if (!depsModule)
                return {};
            let metadata = this._dependencyModulePolicy.getDependenciesFromModule(depsModule);
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

        private _getAllDependencies(deps: { [key: string]: Dependency }, childDeps: { [key: string]: Dependency }): { [key: string]: Dependency } {
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
