import { BrowserModuleLoader } from '../module_loaders/browser_module_loader';
import { FeatureReference, Type } from '../feature_reference';
import { EntryPoint } from '../../entry_point';
import { Polyfiller } from '../polyfills/polyfiller';
import { ModuleLoader, ModuleResolutionContext } from '../module_loaders/module_loader';

export interface SystemJSModuleResolutionContext extends ModuleResolutionContext {
}

export class SystemJSModuleLoader extends ModuleLoader<SystemJSModuleResolutionContext> {
    public constructor(public initialConfig: SystemJSLoader.Config, public systemJsPath: string) {
        super();
    }

    dependentTypes(): Type[] {
        return [BrowserModuleLoader, Polyfiller];
    }

    onLoadModuleAsync(context: SystemJSModuleResolutionContext): Promise<any> {
        return System.import(context.key, context.parentKey);
    }

    async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let polyfiller = FeatureReference.getFeature<Polyfiller>(Polyfiller);
        polyfiller.registerPolyfill({ src: this.systemJsPath, test: () => typeof System === 'undefined', waitFor: true, moduleLoader: FeatureReference.getFeature<BrowserModuleLoader>(BrowserModuleLoader) });
        await polyfiller.ensureAllAsync();
        System.config(this.initialConfig);
    }
}
