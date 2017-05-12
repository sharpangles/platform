import { AsyncTrackerProcess } from '../tracking/processes/async_tracker_process';
import { MutexTracker } from '../tracking/trackers/mutex_tracker';
import { TrackerContext } from '../tracking/tracker_context';
import { TypescriptTrackerFactory } from '../typescript/typescript_tracker_factory';
import { TrackerFactoriesConfig } from './configuration_tracker_factory';

export class ConfigurationFactoriesInvoker extends MutexTracker<AsyncTrackerProcess, any, TrackerFactoriesConfig> {
    constructor(public trackerContext: TrackerContext, public cwd?: string) {
        super({
            name: 'Factory Invoker',
            description: 'Builds trackers from factories discovered via configuration.'
        });
    }

    protected createProcess(state?: TrackerFactoriesConfig): AsyncTrackerProcess | undefined {
        if (!state || !state.factories)
            return;
        return AsyncTrackerProcess.create(() => this.createFactoriesAsync(<{ [key: string]: any }>state.factories));
    }

    private async createFactoriesAsync(factories: { [key: string]: any }) {
        for (let factoryName of Object.keys(factories)) {
            let factory = this.getFactory(factoryName, factories[factoryName]);
            let trackers = await factory.createTrackersAsync(this);
            this.trackerContext.onTrackersCreated(factory, trackers);
            factory.start();
        }
    }

    private getFactory(type: string, options: any) {
        switch (type) {
            case 'typescript':
                return new TypescriptTrackerFactory(options, this.cwd);
            default:
                throw new Error('Unknown factory type');
        }
    }
}
