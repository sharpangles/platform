/// <reference path="../entry_point.ts" />
/// <reference path="../../dependency_loader.ts" />
/// <reference path="../../dependency_resolver.ts" />

declare var __karma__: any;

// Cancel Karma's synchronous start, we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function () { };

//var __sharpanglesTestDependencies: any[] = [];

namespace __sharpangles {
    export class KarmaEntryPoint extends EntryPoint {
        constructor() {
            super();
        }

        protected async runAsync() {
            try {
                await this.ensureKarmaTestsLoadedAsync();
            }
            catch (ex) {
                console.error(ex.stack || ex);
            }
            __karma__.start();
        }

        protected createDependencyLoader() {
            return new DependencyLoader(this.moduleLoader, this.name, 'test', "/base", new DependencyResolver(this.moduleLoader, this.name, 'test', 'src/dependencies'));
        }

        async ensureKarmaTestsLoadedAsync() {
            await Promise.all(this.getKarmaTestFiles().map(fileName => this.loadTestsAsync(fileName)));
        }

        getKarmaTestFiles(): string[] {
            return Object.keys((<any>window).__karma__.files).filter(path => !path.startsWith("/base/node_modules/") && /.spec\.js$/.test(path));
        }

        async loadTestsAsync(fileName: string) {
            var module = await this.moduleLoader(fileName.replace((<any>System).baseURL, '').replace('.js', ''));
            if (Object.prototype.hasOwnProperty.call(module, "main"))
                module.main(); //expose the tests
        }
    }
}
