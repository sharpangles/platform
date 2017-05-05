import { LibraryTracker, PlatformTracker } from '@sharpangles/devops-build';

export class TrackerFactory {
    constructor(argv: any, public watch: boolean) {
        this.tracker = this.isPlatform(argv) ? this.createPlatformTracker(argv) : this.createLibraryTracker(argv);
        this.tracker.runAsync(true);
    }

    tracker: LibraryTracker | PlatformTracker;

    isPlatform(argv: any) {
        return false;
    }

    createLibraryTracker(argv: any) {
        return new LibraryTracker(undefined, undefined, undefined, this.watch);
    }

    createPlatformTracker(argv: any) {
        return new PlatformTracker(undefined);
    }
}
