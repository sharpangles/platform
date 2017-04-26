import { Feature, FeatureReference } from '../feature';
import { Polyfiller, Polyfill } from './polyfiller';
import { EntryPoint } from '../../entry_point';

export class CoreJSFeature extends Feature {
    static create(): FeatureReference {
        return new FeatureReference(CoreJSFeature, () => new CoreJSFeature).withDependency(Polyfiller);
    }

    public constructor(public reflect?: boolean) {
        super();
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        super.onInitAsync(entryPoint);
        if (this.reflect)
            FeatureReference.getFeature<Polyfiller>(Polyfiller).registerPolyfill(<Polyfill>{ src: 'core-js/es7/reflect', test: () => typeof Reflect === 'undefined' || !(<any>Reflect).getMetadata });
    }
}
