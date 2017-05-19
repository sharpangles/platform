import { TrackerContext } from '../tracking/tracker_context';
import { PackageJsonTrackerFactory } from '../typescript/packagejson_tracker_factory';
import { TrackerFactory } from '../tracking/tracker_factory';
import * as fs from 'fs';

export class LibraryScanner {
    constructor(private trackerContext: TrackerContext, public path: string) {
    }

    async scanAsync() {
        let files = new Set<string>(await new Promise<string[]>((resolve, reject) => fs.readdir(this.path, (err, files) => err ? reject(err) : resolve(files))));
        let factories: TrackerFactory[] = [];
        if (files.has('package.json'))
            factories.push(new PackageJsonTrackerFactory(this.trackerContext, { watch: true }, this.path));
        if (files.has('tsconfig.json')) {
            factories.push(new PackageJsonTrackerFactory(this.trackerContext, { watch: true }, this.path));
        }
    }
}
