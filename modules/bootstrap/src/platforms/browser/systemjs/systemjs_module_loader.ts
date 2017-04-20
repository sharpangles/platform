/// <reference path="../../../module_loader.ts" />
/// <reference path="../../../task_map.ts" />
/// <reference path="../browser_module_loader.ts" />
/// <reference path="./systemjs_bundle_dependency_policy.ts" />
/// <reference path="./systemjs_module_loader_config.ts" />

namespace __sharpangles {
    export class SystemJSModuleLoader extends ModuleLoader<SystemJSModuleLoaderConfig> {
        constructor(private _browserModuleLoader: BrowserModuleLoader, dependencyPolicy: SystemJSBundleDependencyPolicy, private _baseUrl: string = '/', useDefaultOnBasePaths = true) {
            super();
            if (this._baseUrl !== '/')
                dependencyPolicy.localCodePaths.push(this._baseUrl.startsWith('/') ? this._baseUrl.substr(1) : this._baseUrl);

            this.initialConfig = {
                transpiler: false,
                packages: <any>{},
                baseURL: this._baseUrl,
                paths: {
                    'npm:': '/' + this._browserModuleLoader.combinePath('node_modules/', this._baseUrl)
                }
            };
            if (useDefaultOnBasePaths) {
                for (let codePath of dependencyPolicy.localCodePaths)
                    this.initialConfig.packages['/' + codePath] = { defaultExtension: 'js' };
            }
        }

        initialConfig: any;

        private _taskMap = new TaskMap<string, void, void>((key: string) => new Task<void>(() => System.import(key)));

        loadModuleAsync(moduleName: string): Promise<any> {
            if (this.initialConfig) {
                // Lazy config for system since the module loader is constructed before the polyfiller.
                System.config(this.initialConfig);
                delete this.initialConfig;
            }
            return this._taskMap.ensureOrCreateAsync(moduleName, undefined);
        }

        async ensureAllLoadedAsync(): Promise<void> {
            await Promise.all([this._browserModuleLoader.ensureAllLoadedAsync(), this._taskMap.ensureAllAsync()]);
        }

        registerDependencies(dependencies: { [key: string]: Dependency<SystemJSModuleLoaderConfig> }) {
            let config = {
                map: <{ [key: string]: string }>{},
                packages: <{ [key: string]: { defaultExtension: string | boolean, main: string } }>{},
                paths: {}
            };
            for (let dep of Object.keys(dependencies).map(k => dependencies[k]))
                this._registerDependencyOnConfig(dep, config);
            System.config(config);
        }

        private _registerDependencyOnConfig(dependency: Dependency<SystemJSModuleLoaderConfig>, config: any) {
            if (!dependency.moduleLoaderConfig)
                return;
            if (dependency.moduleLoaderConfig.browserLoaderConfig) {
                let deps: { [key: string ]: Dependency<BrowserModuleLoaderConfig> } = {};
                deps[dependency.name] = <Dependency<BrowserModuleLoaderConfig>>{
                    name: dependency.name,
                    knownDependencies: dependency.knownDependencies,
                    dependencies: dependency.dependencies,
                    moduleLoaderConfig: dependency.moduleLoaderConfig.browserLoaderConfig
                };
                this._browserModuleLoader.registerDependencies(deps);
                this._browserModuleLoader.loadModuleAsync(this._browserModuleLoader.combinePath(dependency.moduleLoaderConfig.browserLoaderConfig.src, this._baseUrl));
            }
            if (dependency.moduleLoaderConfig.systemConfig)
                System.config(dependency.moduleLoaderConfig.systemConfig);
            if (dependency.moduleLoaderConfig.systemPackageConfig) {
                for (let key of Object.keys(dependency.moduleLoaderConfig.systemPackageConfig)) {
                    if (!config.packages[dependency.name])
                        config.packages[dependency.name] = {};
                    config.packages[dependency.name][key] = (<any>dependency.moduleLoaderConfig.systemPackageConfig)[key];
                }
            }
        }
    }
}
