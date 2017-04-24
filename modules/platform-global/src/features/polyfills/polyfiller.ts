import { TaskMap, Task } from '../../task_map';
import { Feature, FeatureReference } from '../feature';
import { ModuleLoader } from '../module_loaders/module_loader';

interface Polyfill {
    /** Allows per-polyfill specification of the module loader. */
    moduleLoader?: ModuleLoader;

    dependsOn?: string[];

    /** True to wait for this polyfill before any others start. */
    waitFor?: boolean;

    /** A test to determine if the polyfill is needed or already loaded. */
    test(): boolean;
}

export class Polyfiller extends Feature {
    ensureAllAsync() {
        return this._taskMap.ensureAllAsync();
    }

    private _taskMap = new TaskMap<string, Polyfill, any>((key: string, source: Polyfill) => new Task<any>(() => this._loadPolyfillAsync(key, source)));

    private async _loadPolyfillAsync(key: string, source: Polyfill) {
        await this._taskMap.ensureAllAsync(s => !!s.waitFor);
        if (source.dependsOn) {
            await Promise.all(source.dependsOn.map(d => this._taskMap.ensureAsync(d)));
        }
        if (!source.test())
            return;
        return await (source.moduleLoader || <ModuleLoader>FeatureReference.getFeature(ModuleLoader)).loadModuleAsync(key);
    }

    registerPolyfill(src: string, test?: () => boolean, dependsOn?: string[], waitFor?: boolean, moduleLoader?: ModuleLoader) {
        this._taskMap.ensureOrCreateAsync(src, { moduleLoader: moduleLoader, test: test ? test : () => true, dependsOn: dependsOn, waitFor: waitFor });
    }
}
