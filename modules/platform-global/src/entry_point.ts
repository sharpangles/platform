import { FeatureReference, Feature } from './features/feature';

export let rootFeature: Feature;

export class EntryPoint extends FeatureReference {
    constructor() {
        super(Feature);
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
            // Flatten and check for cyclical
            let features: Feature[] = [];
            this._traverse(rootFeature, f => f.dependencies, f => features.push(f), new Set<Feature>());

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
                            throw new Error('Cyclical runtime dependencies in features.');
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

    private _dostuff(featureReference: FeatureReference) {
    }

    private _traverse<T>(node: T, childrenSelector: (node: T) => T[], func: (node: T) => void, visitedStack?: Set<T>) {
        if (visitedStack) {
            if (visitedStack.has(node))
                throw new Error('Cyclical features.');
            visitedStack.add(node);
        }
        func(node);
        let children = childrenSelector(node);
        if (children && children.length !== 0) {
            for (let child of children)
                this._traverse(child, childrenSelector, func, visitedStack);
        }
        if (visitedStack)
            visitedStack.delete(node);
    }
}
