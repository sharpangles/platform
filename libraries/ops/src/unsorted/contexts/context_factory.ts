import { TrackerFactory } from '../tracker_factory';
import { Tracker } from '../tracker';
import { ConfigurationTrackerFactory, ConfigurationTrackerFactoryOptions } from '../../configuration/configuration_tracker_factory';
import { TrackerContext } from '../tracker_context';
import { DefaultTrackerFactoryLoader, FactoryConfig, TrackerFactoryLoader } from '../tracker_factory_loader';
import { TerminalTrackerContext } from './terminal_tracker_context';

export class ContextFactory {
    async buildAsync(trackerPredicate?: (factory: TrackerFactory, tracker: Tracker) => boolean) {
        let factoryLoader = this.createFactoryLoader();
        let seedTrackerName = this.getSeedTrackerName();
        let trackerContext: TrackerContext = trackerPredicate ? new TerminalTrackerContext(factoryLoader, trackerPredicate) : new TrackerContext(factoryLoader);
        let factory = <ConfigurationTrackerFactory | undefined>await trackerContext.trackerFactoryLoader.findAsync(<FactoryConfig<ConfigurationTrackerFactoryOptions>>{ type: seedTrackerName, config: { localConfigPath: this.findConfigPath() } });
        if (!factory)
            throw new Error(`${seedTrackerName} is a fundamental factory type and must be present in the factory loader.`);
        await trackerContext.createFactoriesAsync([factory]);
    }

    protected getSeedTrackerName() {
        return ConfigurationTrackerFactory.factoryName;
    }

    protected getCwd(): string | undefined {
        return;
    }

    protected createFactoryLoader(): TrackerFactoryLoader {
        return new DefaultTrackerFactoryLoader(undefined, this.getCwd());
    }

    /** If running platform-level operations, determine if we need to navigate upward to find the root. */
    protected findConfigPath() {
        return '.';
    }
}
