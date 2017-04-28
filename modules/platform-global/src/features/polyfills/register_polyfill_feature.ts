import { Polyfiller, Polyfill } from './polyfiller';
import { Feature } from '../feature';
import { FeatureReference, Type } from '../feature_reference';
import { EntryPoint } from '../../entry_point';

export class RegisterPolyfillFeature extends Feature {
    constructor(public polyfills: Polyfill[], public waitForLoad?: boolean) {
        super();
    }

    dependentTypes(): Type[] {
        return [Polyfiller];
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let polyfiller = FeatureReference.getFeature<Polyfiller>(Polyfiller);
        this.polyfills.map(p => polyfiller.registerPolyfill(p));
        if (this.waitForLoad)
            await polyfiller.ensureAllAsync();
    }
}
