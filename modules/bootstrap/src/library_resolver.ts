/// <reference path="./dependency.ts" />
/// <reference path="./dependency_module_policy.ts" />

namespace __sharpangles {
    export class LibraryResolver {
        constructor(private _moduleLoader: ModuleLoader, private _libraryPolicy: LibraryPolicy) {
        }

        async resolveChildLibrariesAsync(library: Library): Promise<{ [key: string]: Dependency }> {
            if (library.knownChildLibraries || !await this._libraryPolicy.isLibraryAsync(dependency.name)) {
                return this._getAllChildren({}, dependency.knownDependencies ? dependency.knownDependencies : {});
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

        private _getAllChildren(deps: { [key: string]: Library }, childDeps: { [key: string]: Library }): { [key: string]: Library } {
            if (!childDeps)
                return {};
            for (let name of Object.keys(childDeps)) {
                let child = childDeps[name];
                deps[name] = child;
                this._getAllChildren(deps, child.knownChildLibraries ? child.knownChildLibraries : {});
            }
            return deps;
        }
    }
}
