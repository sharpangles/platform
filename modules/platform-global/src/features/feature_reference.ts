import { Feature } from './feature';

export interface Type {
}

/**
 * @todo Could also use this as an entrypoint compiler of sorts.
 * Could connect to build process stuff, perhaps detecting polyfills to bundle.
 * Could also do this down the library chain...
 */
export class FeatureReference {
    constructor(public type: Type, factory?: () => Feature) {
        if (factory)
            FeatureReference.setFactory(type, factory);
    }

    dependencies: Map<Type, FeatureReference>;

    static setFactory(type: Type, factory: () => Feature) {
        let existing = FeatureReference.factories.get(type);
        if (existing && existing !== this.requiredCheck)
            throw new Error('Already have a factory for this feature.');
        FeatureReference.factories.set(type, factory);
    }

    private static requiredCheck: () => Feature = () => { throw new Error('The feature is required but is missing a factory.'); };

    /**
     * Allows registering factories for the types.
     * Static, since we dont want to bloat this layer with a DI mechanism.  That would itself be some kind of feature.
     */
    private static factories = new Map<Type, () => Feature>();

    /** Features are singletons per type.  Static is ok here since dependency injection would itself be a feature, and we have no notion of lifetime without DI anyway. */
    private static instances = new Map<Type, Feature>();

    static getFeature<TFeature extends Feature>(type: Type) {
        let feature = FeatureReference.instances.get(type);
        if (!feature)
            throw new Error(`The feature ${type.constructor.name} was not found`);
        return <TFeature>feature;
    }

    requiresDependency(type: Type) {
        this.withDependency(type, FeatureReference.requiredCheck);
    }

    /**
     *
     * @param referenceOrType Configures and returns a child dependency.
     * @param factory
     */
    withDependency(referenceOrType: FeatureReference | Type, factory?: () => Feature) {
        if (!this.dependencies)
            this.dependencies = new Map<Type, FeatureReference>();
        let child = referenceOrType instanceof FeatureReference ? referenceOrType : new FeatureReference(referenceOrType, factory);
        this.dependencies.set(referenceOrType instanceof FeatureReference ? referenceOrType.type : referenceOrType, child);
        return child;
    }

    /**
     * Aliases the reference as a type.
     * Typical usage: new FeatureReference(Derived).as(Base);
     */
    as(type: Type) {
        if (FeatureReference.factories.has(type))
            throw new Error('Already have an alias for this feature.');
        FeatureReference.factories.set(type, () => this.findFeature());
        return this;
    }

    /** @internal */
    findFeature(): Feature {
        let feature = FeatureReference.instances.get(this.type);
        if (feature)
            return feature;
        let factory = FeatureReference.factories.get(this.type);
        feature = factory ? factory() : <Feature>new (<any>this.type)();
        FeatureReference.instances.set(this.type, feature);
        if (this.dependencies) {
            for (let dep of this.dependencies.values())
                feature.addDependency(dep.findFeature());
        }
        return feature;
    }
}
