// import { Tracker } from '../tracking/tracker';
// import { Description } from '../tracking/description';
// import { WatcherProcess } from './watcher_process';
// import { OverridingTracker } from '../tracking/trackers/overriding_tracker';

// export interface LibraryConfig {
//     cwd?: string;
//     patterns: string[];

//     /** Idle time required between changes to trigger a progress event. */
//     idleTime?: number;
// }

// /**
//  * A process that starts, progresses, and the completes.
//  * Completion can be due to success, failure, or cancellation.
//  */
// export class LibraryTracker extends Tracker {
//     constructor(relativePath: string, cwd?: string) {
//         super({
//             name: 'Library tracker',
//             description: 'Discovers and creates tracker factories based on discovered files in a folder.'
//         });
//     }

//     private config: WatcherConfig;

//     async configureAsync(config: WatcherConfig) {
//         this.config = config;
//     }

//     protected createProcess(state?: WatcherConfig): WatcherProcess | undefined {
//         return new WatcherProcess(
//             state && state.patterns || this.config && this.config.patterns,
//             state && state.cwd || this.config && this.config.cwd,
//             state && state.idleTime || this.config && this.config.idleTime);
//     }
// }
