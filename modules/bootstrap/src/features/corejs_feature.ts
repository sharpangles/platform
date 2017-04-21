/// <reference path="../feature.ts" />

namespace __sharpangles {
    export class CoreJSFeature extends Feature {
        constructor(_dependencies?: Feature[]) {
            super(_dependencies);
        }

        protected async onPolyfillerCreatedAsync(entryPoint: EntryPoint<any>) {
            entryPoint.polyfiller.registerPolyfill('core-js/es7/reflect.js', () => typeof Reflect === 'undefined' || !(<any>Reflect).getMetadata);
        }
    }
}
