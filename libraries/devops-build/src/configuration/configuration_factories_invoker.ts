import { FactoryConfig } from '../tracking/tracker_factory_loader';
import { AsyncTrackerProcess } from '../tracking/processes/async_tracker_process';
import { MutexTracker } from '../tracking/trackers/mutex_tracker';
import { TrackerContext } from '../tracking/tracker_context';
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
        return AsyncTrackerProcess.create(() => this.trackerContext.createFactoriesAsync(<FactoryConfig[]>state.factories));
    }
}
