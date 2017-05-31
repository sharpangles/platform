import { ConfigurationTrackerFactory } from '../configuration/configuration_tracker_factory';
import { TrackerContext } from './tracker_context';
import { TypescriptTrackerFactory } from '../typescript/typescript_tracker_factory';
import { TrackerFactory } from './tracker_factory';

export interface FactoryConfig<TConfig = any> {
    /** A name that can be used to identify the factory from others of the same type. */
    name?: string;

    /** A type that can be resolved via a factory loader. */
    type?: string;

    /** Configuration for the loader to build the factory. */
    config?: TConfig;
}

/** Implement this to provide sources of tracker factories, such as private or public repositories. */
export abstract class TrackerFactoryLoader {
    constructor(protected previous?: TrackerFactoryLoader, protected cwd?: string) {
    }

    trackerContext: TrackerContext;

    async findAsync(factoryConfig: FactoryConfig): Promise<TrackerFactory | undefined> {
        let result = await this.onFindAsync(factoryConfig);
        if (result)
            return result;
        if (this.previous)
            return this.previous.findAsync(factoryConfig);
        return;
    }

    protected abstract onFindAsync(factoryConfig: FactoryConfig): Promise<TrackerFactory | undefined>;
}

export class DefaultTrackerFactoryLoader extends TrackerFactoryLoader {
    protected async onFindAsync(factoryConfig: FactoryConfig): Promise<TrackerFactory | undefined> {
        switch (factoryConfig.type) {
            case TypescriptTrackerFactory.factoryName:
                return new TypescriptTrackerFactory(this.trackerContext, factoryConfig.config, this.cwd);
            case ConfigurationTrackerFactory.factoryName:
                return new ConfigurationTrackerFactory(this.trackerContext, factoryConfig.config, this.cwd);
            default:
                throw new Error('Unknown factory type');
        }
    }
}
