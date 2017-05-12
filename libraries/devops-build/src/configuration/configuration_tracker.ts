import { TrackerFactoriesConfig } from './configuration_tracker_factory';
import { AsyncTrackerProcess } from '../tracking/processes/async_tracker_process';
import { OverridingTracker } from '../tracking/trackers/overriding_tracker';
import * as extendProxy from 'deep-extend';

const extend: any = (<any>extendProxy).default || extendProxy; // https://github.com/rollup/rollup/issues/1267

export class ConfigurationTracker extends OverridingTracker<AsyncTrackerProcess> {
    constructor(public config: TrackerFactoriesConfig) {
        super({
            name: 'Configuration',
            description: 'Deep-extends json configuration with its own.'
        });
    }

    parent?: TrackerFactoriesConfig;

    async configureAsync(parent: TrackerFactoriesConfig) {
        this.parent = parent;
    }

    protected createProcess(state?: TrackerFactoriesConfig) {
        return AsyncTrackerProcess.create(() => Promise.resolve(extend({}, this.parent, this.config, state)));
    }
}
