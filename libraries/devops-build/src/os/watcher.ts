import { Observable } from 'rxjs/Observable';
import * as chokidar from 'chokidar';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/buffer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounce';

export class WatchChange {
    /**
     * @param changes The list of changes if determinate.
     */
    constructor(public changes?: string[]) {
    }
}

export class Watcher {
    constructor(public patterns: string | string[], cwd: string, delta: number = 100) {
        this._cwd = cwd || process.cwd();
        this.watcher = chokidar.watch(this.patterns, { cwd: this._cwd });
        this.changed = Observable.fromEvent<string>(this.watcher, 'change');
        // let obs = Observable.fromEvent<string>(this.watcher, 'change');
        // Buffer a set of saved files so long as changes keep occuring within x.  Only emit distinct.
        // this.changed = obs.buffer(obs.debounce(() => Observable.timer(delta))).map(event => new WatchChange(event.filter((v, i, s) => s.indexOf(v) === i)));
    }

    private _cwd: string;

    public watcher: chokidar.FSWatcher;
    // changed: Observable<WatchChange>;
    changed: Observable<string>;

    dispose() {
        this.watcher.close();
    }
}
