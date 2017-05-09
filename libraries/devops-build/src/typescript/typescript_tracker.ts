import { Subscription } from 'rxjs/Subscription';
import { OverridingTracker } from '../trackers/overriding_tracker';
import { TypescriptIncrementalCompiler } from '../typescript/typescript_incremental_compiler';
import { Tracker } from '../trackers/tracker';
import { MutexTracker } from '../trackers/mutex_tracker';
import { AsyncTrackerProcess } from '../processes/async_tracker_process';
import { WatcherProcess } from '../os/watcher_process';
import { WatcherTracker } from '../os/watcher_tracker';
import { ParsedCommandLine } from 'typescript';

export class TypescriptTracker extends MutexTracker {


// switch to connections, trackers are pretty low level now.



    static async createWatcherTrackerAsync(sources: Tracker[], cwd?: string, config: ParsedCommandLine | string = 'tsconfig.json') {
// todo configtracker

        let tracker = { watcherTracker: new OverridingTracker(), typescriptTracker: new TypescriptTracker() };
        await Promise.all(sources.map(s => tracker.typescriptTracker.connectAsync(s)));
        await tracker.typescriptTracker.connectAsync(tracker.watcherTracker);
        tracker.watcherTracker.runProcessAsync(new WatcherProcess(tracker.typescriptTracker.compiler.config.fileNames, cwd));
        return tracker;
    }

    constructor(cwd?: string, config: ParsedCommandLine | string = 'tsconfig.json') {
        super();
        this.compiler = new TypescriptIncrementalCompiler(cwd, config);
    }

    get rootFiles() { return this.compiler.config.fileNames; }

    protected addSourceTracker(sourceTracker: Tracker, dispose?: () => void) {
        let sub: Subscription;
        if (sourceTracker instanceof WatcherTracker) {
            sub = sourceTracker.progressed.subscribe(progress => {
                if (progress.trackerProcess instanceof WatcherProcess)
                    this.runProcessAsync(new AsyncTrackerProcess(() => this.compiler.compileAsync(progress.progress)));
            });
        }
        else {
            // By default, anytime a source succeeds, it will trigger a full compilation.
            sub = sourceTracker.succeeded.subscribe(() => {
                this.runProcessAsync(new AsyncTrackerProcess(() => this.compiler.compileAsync()));
            });
        }
        super.addSourceTracker(sourceTracker, () => {
            sub.unsubscribe();
            if (dispose)
                dispose();
        });
    }

    compiler: TypescriptIncrementalCompiler;

    protected async onDisposeAsync() {
        this.compiler.dispose();
    }
}
