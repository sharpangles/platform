import { TrackerFactoriesConfig } from './configuration_tracker_factory';
import { AsyncTrackerProcess } from '../tracking/async_tracker_process';
import { OverridingTracker } from '../tracking/overriding_tracker';
import * as extendProxy from 'deep-extend';

const extend: any = (<any>extendProxy).default || extendProxy; // https://github.com/rollup/rollup/issues/1267

// export interface ConfigurationConfig {
//     loadType: 'file' | 'watch';
//     loadConfig: any;
//     parent: { [key: string]: any };
// }

export class ConfigurationTracker extends OverridingTracker<AsyncTrackerProcess> {
    constructor(public config: TrackerFactoriesConfig) {
        super();
        // super.succeeded.subscribe(r => this.succeededSubject.next(r));
    }

    /** Always recalls the last successful run. */
    // get succeeded(): Observable<LoadProcess<{ [key: string]: any }>> { return this.succeededSubject; }
    // private succeededSubject = new AsyncSubject<LoadProcess<{ [key: string]: any }>>();

    parent?: TrackerFactoriesConfig;

    configure(parent: TrackerFactoriesConfig) {
        this.parent = parent;
    }

    protected createProcess(state: TrackerFactoriesConfig) {
        return new AsyncTrackerProcess(() => Promise.resolve(extend({}, this.parent, this.config, state)));
    }
}
