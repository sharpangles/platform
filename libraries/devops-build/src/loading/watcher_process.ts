import { TrackerProcess } from '../processes/tracker_process';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as chokidar from 'chokidar';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/buffer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounce';

/**
 * A file watcher that emits progress events with changes.
 */
export class WatcherProcess extends TrackerProcess<string[], Error> {
    constructor(public patterns: string | string[], cwd?: string, public delta: number = 100) {
        super();
        this.cwd = cwd || process.cwd();
    }

    cwd: string;

    start() {
        this.watcher = chokidar.watch(this.patterns, { cwd: this.cwd });
        let obs = Observable.fromEvent<string>(this.watcher, 'change');
        // Buffer a set of saved files so long as changes keep occuring within x.  Only emit distinct.
        this.subscription = obs.buffer(obs.debounce(() => Observable.timer(this.delta))).map(event => event.filter((v, i, s) => s.indexOf(v) === i)).subscribe(changes => this.setProgress(changes)); // @todo extraneous subject
    }

    public watcher: chokidar.FSWatcher;
    // changed: Observable<WatchChange>;
    changed: Observable<string[]>;
    private subscription: Subscription;

    dispose() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.watcher.close();
        }
    }
}
