import { AsyncTrackerProcess } from '../tracking/async_tracker_process';
import { ConfigurationFactoriesInvoker } from './configuration_factories_invoker';
import { FileLoadSource } from '../loading/file_load_source';
import { HttpLoadSource } from '../loading/http_load_source';
import { JsonLoadSource } from '../loading/json_load_source';
import { OnSuccessTrackerConnection } from '../tracking/on_success_connection';
import { Tracker } from '../tracking/tracker';
import { TrackerFactory } from '../tracking/tracker_factory';
import { ConfigurationTracker } from './configuration_tracker';
import * as os from 'os';
import * as path from 'path';

export interface TrackerFactoriesConfig {
    configurationSources?: ConfigurationSource[];
    factories?: { [key: string]: any };
}

export interface FileLoadConfig {
    file: string;
}

export interface HttpLoadConfig {
    url: string;
}

export interface ConfigurationSource {
    loadType: 'file' | 'http';
    loadConfig: FileLoadConfig | HttpLoadConfig;
}

const tempLocation = os.tmpdir();
const userLocation = path.resolve(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local'), 'sharpangles');
const environmentLocation: string | undefined = process.env.SHARPANGLES;

const defaultConfigName = 'sharpangles.config.json';

export interface ConfigurationTrackerFactoryOptions {
    configName?: string;
    remoteUrl?: string;
}

export class ConfigurationTrackerFactory implements TrackerFactory {
    constructor(public options: ConfigurationTrackerFactoryOptions, cwd?: string) {
        this.cwd = cwd || process.cwd();
    }

    cwd: string;

    rootTracker: ConfigurationTracker;

    async createTrackersAsync(tracker: Tracker): Promise<Tracker[]> {
        let trackers: Tracker[] = [];
        let configs = (await Promise.all(this.getDefaultSources().map(s => this.unrollAsync(s)))).reduce((prev, curr, ind) => prev.concat(curr), []);
        let prevTracker = tracker;
        for (let config of configs) {
            tracker = new ConfigurationTracker(config);
            trackers.push(tracker);
            if (prevTracker instanceof ConfigurationTracker)
                await tracker.configureAsync(prevTracker.config); // Or if we ever add discovery trackers, add config connection instead
            if (prevTracker)
                await new OnSuccessTrackerConnection(prevTracker, tracker).connectAsync();
            prevTracker = tracker;
        }
        let invoker = new ConfigurationFactoriesInvoker(this.cwd);
        await new OnSuccessTrackerConnection(tracker, invoker, proc => (<AsyncTrackerProcess>proc).result).connectAsync();
        this.rootTracker = <ConfigurationTracker>trackers[0];
        return trackers;
    }

    start() {
        this.rootTracker.runProcess();
    }

    private async unrollAsync(config: ConfigurationSource): Promise<TrackerFactoriesConfig[]> {
        let trackerFactoriesConfig = await this.getTrackerFactoriesConfigAsync(config);
        if (!trackerFactoriesConfig)
            return [];
        if (!trackerFactoriesConfig.configurationSources)
            return [trackerFactoriesConfig];
        return (await Promise.all(trackerFactoriesConfig.configurationSources.map(s => this.unrollAsync(s)))).reduce((prev, curr, ind, arr) => arr.concat(curr), [trackerFactoriesConfig]);
    }

    private getDefaultSources(): ConfigurationSource[] {
        let configs = [path.resolve(this.cwd, this.options.configName || defaultConfigName), environmentLocation, path.resolve(tempLocation, this.options.configName || defaultConfigName), path.resolve(userLocation, this.options.configName || defaultConfigName)]
            .filter(l => l)
            .map(l => <ConfigurationSource>{ loadType: 'file', loadConfig: <FileLoadConfig>{ file: l } });
        if (this.options.remoteUrl)
            configs.push(<ConfigurationSource>{ loadType: 'http', loadConfig: <HttpLoadConfig>{ url: this.options.remoteUrl } });
        return configs;
    }

    private async getTrackerFactoriesConfigAsync(config: ConfigurationSource): Promise<TrackerFactoriesConfig | undefined> {
        switch (config.loadType) {
            case 'file':
                return await new JsonLoadSource(new FileLoadSource((<FileLoadConfig>config.loadConfig).file)).readAsync(() => {});
            case 'http':
                return await new JsonLoadSource(new HttpLoadSource((<HttpLoadConfig>config.loadConfig).url)).readAsync(() => {});
            default:
                throw new Error('Unrecognized load type.');
        }
    }
}
