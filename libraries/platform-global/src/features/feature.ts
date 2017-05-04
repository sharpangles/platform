import { FeatureReference, Type } from './feature_reference';
import { EntryPoint } from '../entry_point';

/**
 * Base class for pluggable entry point features.
 */
export class Feature {
    dependencies: Feature[];

    /**
     * Returns compile-time Feature dependency types.
     */
    dependentTypes(): Type[] { return []; }

    /**
     * Allows runtime-checking to add dependencies.
     */
    dependsOn(feature: Feature) {
        return false;
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        if (!this.dependencies)
            return;
        await Promise.all(this.dependencies.map(d => d.initAsync(entryPoint)));
    }

    private _initTask?: Promise<void>;
    async initAsync(entryPoint: EntryPoint) {
        if (!this._initTask) {
            for (let dep of this.dependentTypes())
                this.addDependency(new FeatureReference(dep).findFeature());
            this._initTask = this.onInitAsync(entryPoint);
        }
        return this._initTask;
    }

    protected async onModifiedAsync(entryPoint: EntryPoint) {
        if (!this.dependencies)
            return;
        await Promise.all(this.dependencies.map(d => d.modifiedAsync(entryPoint)));
    }

    private _modifiedTask?: Promise<void>;
    async modifiedAsync(entryPoint: EntryPoint) {
        if (!this._initTask) {
            await this.initAsync(entryPoint);
            await this.runAsync(entryPoint);
        }
        else if (!this._modifiedTask) {
            this._modifiedTask = this.onModifiedAsync(entryPoint);
            await this._modifiedTask;
        }
    }

    protected async onRunAsync(entryPoint: EntryPoint) {
        if (!this.dependencies)
            return;
        await Promise.all(this.dependencies.map(d => d.runAsync(entryPoint)));
    }

    private _runTask?: Promise<void>;
    async runAsync(entryPoint: EntryPoint) {
        if (!this._runTask)
            this._runTask = this.onRunAsync(entryPoint);
        return this._runTask;
    }

    /**
     * Adds a dependency to the feature.
     * It is acceptable to add a feature as a dependency multiple times for numerous parents without worrying about multiple initializations.
     */
    addDependency(child: Feature | Type): boolean {
        let childFeature = child instanceof Feature ? child : FeatureReference.getFeature(child);
        if (!this.dependencies)
            this.dependencies = [childFeature];
        else if (this.dependencies.indexOf(childFeature) < 0)
            this.dependencies.push(childFeature);
        return true;
    }
}
