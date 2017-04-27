import { SystemJSModuleLoader } from './systemjs_module_loader';
import { Feature } from '../feature';
import { FeatureReference } from '../feature_reference';
import { EntryPoint } from '../../entry_point';

export class SystemJSConfigFeature extends Feature {
    static create(systemConfig: SystemJSLoader.Config): FeatureReference {
        return new FeatureReference(SystemJSConfigFeature).withDependency(SystemJSModuleLoader);
    }

    constructor(public systemConfig: SystemJSLoader.Config) {
        super();
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        System.config(this.systemConfig);
    }
}
