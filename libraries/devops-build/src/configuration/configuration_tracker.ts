import { LoadProcess } from '../loading/load_process';
import { OverridingTracker } from '../tracking/overriding_tracker';

export interface ConfigurationConfig {
    loadType: string;
    loadConfig: any;
    parent: { [key: string]: any };
}

export class ConfigurationTracker extends OverridingTracker<ConfigurationConfig, LoadProcess<{ [key: string]: any }>> {
}
