/// <reference path="./dependency.ts" />

namespace __sharpangles {
    /** @internal */
    export class DependencyResolver {
        constructor(
            private _moduleLoader: DependencyModuleLoader,
            rootName: string,
            private _environment: string,
            private _dependencyModuleLocation: string,
            private _dependencyModuleExport?: string) {
            this._rootScope = this._getScope(rootName);
        }

        private _rootScope?: string;

        protected canDependencyHaveDependencies(dependency: Dependency) {
            this._getScope(dependency.name) != this._rootScope;
        }

        protected getMetadataForEnvironmentFromModule(depsModule: any): { [key: string]: Dependency } {
            return this._dependencyModuleExport ? depsModule[this._dependencyModuleExport] : depsModule;
        }

        async resolveChildDependenciesAsync(dependency: Dependency, isLocal: boolean): Promise<{ [key: string]: Dependency }> {
            if (dependency.knownDependencies || !this.canDependencyHaveDependencies(dependency)) {
                return this._getAllDependencies({}, dependency.knownDependencies ? dependency.knownDependencies : {});
            }
            var depsModule = await this._moduleLoader.loadModuleAsync(isLocal ? this._dependencyModuleLocation : `${dependency.name}/${this._dependencyModuleLocation}`);
            if (!depsModule)
                return {};
            let metadata = this.getMetadataForEnvironmentFromModule(depsModule);
            if (!metadata)
                return {};

            for (var name in metadata) {
                metadata[name].name = name;
                if (!dependency.dependencies)
                    dependency.dependencies = [];
                dependency.dependencies.push(name);
            }
            return metadata;
        }

        private _getScope(name: string): string | undefined {
            return name && name.charAt(0) == '@' ? name.indexOf('/') > 0 ? name.substr(0, name.indexOf('/')) : name : undefined;
        }

        private _getAllDependencies(deps: { [key: string]: Dependency }, childDeps: { [key: string]: Dependency }): { [key: string]: Dependency } {
            if (!childDeps)
                return {};
            for (var name of Object.keys(childDeps)) {
                var child = childDeps[name];
                deps[name] = child;
                this._getAllDependencies(deps, child.knownDependencies ? child.knownDependencies : {});
            }
            return deps;
        }
    }
}
