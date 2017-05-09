// import { TypescriptIncrementalCompiler } from '../typescript/typescript_incremental_compiler';
// import { WatchChange } from './watcher';
// import { Observable } from 'rxjs/Observable';
// import { RollupCompiler } from '../rollup/rollup_compiler';
// import { RollupTracker } from '../rollup/rollup_tracker';
// import { TypescriptTracker } from '../typescript/typescript_tracker';
// import * as path from 'path';
// import { Tracker } from './tracker';

// export interface LibraryConfig {
// }

// export class LibraryTracker extends Tracker<any, boolean> {
//     constructor(observable?: Observable<any>, name?: string, cwd?: string, watch?: boolean) {
//         super(observable);
//         this.cwd = cwd || process.cwd();
//         this.name = name || require(path.resolve(this.cwd, './package.json')).name;
//         if (watch) {
//             // Trigger both in parallel from both the watch built by the local tracker and the library trigger.
//             this.localTypescriptTracker = this.attach(changed => TypescriptTracker.createIncremental(this.cwd, undefined, changed.map(() => <WatchChange>{ init: true })));
//             this.buildTypescriptTracker = this.attach(changed => TypescriptTracker.createDefault(this.cwd, 'tsconfig.build.json', Observable.merge(changed, (<TypescriptIncrementalCompiler>this.localTypescriptTracker.compiler).watcher.changed).map(() => <WatchChange>{ init: true })));
//         }
//         else {
//             this.localTypescriptTracker = this.attach(changed => TypescriptTracker.createDefault(this.cwd, undefined, changed.map(() => <WatchChange>{ init: true })));
//             this.buildTypescriptTracker = this.attach(changed => TypescriptTracker.createDefault(this.cwd, 'tsconfig.build.json', changed.map(() => <WatchChange>{ init: true })));
//         }
//         this.rollupTracker = this.buildTypescriptTracker.attach(changed => new RollupTracker(changed, new RollupCompiler(this.name)));
//     }

//     protected async onRunAsync(source: any): Promise<boolean | undefined> {
//         return true;
//     }

//     private cwd: string;
//     name: string;

//     localTypescriptTracker: TypescriptTracker;
//     buildTypescriptTracker: TypescriptTracker;
//     rollupTracker: RollupTracker;

//     dispose() {
//         this.rollupTracker.dispose();
//         this.localTypescriptTracker.dispose();
//         this.buildTypescriptTracker.dispose();
//         super.dispose();
//     }
// }
