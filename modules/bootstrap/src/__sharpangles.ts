/// <reference path="./Bootstrapper.ts" />

namespace __sharpangles {
    // var _bootstrapper: Bootstrapper;
    // export var environment: string;

    // /**
    //  *
    //  * @param name
    //  * @param environment
    //  * @param app The name of the module to pass to the IBootstrapper call.
    //  * @param baseUrl A base url for SystemJS (such as '/base' for karma).
    //  * @param featureExportingModule Indicates the module that exports __sharpanglesFeature.  Defaults to the app.
    //  * @param bootstrappingFeature An optional reference to a module that exports a custom __sharpanglesBootstrap function that implements IBootstrap.
    //  * @param bootstrapper An bootstrapping method to override any others (ie. unit tests).
    //  */
    // export function bootstrapAsync(name: string, environment: string, app: string, baseUrl: string = '/', featureExportingModule?: string, bootstrappingFeature?: string, bootstrapper?: IFeatureBootstrapper) {
    //     if (_bootstrapper)
    //         throw new Error("Already bootstrapped");
    //     __sharpangles.environment = environment;
    //     _bootstrapper = new Bootstrapper(name, environment, app, baseUrl, featureExportingModule, bootstrappingFeature, bootstrapper);
    //     return _bootstrapper.runAsync();
    // }

    // /**
    //  * Dynamically registers a new dependency on the fly using the default usage of IDependency.
    //  * @param moduleName
    //  */
    // export async function ensureModuleAsync(moduleName: string) {
    //     var dependency = <IDependency>{
    //         name: moduleName,
    //         systemConfig: {
    //             bundles: {}
    //         },
    //         systemPackageConfig: {
    //             main: "src/index",
    //             defaultExtension: false,
    //             format: 'system'
    //         }
    //     };
    //     (<any>dependency.systemConfig).bundles[`/npm:${moduleName}/dist/${moduleName.replace('/', '.').replace('@', '')}.${_bootstrapper.environment}.js`] = [
    //         `@scopegoeshere/${moduleName}`,
    //         `@scopegoeshere/${moduleName}/*`,
    //         `@scopegoeshere/${moduleName}/src/*`
    //     ];
    //     await _bootstrapper.appendAsync(dependency);
    // }

    // /**
    //  * Wraps xhr requests with a url rewrite to add node_modules for child dependency .html and .css calls, since system configuration would not apply to them.
    //  * TODO: Implement custom @angular/compiler/ResourceLoader instead of globally hacking xhr
    //  */
    // export function hackXHRForDynamicAngular() {
    //     (function (open: any) {
    //         XMLHttpRequest.prototype.open = function (this: any, method: any, url: any, async: any, user: any, pass: any) {
    //             if (url && url.indexOf("/node_modules/") < 0 && url.indexOf("/@scopegoeshere/") >= 0 && (url.endsWith(".css") || url.endsWith(".html")))
    //                 url = url.replace("/@scopegoeshere/", "/node_modules/@scopegoeshere/");
    //             open.call(this, method, url, async, user, pass);
    //         };
    //     })(XMLHttpRequest.prototype.open);
    // }
}
