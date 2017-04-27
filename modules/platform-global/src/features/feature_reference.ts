import { Feature } from './feature';

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

