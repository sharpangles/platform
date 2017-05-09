// import { Tracker } from './tracker';
// import { LibraryConfig, LibraryTracker } from './library_tracker';
// import { Observable } from 'rxjs/Observable';
// import * as path from 'path';
// import * as fs from 'fs';

// export interface PlatformConfig {
//     libraries: (LibraryConfig | string)[];
// }

// export class PlatformTracker extends Tracker<any, boolean> {
//     constructor(observable?: Observable<any>, cwd?: string, libraryPaths?: string[], watch?: boolean) {
//         super(observable);
//         this.cwd = cwd || process.cwd();
//         if (!libraryPaths)
//             libraryPaths = fs.readdirSync(this.cwd).filter(i => fs.statSync(path.join(this.cwd, i)).isDirectory());
//         this.libraryTrackers = libraryPaths.map(p => this.attach(changed => new LibraryTracker(changed, undefined, p, watch)));
//     }

//     private cwd: string;

//     libraryTrackers: LibraryTracker[];

//     protected async onRunAsync(source: any): Promise<boolean | undefined> {
//         return true;
//     }

//     dispose() {
//         for (let lib of this.libraryTrackers)
//             lib.dispose();
//         super.dispose();
//     }
// }
