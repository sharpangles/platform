// import { FactoryHandler } from './factory_handler';
// import { MutexTracker } from '../tracking/mutex_tracker';
// import { AsyncTrackerProcess } from '../tracking/async_tracker_process';

// export class FactoryTracker extends MutexTracker {
//     async configureAsync(factoryHandler: FactoryHandler) {
//         if (this.factoryHandler)
//             await this.factoryHandler.removeTrackersAsync();
//         this.factoryHandler = factoryHandler;
//     }

//     factoryHandler: FactoryHandler;

//     protected createProcess(): AsyncTrackerProcess | undefined {
//         return new AsyncTrackerProcess(async () => {
//             await this.factoryHandler.createTrackersAsync();
//             return this.factoryHandler.trackers;
//         });
//     }

//     protected async onDisposeAsync() {
//         if (this.factoryHandler)
//             await this.factoryHandler.removeTrackersAsync();
//         await super.onDisposeAsync();
//     }
// }
