import { TypescriptTrackerFactory } from '../typescript/typescript_tracker_factory';
import { MutexTracker } from '../tracking/mutex_tracker';
import { TrackerFactoriesConfig } from './configuration_tracker_factory';
import { AsyncTrackerProcess } from '../tracking/async_tracker_process';

export class ConfigurationFactoriesInvoker extends MutexTracker<AsyncTrackerProcess, any, TrackerFactoriesConfig> {
    constructor(public cwd?: string) {
        super();
    }

    protected createProcess(state?: TrackerFactoriesConfig): AsyncTrackerProcess | undefined {
        if (!state || !state.factories)
            return;
        return new AsyncTrackerProcess(() => this.createFactoriesAsync(<{ [key: string]: any }>state.factories));
    }

    private async createFactoriesAsync(factories: { [key: string]: any }) {
        for (let factoryName of Object.keys(factories)) {
            let factory = this.getFactory(factoryName, factories[factoryName]);
            await factory.createTrackersAsync(this);
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
