// import { Tracker } from '../tracking/tracker';
// import { TypescriptTrackerFactory } from '../typescript/typescript_tracker_factory';
// import { FactoryConfig } from './configuration_load_tracker';

// export class FactoryHandler {
//     constructor(public sourceTracker: Tracker, public factoryType: string, public config: FactoryConfig, private cwd?: string) {
//     }

//     trackers: Tracker[];

//     async createTrackersAsync() {
//         await this.removeTrackersAsync();
//         if (!this.config.factories)
//             return;
//         let factory = this.getFactory(this.factoryType, this.config.factories);
//         this.trackers = await factory.createTrackersAsync(this.sourceTracker);
//         factory.start();
//     }

//     async removeTrackersAsync() {
//         if (this.trackers) {
//             let trackers = this.trackers;
//             delete this.trackers;
//             await Promise.all(trackers.map(t => t.disposeAsync()));
//         }
//     }

//     private getFactory(type: string, options: any) {
//         switch (type) {
//             case 'typescript':
//                 return new TypescriptTrackerFactory(options, this.cwd);
//             default:
//                 throw new Error('Unknown factory type');
//         }
//     }
// }
