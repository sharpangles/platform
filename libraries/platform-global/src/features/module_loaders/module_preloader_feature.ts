import { Feature } from '../feature';
import { FeatureReference } from '../feature_reference';
import { EntryPoint } from '../../entry_point';
import { ModuleLoader, ModuleResolutionContext } from './module_loader';

/**
 * A feature that triggers loads on a module loader based on loads from another.
 */
export class ModulePreloaderFeature extends Feature {
    /**
     * @param dependentLoads The loads to trigger
     * @param waitForLoad If false, the loads trigger but are not awaited before moving on
     * @param sourceModuleLoader The loader that is monitored
     * @param preModuleLoader The loader the dependencies trigger on, otherwise the same as the source.
     */
    constructor(public dependentLoads: ModuleResolutionContext[], public waitForLoad?: boolean, public sourceModuleLoader?: ModuleLoader, public preModuleLoader?: ModuleLoader, public filter?: (context: ModuleResolutionContext) => boolean) {
        super();
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let sourceModuleLoader = this.sourceModuleLoader || FeatureReference.getFeature<ModuleLoader>(ModuleLoader);
        sourceModuleLoader.registerResolver(async (context, next) => {
            if (!this.filter || this.filter(context)) {
                let promises = this.dependentLoads.map(d => (this.preModuleLoader || sourceModuleLoader).loadModuleAsync(d));
                if (this.waitForLoad)
                    await Promise.all(promises);
            }
            await next(context);
        });
    }
}
