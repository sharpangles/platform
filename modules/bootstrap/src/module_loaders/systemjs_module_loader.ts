/// <reference path="./dependency_module_loader.ts" />
/// <reference path="../script_tag_loader.ts" />

declare var System: any;

namespace __sharpangles {
    export class SystemJSModuleLoader extends DependencyModuleLoader {
        constructor(private _baseUrl: string = '/', useDefaultOnBasePaths = true) {
            super();

            let localCodePaths = ['src', 'test', 'Views'];
             if (this._baseUrl != '/')
                localCodePaths.push(this._baseUrl.startsWith('/') ? this._baseUrl.substr(1) : this._baseUrl);

           var initialConfig = {
                packages: <any>{},
                baseURL: this._baseUrl,
                paths: {
                    'npm:': '/' + scriptTagLoader.combinePath('node_modules/', this._baseUrl)
                }
            };
            if (useDefaultOnBasePaths) {
                for (var codePath of localCodePaths)
                    initialConfig.packages['/' + codePath] = { defaultExtension: 'js' };
            }
            System.config(initialConfig);
        }

        loadModuleAsync(module: string): Promise<any> {
            return System.import(module);
        }

        registerDependencies(dependencies: { [key: string]: Dependency }) {
            var config = {
                map: <{ [key: string]: string }>{},
                packages: <{ [key: string]: { defaultExtension: string | boolean, main: string } }>{},
                paths: {}
            };
            for (var dep of Object.keys(dependencies).map(k => dependencies[k]))
                this._registerDependencyOnConfig(dep, config);
            System.config(config);
        }

        private _registerDependencyOnConfig(dependency: Dependency, config: any) {
            if (dependency.useTag)
                scriptTagLoader.loadAsync(dependency.useTag, this._baseUrl);
            if (dependency.systemConfig)
                System.config(dependency.systemConfig);
            if (dependency.systemPackageConfig) {
                for (var key of Object.keys(dependency.systemPackageConfig)) {
                    if (!config.packages[dependency.name])
                        config.packages[dependency.name] = {};
                    config.packages[dependency.name][key] = (<any>dependency.systemPackageConfig)[key];
                }
            }
        }
    }
}
