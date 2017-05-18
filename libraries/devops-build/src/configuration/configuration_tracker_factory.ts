import { FactoryConfig } from '../tracking/tracker_factory_loader';
import { Connections } from '../tracking/connections/connections';
import { TrackerContext } from '../tracking/tracker_context';
import { AsyncTrackerProcess } from '../tracking/processes/async_tracker_process';
import { ConfigurationFactoriesInvoker } from './configuration_factories_invoker';
import { FileLoadSource } from '../loading/file_load_source';
import { HttpLoadSource } from '../loading/http_load_source';
import { JsonLoadSource } from '../loading/json_load_source';
import { Tracker } from '../tracking/tracker';
import { TrackerFactory } from '../tracking/tracker_factory';
import { ConfigurationTracker } from './configuration_tracker';
import * as os from 'os';
import * as path from 'path';

export interface TrackerFactoriesConfig {
    configurationSources?: ConfigurationSource[];
    factories?: FactoryConfig[];
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
    localConfigPath?: string;
    configName?: string;
    remoteUrl?: string;
}

export class ConfigurationTrackerFactory extends TrackerFactory<ConfigurationTrackerFactoryOptions> {
    static readonly factoryName = '@sharpangles/tracker-config';

    constructor(trackerContext: TrackerContext, config: FactoryConfig<ConfigurationTrackerFactoryOptions>, private cwd?: string, public explicitConfig?: TrackerFactoriesConfig) {
        super(trackerContext, config);
    }

    trackerContext: TrackerContext;

    rootTracker: ConfigurationTracker;

    protected async onCreateTrackersAsync(): Promise<Tracker[]> {
        let trackers: Tracker[] = [];
        let configs = (await Promise.all(this.getDefaultSources().map(s => this.unrollAsync(s)))).reduce((prev, curr, ind) => prev.concat(curr), []);
        if (this.explicitConfig)
            configs.push(this.explicitConfig);
        let tracker: Tracker | undefined;
        let prevTracker: Tracker | undefined;
        for (let config of configs) {
            tracker = new ConfigurationTracker(config);
            trackers.push(tracker);
            if (prevTracker instanceof ConfigurationTracker)
                await tracker.configureAsync(prevTracker.config); // Or if we ever add discovery trackers, add config connection instead
            if (prevTracker)
                await Connections.runOnSuccess(prevTracker, tracker, { name: 'Extend Config', description: 'Connects a base config to be extended by a derived one.' }).connectAsync();
            prevTracker = tracker;
        }
        if (!tracker)
            throw new Error('No configurations found.');
        let invoker = new ConfigurationFactoriesInvoker(this.trackerContext, this.cwd);
        trackers.push(invoker);
        await Connections.runOnSuccess(tracker, invoker, { name: 'Submit Config', description: 'Final config output from which to build trackers.' }, (proc: AsyncTrackerProcess) => (<AsyncTrackerProcess>proc).result).connectAsync();
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
        let configName = this.config.config && this.config.config.configName || defaultConfigName;
        let configs = [path.resolve(this.cwd || process.cwd(), this.config.config && this.config.config.localConfigPath, configName), environmentLocation, path.resolve(tempLocation, configName), path.resolve(userLocation, configName)]
            .filter(l => l)
            .map(l => <ConfigurationSource>{ loadType: 'file', loadConfig: <FileLoadConfig>{ file: l } });
        if (this.config.config && this.config.config.remoteUrl)
            configs.push(<ConfigurationSource>{ loadType: 'http', loadConfig: <HttpLoadConfig>{ url: this.config.config.remoteUrl } });
        return configs.reverse();
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
