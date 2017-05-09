import { ConfigurationTracker } from './configuration_tracker';
import { LoadProcess } from '../loading/load_process';
import { Subscription } from 'rxjs/Subscription';
import { Tracker } from '../tracking/tracker';
import { TrackerConnection } from '../tracking/tracker_connection';
import * as extendProxy from 'deep-extend';

const extend: any = (<any>extendProxy).default || extendProxy; // https://github.com/rollup/rollup/issues/1267

/**
 * Connects a tracker for json-sourced LoadProcesses to a target, configuring the target on change.
 */
export class ConfigurationConnection<TConfig> extends TrackerConnection {
    constructor(source: ConfigurationTracker, target: Tracker, public configurationSelector?: (data: { [key: string]: any }) => TConfig) {
        super(source, target);
    }

    private subscription: Subscription;

    async connectAsync(): Promise<void> {
        this.subscription = this.source.succeeded.subscribe((p: LoadProcess<{ [key: string]: any }>) => {
            let config = this.configurationSelector ? this.configurationSelector(p.loadSource.data) : <TConfig>p.loadSource.data;
            if (config)
                this.target.configure(config);
        });
    }

    async breakAsync(): Promise<void> {
        if (this.subscription)
            this.subscription.unsubscribe();
        super.breakAsync();
    }
}

/** Connect two configuration trackers together, where the target load will extend the source load. */
export async function wireExtendingConfigAsync(source: ConfigurationTracker, target: ConfigurationTracker) {
    let connection = new ConfigurationConnection<{ [key: string]: any }>(source, target, data => extend({}, data));
    await connection.connectAsync();
    return connection;
}
