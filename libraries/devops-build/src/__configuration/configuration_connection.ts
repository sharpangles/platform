// import { LoadProcess } from '../loading/load_process';
// import { Subscription } from 'rxjs/Subscription';
// import { Tracker } from '../tracking/tracker';
// import { TrackerConnection } from '../tracking/tracker_connection';

// /**
//  * Connects the data result of a LoadProcess to a target configuration call.
//  */
// export class ConfigurationConnection<TLoadType, TConfig> extends TrackerConnection {
//     constructor(source: Tracker, target: Tracker, public configurationSelector?: (load: TLoadType) => TConfig) {
//         super(source, target);
//     }

//     private subscription: Subscription;

//     async connectAsync(): Promise<void> {
//         this.subscription = this.source.succeeded.subscribe((p: LoadProcess<TLoadType>) => {
//             let config = this.configurationSelector ? this.configurationSelector(p.loadSource.data) : <TConfig><any>p.loadSource.data;
//             if (config)
//                 this.target.configureAsync(config);
//         });
//     }

//     async breakAsync(): Promise<void> {
//         if (this.subscription)
//             this.subscription.unsubscribe();
//         super.breakAsync();
//     }
// }
