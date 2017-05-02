import { Feature } from '../feature';
import { FeatureReference, Type } from '../feature_reference';
import { Polyfiller, Polyfill } from './polyfiller';
import { EntryPoint } from '../../entry_point';

export class CoreJSFeature extends Feature {
    public constructor(public reflect?: boolean) {
        super();
    }

    dependentTypes(): Type[] {
        return [Polyfiller];
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        if (this.reflect)
            FeatureReference.getFeature<Polyfiller>(Polyfiller).registerPolyfill(<Polyfill>{ src: 'core-js/es7/reflect', test: () => typeof Reflect === 'undefined' || !(<any>Reflect).getMetadata });
    }
}
