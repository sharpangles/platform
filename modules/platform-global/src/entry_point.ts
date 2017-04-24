import { FeatureReference, Feature } from './features/feature';

export let rootFeature: Feature;

export abstract class EntryPoint extends FeatureReference {
    constructor() {
        super(FeatureReference);
    }

    /**
     * Start the application.
     */
    async startAsync(): Promise<void> {
        if (rootFeature) {
            throw new Error('Already started');
        }
        rootFeature = this.getFeature();
        if (rootFeature) {
            let features: Feature[] = [];
            this._flatten(rootFeature, features);
            let ind = features.length - 1;
            // We only order the list to wire up dependencies and perform a cyclical check.  Once wired, awaiting tasks from the root is the most optimal async pattern.
            while (ind > 0) {
                for (let pos = 0; pos < features.length; pos++) { // Still go to full length to ensure dependsOn always gets called.
                    let tries = 0;
                    if (features[pos].dependsOn(features[ind])) {
                        if (!features[pos].dependencies)
                            features[pos].dependencies = [features[ind]];
                        else if ((<any>features[pos].dependencies).indexOf(features[ind]) < 0)
                            (<any>features[pos].dependencies).push(features[ind]);
                        if (pos < ind)
                            features.splice(pos--, 0, features.splice(ind, 1)[0]);
                        tries++;
                        if (tries > features.length * 2)
                            throw new Error('Cyclical dependencies in features.');
                    }
                }
                ind--;
            }
        }
        if (rootFeature) {
            await rootFeature.initAsync(this);
            await rootFeature.runAsync(this);
        }
    }

    private _flatten(feature: Feature, features: Feature[]) {
        features.push(feature);
        if (feature.dependencies) {
            for (let child of feature.dependencies)
                this._flatten(child, features);
        }
    }
}
