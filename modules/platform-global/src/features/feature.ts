import { EntryPoint } from '../entry_point';

/**
 * @todo Could also use this as an entrypoint compiler of sorts.
 * Could connect to build process stuff, perhaps detecting polyfills to bundle.
 * Could also do this down the library chain...
 */
export class FeatureReference {
    constructor(public type: any, factory?: () => Feature) {
        if (factory) {
            if (FeatureReference.factories.has(type))
                throw new Error('Already have a factory for this feature.');
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

    static getFeature<TFeature extends Feature>(type: any) {
        let feature = FeatureReference._instances.get(type);
        if (!feature)
            throw new Error(`The feature ${type.constructor.name} was not found`);
        return <TFeature>feature;
    }

    withDependency(referenceOrType: FeatureReference | any, factory?: () => Feature) {
        if (!this.dependencies)
            this.dependencies = new Map<any, FeatureReference>();
        this.dependencies.set(
            referenceOrType instanceof FeatureReference ? referenceOrType.type : referenceOrType,
            referenceOrType instanceof FeatureReference ? referenceOrType : new FeatureReference(referenceOrType, factory));
        return this;
    }

    /**
     * Aliases the reference as a type.
     * Typical usage: new FeatureReference(Derived).as(Base);
     */
    as(type: any) {
        if (FeatureReference.factories.has(type))
            throw new Error('Already have an alias for this feature.');
        FeatureReference.factories.set(type, () => this.findFeature());
        return this;
    }

    /** @internal */
    findFeature(): Feature {
        let feature = FeatureReference._instances.get(this.type);
        if (feature)
            return feature;
        let factory = FeatureReference.factories.get(this.type);
        feature = factory ? factory() : <Feature>new this.type();
        FeatureReference._instances.set(this.type, feature);
        if (this.dependencies)
            feature.dependencies = Array.from(this.dependencies.values()).map(d => d.findFeature());
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
        if (!this._modifiedTask)
            this._modifiedTask = this.onModifiedAsync(entryPoint);
        return this._modifiedTask;
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

    /** @internal */
    addDependency(child: Feature): boolean {
        if (!this.dependencies)
            this.dependencies = [child];
        else if (this.dependencies.indexOf(child) < 0)
            this.dependencies.push(child);
        return true;
    }
}
