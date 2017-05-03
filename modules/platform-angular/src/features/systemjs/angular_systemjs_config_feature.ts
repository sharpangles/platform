import { EntryPoint, Feature, Type, SystemJSModuleLoader } from '@sharpangles/platform-global';
import { RxjsSystemJSConfigFeature } from './rxjs_systemjs_config_feature';

export class AngularSystemJSConfigFeature extends Feature {
    constructor(public angularPathRoot?: string, public useBundle?: boolean, public useMin?: boolean, public useES5?: boolean, public includeTest?: boolean, public platforms?: string[]) {
        super();
    }

    dependentTypes(): Type[] {
        return [SystemJSModuleLoader, RxjsSystemJSConfigFeature];
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
        // @todo Whats the most 'appropriate' way to do this, map, path, bundle, ...?
        // @todo try bundle, its exactly what it is, and lets us use path for things like 'npm:'
        if (!this.includeTest && pkg.endsWith('/testing'))
            return;
        if (this.platforms && pkg.startsWith('@angular/platform-') && !this.platforms.find(p => pkg.startsWith(`@angular/platform-${p}`)))
            return;
        if (this.useBundle)
            return `${this.angularPathRoot || ''}${pkg}/bundles/${pkg.substr(9).replace('/', '-')}.umd.${this.useMin ? 'min.js' : 'js'}`;
        return `${this.angularPathRoot || ''}${pkg}//${pkg}.${this.useES5 ? 'es5.js' : 'js'}`;
    }
}
