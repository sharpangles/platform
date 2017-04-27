import { Library, LazyFeatureContext, FeatureReference, SystemJSModuleLoaderConfigCapability, SystemJSLibraryContext } from '@sharpangles/platform-global';

let systemConfig: any = {
    packages: {
        'rxjs': { main: 'Rx.js', defaultExtension: 'js', format: 'cjs' },
        '@angular/animations': { defaultExtension: 'js', format: 'esm' },
        '@angular/animations/browser': { defaultExtension: 'js', format: 'esm' },
        '@angular/animations/browser/testing': { defaultExtension: 'js', format: 'esm' },
        '@angular/core': { defaultExtension: 'js', format: 'esm' },
        '@angular/core/testing': { defaultExtension: 'js', format: 'esm' },
        '@angular/common': { defaultExtension: 'js', format: 'esm' },
        '@angular/common/testing': { defaultExtension: 'js', format: 'esm' },
        '@angular/compiler': { defaultExtension: 'js', format: 'esm' },
        '@angular/compiler/testing': { defaultExtension: 'js', format: 'esm' },
        '@angular/forms': { defaultExtension: 'js', format: 'esm' },
        '@angular/http': { defaultExtension: 'js', format: 'esm' },
        '@angular/http/testing': { defaultExtension: 'js', format: 'esm' },
        '@angular/router': { defaultExtension: 'js', format: 'esm' },
        '@angular/router/testing': { defaultExtension: 'js', format: 'esm' },
        '@angular/platform-browser': { defaultExtension: 'js', format: 'esm' },
        '@angular/platform-browser/animations': { defaultExtension: 'js', format: 'esm' },
        '@angular/platform-browser/testing': { defaultExtension: 'js', format: 'esm' },
        '@angular/platform-browser-dynamic': { defaultExtension: 'js', format: 'esm' },
        '@angular/platform-browser-dynamic/testing': { defaultExtension: 'js', format: 'esm' },
        '@angular/platform-webworker': { defaultExtension: 'js', format: 'esm' },
        '@angular/platform-webworker-dynamic': { defaultExtension: 'js', format: 'esm' }
    },
    paths: {
        '@angular/animations': '@angular/animations/@angular/animations.es5.js',
        '@angular/animations/browser': '@angular/animations/@angular/animations/browser.es5.js',
        '@angular/animations/browser/testing': '@angular/animations/@angular/animations/browser/testing.es5.js',
        '@angular/core': '@angular/core/@angular/core.es5.js',
        '@angular/core/testing': '@angular/core/@angular/core/testing.es5.js',
        '@angular/common': '@angular/common/@angular/common.es5.js',
        '@angular/common/testing': '@angular/common/@angular/common/testing.es5.js',
        '@angular/compiler': '@angular/compiler/@angular/compiler.es5.js',
        '@angular/compiler/testing': '@angular/compiler/@angular/compiler/testing.es5.js',
        '@angular/forms': '@angular/forms/@angular/forms.es5.js',
        '@angular/http': '@angular/http/@angular/http.es5.js',
        '@angular/http/testing': '@angular/http/@angular/http/testing.es5.js',
        '@angular/router': '@angular/router/@angular/router.es5.js',
        '@angular/router/testing': '@angular/router/@angular/router/testing.es5.js',
        '@angular/platform-browser': '@angular/platform-browser/@angular/platform-browser.es5.js',
        '@angular/platform-browser/animations': '@angular/platform-browser/@angular/platform-browser/animations.es5.js',
        '@angular/platform-browser/testing': '@angular/platform-browser/@angular/platform-browser/testing.es5.js',
        '@angular/platform-browser-dynamic': '@angular/platform-browser-dynamic/@angular/platform-browser-dynamic.es5.js',
        '@angular/platform-browser-dynamic/testing': '@angular/platform-browser-dynamic/@angular/platform-browser-dynamic/testing.es5.js',
        '@angular/platform-webworker': '@angular/platform-webworker/@angular/platform-webworker.es5.js',
        '@angular/platform-webworker-dynamic': '@angular/platform-webworker-dynamic/@angular/platform-webworker-dynamic.es5.js'
    }
};

export default <Library>{
    capabilityContexts: {
        'SystemJSModuleLoaderConfigCapability': <SystemJSLibraryContext>{
            systemConfig: systemConfig
        }
    }
};
