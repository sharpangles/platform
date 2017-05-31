import { Resolver } from '../resolvers/resolver';
import { Tracker } from '../trackers/tracker';

export interface SystemFeature {
    /** Creates any subsystems and trackers on the provided system, called in the order of configuration. */
    createAsync(system: System): Promise<void>;

    /** Called after all known features for the system have been created, called in the order of configuration. */
    onCreatedAsync(system: System): Promise<void>;

    /** Called in reverse order when the system that sourced the factory is disposing. */
    disposeAsync(system: System): Promise<void>;
}

export interface SystemConfig {
    features: { [key: string]: any };
}

export class System {
    constructor(public parent?: System, resolver?: Resolver) {
        resolver = resolver || parent && parent.resolver;
        if (!resolver)
            throw new Error('Root system requires a resolver.');
    }

    async initAsync(config: SystemConfig) {
        for (let factoryName in config.features) {
            let feature = await this.resolver.resolveAsync(this, factoryName, config.features[factoryName]);
            this.features.push(feature);
            await feature.createAsync(this);
        }
        for (let feature of this.features)
            await feature.onCreatedAsync(this);
    }

    features: SystemFeature[] = [];
    trackers: Tracker[] = [];
    subsystems: System[] = [];
    private resolver: Resolver;

    async resolveFactoryAsync<T>(key: string, config: any) {
        let result: T | undefined = this.findExisting(key, config);
        if (result)
            return result;
        return await this.resolver.resolveAsync(this, key, config);
    }

    protected findExisting(key: string, config: any) {
        // This sounds like it find factories...but we should be finding trackers...
    }

    protected findExistingTracker(factoryKey: string, config: any) {
        // This sounds like it find factories...but we should be finding trackers...
    }

    async disposeAsync() {
        for (let feature of this.features.reverse())
            await feature.disposeAsync(this);
        for (let subsystem of this.subsystems.reverse())
            await subsystem.disposeAsync();
        for (let tracker of this.trackers.reverse())
            await tracker.disposeAsync();
    }
}

// Systems are trackers that contain trackers and subsystems.
// Systems encapsulate a lifetime for trackers and their subsystems.
// Systems are constructed with config.
// The root system is a system with a default config factory that requires no special config.
// That one creates a subsystem based on its configuration for config sources.
// Configs are really system configs, which produce the array of factory configs.

// Systems have config tracker factory
// config tracker factory creates config loaders and subsc
