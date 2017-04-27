import { SystemJSConfigFeature } from '../systemjs/systemjs_config_feature';
import { SystemJSModuleLoader } from '../systemjs/systemjs_module_loader';
import { EntryPoint } from '../../entry_point';
import { Feature } from '../feature';
import { FeatureReference } from '../feature_reference';

export class AngularSystemJSConfigFeature extends Feature {
    static create(angularPathRoot?: string, useBundle?: boolean, useMin?: boolean, useES5?: boolean, includeTest?: boolean, platforms?: string[]): FeatureReference {
        return new FeatureReference(AngularSystemJSConfigFeature, () => new AngularSystemJSConfigFeature(angularPathRoot, useBundle, useMin, useES5, includeTest, platforms)).withDependency(SystemJSModuleLoader);
    }

    constructor(public angularPathRoot?: string, public useBundle?: boolean, public useMin?: boolean, public useES5?: boolean, public includeTest?: boolean, public platforms?: string[]) {
        super();
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        System.config(this.createSystemConfig());
    }

    createSystemConfig() {
        let config: any = { packages: {}, paths: {} };
        for (let pkg of this.packages) {
            let path = this.getBundlePath(pkg);
            if (!path)
                continue;
            config.paths[pkg] = path;
            config.packages[pkg] = { defaultExtension: 'js', format: 'cjs' };
        }
        config.packages.rxjs = { main: 'Rx.js', defaultExtension: 'js', format: 'cjs' }; // @todo separate rxjs feature.  For now loading the whole thing.  Need either a custom build of all potential used features or a differential with dynamic libs.
        return <SystemJSLoader.Config>config;
    }

    private packages = [
        '@angular/animations',
        '@angular/animations/browser',
        '@angular/animations/browser/testing',
        '@angular/core',
        '@angular/core/testing',
        '@angular/common',
        '@angular/common/testing',
        '@angular/compiler',
        '@angular/compiler/testing',
        '@angular/forms',
        '@angular/http',
        '@angular/http/testing',
        '@angular/router',
        '@angular/router/testing',
        '@angular/platform-browser',
        '@angular/platform-browser/animations',
        '@angular/platform-browser/testing',
        '@angular/platform-browser-dynamic',
        '@angular/platform-browser-dynamic/testing',
        '@angular/platform-webworker',
        '@angular/platform-webworker-dynamic'
    ];

    private getBundlePath(pkg: string): string | undefined {
        if (!this.includeTest && pkg.endsWith('/testing'))
            return;
        if (this.platforms && pkg.startsWith('@angular/platform-') && !this.platforms.find(p => pkg.startsWith(`@angular/platform-${p}`)))
            return;
        if (this.useBundle)
            return `${this.angularPathRoot || ''}${pkg}/bundles/${pkg.substr(9).replace('/', '-')}.umd.${this.useMin ? 'min.js' : 'js'}`;
        return `${this.angularPathRoot || ''}${pkg}//${pkg}.${this.useES5 ? 'es5.js' : 'js'}`;
    }

    // private createSystemConfig(): SystemJSLoader.Config {
    //     return {
    //         packages: {
    //             'rxjs': { main: 'Rx.js', defaultExtension: 'js', format: 'cjs' },
    //             '@angular/animations': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/animations/browser': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/animations/browser/testing': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/core': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/core/testing': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/common': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/common/testing': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/compiler': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/compiler/testing': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/forms': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/http': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/http/testing': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/router': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/router/testing': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/platform-browser': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/platform-browser/animations': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/platform-browser/testing': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/platform-browser-dynamic': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/platform-browser-dynamic/testing': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/platform-webworker': { defaultExtension: 'js', format: 'esm' },
    //             '@angular/platform-webworker-dynamic': { defaultExtension: 'js', format: 'esm' }
    //         },
    //         paths: {
    //             '@angular/animations': `${this.angularPathRoot}/animations/@angular/animations.es5.js`,
    //             '@angular/animations/browser': `${this.angularPathRoot}/animations/@angular/animations/browser.es5.js`,
    //             '@angular/animations/browser/testing': `${this.angularPathRoot}/animations/@angular/animations/browser/testing.es5.js`,
    //             '@angular/core': `${this.angularPathRoot}/core/@angular/core.es5.js`,
    //             '@angular/core/testing': `${this.angularPathRoot}/core/@angular/core/testing.es5.js`,
    //             '@angular/common': `${this.angularPathRoot}/common/@angular/common.es5.js`,
    //             '@angular/common/testing': `${this.angularPathRoot}/common/@angular/common/testing.es5.js`,
    //             '@angular/compiler': `${this.angularPathRoot}/compiler/@angular/compiler.es5.js`,
    //             '@angular/compiler/testing': `${this.angularPathRoot}/compiler/@angular/compiler/testing.es5.js`,
    //             '@angular/forms': `${this.angularPathRoot}/forms/@angular/forms.es5.js`,
    //             '@angular/http': `${this.angularPathRoot}/http/@angular/http.es5.js`,
    //             '@angular/http/testing': `${this.angularPathRoot}/http/@angular/http/testing.es5.js`,
    //             '@angular/router': `${this.angularPathRoot}/router/@angular/router.es5.js`,
    //             '@angular/router/testing': `${this.angularPathRoot}/router/@angular/router/testing.es5.js`,
    //             '@angular/platform-browser': `${this.angularPathRoot}/platform-browser/@angular/platform-browser.es5.js`,
    //             '@angular/platform-browser/animations': `${this.angularPathRoot}/platform-browser/@angular/platform-browser/animations.es5.js`,
    //             '@angular/platform-browser/testing': `${this.angularPathRoot}/platform-browser/@angular/platform-browser/testing.es5.js`,
    //             '@angular/platform-browser-dynamic': `${this.angularPathRoot}/platform-browser-dynamic/@angular/platform-browser-dynamic.es5.js`,
    //             '@angular/platform-browser-dynamic/testing': `${this.angularPathRoot}/platform-browser-dynamic/@angular/platform-browser-dynamic/testing.es5.js`,
    //             '@angular/platform-webworker': `${this.angularPathRoot}/platform-webworker/@angular/platform-webworker.es5.js`,
    //             '@angular/platform-webworker-dynamic': `${this.angularPathRoot}/platform-webworker-dynamic/@angular/platform-webworker-dynamic.es5.js`
    //         }
    //    };
    // }
}
