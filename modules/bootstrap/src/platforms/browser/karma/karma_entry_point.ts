/// <reference path="../systemjs/systemjs_browser_entry_point.ts" />

namespace __sharpangles {
    declare var __karma__: any;

    export class KarmaEntryPoint extends SystemJSBrowserEntryPoint {
        constructor(public dependencyPolicy: DependencyPolicy<SystemJSModuleLoaderConfig>) {
            super(dependencyPolicy, '/base');
            __karma__.loaded = function () { };
        }

        async startAsync() {
            await super.startAsync();
            try {
                await this.ensureKarmaTestsLoadedAsync();
            }
            catch (ex) {
                console.error(ex.stack || ex);
            }
            __karma__.start();
        }

        async ensureKarmaTestsLoadedAsync() {
            await Promise.all(this.getKarmaTestFiles().map(fileName => this.loadTestsAsync(fileName)));
        }

        getKarmaTestFiles(): string[] {
            return Object.keys((<any>window).__karma__.files).filter(path => !path.startsWith('/base/node_modules/') && /.spec\.js$/.test(path));
        }

        async loadTestsAsync(fileName: string) {
            await this.moduleLoader.loadModuleAsync(fileName.replace((<any>System).baseURL, '').replace('.js', ''));
        }
    }
}
