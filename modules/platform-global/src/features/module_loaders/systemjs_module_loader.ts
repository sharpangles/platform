import { BrowserModuleLoader } from './browser_module_loader';
import { FeatureReference } from '../feature';
import { EntryPoint } from '../../entry_point';
import { Polyfiller } from '../polyfills/polyfiller';
import { ModuleLoader, ModuleResolutionContext } from './module_loader';

export interface SystemJSModuleResolutionContext extends ModuleResolutionContext {
}


export class SystemJSModuleLoader extends ModuleLoader<SystemJSModuleResolutionContext> {
    static create(initialConfig: SystemJSLoader.Config, systemJsPath: string): FeatureReference {
        return new FeatureReference(SystemJSModuleLoader, () => new SystemJSModuleLoader(initialConfig, systemJsPath)).withDependency(Polyfiller).withDependency(BrowserModuleLoader);
    }

    public constructor(public initialConfig: SystemJSLoader.Config, public systemJsPath: string) {
        super();
        this.resolver = this.onLoadModuleAsync.bind(this);
    }

    onLoadModuleAsync(context: SystemJSModuleResolutionContext): Promise<any> {
        return System.import(context.key, context.parentKey);
    }

    async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let polyfiller = <Polyfiller>FeatureReference.getFeature(Polyfiller);
        polyfiller.registerPolyfill({ src: this.systemJsPath, test: () => typeof System === 'undefined', waitFor: true, moduleLoader: <BrowserModuleLoader>FeatureReference.getFeature(BrowserModuleLoader) });
        await polyfiller.ensureAllAsync();
        System.config(this.initialConfig);
    }
}
