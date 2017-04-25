import { EntryPoint } from '@sharpangles/platform-global';

E

/**
 * An entrypoint useful for a development deployment that includes source maps.
 */
class __EntryPoint_Web_Dev extends __sharpangles.SystemJSBrowserEntryPoint { // tslint:disable-line:class-name
    constructor() {
        super('polyfills/system.src.js',
            new __sharpangles.ScopedDependencyModulePolicy('@sharpangles', 'dev'),
            new __sharpangles.SystemJSBundleLibraryPolicy(),
            [
                new __sharpangles.CoreJSFeature(),
                new __sharpangles.AngularPlatformBrowserDynamicFeature('app.module'),
                new __sharpangles.SystemJSConfigFeature({
                })
            ]);
    }
}

new __EntryPoint_Web_Dev().startAsync();
