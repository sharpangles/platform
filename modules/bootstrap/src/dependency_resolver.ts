/// <reference path="./dependency.ts" />
/// <reference path="./dependency_module_policy.ts" />

namespace __sharpangles {
    /**
     * If the dependency is a dependency participant (i.e. provides metadata to participate in this framework, such as listing its child dependencies),
     * this will determine the module name in that library, load it, and wire up its results to dependency.dependencies.
     *
     * The state of dynamic module loading is very much in flux:
     * Read up here:
     * - Todays polyfill: https://github.com/ModuleLoader/es-module-loader
     *     - Particularly the bottom, 'Spec Differences.'  If we wanted the libraries dependency metadata stored in the same bundle, the RegisterLoader comment is important.
     *       Presently, the only way I've discovered to have this as part of the same package is to use system-formatted bundles.
     * - Tomorrows approach: https://github.com/tc39/proposal-dynamic-import
     *
     * Stuff to watch:
     * - https://github.com/whatwg/loader
     *     - Note the 'Status' which says its getting a bit of an overhaul.
     * - https://github.com/ModuleLoader/browser-es-module-loader
     * - https://github.com/whatwg/loader/issues/147
     *
     * Our concern:
     * - It boils down to having lazy instantiation (or even lazy child resolution).  When a module gets dynamically loaded it can pull a bundle.
     *   Ideally, we would like to have metadata in that bundle that may affect further dependency resolution of children in that bundle.
     *   This has been achieved (currently separate from this library) using a systemjs build process.
     *   Our hope is that the discussions of simplification (link just above) do not isolate the resolution process in a black box.
     *   Currently the discussion is trending towards pushing solutions into the infrastructure layers (HTTP/2) and ignoring what time always proves,
     *   the need for abstraction of the process.  Prepackaging may soon become a pasttime performance fad in a world heading towards multi-gigabit wifi everywhere,
     *   but we would still like the ability to load custom metadata with the bundle to minimize latency.
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
