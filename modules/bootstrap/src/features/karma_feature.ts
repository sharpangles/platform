/// <reference path="../feature.ts" />

namespace __sharpangles {
    declare var __karma__: any;
    export class KarmaFeature extends Feature {
        constructor(private _testFilter?: (path: string) => boolean, _dependencies?: Feature[]) {
            super(_dependencies);
            if (!_testFilter)
                this._testFilter = path => !path.startsWith('/base/node_modules/') && /.spec\.js$/.test(path);
            __karma__.loaded = function () { };
        }

        dependsOn(feature: Feature) {
            return feature instanceof AngularPlatformFeature;
        }

        protected async onStartedAsync(entryPoint: EntryPoint<any>) {
            try {
                await this.ensureKarmaTestsLoadedAsync(entryPoint);
            }
            catch (ex) {
                console.error(ex.stack || ex);
            }
            __karma__.start();
        }

        async ensureKarmaTestsLoadedAsync(entryPoint: EntryPoint<any>) {
            await Promise.all(this.getKarmaTestFiles().map(fileName => this.loadTestsAsync(entryPoint, fileName)));
        }

        getKarmaTestFiles(): string[] {
            return Object.keys((<any>window).__karma__.files).filter(<any>this._testFilter);
        }

        async loadTestsAsync(entryPoint: EntryPoint<any>, fileName: string) {
            await entryPoint.moduleLoader.loadModuleAsync(fileName.replace((<any>System).baseURL, '').replace('.js', ''));
        }
    }
}
