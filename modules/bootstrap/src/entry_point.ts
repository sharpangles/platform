/// <reference path="./dependency_loader.ts" />
/// <reference path="./dependency_resolver.ts" />
/// <reference path="./polyfiller.ts" />

namespace __sharpangles {
    let entryPoint: EntryPoint<any>;

    /**
     * @export
     */
    export function loadDynamicDependencyAsync(url: string) {
        return entryPoint.dependencyLoader.addDependencyAsync(url);
    }

    export abstract class EntryPoint<TModuleLoaderConfig> {
        constructor(public dependencyPolicy: DependencyPolicy<TModuleLoaderConfig>, public baseUrl: string = '/') {
        }

        dependencyLoader: DependencyLoader<TModuleLoaderConfig>;
        moduleLoader: ModuleLoader<TModuleLoaderConfig>;
        polyfiller: Polyfiller;

        async startAsync(): Promise<void> {
            if (entryPoint) {
                throw new Error('Already started');
            }
            await this.initEnvironmentAsync();
            this.dependencyLoader = new DependencyLoader<TModuleLoaderConfig>(this.moduleLoader, this.dependencyPolicy);
            await this.dependencyLoader.loadStaticDependenciesAsync();
        }

        protected async initEnvironmentAsync() {
            entryPoint = this;
            this.moduleLoader = this.createModuleLoader();
            this.polyfiller = this.createPolyfiller();
            await this.polyfiller.ensureAllAsync();
        }

        protected abstract createModuleLoader(): ModuleLoader<TModuleLoaderConfig>;

        protected createPolyfiller() {
            return new Polyfiller(this.moduleLoader, this.baseUrl).fromES5();
        }
    }
}
