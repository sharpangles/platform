import { EntryPoint } from '../entry_point';

export class FeatureReference {
    constructor(public type: any, factory?: () => Feature) {
        if (factory) {
            if (FeatureReference.factories.has(type))
                throw new Error('Already ahve a factory for this feature.');
            FeatureReference.factories.set(type, factory);
        }
    }

    dependencies: Map<any, FeatureReference>;

    /**
     * Allows registering factories for the types.
     * Static, since we dont want to bloat this layer with a DI mechanism.  That would itself be some kind of feature.
     */
    static factories = new Map<any, () => Feature>();

    /** Features are singletons per type.  Static is ok here since dependency injection would itself be a feature, and we have no notion of lifetime without DI anyway. */
    private static _instances = new Map<any, Feature>();

    static getFeature(type: any) {
        let feature = FeatureReference._instances.get(type);
        if (!feature)
            throw new Error('Not found');
        return feature;
    }

    // /** Gets a dependency of the same type with an already constructed instance. */
    // private _getDependencyInDepth(type: any): FeatureReference | undefined {
    //     if (!this.dependencies)
    //         return;
    //     let reference: FeatureReference | undefined;
    //     if (reference = this.dependencies.get(type))
    //         return reference;
    //     for (let dep of this.dependencies.values()) {
    //         if (reference = dep._getDependencyInDepth(type))
    //             return reference;
    //     }
    //     return;
    // }

    withDependency(type: any) {
        if (!this.dependencies)
            this.dependencies = new Map<any, FeatureReference>();
        this.dependencies.set(type, new FeatureReference(type));
        return this;
    }

    /**
     * Aliases the reference as a type.
     * Typical usage: new FeatureReference(Derived).as(Base);
     */
    as(type: any) {
        if (!this.dependencies)
            this.dependencies = new Map<any, FeatureReference>();
        this.dependencies.set(type, this);
        return this;
    }

    protected getFeature(): Feature {
        let feature = FeatureReference._instances.get(this.type);
        if (feature)
            return feature;
        let factory = FeatureReference.factories.get(this.type);
        feature = factory ? factory() : <Feature>new this.type();
        FeatureReference._instances.set(this.type, feature);
        if (this.dependencies)
            feature.dependencies = Array.from(this.dependencies.values()).map(d => d.getFeature());
        return feature;
    }
}

/**
 * Base class for pluggable entry point features.
 */
export class Feature {
    dependencies: Feature[];

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
            this._initTask = this.onInitAsync(entryPoint);
        }
        return this._initTask;
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
}
