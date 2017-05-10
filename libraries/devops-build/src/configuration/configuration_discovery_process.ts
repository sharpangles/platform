// import { ConfigurationTracker } from './configuration_tracker';
// import { OnProgressConnection } from '../tracking/on_progress_connection';
// import { Tracker } from '../tracking/tracker';
// import { WatcherConfig, WatcherTracker } from '../loading/watcher_tracker';
// import { LoadProcess } from '../loading/load_process';
// import { OverridingTracker } from '../tracking/overriding_tracker';
// import { FileLoadSource } from '../loading/file_load_source';
// import { HttpLoadSource } from '../loading/http_load_source';
// import { JsonLoadSource } from '../loading/json_load_source';
// import { TrackerProcess } from '../tracking/tracker_process';
// import * as os from 'os';
// import * as path from 'path';

// export interface TrackerFactoriesConfig {
//     configurationSources?: ConfigurationSource[];
//     [key: string]: any;
// }

// export interface FileLoadConfig {
//     file: string;
// }

// export interface HttpLoadConfig {
//     url: string;
// }

// export interface ConfigurationSource {
//     loadType: 'file' | 'http';
//     loadConfig: FileLoadConfig | HttpLoadConfig;
// }

// const tempLocation = os.tmpdir();
// const userLocation = path.resolve(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local'), 'sharpangles');
// const environmentLocation: string | undefined = process.env.SHARPANGLES;

// export class ConfigurationDiscoveryProcess extends TrackerProcess {
//     constructor(public source: Tracker, cwd?: string, public configName: string = 'sharpangles.json', public remoteUrl?: string) {
//         super();
//         this.cwd = cwd || process.cwd();
//     }

//     private cwd: string;

//     start() {
//         // Discover configs from most local to most remote
//         // see if there is config for config that includes remote.
//         // build config tracker chain.
//         // connect final config to a factory of factories process.
//     }

//     private async buildTrackerChain() {
//         let configs = await this.unrollAsync();
//         let tracker: Tracker = this.source;
//         for (let config in configs) {
//             tracker = new ConfigurationTracker(config);
//             tracker.configure(config);
//         }
//     }

//     private async unrollAsync(config?: ConfigurationSource): Promise<TrackerFactoriesConfig[]> {
//         if (!config)
//             return (await Promise.all(this.getDefaultSources().map(s => this.unrollAsync(s)))).reduce((prev, curr, ind, arr) => arr.concat(curr), []);
//         let trackerFactoriesConfig = await this.getTrackerFactoriesConfigAsync(config);
//         if (!trackerFactoriesConfig.configurationSources)
//             return [trackerFactoriesConfig];
//         return (await Promise.all(trackerFactoriesConfig.configurationSources.map(s => this.unrollAsync(s)))).reduce((prev, curr, ind, arr) => arr.concat(curr), [trackerFactoriesConfig]);
//     }

//     private getDefaultSources(): ConfigurationSource[] {
//         let configs = [path.resolve(this.cwd, this.configName), environmentLocation, tempLocation, userLocation]
//             .filter(l => l)
//             .map(l => <ConfigurationSource>{ loadType: 'file', loadConfig: <FileLoadConfig>{ file: path.resolve(l, this.configName) } });
//         if (this.remoteUrl)
//             configs.push(<ConfigurationSource>{ loadType: 'http', loadConfig: <HttpLoadConfig>{ url: this.remoteUrl } });
//         return configs;
//     }

//     private async getTrackerFactoriesConfigAsync(config: ConfigurationSource): Promise<TrackerFactoriesConfig> {
//         switch (config.loadType) {
//             case 'file':
//                 return await new JsonLoadSource(new FileLoadSource((<FileLoadConfig>config.loadConfig).file)).readAsync(() => {});
//             case 'http':
//                 return await new JsonLoadSource(new HttpLoadSource((<HttpLoadConfig>config.loadConfig).url)).readAsync(() => {});
//             default:
//                 throw new Error('Unrecognized load type.');
//         }
//     }
// }

//     /**
//      * This could get more complicated.  We could create a DiscoveryTracker for each discovered config that handles creating ConfigurationTrackers.  For now it just directly loads them, so changes to configuration require a full reconstruction of the tracker graph.
//      * That would make us need to trace constructed trackers through factories, which is just getting insane.
//      */
// //     private async createTrackerAsync(config: ConfigurationSource): Promise<ConfigurationTracker> {
// //         switch (config.loadType) {
// //             case 'file':
// //                 let tracker = new ConfigurationTracker(() => new LoadProcess(new JsonLoadSource(new FileLoadSource((<FileLoadConfig>config.loadConfig).file))));
// //                 if ((<FileLoadConfig>config.loadConfig).watch) {
// //                     let watchTracker = new WatcherTracker();
// //                     watchTracker.configure(<WatcherConfig>{ cwd: this.cwd, patterns: [(<FileLoadConfig>config.loadConfig).file] });
// //                     await new OnProgressConnection(watchTracker, tracker, (proc, progress) => {}).connectAsync();
// //                 }
// //                 return tracker;
// //             case 'http':
// //                 return new ConfigurationTracker(() => new LoadProcess(new JsonLoadSource(new HttpLoadSource((<HttpLoadConfig>config.loadConfig).url))));
// //             default:
// //                 throw new Error('Unrecognized load type.');
// //         }
// //     }
// // }
