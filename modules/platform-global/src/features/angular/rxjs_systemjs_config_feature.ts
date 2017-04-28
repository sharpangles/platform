import { SystemJSModuleLoader } from '../systemjs/systemjs_module_loader';
import { EntryPoint } from '../../entry_point';
import { Feature } from '../feature';
import { FeatureReference, Type } from '../feature_reference';

export class RxjsSystemJSConfigFeature extends Feature {
    constructor(public rxjsBundle?: string) {
        super();
    }

    dependentTypes(): Type[] {
        return [SystemJSModuleLoader];
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        System.config(this.createSystemConfig());
    }

    createSystemConfig(): SystemJSLoader.Config {
        let config: SystemJSLoader.Config = {
            packages: {
                rxjs: { defaultExtension: 'js', format: 'cjs' }
            },
            bundles: { }
        };
        (<SystemJSLoader.ModulesList>config.bundles)[this.rxjsBundle || 'rxjs/bundles/Rx.min.js'] = [
            'rxjs',
            'rxjs/*',
            'rxjs/operator/*',
            'rxjs/observable/*',
            'rxjs/scheduler/*',
            'rxjs/symbol/*',
            'rxjs/add/operator/*',
            'rxjs/add/observable/*',
            'rxjs/util/*'
        ];
        return config;
    }
}
