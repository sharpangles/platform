import { SystemJSModuleLoader } from './systemjs_module_loader';
import { Feature } from '../feature';
import { Type } from '../feature_reference';
import { EntryPoint } from '../../entry_point';

export class SystemJSConfigFeature extends Feature {
    constructor(public systemConfig: SystemJSLoader.Config) {
        super();
    }

    dependentTypes(): Type[] {
        return [SystemJSModuleLoader];
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        System.config(this.systemConfig);
    }
}
