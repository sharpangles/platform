// import { FileLoadSource } from '../loading/file_load_source';
// import { HttpLoadSource } from '../loading/http_load_source';
// import { JsonLoadSource } from '../loading/json_load_source';
// import { LoadProcess } from '../loading/load_process';
// import { LoadSource } from '../loading/load_source';
// import { WatcherTracker } from '../loading/watcher_tracker';
// import { OnProgressConnection } from '../tracking/on_progress_connection';
// import { OverridingTracker } from '../tracking/overriding_tracker';
// import { Tracker } from '../tracking/tracker';

// export interface TrackerFactoriesConfig {
//     configurationSources?: ConfigurationSource[];
//     factories?: { [key: string]: FactoryConfig };
// }

// export interface FileLoadConfig {
//     file: string;
//     watch?: boolean;
// }

// export interface HttpLoadConfig {
//     url: string;
//     poll?: boolean;
// }

// export interface ConfigurationSource {
//     loadType: 'file' | 'http';
//     loadConfig: FileLoadConfig | HttpLoadConfig;
// }

// export interface FactoryConfig {
//     [key: string]: any;
// }

// export class ConfigurationLoadTracker extends OverridingTracker<LoadProcess> {
//     constructor(private cwd?: string) {
//         super();
//     }

//     config: ConfigurationSource;

//     private watchTracker?: Tracker;

//     async configureAsync(config: ConfigurationSource) {
//         this.config = config;
//         if (this.watchTracker)
//             await this.watchTracker.disposeAsync();
//         this.watchTracker = await this.getWatchAsync(config);
//     }

//     protected createProcess(): LoadProcess | undefined {
//         return new LoadProcess(this.getLoadSource(this.config));
//     }

//     private getLoadSource(config: ConfigurationSource): LoadSource<TrackerFactoriesConfig> {
//         switch (config.loadType) {
//             case 'file':
//                 return new JsonLoadSource(new FileLoadSource((<FileLoadConfig>config.loadConfig).file));
//             case 'http':
//                 return new JsonLoadSource(new HttpLoadSource((<HttpLoadConfig>config.loadConfig).url));
//             default:
//                 throw new Error('Unrecognized load type.');
//         }
//     }

//     private async getWatchAsync(config: ConfigurationSource): Promise<WatcherTracker | undefined> {
//         switch (config.loadType) {
//             case 'file':
//                 if (!(<FileLoadConfig>config.loadConfig).watch)
//                     return;
//                 let watcher = new WatcherTracker();
//                 await watcher.configureAsync({ patterns: [(<FileLoadConfig>config.loadConfig).file], cwd: this.cwd });
//                 await new OnProgressConnection(watcher, this).connectAsync();
//                 watcher.runProcess();
//                 return watcher;
//             case 'http':
//             // @todo if poll..
//                 return;
//             default:
//                 throw new Error('Unrecognized load type.');
//         }
//     }

//     protected async onDisposeAsync() {
//         if (this.watchTracker)
//             await this.watchTracker.disposeAsync();
//         await super.onDisposeAsync();
//     }
// }
