// import { ParsedCommandLine } from 'typescript';
// import { TypescriptTracker } from '../typescript/typescript_tracker';
// import { TsConfigLoadSource } from '../typescript/tsconfig_load_source';
// import { OnSuccessTrackerConnection } from '../connections/on_success_connection';
// import { MutexTracker } from '../trackers/mutex_tracker';
// import { LoadProcess } from '../loading/load_process';
// import { OnProgressConnection } from '../connections/on_progress_connection';
// import { WatcherProcess } from '../loading/watcher_process';
// import { LoadProgress } from '../loading/load_source';
// import { FileStringLoadSource } from '../loading/file_string_load_source';
// import { OverridingTracker } from '../trackers/overriding_tracker';
// import { OverridingTracker } from '../loading/load_source';
// import { Tracker } from '../trackers/tracker';

// export async function createConfigurationTrackerAsync() {
//     let tsconfigWatcherTracker = new OverridingTracker<string[], any>();
//     let tscommandlineLoaderTracker = new OverridingTracker();
//     let tsconfigChanged = new OnProgressConnection(tsconfigWatcherTracker, tscommandlineLoaderTracker, (process, progress) => new LoadProcess<ParsedCommandLine>(new TsConfigLoadSource()));
//     await tsconfigChanged.connectAsync();

//     let tsFilesWatcherTracker = new OverridingTracker<string[], any>();
//     let tsFilesChanged = new OnSuccessTrackerConnection(tscommandlineLoaderTracker, tsFilesWatcherTracker, (process: LoadProcess<ParsedCommandLine>) => new WatcherProcess(process.loadSource.data.fileNames));
//     await tsFilesChanged.connectAsync();

//     let typescriptTracker = new TypescriptTracker();
//     let typescriptConfigChanged = new OnSuccessTrackerConnection(tsFilesWatcherTracker, typescriptTracker, process => {
//         typescriptTracker.setConfig(undefined, (<LoadProcess<string>>process).loadSource.data);
//         return undefined;
//     });
//     await typescriptConfigChanged.connectAsync();
//     let typescriptFilesChanged = new OnSuccessTrackerConnection(tscommandlineLoaderTracker, typescriptTracker, (process: LoadProcess<ParsedCommandLine>) => new WatcherProcess(process.loadSource.data.fileNames));
//     await typescriptFilesChanged.connectAsync();

//     tsconfigWatcherTracker.runProcess(new WatcherProcess('tsconfig.json'));


//     // let tsconfigWatcherTracker = new OverridingTracker<string[], any>();
//     // let typescriptTracker = new TypescriptTracker();
//     // let tsconfigChanged = new OnProgressConnection(tsconfigWatcherTracker, typescriptTracker, (process, progress) => {
//     //     typescriptTracker.setConfig(progress[0]);
//     //     return undefined;
//     // });
//     // await tsconfigChanged.connectAsync();

//     // let tsWatcherTracker = new OverridingTracker<string[], any>();
//     // let tsInputChanged = new OnProgressConnection(tsconfigWatcherTracker, tsWatcherTracker, (process, progress) => new WatcherProcess()

//     // tsconfigWatcherTracker.runProcess(new WatcherProcess('tsconfig.json'));



//     // let watcherTracker = new OverridingTracker<string[], any>();
//     // let tsconfigLoaderTracker = new OverridingTracker<LoadProgress, any>();
//     // let tsconfigChanged = new OnProgressConnection(watcherTracker, tsconfigLoaderTracker, (process, progress) => new LoadProcess<string>(new FileStringLoadSource(progress[0])));
//     // await tsconfigChanged.connectAsync();
//     // let typescriptTracker = new TypescriptTracker();
//     // let tsconfigLoaded = new OnSuccessTrackerConnection(tsconfigLoaderTracker, typescriptTracker, process => {
//     //     typescriptTracker.setConfig(undefined, (<LoadProcess<string>>process).loadSource.data);
//     //     return undefined;
//     // });
//     // await tsconfigLoaded.connectAsync();


// }

// // /**
// //  * A process that starts, progresses, and the completes.
// //  * Completion can be due to success, failure, or cancellation.
// //  */
// // export class ConfigurationTracker extends OverridingTracker<string[], Error> {
// //     constructor(public filename?: string) {
// //         super();
// //     }

// //     extractConfiguration()

// //     protected addSourceTracker(sourceTracker: Tracker, dispose?: () => void) {
// //         if (sourceTracker instanceof ConfigurationTracker) {
// //             let sub = sourceTracker.succeeded.subscribe((config: any) => {
// //                 let watcherConfig = this.extractConfig(config.config);
// //                 if (watcherConfig)
// //                     this.runProcessAsync(new WatcherProcess(watcherConfig.patterns, watcherConfig.cwd, watcherConfig.idleTime));
// //             });
// //             super.addSourceTracker(sourceTracker, () => {
// //                 sub.unsubscribe();
// //                 if (dispose)
// //                     dispose();
// //             });
// //             return;
// //         }
// //         throw new Error('Unknown source type.');
// //     }
// // }
