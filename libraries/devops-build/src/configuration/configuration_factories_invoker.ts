import { Tracker } from '../tracking/tracker';
import { TypescriptTrackerFactory } from '../typescript/typescript_tracker_factory';
import { TrackerFactoriesConfig } from './configuration_tracker_factory';
import { TrackerProcess } from '../tracking/tracker_process';

export class ConfigurationFactoriesInvoker extends TrackerProcess {
    constructor(public sourceTracker: Tracker, public config: TrackerFactoriesConfig, private cwd?: string) {
        super();
    }

    start() {
        super.start();
        this.runAsync();
    }

    async runAsync() {
        if (!this.config.factories) {
            this.succeed();
            return;
        }
        for (let factoryType of Object.keys(this.config.factories)) {
            let factory = this.getFactory(factoryType, this.config.factories);
            await factory.createTrackersAsync(this.sourceTracker);
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
