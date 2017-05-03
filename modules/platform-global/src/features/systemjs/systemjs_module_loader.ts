import { BrowserModuleLoader } from '../module_loaders/browser_module_loader';
import { FeatureReference, Type } from '../feature_reference';
import { EntryPoint } from '../../entry_point';
import { Polyfiller } from '../polyfills/polyfiller';
import { ModuleLoader, ModuleResolutionContext } from '../module_loaders/module_loader';

export interface SystemJSModuleResolutionContext extends ModuleResolutionContext {
}

export class SystemJSModuleLoader extends ModuleLoader<SystemJSModuleResolutionContext> {
    public constructor(public initialConfig: SystemJSLoader.Config, public systemJsPath: string, public globalNamespace = 'sharpangles') {
        super();
    }

    dependentTypes(): Type[] {
        return [BrowserModuleLoader, Polyfiller];
    }

    async onLoadModuleAsync(context: SystemJSModuleResolutionContext): Promise<any> {
        return System.import(context.key, context.parentKey);
    }

    async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let polyfiller = FeatureReference.getFeature<Polyfiller>(Polyfiller);
        polyfiller.registerPolyfill({ src: this.systemJsPath, test: () => typeof System === 'undefined', waitFor: true, moduleLoader: FeatureReference.getFeature<BrowserModuleLoader>(BrowserModuleLoader) });
        await polyfiller.ensureAllAsync();
        System.config(this.initialConfig);
        let globalVar: any = (window || global);
        // Since we configured systemjs, systemjs didn't load this module itself, so we assume its global and wire it up as a module.
        let entrypointGlobal = globalVar[this.globalNamespace];
        let keys = Object.keys(entrypointGlobal);
        if (keys.length !== 1)
            throw new Error('A single global build is not present.');
        System.registerDynamic('@sharpangles/platform-global', [], false, function (require, exports, module) {
            module.exports = entrypointGlobal[keys[0]]; // @todo: This makes an assumption that a rollup has only set a single global namespace here.
        });
    }
}
