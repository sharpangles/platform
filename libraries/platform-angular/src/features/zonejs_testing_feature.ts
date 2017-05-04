import { Polyfiller, Feature, Type, EntryPoint, FeatureReference } from '@sharpangles/platform-global';

export class ZoneJSTestingFeature extends Feature {
    dependentTypes(): Type[] {
        return [Polyfiller];
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let polyfiller = FeatureReference.getFeature<Polyfiller>(Polyfiller);
        polyfiller.registerPolyfill({ src: 'zone.js/dist/zone-node.js' });
        polyfiller.registerPolyfill({ src: 'zone.js/dist/long-stack-trace-zone.js' });
        polyfiller.registerPolyfill({ src: 'zone.js/dist/proxy.js' });
        polyfiller.registerPolyfill({ src: 'zone.js/dist/sync-test.js' });
        polyfiller.registerPolyfill({ src: 'zone.js/dist/async-test.js' });
        polyfiller.registerPolyfill({ src: 'zone.js/dist/fake-async-test.js' });
        polyfiller.registerPolyfill({ src: 'zone.js/dist/jasmine-patch.js' });
    }
}
