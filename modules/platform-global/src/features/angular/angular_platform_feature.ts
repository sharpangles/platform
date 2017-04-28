import { ModuleLoader } from '../module_loaders/module_loader';
import { Feature } from '../feature';
import { FeatureReference, Type } from '../feature_reference';
import { EntryPoint } from '../../entry_point';
import { CoreJSFeature } from '../polyfills/corejs_feature';

export abstract class AngularPlatformFeature extends Feature {
    /**
     * Denotes an angular app from the provided module type or string module reference.
     * Although a module is directly accepted and may feel more accurate, you should almost always you should use a string to prevent coupling the entrypoint and app builds.
     * The entrypoint capabilities would otherwise not be wired up until the app module and dependencies were already pulled in.
     * @param rootModuleReference
     */
    constructor(public rootModuleReference: string | any) {
        super();
    }

    dependentTypes(): Type[] {
        return [CoreJSFeature, ModuleLoader];
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let ngModule: any;
        if (typeof this.rootModuleReference === 'string') {
            let ind = this.rootModuleReference.indexOf('#');
            let mod = await FeatureReference.getFeature<ModuleLoader>(ModuleLoader).loadModuleAsync({ key: ind >= 0 ? this.rootModuleReference.substr(0, ind) : this.rootModuleReference });
            ngModule = mod[ind >= 0 ? this.rootModuleReference.substr(ind + 1) : 'default'];
        }
        else
            ngModule = this.rootModuleReference;
        this.bootstrap(ngModule);
    }

    protected abstract bootstrap(rootModule: any): void;
}
