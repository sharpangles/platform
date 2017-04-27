import { Polyfiller, Polyfill } from './polyfiller';
import { Feature } from '../feature';
import { FeatureReference } from '../feature_reference';
import { EntryPoint } from '../../entry_point';

export class RegisterPolyfillFeature extends Feature {
    static create(polyfills: Polyfill[], waitForLoad?: boolean): FeatureReference {
        return new FeatureReference(RegisterPolyfillFeature).withDependency(Polyfiller);
    }

    constructor(public polyfills: Polyfill[], public waitForLoad?: boolean) {
        super();
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let polyfiller = FeatureReference.getFeature<Polyfiller>(Polyfiller);
        this.polyfills.map(p => polyfiller.registerPolyfill(p));
        if (this.waitForLoad)
            await polyfiller.ensureAllAsync();
    }
}
