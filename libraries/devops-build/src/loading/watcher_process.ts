import { SubscriptionProcess } from '../tracking/processes/subscription_process';
import { Observable } from 'rxjs/Observable';
import * as chokidar from 'chokidar';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/buffer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounce';

/**
 * A file watcher that emits progress events with changes.
 */
export class WatcherProcess extends SubscriptionProcess<string[], Error> {
    constructor(private patterns: string | string[], private cwd?: string, private delta: number = 100) {
        super();
    }


    protected createObservable(): Observable<string[]> {
        this.watcher = chokidar.watch(this.patterns, { cwd: this.cwd });
        let obs = Observable.fromEvent<string>(this.watcher, 'change');
        // Buffer a set of saved files so long as changes keep occuring within x.  Only emit distinct.
        return obs.buffer(obs.debounce(() => Observable.timer(this.delta))).map(event => event.filter((v, i, s) => s.indexOf(v) === i));
    }

    public watcher: chokidar.FSWatcher;

    dispose() {
        if (this.watcher)
            this.watcher.close();
        super.dispose();
    }
}
